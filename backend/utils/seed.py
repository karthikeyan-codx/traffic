from datetime import datetime, timedelta
import random
from models import db, Officer, Violation

def seed_database():
    """
    Populates initial real SQLite records for local testing.
    Includes a default traffic officer and realistic traffic violation records.
    """
    # 1. Seed Officer
    if not Officer.query.filter_by(username="officer").first():
        officer = Officer(
            username="officer",
            name="Officer Rajesh Sharma",
            badge_number="TP-8842",
            role="officer"
        )
        officer.set_password("traffic123")
        db.session.add(officer)
        print("Default officer created: officer / traffic123")

    if not Officer.query.filter_by(username="admin").first():
        admin = Officer(
            username="admin",
            name="Inspector Sunita Rao",
            badge_number="TP-1001",
            role="admin"
        )
        admin.set_password("admin123")
        db.session.add(admin)
        print("Default admin created: admin / admin123")

    # 2. Seed Violations if table is empty
    if Violation.query.count() == 0:
        sample_records = [
            {
                "challan_id": "CH-20260925-A101",
                "vehicle_number": "DL-01-AB-1234",
                "violation_type": "No Helmet",
                "location": "Connaught Place Radial Rd 3, New Delhi",
                "days_ago": 0,
                "fine_amount": 1000.0,
                "payment_status": "UNPAID",
                "officer_badge": "TP-8842",
                "notes": "Rider without approved safety helmet during morning patrol."
            },
            {
                "challan_id": "CH-20260925-B202",
                "vehicle_number": "KA-05-MN-9876",
                "violation_type": "Overspeeding",
                "location": "Outer Ring Road, Bellandur Junction, Bengaluru",
                "days_ago": 0,
                "fine_amount": 2000.0,
                "payment_status": "UNPAID",
                "officer_badge": "TP-8842",
                "notes": "Recorded 84 km/h in a 50 km/h urban arterial corridor."
            },
            {
                "challan_id": "CH-20260924-C303",
                "vehicle_number": "MH-02-CP-4521",
                "violation_type": "Signal Violation",
                "location": "Worli Sea Face Intersection, Mumbai",
                "days_ago": 1,
                "fine_amount": 1500.0,
                "payment_status": "PAID",
                "officer_badge": "TP-1001",
                "notes": "Red light jump captured via automated intersection camera."
            },
            {
                "challan_id": "CH-20260924-D404",
                "vehicle_number": "TN-09-BK-3390",
                "violation_type": "No Seat Belt",
                "location": "Anna Salai Signal, Chennai",
                "days_ago": 1,
                "fine_amount": 1000.0,
                "payment_status": "UNPAID",
                "officer_badge": "TP-8842",
                "notes": "Front seat passenger unbelted while navigating peak traffic."
            },
            {
                "challan_id": "CH-20260923-E505",
                "vehicle_number": "TS-09-FA-8812",
                "violation_type": "Wrong Parking",
                "location": "Hitec City Main Boulevard, Hyderabad",
                "days_ago": 2,
                "fine_amount": 500.0,
                "payment_status": "PAID",
                "officer_badge": "TP-1001",
                "notes": "Obstructing no-parking pedestrian crossing zone."
            },
            {
                "challan_id": "CH-20260922-F606",
                "vehicle_number": "DL-04-TC-7711",
                "violation_type": "Using Mobile Phone",
                "location": "Ring Road near Moolchand Flyover, New Delhi",
                "days_ago": 3,
                "fine_amount": 5000.0,
                "payment_status": "UNPAID",
                "officer_badge": "TP-8842",
                "notes": "Driver actively texting while steering commercial light van."
            },
            {
                "challan_id": "CH-20260921-G707",
                "vehicle_number": "KA-01-EE-4455",
                "violation_type": "Drunk Driving",
                "location": "MG Road Checkpoint, Bengaluru",
                "days_ago": 4,
                "fine_amount": 10000.0,
                "payment_status": "UNPAID",
                "officer_badge": "TP-1001",
                "notes": "Breathalyzer reading 65mg/100ml. Vehicle impounded for verification."
            },
            {
                "challan_id": "CH-20260920-H808",
                "vehicle_number": "MH-12-DE-1122",
                "violation_type": "Triple Riding",
                "location": "FC Road University Circle, Pune",
                "days_ago": 5,
                "fine_amount": 1000.0,
                "payment_status": "PAID",
                "officer_badge": "TP-8842",
                "notes": "Three adults on single two-wheeler without headgear."
            },
            {
                "challan_id": "CH-20260919-J909",
                "vehicle_number": "DL-01-AB-1234",
                "violation_type": "Wrong Parking",
                "location": "Khan Market Inner Circle, New Delhi",
                "days_ago": 6,
                "fine_amount": 500.0,
                "payment_status": "PAID",
                "officer_badge": "TP-8842",
                "notes": "Double parking during peak market evening hours."
            },
            {
                "challan_id": "CH-20260918-K010",
                "vehicle_number": "GJ-01-XZ-6060",
                "violation_type": "Dangerous Driving",
                "location": "SG Highway Express Lane, Ahmedabad",
                "days_ago": 7,
                "fine_amount": 5000.0,
                "payment_status": "UNPAID",
                "officer_badge": "TP-1001",
                "notes": "Abrupt lane changes across three lanes without indicator."
            }
        ]

        now = datetime.now()
        for rec in sample_records:
            v_date = now - timedelta(days=rec["days_ago"], hours=random.randint(1, 8), minutes=random.randint(5, 50))
            is_paid = rec["payment_status"] == "PAID"
            paid_at = v_date + timedelta(hours=12) if is_paid else None
            payment_ref = f"TXN-{random.randint(10000000, 99999999)}" if is_paid else None

            v = Violation(
                challan_id=rec["challan_id"],
                vehicle_number=rec["vehicle_number"],
                violation_type=rec["violation_type"],
                location=rec["location"],
                violation_date=v_date,
                fine_amount=rec["fine_amount"],
                payment_status=rec["payment_status"],
                paid_at=paid_at,
                payment_reference=payment_ref,
                officer_badge=rec["officer_badge"],
                notes=rec["notes"],
                created_at=v_date,
                updated_at=paid_at if is_paid else v_date
            )
            db.session.add(v)

        print("Seeded 10 initial traffic violations into SQLite.")

    db.session.commit()

if __name__ == "__main__":
    from flask import Flask
    import sys
    from pathlib import Path
    sys.path.append(str(Path(__file__).resolve().parent.parent))
    from config import Config

    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)

    with app.app_context():
        db.create_all()
        seed_database()
        print("Database initialized and seeded successfully.")
