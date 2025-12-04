import os
from dotenv import load_dotenv

load_dotenv() 

class Config:
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.environ.get('SECRET_KEY')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    JWT_EXPIRATION_HOURS = 24
    
    # mqtt configuration
    MQTT_BROKER_URL = os.environ.get('MQTT_BROKER_URL')
    MQTT_BROKER_PORT = int(os.environ.get('MQTT_BROKER_PORT'))
    MQTT_USERNAME = os.environ.get('MQTT_USERNAME')
    MQTT_PASSWORD = os.environ.get('MQTT_PASSWORD')
    MQTT_KEEPALIVE = int(os.environ.get('MQTT_KEEPALIVE', 60))
    MQTT_TLS_ENABLED = os.environ.get('MQTT_TLS_ENABLED', 'False').lower() == 'true'