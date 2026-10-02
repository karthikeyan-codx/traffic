from datetime import datetime
import re

ALLOWED_VIOLATION_TYPES = [
    "No Helmet",
    "Overspeeding",
    "Signal Violation",
    "No Seat Belt",
    "Drunk Driving",
    "Wrong Parking",
    "Triple Riding",
    "Using Mobile Phone",
    "Dangerous Driving",
    "Without Valid License",
    "Expired Insurance",
    "Pollution Under Control (PUC) Violation"
]

def validate_violation_payload(data: dict):
    """
    Validates violation payload.
    Returns (is_valid: bool, errors: dict, sanitized_data: dict)
    """
    errors = {}
    sanitized = {}

    if not isinstance(data, dict):
        return False, {"general": "Invalid JSON payload"}, {}

    # Vehicle Number
    vehicle_number = str(data.get("vehicle_number", "")).strip().upper()
    if not vehicle_number:
        errors["vehicle_number"] = "Vehicle number is required."
    elif len(vehicle_number) < 4 or len(vehicle_number) > 20:
        errors["vehicle_number"] = "Vehicle number must be between 4 and 20 characters."
    else:
        # Normalize: allow letters, numbers, spaces, and hyphens
        sanitized["vehicle_number"] = re.sub(r'[^A-Z0-9-]', '', vehicle_number)

    # Violation Type
    violation_type = str(data.get("violation_type", "")).strip()
    if not violation_type:
        errors["violation_type"] = "Violation type is required."
    elif len(violation_type) > 80:
        errors["violation_type"] = "Violation type must not exceed 80 characters."
    else:
        sanitized["violation_type"] = violation_type

    # Location
    location = str(data.get("location", "")).strip()
    if not location:
        errors["location"] = "Location is required."
    elif len(location) < 3:
        errors["location"] = "Location must be at least 3 characters."
    elif len(location) > 200:
        errors["location"] = "Location must not exceed 200 characters."
    else:
        sanitized["location"] = location

    # Violation Date
    raw_date = data.get("violation_date")
    if not raw_date:
        errors["violation_date"] = "Violation date is required."
    else:
        try:
            # Handle ISO string with or without timezone or simple YYYY-MM-DD
            if isinstance(raw_date, str):
                cleaned_date = raw_date.replace("Z", "+00:00")
                parsed_date = datetime.fromisoformat(cleaned_date)
            elif isinstance(raw_date, (datetime,)):
                parsed_date = raw_date
            else:
                parsed_date = datetime.strptime(str(raw_date), "%Y-%m-%d")
            sanitized["violation_date"] = parsed_date
        except Exception:
            errors["violation_date"] = "Invalid date format. Use ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)."

    # Fine Amount
    raw_amount = data.get("fine_amount")
    if raw_amount is None or raw_amount == "":
        errors["fine_amount"] = "Fine amount is required."
    else:
        try:
            amount = float(raw_amount)
            if amount <= 0:
                errors["fine_amount"] = "Fine amount must be greater than 0."
            elif amount > 500000:
                errors["fine_amount"] = "Fine amount exceeds realistic limit (Max: 500,000)."
            else:
                sanitized["fine_amount"] = round(amount, 2)
        except (ValueError, TypeError):
            errors["fine_amount"] = "Fine amount must be a valid positive number."

    # Optional fields
    if "notes" in data and data["notes"]:
        sanitized["notes"] = str(data["notes"]).strip()[:500]
    else:
        sanitized["notes"] = None

    if "officer_badge" in data and data["officer_badge"]:
        sanitized["officer_badge"] = str(data["officer_badge"]).strip()[:50]
    else:
        sanitized["officer_badge"] = None

    return len(errors) == 0, errors, sanitized
