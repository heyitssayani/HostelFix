"""
=============================================================================
HostelFix - Hostel Complaint Management System
=============================================================================
A clean, beginner-friendly Flask web application for college hostel students
to log, track, filter, and resolve hostel maintenance issues.

Author: Antigravity Coding Mentor & Pair Programmer
Tech Stack: Python 3, Flask, HTML5, CSS3, Vanilla JavaScript, JSON file storage
=============================================================================
"""

import os
import json
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for, flash

# ---------------------------------------------------------------------------
# 1. Application Initialization & Configuration
# ---------------------------------------------------------------------------
app = Flask(__name__)

# Secret key is required by Flask to securely sign session cookies for flash messages.
# For production apps, use an environment variable; for local student projects, this string is fine.
app.secret_key = "hostelfix_super_secret_session_key_2026"

# Define the path for our JSON storage file relative to this script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "complaints.json")

# Allowed configuration options for validation and dropdowns
ALLOWED_CATEGORIES = [
    "Electrical",
    "Plumbing",
    "Carpentry",
    "Wi-Fi & Network",
    "Cleanliness",
    "Others"
]

ALLOWED_PRIORITIES = [
    "Low",
    "Medium",
    "High",
    "Urgent"
]

ALLOWED_STATUSES = [
    "Pending",
    "In Progress",
    "Resolved"
]

# Realistic seed data used ONLY if complaints.json doesn't exist or is empty
DEFAULT_SAMPLE_DATA = [
    {
        "id": "HF-1001",
        "student_name": "Aarav Sharma",
        "room_number": "B-204",
        "title": "Ceiling fan regulator stuck at maximum speed",
        "category": "Electrical",
        "priority": "Medium",
        "description": "The fan regulator knob broke off and is jammed at speed 5. It creates excessive noise and cannot be slowed down or switched off independently.",
        "status": "In Progress",
        "created_at": "2026-10-10 14:30"
    },
    {
        "id": "HF-1002",
        "student_name": "Rohan Deshmukh",
        "room_number": "A-108",
        "title": "Continuous tap leakage under washbasin",
        "category": "Plumbing",
        "priority": "Urgent",
        "description": "Water pipe joint beneath the bathroom washbasin is dripping steadily, accumulating water on the floor and making it slippery.",
        "status": "Pending",
        "created_at": "2026-10-11 09:15"
    },
    {
        "id": "HF-1003",
        "student_name": "Priya Nair",
        "room_number": "C-312",
        "title": "Wi-Fi access point dead in 3rd floor west wing",
        "category": "Wi-Fi & Network",
        "priority": "High",
        "description": "The corridor router has no power or blinking lights. Students in rooms C-310 through C-316 have zero signal during evening study hours.",
        "status": "Resolved",
        "created_at": "2026-10-09 18:45"
    },
    {
        "id": "HF-1004",
        "student_name": "Karthik Verma",
        "room_number": "B-115",
        "title": "Study table drawer runner jammed",
        "category": "Carpentry",
        "priority": "Low",
        "description": "Wooden slider on the left drawer is misaligned and stuck halfway. Cannot store books or laptop safely.",
        "status": "Pending",
        "created_at": "2026-10-12 11:20"
    },
    {
        "id": "HF-1005",
        "student_name": "Siddharth Rao",
        "room_number": "A-304",
        "title": "Common corridor lighting tube flickering violently",
        "category": "Electrical",
        "priority": "Medium",
        "description": "Tube light right outside room A-304 flickers rapidly and produces a loud hum, causing headaches and poor visibility at night.",
        "status": "In Progress",
        "created_at": "2026-10-12 16:10"
    },
    {
        "id": "HF-1006",
        "student_name": "Ananya Sen",
        "room_number": "C-102",
        "title": "Room door latch lock cylinder jamming",
        "category": "Carpentry",
        "priority": "Urgent",
        "description": "Key gets stuck inside the lock tumbler when attempting to latch from outside. Need lock replacement for safety.",
        "status": "Resolved",
        "created_at": "2026-10-08 10:05"
    }
]


# ---------------------------------------------------------------------------
# 2. JSON Storage Helper Functions (Beginner Python file handling)
# ---------------------------------------------------------------------------
def init_storage():
    """
    Ensures that the JSON storage file exists.
    If the file is missing or empty, seeds it with initial sample complaints.
    """
    if not os.path.exists(DATA_FILE) or os.path.getsize(DATA_FILE) == 0:
        save_complaints(DEFAULT_SAMPLE_DATA)


def load_complaints():
    """
    Reads and returns the list of complaints from complaints.json.
    Includes error handling for file reading and invalid JSON.
    """
    init_storage()
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        # Fallback in case the file became corrupted during manual edits
        return []


