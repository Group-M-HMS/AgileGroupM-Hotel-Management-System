import urllib.request
import json
from datetime import datetime, timedelta

def create_booking(uid, room_id, check_in, check_out, guests=1):
    data = json.dumps({
        "roomId": room_id,
        "checkInDate": check_in,
        "checkOutDate": check_out,
        "numberOfGuests": guests,
        "specialRequests": "none",
        "termsAccepted": True
    }).encode("utf-8")
    
    req = urllib.request.Request("http://168.138.170.92:8085/api/v1/bookings", data=data)
    req.add_header("Content-Type", "application/json")
    req.add_header("X-User-Id", uid)
    
    try:
        res = urllib.request.urlopen(req)
        print("Created:", res.read().decode())
    except Exception as e:
        print("Error:", e)

def get_date(days_offset):
    d = datetime.now() + timedelta(days=days_offset)
    return d.strftime("%Y-%m-%d")

# 1. sorted_user_uid (needs 3 future bookings out of order)
create_booking("sorted_user_uid", 2, get_date(20), get_date(22)) # Room 2
create_booking("sorted_user_uid", 1, get_date(10), get_date(12)) # Room 1
create_booking("sorted_user_uid", 3, get_date(30), get_date(32)) # Room 3

# 2. details_user_uid (needs 1 specific booking)
create_booking("details_user_uid", 4, get_date(5), get_date(7), 4)

# 3. past_user_uid (needs 1 past booking)
create_booking("past_user_uid", 1, get_date(-10), get_date(-8))

# 4. today_user_uid (needs 1 booking with checkout = today)
create_booking("today_user_uid", 2, get_date(-2), get_date(0))


