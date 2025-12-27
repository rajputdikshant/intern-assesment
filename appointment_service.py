"""
appointment_service.py

Assignment Requirement: Backend service that mocks appointment data and implements:
- CRUD operations (Create, Read, Update, Delete)
- Filtering by date, status, and doctorName
- Conflict detection (same doctor / overlapping times)

This service simulates Lambda/AppSync logic that would connect to Aurora PostgreSQL in production.
"""

from datetime import datetime, timedelta
import uuid
from typing import List, Dict, Optional

# Mock appointment data - mirrors the frontend mock data
MOCK_APPOINTMENTS: List[Dict] = [
    {
        "id": str(uuid.uuid4()),
        "patientName": "Rajesh Kumar",
        "date": "2025-11-06",
        "time": "09:00",
        "duration": 30,
        "doctorName": "Dr. Sarah Johnson",
        "status": "Scheduled",
        "mode": "In-person",
        "purpose": "General Checkup",
    },
    {
        "id": str(uuid.uuid4()),
        "patientName": "Anita Patel",
        "date": "2025-11-06",
        "time": "10:00",
        "duration": 60,
        "doctorName": "Dr. Sarah Johnson",
        "status": "Scheduled",
        "mode": "In-person",
        "purpose": "Follow-up Consultation",
    },
    {
        "id": str(uuid.uuid4()),
        "patientName": "Priya Sharma",
        "date": "2025-11-06",
        "time": "11:30",
        "duration": 45,
        "doctorName": "Dr. Rajesh Kumar",
        "status": "Scheduled",
        "mode": "Teleconsult",
        "purpose": "Vaccination",
    },
    {
        "id": str(uuid.uuid4()),
        "patientName": "Vikram Singh",
        "date": "2025-11-06",
        "time": "14:00",
        "duration": 30,
        "doctorName": "Dr. Alice Brown",
        "status": "Completed",
        "mode": "In-person",
        "purpose": "Dental Check",
    },
    {
        "id": str(uuid.uuid4()),
        "patientName": "Shreya Reddy",
        "date": "2025-11-07",
        "time": "09:30",
        "duration": 30,
        "doctorName": "Dr. Sarah Johnson",
        "status": "Confirmed",
        "mode": "In-person",
        "purpose": "Cardiology",
    },
    {
        "id": str(uuid.uuid4()),
        "patientName": "Amit Rai",
        "date": "2025-11-08",
        "time": "08:30",
        "duration": 30,
        "doctorName": "Dr. Rajesh Kumar",
        "status": "Cancelled",
        "mode": "In-person",
        "purpose": "General Checkup",
    },
    {
        "id": str(uuid.uuid4()),
        "patientName": "Nisha Verma",
        "date": "2025-11-06",
        "time": "15:00",
        "duration": 45,
        "doctorName": "Dr. Alice Brown",
        "status": "Scheduled",
        "mode": "Teleconsult",
        "purpose": "Consultation",
    },
    {
        "id": str(uuid.uuid4()),
        "patientName": "Vikash Patel",
        "date": "2025-11-06",
        "time": "09:30",
        "duration": 30,
        "doctorName": "Dr. Sarah Johnson",
        "status": "Scheduled",
        "mode": "In-person",
        "purpose": "General Checkup",
    },
    {
        "id": str(uuid.uuid4()),
        "patientName": "Rohit Gupta",
        "date": "2025-11-09",
        "time": "11:00",
        "duration": 30,
        "doctorName": "Dr. Rajesh Kumar",
        "status": "Upcoming",
        "mode": "In-person",
        "purpose": "Lab Review",
    },
    {
        "id": str(uuid.uuid4()),
        "patientName": "Meera Joshi",
        "date": "2025-11-06",
        "time": "12:00",
        "duration": 60,
        "doctorName": "Dr. Sarah Johnson",
        "status": "Scheduled",
        "mode": "Teleconsult",
        "purpose": "Follow-up Consultation",
    },
    {
        "id": str(uuid.uuid4()),
        "patientName": "Karan Malhotra",
        "date": "2025-11-06",
        "time": "16:00",
        "duration": 30,
        "doctorName": "Dr. Alice Brown",
        "status": "Scheduled",
        "mode": "In-person",
        "purpose": "Vaccination",
    },
]

APPOINTMENTS: List[Dict] = MOCK_APPOINTMENTS.copy()


