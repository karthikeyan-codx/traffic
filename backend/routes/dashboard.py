from datetime import datetime, timedelta, timezone
from flask import Blueprint, jsonify
from sqlalchemy import func, desc
from models import db, Violation

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")

@dashboard_bp.route("/stats", methods=["GET"])
def get_dashboard_stats():
    # 1. Total violations count
    total_violations = Violation.query.count()

    # 2. Paid / Unpaid counts
    paid_violations = Violation.query.filter_by(payment_status="PAID").count()
    unpaid_violations = Violation.query.filter_by(payment_status="UNPAID").count()

    # 3. Today's violations (from midnight local/UTC)
    now = datetime.now()
    today_start = datetime(now.year, now.month, now.day, 0, 0, 0)
    today_violations = Violation.query.filter(Violation.violation_date >= today_start).count()

    # 4. Total fine collected & pending
    fine_collected_query = db.session.query(func.sum(Violation.fine_amount)).filter_by(payment_status="PAID").scalar()
    fine_collected = float(fine_collected_query or 0.0)

    fine_pending_query = db.session.query(func.sum(Violation.fine_amount)).filter_by(payment_status="UNPAID").scalar()
    fine_pending = float(fine_pending_query or 0.0)

    # 5. Violation type distribution (group by type)
    type_counts = (
        db.session.query(Violation.violation_type, func.count(Violation.id))
        .group_by(Violation.violation_type)
        .order_by(desc(func.count(Violation.id)))
        .all()
    )
    type_distribution = [
        {"type": t[0], "count": t[1]}
        for t in type_counts
    ]

    # 6. Payment status distribution
    status_distribution = [
        {"status": "PAID", "count": paid_violations},
        {"status": "UNPAID", "count": unpaid_violations}
    ]

    # 7. Recent 7 days trend
    trend = []
    for i in range(6, -1, -1):
        day_date = (now - timedelta(days=i)).date()
        start = datetime(day_date.year, day_date.month, day_date.day, 0, 0, 0)
        end = datetime(day_date.year, day_date.month, day_date.day, 23, 59, 59)
        day_count = Violation.query.filter(
            Violation.violation_date >= start,
            Violation.violation_date <= end
        ).count()
        trend.append({
            "date": day_date.strftime("%b %d"),
            "count": day_count
        })

    # 8. Recent 6 violations
    recent = (
        Violation.query
        .order_by(desc(Violation.created_at))
        .limit(6)
        .all()
    )

    return jsonify({
        "total_violations": total_violations,
        "paid_violations": paid_violations,
        "unpaid_violations": unpaid_violations,
        "today_violations": today_violations,
        "total_fine_collected": round(fine_collected, 2),
        "total_fine_pending": round(fine_pending, 2),
        "type_distribution": type_distribution,
        "status_distribution": status_distribution,
        "trend_7_days": trend,
        "recent_violations": [v.to_dict() for v in recent]
    }), 200
