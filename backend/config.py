import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "smart-traffic-secret-key-2026-prod")
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", f"sqlite:///{BASE_DIR / 'traffic_violations.db'}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Base URL used when building the public QR code link
    # Default is the frontend Vite dev server or configured host
    PUBLIC_PORTAL_URL = os.environ.get("PUBLIC_PORTAL_URL", "http://localhost:5173/public/challan")
    
    # Token expiration in hours
    JWT_EXPIRATION_HOURS = int(os.environ.get("JWT_EXPIRATION_HOURS", 24))
