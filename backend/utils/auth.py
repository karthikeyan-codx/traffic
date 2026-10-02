from functools import wraps
from datetime import datetime, timedelta, timezone
import jwt
from flask import request, jsonify, current_app, g
from models import Officer

def generate_token(officer: Officer) -> str:
    payload = {
        "sub": officer.id,
        "username": officer.username,
        "name": officer.name,
        "badge_number": officer.badge_number,
        "role": officer.role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=current_app.config.get("JWT_EXPIRATION_HOURS", 24)),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")

def decode_token(token: str):
    try:
        return jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def jwt_required(optional: bool = False):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            auth_header = request.headers.get("Authorization", "")
            token = None
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ", 1)[1].strip()

            if not token:
                if optional:
                    g.current_user = None
                    return f(*args, **kwargs)
                return jsonify({"error": "Authentication token is missing. Please log in."}), 401

            payload = decode_token(token)
            if not payload:
                if optional:
                    g.current_user = None
                    return f(*args, **kwargs)
                return jsonify({"error": "Token has expired or is invalid. Please log in again."}), 401

            officer = Officer.query.get(payload["sub"])
            if not officer:
                if optional:
                    g.current_user = None
                    return f(*args, **kwargs)
                return jsonify({"error": "User no longer exists."}), 401

            g.current_user = officer
            return f(*args, **kwargs)
        return wrapper
    return decorator
