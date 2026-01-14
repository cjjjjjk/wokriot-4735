# app/__init__.py
from flask import Flask, redirect
from flasgger import Swagger
from .config import Config
from .extensions import db, migrate, mqtt, cors
from . import models 
from .api import api_bp 


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # swagger configuration
    swagger_config = {
        "headers": [],
        "specs": [
            {
                "endpoint": 'apispec',
                "route": '/apispec.json',
                "rule_filter": lambda rule: True,
                "model_filter": lambda tag: True,
            }
        ],
        "static_url_path": "/flasgger_static",
        "swagger_ui": True,
        "specs_route": "/apidocs"
    }
    
    swagger_template = {
        "swagger": "2.0",
        "info": {
            "title": "IoT Attendance System API",
            "description": "api documentation for iot attendance management system with rfid and mqtt integration",
            "version": "1.0.0",
            "contact": {
                "name": "IoT Team",
            }
        },
        "securityDefinitions": {
            "Bearer": {
                "type": "apiKey",
                "name": "Authorization",
                "in": "header",
                "description": "jwt authorization header using the bearer scheme. example: \"Authorization: Bearer {token}\""
            }
        },
        "security": [
            {
                "Bearer": []
            }
        ]
    }
    
    Swagger(app, config=swagger_config, template=swagger_template)

    # 1. khởi tạo extensions
    db.init_app(app)
    migrate.init_app(app, db)
    mqtt.init_app(app)
    
    # khởi tạo CORS - cho phép frontend truy cập API
    cors.init_app(app, resources={
        r"/api/*": {
            "origins": "*", # all sources
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })

    # 2. đăng ký blueprint
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # 3. root route - redirect to api docs
    @app.route('/')
    def index():
        return redirect('/apidocs')

    # 4. import mqtt handlers after app initialization
    with app.app_context():
        from .api import mqtt_handlers

    return app