from datetime import datetime, timezone
import uuid
from flask import Blueprint, request, jsonify, g, send_file, Response
from sqlalchemy import or_, and_, desc, asc
from models import db, Violation
from utils.validators import validate_violation_payload, ALLOWED_VIOLATION_TYPES
from utils.qr_generator import generate_challan_qr
from utils.auth import jwt_required

violations_bp = Blueprint("violations", __name__, url_prefix="/api/violations")

@violations_bp.route("/types", methods=["GET"])
def get_violation_types():
    return jsonify({
        "types": ALLOWED_VIOLATION_TYPES
    }), 200

@violations_bp.route("", methods=["GET"])
def get_violations():
    search = request.args.get("search", "").strip()
    vehicle = request.args.get("vehicle_number", "").strip().upper()
    challan_id = request.args.get("challan_id", "").strip().upper()
    status = request.args.get("status", "").strip().upper()
    violation_type = request.args.get("violation_type", "").strip()
    date_from = request.args.get("date_from", "").strip()
    date_to = request.args.get("date_to", "").strip()
    
    page = max(1, request.args.get("page", 1, type=int))
    per_page = min(100, max(1, request.args.get("per_page", 15, type=int)))

    query = Violation.query

    # Search filter (vehicle number, challan ID, or location)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Violation.vehicle_number.ilike(search_filter),
                Violation.challan_id.ilike(search_filter),
                Violation.location.ilike(search_filter),
                Violation.violation_type.ilike(search_filter)
            )
        )

    if vehicle:
        query = query.filter(Violation.vehicle_number.ilike(f"%{vehicle}%"))

    if challan_id:
        query = query.filter(Violation.challan_id.ilike(f"%{challan_id}%"))

    if status and status != "ALL":
        query = query.filter(Violation.payment_status == status)

    if violation_type and violation_type != "ALL":
        query = query.filter(Violation.violation_type == violation_type)

    if date_from:
        try:
            d_from = datetime.fromisoformat(date_from)
            query = query.filter(Violation.violation_date >= d_from)
        except Exception:
            pass

    if date_to:
        try:
            d_to = datetime.fromisoformat(date_to)
            # End of day if simple date
            if len(date_to) <= 10:
                d_to = d_to.replace(hour=23, minute=59, second=59)
            query = query.filter(Violation.violation_date <= d_to)
        except Exception:
            pass

    # Order by violation_date descending by default
    query = query.order_by(desc(Violation.violation_date))

    total = query.count()
    paginated = query.offset((page - 1) * per_page).limit(per_page).all()

    items = []
    for v in paginated:
        item = v.to_dict()
        items.append(item)

    return jsonify({
        "violations": items,
        "pagination": {
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": (total + per_page - 1) // per_page if total > 0 else 1
        }
    }), 200

@violations_bp.route("", methods=["POST"])
@jwt_required(optional=True)
def create_violation():
    data = request.get_json() or {}
    
    is_valid, errors, sanitized = validate_violation_payload(data)
    if not is_valid:
        return jsonify({
            "error": "Validation failed",
            "validation_errors": errors
        }), 422

    # Officer badge if logged in
    officer_badge = sanitized.get("officer_badge")
    if hasattr(g, "current_user") and g.current_user:
        officer_badge = g.current_user.badge_number

    # Generate unique challan ID
    challan_id = Violation.generate_challan_id()
    while Violation.query.filter_by(challan_id=challan_id).first():
        challan_id = Violation.generate_challan_id()

    new_violation = Violation(
        challan_id=challan_id,
        vehicle_number=sanitized["vehicle_number"],
        violation_type=sanitized["violation_type"],
        location=sanitized["location"],
        violation_date=sanitized["violation_date"],
        fine_amount=sanitized["fine_amount"],
        payment_status="UNPAID",
        officer_badge=officer_badge,
        notes=sanitized.get("notes")
    )

    db.session.add(new_violation)
    db.session.commit()

    # Generate QR code for immediate return
    qr_data_uri, public_url = generate_challan_qr(new_violation.challan_id)
    response_data = new_violation.to_dict()
    response_data["qr_code"] = qr_data_uri
    response_data["public_url"] = public_url

    return jsonify({
        "message": "Traffic violation logged successfully.",
        "violation": response_data
    }), 201

