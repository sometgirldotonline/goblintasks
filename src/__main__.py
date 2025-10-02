# Debug logging was added by Github Copilot
from flask import (
    Flask,
    redirect,
    url_for,
    render_template,
    g,
    make_response,
    request,
    jsonify,
    session,
)
import jinja2
import os
import sqlite3
import json
import datetime, time
from dotenv import load_dotenv
from flask_dance.contrib.github import make_github_blueprint, github

load_dotenv()
app = Flask(__name__)
app.config.from_mapping({"DEBUG": True})


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(
            os.path.join(os.path.dirname(os.path.realpath(__file__)), "data.sqlite")
        )
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(error):
    db = g.pop("db", None)
    if db is not None:
        db.close()


app.secret_key = os.getenv("flaskDanceSecret")
blueprint = make_github_blueprint(
    client_id=os.getenv("githubClientID"),
    client_secret=os.getenv("githubClientSecret"),
)
# custom filter (was written by GPT.)
@app.template_filter()
def timestamp_to_time(value, thing):
    if isinstance(value, jinja2.runtime.Undefined) or value is None:
        return None
    return datetime.datetime.fromtimestamp(value).strftime(thing)


app.register_blueprint(blueprint, url_prefix="/login")


@app.route("/logout", methods=["GET"])
def logout():
    res = make_response("Logged Out.")
    res.set_cookie("session", "", max_age=0)
    return res


@app.route("/", methods=["GET"])
def index():
    db = get_db()
    if not github.authorized:
        return redirect(url_for("github.login"))
    if "github_id" not in session:
        resp = github.get("/user")
        assert resp.ok
        user_info = resp.json()
        session["github_id"] = user_info["id"]
        session["github_login"] = user_info["login"]
    cur = db.execute(
        "SELECT userCoins FROM users WHERE userid = ?", (session["github_id"],)
    )
    data = cur.fetchall()
    usercoins = 0
    if len(data) == 0:
        print("Not In DB")
        db.execute(
            """
INSERT INTO users (
                      userCoins,
                      userID
                  )
                  VALUES (
                      ?,
                      ?
                  );
""",
            (60, session["github_id"]),
        )
        db.commit()
        usercoins = 60
    else:
        usercoins = data[0]["userCoins"]
    cur = db.execute(
        "SELECT COALESCE(SUM(taskValue), 0) AS total_value FROM tasks WHERE ownerID = ? and taskCompletion = 1;",
        (session["github_id"],),
    )
    res = cur.fetchone()
    username = session["github_login"]
    cur = db.execute("SELECT * FROM tasks WHERE ownerID = ?", (session["github_id"],))
    return render_template(
        "app.html",
        username=username,
        usercoins=res["total_value"] + usercoins,
        tasks=cur.fetchall(),
    )


@app.route("/api", methods=["GET"])
def notforyou():
    return "no"


@app.route("/api/updateTaskState", methods=["POST"])
def uts():
    state = "it probably worked idk"
    selector = "ul.tasksList"
    if "id" in request.form and "state" in request.form:
        # Debug logging
        print(f"DEBUG: Received id={request.form['id']}, state={request.form['state']}")
        if not github.authorized:
            return redirect(url_for("github.login"))
        db = get_db()
        cur = db.execute(
            "SELECT * FROM tasks WHERE ownerID = ? and taskID = ?",
            (
                session["github_id"],
                request.form["id"],
            ),
        )
        res = cur.fetchall()
        if len(res) == 1:
            # Debug: Show what we're about to update
            new_completion_value = 1 if request.form["state"] == "1" else 0
            print(
                f"DEBUG: Updating taskID {request.form['id']} to completion {new_completion_value}"
            )
            # this sql statement was adjusted by chat GPT, i have no clue what im doing with SQL.
            cur = db.execute(
                """
            UPDATE tasks
            SET taskCompletion = ?
            WHERE ownerID = ? AND taskID = ?;
            """,
                (
                    new_completion_value,
                    session["github_id"],
                    request.form["id"],
                ),
            )
            db.commit()

            # Debug: Verify the update worked
            cur = db.execute(
                "SELECT taskCompletion FROM tasks WHERE ownerID = ? and taskID = ?",
                (
                    session["github_id"],
                    request.form["id"],
                ),
            )
            updated_result = cur.fetchall()
            print(
                f"DEBUG: After update, taskCompletion = {updated_result[0]['taskCompletion'] if updated_result else 'NOT FOUND'}"
            )

        elif len(res) == 0:
            state = "eNotFound"
        elif len(res) > 1:
            state = "eTooManyFound"
        # tasks = []
        cur = db.execute(
            "SELECT * FROM tasks WHERE ownerID = ?", (session["github_id"],)
        )
        res = cur.fetchall()
        for task in res:
            print(dict(task))
        # for task in res:
        #     tasks.append(json.dumps(dict(task)))
        # sql by chatGPT again, i hate working with SQL but it made the most sense for this
        cur = db.execute(
            "SELECT COALESCE(SUM(taskValue), 0) AS total_value FROM tasks WHERE ownerID = ? and taskCompletion = 1;",
            (session["github_id"],),
        )
        return f"""$1${state}
${selector}
{cur.fetchone()['total_value'] + db.execute("SELECT userCoins FROM users WHERE userid = ?", (session["github_id"],)).fetchone()['userCoins']}
{render_template("tasksCard.html", tasks=res)}
"""

    else:
        return f"""$0${state}"""


