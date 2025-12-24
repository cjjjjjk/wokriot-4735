from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_mqtt import Mqtt
from flask_cors import CORS

db = SQLAlchemy()
migrate = Migrate()
mqtt = Mqtt()
cors = CORS()