def _time_to_minutes(time_str: str) -> int:
    """Helper: Convert HH:MM time string to minutes since midnight."""
    """Convert HH:MM -> minutes since midnight."""
    h, m = map(int, time_str.split(":"))
    return h * 60 + m


def _overlaps(a_start: int, a_end: int, b_start: int, b_end: int) -> bool:
    """Helper: Check if two time ranges overlap."""
    return a_start < b_end and b_start < a_end


def get_appointments(filters: Optional[Dict] = None) -> List[Dict]:
    """
    Assignment Requirement: Query appointments with optional filters
    
    Filters supported:
    - date: Filter by exact date (YYYY-MM-DD)
    - status: Filter by status (Scheduled, Confirmed, Completed, Cancelled, Upcoming)
    - doctorName: Filter by doctor name
    
    Returns a copy of filtered appointments.
    """
    results = APPOINTMENTS
    if not filters:
        return results.copy()
    if "date" in filters and filters["date"]:
        results = [a for a in results if a["date"] == filters["date"]]
    if "status" in filters and filters["status"]:
        results = [a for a in results if a["status"] == filters["status"]]
    if "doctorName" in filters and filters["doctorName"]:
        results = [a for a in results if a["doctorName"] == filters["doctorName"]]
    return results.copy()


def create_appointment(payload: Dict) -> Dict:
    """
    Assignment Requirement: Create appointment with validation and overlap detection
    
    Validates required fields and prevents time conflicts for the same doctor
    on the same date. Raises ValueError if validation fails or conflict detected.
    
    Required fields: patientName, date, time, duration, doctorName, mode
    """
    required = ["patientName", "date", "time", "duration", "doctorName", "mode"]
    for k in required:
        if k not in payload or payload[k] is None or payload[k] == "":
            raise ValueError(f"Missing required field: {k}")

    date = payload["date"]
    time = payload["time"]
    duration = int(payload["duration"])
    doctor = payload["doctorName"]

    new_start = _time_to_minutes(time)
    new_end = new_start + duration
    
    # Assignment Requirement: Conflict detection
    # Check for overlapping appointments for the same doctor on the same date
    # Cancelled appointments are excluded from conflict checks
    for appt in APPOINTMENTS:
        if appt["date"] != date:
            continue
        if appt["doctorName"] != doctor:
            continue
        if appt["status"] == "Cancelled":
            continue
        existing_start = _time_to_minutes(appt["time"])
        existing_end = existing_start + int(appt["duration"])
        if _overlaps(new_start, new_end, existing_start, existing_end):
            raise ValueError(
                f"Time conflict with appointment {appt['id']} for {doctor} ({appt['time']}-{existing_end})"
            )

    new_appt = {
        "id": str(uuid.uuid4()),
        "patientName": payload["patientName"],
        "date": date,
        "time": time,
        "duration": duration,
        "doctorName": doctor,
        "status": payload.get("status", "Scheduled"),
        "mode": payload.get("mode", "In-person"),
        "purpose": payload.get("purpose", ""),
    }
    APPOINTMENTS.append(new_appt)
    return new_appt


def update_appointment_status(appt_id: str, new_status: str) -> Dict:
    """
    Assignment Requirement: Update appointment status
    
    Updates the status of an appointment by ID.
    Raises ValueError if appointment not found.
    """
    for appt in APPOINTMENTS:
        if appt["id"] == appt_id:
            appt["status"] = new_status
            return appt
    raise ValueError("Appointment not found")


def delete_appointment(appt_id: str) -> bool:
    """
    Assignment Requirement: Delete appointment
    
    Deletes an appointment by ID. Returns True if removed.
    Raises ValueError if appointment not found.
    """
    global APPOINTMENTS
    for i, appt in enumerate(APPOINTMENTS):
        if appt["id"] == appt_id:
            APPOINTMENTS.pop(i)
            return True
    raise ValueError("Appointment not found")


if __name__ == "__main__":
    print("Total mock appointments:", len(get_appointments()))
    print("Appointments on 2025-11-06:", len(get_appointments({"date": "2025-11-06"})))

    try:
        create_appointment({
            "patientName": "Conflict Test",
            "date": "2025-11-06",
            "time": "09:15",
            "duration": 30,
            "doctorName": "Dr. Sarah Johnson",
            "mode": "In-person",
        })
    except ValueError as e:
        print("Error:", e)
    new = create_appointment({
        "patientName": "New Patient",
        "date": "2025-11-06",
        "time": "17:00",
        "duration": 30,
        "doctorName": "Dr. Sarah Johnson",
    })
    print("Created:", new)
