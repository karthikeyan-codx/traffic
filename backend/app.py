import os
import sys
from pathlib import Path

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from models import db
from utils.seed import seed_database
from routes.auth import auth_bp
from routes.violations import violations_bp
from routes.vehicles import vehicles_bp
from routes.dashboard import dashboard_bp
from routes.public import public_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable CORS for frontend Vite development
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # Initialize SQLite database via SQLAlchemy
    db.init_app(app)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(violations_bp)
    app.register_blueprint(vehicles_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(public_bp)

    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "healthy",
            "service": "Smart Traffic Violation Logger API",
            "version": "1.0.0"
        }), 200

    # Global 404 handler for API routes
    @app.errorhandler(404)
    def handle_404(e):
        return jsonify({"error": "Endpoint not found"}), 404

    @app.errorhandler(500)
    def handle_500(e):
        return jsonify({"error": "Internal server error"}), 500

    # Auto-initialize SQLite database & seed default data
    with app.app_context():
        db.create_all()
        seed_database()

    return app

if __name__ == "__main__":
    app = create_app()
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting Smart Traffic Violation Logger Backend on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
