from flask import Flask, redirect, url_for, render_template, g
import os
import sqlite3
import json
import datetime
from dotenv import load_dotenv
from flask_dance.contrib.github import make_github_blueprint, github
load_dotenv()
app = Flask(__name__)
def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect("data.sqlite")
        g.db.row_factory = sqlite3.Row
    return g.db
@app.teardown_appcontext
def close_db(error):
    db = g.pop('db', None)
    if db is not None:
        db.close()
app.secret_key = os.getenv('flaskDanceSecret')
blueprint = make_github_blueprint(
    client_id=os.getenv('githubClientID'),
    client_secret=os.getenv('githubClientSecret'),
)
# custom filter (was written by GPT.)
@app.template_filter()
def timestamp_to_time(value):
    if value is None:
        return None
    return datetime.datetime.fromtimestamp(value)
@app.template_filter()
def strftime(value, thing):
    return value.strftime(thing)
app.register_blueprint(blueprint, url_prefix="/login")
@app.route("/")
def index():
    db = get_db()
    if not github.authorized:
        return redirect(url_for("github.login"))
    resp = github.get("/user")
    assert resp.ok
    cur = db.execute("SELECT userCoins FROM users WHERE userid = ?", (resp.json()["id"],))
    data=cur.fetchall()
    usercoins = 0
    if len(data) == 0:
        print("Not In DB")
        db.execute("""
INSERT INTO users (
                      userCoins,
                      userID
                  )
                  VALUES (
                      ?,
                      ?
                  );
""",(60, resp.json()['id']))
        db.commit()
        usercoins = 60
    else:
        usercoins = data[0]['userCoins']
    username = resp.json()['login']
    cur = db.execute("SELECT * FROM tasks WHERE ownerID = ?", (resp.json()["id"],))
    return render_template("app.html", username=username, usercoins=usercoins, tasks=cur.fetchall())
if __name__ == "__main__":
    app.run(port=8079,ssl_context=('cert.pem', 'key.pem'))