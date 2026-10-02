from flask import Blueprint, request, jsonify, g
from models import db, Officer
from utils.auth import generate_token, jwt_required

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    username = str(data.get("username", "")).strip()
    password = str(data.get("password", "")).strip()

    if not username or not password:
        return jsonify({"error": "Username and password are required."}), 400

    officer = Officer.query.filter_by(username=username).first()
    if not officer or not officer.check_password(password):
        return jsonify({"error": "Invalid credentials. Please verify your badge ID or password."}), 401

    token = generate_token(officer)
    return jsonify({
        "message": "Login successful",
        "token": token,
        "officer": officer.to_dict()
    }), 200

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    return jsonify({
        "officer": g.current_user.to_dict()
    }), 200

@auth_bp.route("/logout", methods=["POST"])
def logout():
    return jsonify({"message": "Logged out successfully"}), 200
