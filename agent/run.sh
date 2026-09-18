#!/bin/bash
source /opt/python-venv/brain/bin/activate
PYTHONPATH=. uvicorn app.main:app --host 0.0.0.0 --port 9000 --reload
