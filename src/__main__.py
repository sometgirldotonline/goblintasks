from flask import Flask, redirect, url_for
import os
from dotenv import load_dotenv
from flask_dance.contrib.github import make_github_blueprint, github
load_dotenv()
app = Flask(__name__)
app.secret_key = os.getenv('flaskDanceSecret')
blueprint = make_github_blueprint(
    client_id=os.getenv('githubClientID'),
    client_secret=os.getenv('githubClientSecret'),
)