@app.route("/api/addTask", methods=["POST"])
def addTask():
    state = "it probably worked idk"
    selector = "ul.tasksList"
    if (
        "dueBy" in request.form
        and "taskValue" in request.form
        and "taskName" in request.form
    ):
        if not github.authorized:
            return redirect(url_for("github.login"))
        
        # Validate and convert inputs
        try:
            task_value = int(request.form["taskValue"])
            due_by = -1 if request.form["dueBy"] == "NaN" else int(request.form["dueBy"])
            task_name = request.form["taskName"].strip()
            
            if not task_name:
                state = "eEmptyTaskName"
                return f"""$0${state}"""
                
        except ValueError:
            state = "eInvalidNumber"
            return f"""$0${state}"""
        
        db = get_db()
        try:
            cur = db.execute(
                """
INSERT INTO tasks (
                        completionDate,
                        creationDate,
                        dueBy,
                        taskCompletion,
                        taskValue,
                        taskName,
                        ownerID
                    )
                    VALUES (
                        -1,
                        ?,
                        ?,
                        0,
                        ?,
                        ?,
                        ?
                    );
            """,
                (
                    time.time(),
                    due_by,
                    task_value,
                    task_name,
                    session["github_id"],
                ),
            )
            db.commit()
        except sqlite3.Error:
            state = "eDatabaseError"
            return f"""$0${state}"""
        except sqlite3.Error:
            state = "eDatabaseError"
            return f"""$0${state}"""
            
        # Get updated task list and total coins
        cur = db.execute(
            "SELECT * FROM tasks WHERE ownerID = ?", (session["github_id"],)
        )
        res = cur.fetchall()
        
        # Get total completed task value + user coins
        cur = db.execute(
            "SELECT COALESCE(SUM(taskValue), 0) AS total_value FROM tasks WHERE ownerID = ? and taskCompletion = 1;",
            (session["github_id"],),
        )
        completed_value = cur.fetchone()['total_value']
        
        cur = db.execute("SELECT userCoins FROM users WHERE userid = ?", (session["github_id"],))
        user_coins = cur.fetchone()['userCoins']
        
        return f"""$1${state}
${selector}
{completed_value + user_coins}
{render_template("tasksCard.html", tasks=res)}
"""

    else:
        return f"""$0${state}"""

@app.route("/api/deleteTask", methods=["POST"])
def deleteTask():
    state = "it probably worked idk"
    selector = "ul.tasksList"
    if (
        "id" in request.form
    ):
        if not github.authorized:
            return redirect(url_for("github.login"))
        
        # Validate and convert inputs
        try:
            task_id = int(request.form["id"])
            
            if not task_id:
                state = "eNoID"
                return f"""$0${state}"""
                
        except ValueError:
            state = "eVerror"
            return f"""$0${state}"""
        
        db = get_db()
        try:
            cur = db.execute("SELECT * FROM tasks WHERE taskID = ? AND ownerID = ?", (request.form["id"],session['github_id'],))
            # dumb name, just means store the value properly, into the users coin balance
            task = cur.fetchone()
            commitTaskEvasion = task["taskCompletion"] == 1                
            cur = db.execute("DELETE FROM tasks WHERE taskID = ? AND ownerID = ?",
                (
                    int(request.form["id"]),
                    session['github_id'],
                ),
            )
            if commitTaskEvasion:
                cur = db.execute("UPDATE users SET userCoins = userCoins + ? WHERE userID = ?;", (task["taskValue"], session['github_id'],))
            db.commit()
        except sqlite3.Error:
            state = "eDatabaseError"
            return f"""$0${state}"""
        # Get updated task list and total coins
        cur = db.execute(
            "SELECT * FROM tasks WHERE ownerID = ?", (session["github_id"],)
        )
        res = cur.fetchall()
        
        # Get total completed task value + user coins
        cur = db.execute(
            "SELECT COALESCE(SUM(taskValue), 0) AS total_value FROM tasks WHERE ownerID = ? and taskCompletion = 1;",
            (session["github_id"],),
        )
        completed_value = cur.fetchone()['total_value']
        
        cur = db.execute("SELECT userCoins FROM users WHERE userid = ?", (session["github_id"],))
        user_coins = cur.fetchone()['userCoins']
        
        return f"""$1${state}
${selector}
{completed_value + user_coins}
{render_template("tasksCard.html", tasks=res)}
"""

    else:
        return f"""$0${state}"""



if __name__ == "__main__":
    app.run(port=443, ssl_context=("cert.pem", "key.pem"))