@violations_bp.route("/<identifier>", methods=["GET"])
def get_violation(identifier: str):
    # Support lookup by numerical ID or challan_id
    violation = None
    if identifier.isdigit():
        violation = Violation.query.get(int(identifier))
    if not violation:
        violation = Violation.query.filter_by(challan_id=identifier).first()

    if not violation:
        return jsonify({"error": "Violation record not found."}), 404

    qr_data_uri, public_url = generate_challan_qr(violation.challan_id)
    data = violation.to_dict()
    data["qr_code"] = qr_data_uri
    data["public_url"] = public_url

    return jsonify({"violation": data}), 200

@violations_bp.route("/<identifier>", methods=["PUT"])
@jwt_required()
def update_violation(identifier: str):
    violation = None
    if identifier.isdigit():
        violation = Violation.query.get(int(identifier))
    if not violation:
        violation = Violation.query.filter_by(challan_id=identifier).first()

    if not violation:
        return jsonify({"error": "Violation record not found."}), 404

    data = request.get_json() or {}
    is_valid, errors, sanitized = validate_violation_payload(data)
    if not is_valid:
        return jsonify({
            "error": "Validation failed",
            "validation_errors": errors
        }), 422

    violation.vehicle_number = sanitized["vehicle_number"]
    violation.violation_type = sanitized["violation_type"]
    violation.location = sanitized["location"]
    violation.violation_date = sanitized["violation_date"]
    violation.fine_amount = sanitized["fine_amount"]
    if "notes" in sanitized:
        violation.notes = sanitized["notes"]

    db.session.commit()

    qr_data_uri, public_url = generate_challan_qr(violation.challan_id)
    data = violation.to_dict()
    data["qr_code"] = qr_data_uri
    data["public_url"] = public_url

    return jsonify({
        "message": "Violation details updated successfully.",
        "violation": data
    }), 200

@violations_bp.route("/<identifier>/status", methods=["PATCH"])
@jwt_required(optional=True)
def update_payment_status(identifier: str):
    violation = None
    if identifier.isdigit():
        violation = Violation.query.get(int(identifier))
    if not violation:
        violation = Violation.query.filter_by(challan_id=identifier).first()

    if not violation:
        return jsonify({"error": "Violation record not found."}), 404

    data = request.get_json() or {}
    new_status = str(data.get("payment_status", "PAID")).strip().upper()

    if new_status not in ["PAID", "UNPAID"]:
        return jsonify({"error": "Payment status must be either 'PAID' or 'UNPAID'."}), 400

    violation.payment_status = new_status
    if new_status == "PAID":
        violation.paid_at = datetime.now(timezone.utc)
        violation.payment_reference = data.get("payment_reference") or f"TXN-{uuid.uuid4().hex[:8].upper()}"
    else:
        violation.paid_at = None
        violation.payment_reference = None

    db.session.commit()

    qr_data_uri, public_url = generate_challan_qr(violation.challan_id)
    result = violation.to_dict()
    result["qr_code"] = qr_data_uri
    result["public_url"] = public_url

    return jsonify({
        "message": f"Payment status updated to {new_status}.",
        "violation": result
    }), 200

@violations_bp.route("/<identifier>", methods=["DELETE"])
@jwt_required()
def delete_violation(identifier: str):
    violation = None
    if identifier.isdigit():
        violation = Violation.query.get(int(identifier))
    if not violation:
        violation = Violation.query.filter_by(challan_id=identifier).first()

    if not violation:
        return jsonify({"error": "Violation record not found."}), 404

    challan_id = violation.challan_id
    db.session.delete(violation)
    db.session.commit()

    return jsonify({
        "message": f"Violation {challan_id} deleted successfully."
    }), 200

@violations_bp.route("/<identifier>/qr", methods=["GET"])
def get_violation_qr(identifier: str):
    violation = None
    if identifier.isdigit():
        violation = Violation.query.get(int(identifier))
    if not violation:
        violation = Violation.query.filter_by(challan_id=identifier).first()

    if not violation:
        return jsonify({"error": "Violation not found."}), 404

    qr_bytes, _ = generate_challan_qr(violation.challan_id, return_format="bytes")
    return Response(qr_bytes, mimetype="image/png")