def save_complaints(complaints_list):
    """
    Writes the list of complaints back to complaints.json with neat indentation.
    """
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(complaints_list, f, indent=2, ensure_ascii=False)


def generate_next_id(complaints):
    """
    Generates a human-friendly unique ID like HF-1007.
    Extracts the highest number from existing HF-xxxx IDs and increments by 1.
    """
    max_num = 1000
    for c in complaints:
        cid = c.get("id", "")
        if cid.startswith("HF-"):
            try:
                num_part = int(cid.split("-")[1])
                if num_part > max_num:
                    max_num = num_part
            except (ValueError, IndexError):
                continue
    return f"HF-{max_num + 1}"


# Initialize file on module import
init_storage()


# ---------------------------------------------------------------------------
# 3. Web Routes & Controller Logic
# ---------------------------------------------------------------------------

@app.route("/")
def index():
    """
    DASHBOARD VIEW:
    Calculates summary metrics (Total, Pending, In Progress, Resolved)
    and displays the most recent complaints and category distribution.
    """
    complaints = load_complaints()

    # Calculate status counts using simple list comprehensions (easy for beginners!)
    total_count = len(complaints)
    pending_count = sum(1 for c in complaints if c.get("status") == "Pending")
    in_progress_count = sum(1 for c in complaints if c.get("status") == "In Progress")
    resolved_count = sum(1 for c in complaints if c.get("status") == "Resolved")

    # Calculate percentage resolved for a progress bar
    resolution_rate = round((resolved_count / total_count * 100), 1) if total_count > 0 else 0.0

    # Calculate category counts for visual breakdown badges
    category_counts = {}
    for cat in ALLOWED_CATEGORIES:
        category_counts[cat] = sum(1 for c in complaints if c.get("category") == cat)

    # Sort complaints by created_at descending (newest first) to show latest 5
    recent_complaints = sorted(
        complaints,
        key=lambda x: x.get("created_at", ""),
        reverse=True
    )[:5]

    return render_template(
        "index.html",
        total_count=total_count,
        pending_count=pending_count,
        in_progress_count=in_progress_count,
        resolved_count=resolved_count,
        resolution_rate=resolution_rate,
        category_counts=category_counts,
        recent_complaints=recent_complaints
    )


@app.route("/complaints")
def complaints_list():
    """
    COMPLAINT LIST VIEW WITH SEARCH & FILTERS:
    Allows students/wardens to filter by category, priority, status,
    and search across title, ID, room number, or student name.
    """
    complaints = load_complaints()

    # Extract query parameters from the URL (e.g. /complaints?status=Pending&search=fan)
    search_query = request.args.get("search", "").strip().lower()
    selected_category = request.args.get("category", "").strip()
    selected_priority = request.args.get("priority", "").strip()
    selected_status = request.args.get("status", "").strip()
    sort_by = request.args.get("sort", "newest").strip()

    # Start with all complaints and apply filters step by step
    filtered = complaints

    # 1. Search filter: matches title, id, room, or student name
    if search_query:
        filtered = [
            c for c in filtered
            if search_query in c.get("title", "").lower()
            or search_query in c.get("id", "").lower()
            or search_query in c.get("room_number", "").lower()
            or search_query in c.get("student_name", "").lower()
        ]

    # 2. Category filter
    if selected_category and selected_category in ALLOWED_CATEGORIES:
        filtered = [c for c in filtered if c.get("category") == selected_category]

    # 3. Priority filter
    if selected_priority and selected_priority in ALLOWED_PRIORITIES:
        filtered = [c for c in filtered if c.get("priority") == selected_priority]

    # 4. Status filter
    if selected_status and selected_status in ALLOWED_STATUSES:
        filtered = [c for c in filtered if c.get("status") == selected_status]

    # 5. Sorting
    priority_order = {"Urgent": 0, "High": 1, "Medium": 2, "Low": 3}
    if sort_by == "oldest":
        filtered = sorted(filtered, key=lambda x: x.get("created_at", ""))
    elif sort_by == "priority":
        filtered = sorted(filtered, key=lambda x: priority_order.get(x.get("priority", "Low"), 99))
    else:
        # Default: newest first
        filtered = sorted(filtered, key=lambda x: x.get("created_at", ""), reverse=True)

    return render_template(
        "complaints.html",
        complaints=filtered,
        total_filtered=len(filtered),
        search_query=request.args.get("search", "").strip(),
        selected_category=selected_category,
        selected_priority=selected_priority,
        selected_status=selected_status,
        sort_by=sort_by,
        categories=ALLOWED_CATEGORIES,
        priorities=ALLOWED_PRIORITIES,
        statuses=ALLOWED_STATUSES
    )


