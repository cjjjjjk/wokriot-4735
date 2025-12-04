# app/__init__.py
from flask import Flask
from .config import Config
from .extensions import db, migrate, mqtt
from . import models 
from .api import api_bp 


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # 1. Khởi tạo extensions
    db.init_app(app)
    migrate.init_app(app, db)
    mqtt.init_app(app)

    # 2. Đăng ký Blueprint -------------------------
    # Đăng ký với prefix là '/api'
    app.register_blueprint(api_bp, url_prefix='/api')
    # -------------------------------------------------------------

    # 3. import mqtt handlers after app initialization
    with app.app_context():
        from .api import mqtt_handlers

    return app