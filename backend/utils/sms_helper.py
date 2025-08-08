# backend/utils/sms_helper.py

import os
from dotenv import load_dotenv

# Load env once
load_dotenv()

# Feature flag: keep SMS off by default until you're ready
DISABLE_SMS = os.getenv("DISABLE_SMS", "true").lower() == "true"

# Support both naming schemes
USERNAME = (os.getenv("AFRICASTALKING_USERNAME") or os.getenv("AT_USERNAME") or "").strip()
API_KEY  = (os.getenv("AFRICASTALKING_API_KEY")  or os.getenv("AT_API_KEY")  or "").strip()

_sms = None
_initialized = False

def _ensure_client():
    """Initialize AT SMS client once, only if enabled & properly configured."""
    global _sms, _initialized
    if _initialized:
        return _sms
    _initialized = True

    if DISABLE_SMS:
        # No-op mode
        return None

    try:
        import africastalking
    except Exception as e:
        print("[SMS] africastalking SDK not available:", e)
        return None

    if not USERNAME or not API_KEY:
        print("[SMS] Missing AFRICASTALKING_USERNAME/API_KEY; SMS disabled.")
        return None

    try:
        africastalking.initialize(USERNAME, API_KEY)
        _sms = africastalking.SMS
        print("[SMS] Africa's Talking initialized.")
    except Exception as e:
        print("[SMS] Init failed; SMS disabled:", e)
        _sms = None

    return _sms

def send_sms(recipient, message, sender_id=None):
    """
    Safe send. If disabled/not configured, no-ops and returns a stub response.
    recipient: str or list[str] in intl format (e.g. '2547XXXXXXXX')
    """
    client = _ensure_client()
    if client is None:
        print(f"[SMS disabled] Would send to {recipient}: {message}")
        return {"success": True, "response": {"status": "disabled", "to": recipient}}

    to = [recipient] if isinstance(recipient, str) else recipient
    params = {"message": message, "to": to}
    if sender_id:
        params["from_"] = sender_id

    try:
        resp = client.send(**params)
        return {"success": True, "response": resp}
    except Exception as e:
        return {"success": False, "error": str(e)}
