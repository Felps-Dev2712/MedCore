#!/bin/sh
mkdir -p /app/data
python manage.py migrate --noinput
python manage.py seed 2>/dev/null || true
exec "$@"
