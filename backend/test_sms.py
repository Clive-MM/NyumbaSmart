# test_sms.py
import os
from dotenv import load_dotenv

# Load .env from current directory (adjust path if needed)
load_dotenv()

# Accept either naming scheme
USERNAME = (os.getenv("AFRICASTALKING_USERNAME") or os.getenv("AT_USERNAME") or "").strip()
API_KEY  = (os.getenv("AFRICASTALKING_API_KEY")  or os.getenv("AT_API_KEY")  or "").strip()

print("Username:", USERNAME or "<missing>")
print("API key present:", bool(API_KEY))

# Optional kill-switch for local testing (same flag as your app)
DISABLE_SMS = os.getenv("DISABLE_SMS", "false").lower() == "true"
if DISABLE_SMS:
    print("DISABLE_SMS=true → skipping real send.")
    raise SystemExit(0)

if not USERNAME or not API_KEY:
    print("⚠️ Missing credentials. Set AFRICASTALKING_USERNAME/API_KEY or AT_USERNAME/AT_API_KEY in .env")
    raise SystemExit(1)

import africastalking

# Initialize SDK
try:
    africastalking.initialize(USERNAME, API_KEY)
    sms = africastalking.SMS
except Exception as e:
    print("❌ Init failed:", e)
    raise SystemExit(1)

# Sandbox notes:
# - Username must be 'sandbox' when using the sandbox API key.
# - Recipient must be a verified sandbox number (Dashboard → Sandbox → Phone Numbers).
recipient = ["254723176982"]  # Prefer no leading '+'
message = "Hello Clive! Test SMS via Africa's Talking sandbox."

try:
    resp = sms.send(message=message, to=recipient)
    print("✅ Sent:", resp)
except Exception as e:
    print("❌ Error sending message:", e)
    raise SystemExit(1)
