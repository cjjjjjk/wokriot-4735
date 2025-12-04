from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_mqtt import Mqtt

db = SQLAlchemy()
migrate = Migrate()
mqtt = Mqtt()