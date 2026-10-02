from flask import Blueprint, jsonify
from sqlalchemy import desc
from models import Violation

vehicles_bp = Blueprint("vehicles", __name__, url_prefix="/api/vehicles")

@vehicles_bp.route("/<vehicle_number>/history", methods=["GET"])
def get_vehicle_history(vehicle_number: str):
    clean_number = vehicle_number.strip().upper()
    violations = (
        Violation.query
        .filter(Violation.vehicle_number == clean_number)
        .order_by(desc(Violation.violation_date))
        .all()
    )

    if not violations:
        # Also try partial match if exact match yields nothing
        violations = (
            Violation.query
            .filter(Violation.vehicle_number.ilike(f"%{clean_number}%"))
            .order_by(desc(Violation.violation_date))
            .all()
        )

    total_count = len(violations)
    paid_count = sum(1 for v in violations if v.payment_status == "PAID")
    unpaid_count = sum(1 for v in violations if v.payment_status == "UNPAID")
    total_fines = sum(v.fine_amount for v in violations)
    pending_fines = sum(v.fine_amount for v in violations if v.payment_status == "UNPAID")

    return jsonify({
        "vehicle_number": clean_number,
        "summary": {
            "total_violations": total_count,
            "paid_violations": paid_count,
            "unpaid_violations": unpaid_count,
            "total_fines": round(total_fines, 2),
            "pending_fines": round(pending_fines, 2)
        },
        "violations": [v.to_dict() for v in violations]
    }), 200
