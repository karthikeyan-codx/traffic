from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import uuid

db = SQLAlchemy()

def utcnow():
    return datetime.now(timezone.utc)

class Officer(db.Model):
    __tablename__ = "officers"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    badge_number = db.Column(db.String(50), unique=True, nullable=False)
    role = db.Column(db.String(20), default="officer", nullable=False)
    created_at = db.Column(db.DateTime, default=utcnow, nullable=False)

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "name": self.name,
            "badge_number": self.badge_number,
            "role": self.role,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Violation(db.Model):
    __tablename__ = "violations"

    id = db.Column(db.Integer, primary_key=True)
    challan_id = db.Column(db.String(36), unique=True, nullable=False, index=True)
    vehicle_number = db.Column(db.String(20), nullable=False, index=True)
    violation_type = db.Column(db.String(80), nullable=False, index=True)
    location = db.Column(db.String(200), nullable=False)
    violation_date = db.Column(db.DateTime, nullable=False, index=True)
    fine_amount = db.Column(db.Float, nullable=False)
    payment_status = db.Column(db.String(20), default="UNPAID", nullable=False, index=True)
    paid_at = db.Column(db.DateTime, nullable=True)
    payment_reference = db.Column(db.String(100), nullable=True)
    officer_badge = db.Column(db.String(50), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    @staticmethod
    def generate_challan_id():
        # Clean government receipt style: CH-YYYYMMDD-XXXX (e.g., CH-20260925-A8F2)
        date_str = datetime.now().strftime("%Y%m%d")
        random_str = uuid.uuid4().hex[:6].upper()
        return f"CH-{date_str}-{random_str}"

    def to_dict(self):
        return {
            "id": self.id,
            "challan_id": self.challan_id,
            "vehicle_number": self.vehicle_number,
            "violation_type": self.violation_type,
            "location": self.location,
            "violation_date": self.violation_date.isoformat() if self.violation_date else None,
            "fine_amount": float(self.fine_amount),
            "payment_status": self.payment_status,
            "paid_at": self.paid_at.isoformat() if self.paid_at else None,
            "payment_reference": self.payment_reference,
            "officer_badge": self.officer_badge,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