@app.route("/submit", methods=["GET", "POST"])
def submit_complaint():
    """
    SUBMIT COMPLAINT VIEW:
    - GET: Shows the complaint registration form.
    - POST: Validates student inputs, generates ID and timestamp,
      and appends to complaints.json.
    """
    if request.method == "POST":
        # Extract inputs from HTML form
        student_name = request.form.get("student_name", "").strip()
        room_number = request.form.get("room_number", "").strip().upper()
        title = request.form.get("title", "").strip()
        category = request.form.get("category", "").strip()
        priority = request.form.get("priority", "").strip()
        description = request.form.get("description", "").strip()

        # Preserve form data in case validation fails
        form_data = {
            "student_name": student_name,
            "room_number": room_number,
            "title": title,
            "category": category,
            "priority": priority,
            "description": description
        }

        # ---------------- Server-Side Validation ----------------
        errors = []

        if not student_name or len(student_name) < 2 or len(student_name) > 50:
            errors.append("Student Name must be between 2 and 50 characters.")

        if not room_number or len(room_number) < 2 or len(room_number) > 15:
            errors.append("Room Number is required (e.g., B-204, 312, A-Block 102).")

        if not title or len(title) < 5 or len(title) > 100:
            errors.append("Title must be between 5 and 100 characters.")

        if category not in ALLOWED_CATEGORIES:
            errors.append("Please select a valid complaint category.")

        if priority not in ALLOWED_PRIORITIES:
            errors.append("Please select a valid priority level.")

        if not description or len(description) < 10 or len(description) > 1000:
            errors.append("Description must be between 10 and 1000 characters explaining the issue.")

        # If any validation error occurred, flash warning and re-render form
        if errors:
            for error in errors:
                flash(error, "error")
            return render_template(
                "submit.html",
                categories=ALLOWED_CATEGORIES,
                priorities=ALLOWED_PRIORITIES,
                form_data=form_data
            )

        # Everything is valid! Proceed to create record.
        complaints = load_complaints()
        new_id = generate_next_id(complaints)
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")

        new_complaint = {
            "id": new_id,
            "student_name": student_name,
            "room_number": room_number,
            "title": title,
            "category": category,
            "priority": priority,
            "description": description,
            "status": "Pending",  # Every new complaint starts as Pending
            "created_at": timestamp
        }

        complaints.append(new_complaint)
        save_complaints(complaints)

        flash(f"Complaint {new_id} submitted successfully! Hostel maintenance has been logged.", "success")
        return redirect(url_for("complaints_list"))

    # GET request: render blank form
    return render_template(
        "submit.html",
        categories=ALLOWED_CATEGORIES,
        priorities=ALLOWED_PRIORITIES,
        form_data={}
    )


@app.route("/update-status/<complaint_id>", methods=["POST"])
def update_status(complaint_id):
    """
    STATUS UPDATE ENDPOINT:
    Allows toggling status between Pending, In Progress, and Resolved.
    """
    new_status = request.form.get("status", "").strip()

    if new_status not in ALLOWED_STATUSES:
        flash("Invalid status selection provided.", "error")
        return redirect(request.referrer or url_for("complaints_list"))

    complaints = load_complaints()
    found = False

    for c in complaints:
        if c.get("id") == complaint_id:
            c["status"] = new_status
            found = True
            break

    if found:
        save_complaints(complaints)
        flash(f"Status for {complaint_id} updated to '{new_status}'.", "success")
    else:
        flash(f"Complaint ID {complaint_id} not found.", "error")

    # Redirect back to the page the user was on (Dashboard or Complaints list)
    return redirect(request.referrer or url_for("complaints_list"))


@app.route("/delete/<complaint_id>", methods=["POST"])
def delete_complaint(complaint_id):
    """
    DELETE COMPLAINT ENDPOINT:
    Permanently deletes a complaint record after client confirmation.
    """
    complaints = load_complaints()
    initial_length = len(complaints)

    # Filter out the matching ID
    complaints = [c for c in complaints if c.get("id") != complaint_id]

    if len(complaints) < initial_length:
        save_complaints(complaints)
        flash(f"Complaint {complaint_id} was deleted successfully.", "info")
    else:
        flash(f"Complaint {complaint_id} could not be found to delete.", "error")

    return redirect(request.referrer or url_for("complaints_list"))


# ---------------------------------------------------------------------------
# 4. Entry Point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    # debug=True enables live code reloading and interactive traceback in browser
    # Port 5000 is Flask standard default
    print("\n" + "="*50)
    print("  HostelFix Server is Starting!")
    print("  Open in your browser: http://127.0.0.1:5000")
    print("="*50 + "\n")
    app.run(debug=True, host="127.0.0.1", port=5000)
