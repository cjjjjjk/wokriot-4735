#!/bin/bash

# wait for mysql
echo "waiting for mysql..."
while ! nc -z db 3306; do
  sleep 1
done
echo "mysql is ready!"

# run database migrations
echo "running database migrations..."
flask db upgrade

# start flask server
echo "starting flask server..."
exec python app.py
