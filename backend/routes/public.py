from datetime import datetime, timezone
import uuid
from flask import Blueprint, jsonify, request
from models import db, Violation
from utils.qr_generator import generate_challan_qr

public_bp = Blueprint("public", __name__, url_prefix="/api/public")

@public_bp.route("/challan/<challan_id>", methods=["GET"])
def get_public_challan(challan_id: str):
    clean_id = challan_id.strip()
    violation = Violation.query.filter_by(challan_id=clean_id).first()

    if not violation:
        return jsonify({
            "error": "Challan Not Found",
            "message": f"No traffic violation record was found matching Challan ID '{clean_id}'. Please verify the number or contact the Traffic Enforcement Department."
        }), 404

    qr_data_uri, public_url = generate_challan_qr(violation.challan_id)
    
    # Public view does not expose internal DB id or officer personal info
    data = {
        "challan_id": violation.challan_id,
        "vehicle_number": violation.vehicle_number,
        "violation_type": violation.violation_type,
        "location": violation.location,
        "violation_date": violation.violation_date.isoformat() if violation.violation_date else None,
        "fine_amount": float(violation.fine_amount),
        "payment_status": violation.payment_status,
        "paid_at": violation.paid_at.isoformat() if violation.paid_at else None,
        "payment_reference": violation.payment_reference,
        "notes": violation.notes,
        "qr_code": qr_data_uri,
        "public_url": public_url,
        "verified_by": "Government Traffic Enforcement Directorate",
        "issuing_authority": "Smart Traffic Police & Transport Authority"
    }

    return jsonify({"challan": data}), 200

@public_bp.route("/challan/<challan_id>/pay", methods=["POST"])
def public_pay_challan(challan_id: str):
    """
    Public citizen payment settlement simulation.
    Allows citizens to settle their challan online directly from the QR page.
    """
    clean_id = challan_id.strip()
    violation = Violation.query.filter_by(challan_id=clean_id).first()

    if not violation:
        return jsonify({"error": "Challan not found"}), 404

    if violation.payment_status == "PAID":
        return jsonify({
            "message": "Challan has already been paid.",
            "payment_reference": violation.payment_reference,
            "paid_at": violation.paid_at.isoformat() if violation.paid_at else None
        }), 200

    data = request.get_json() or {}
    payment_method = data.get("payment_method", "ONLINE_UPI")

    violation.payment_status = "PAID"
    violation.paid_at = datetime.now(timezone.utc)
    violation.payment_reference = f"CITIZEN-PAY-{uuid.uuid4().hex[:8].upper()}"

    db.session.commit()

    return jsonify({
        "message": "Payment processed successfully. Challan is now settled.",
        "challan_id": violation.challan_id,
        "payment_status": "PAID",
        "paid_at": violation.paid_at.isoformat(),
        "payment_reference": violation.payment_reference
    }), 200
