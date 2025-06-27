# utils/sms_helper.py

import africastalking
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path=".env")

# Initialize Africa's Talking SDK
username = os.getenv("AT_USERNAME")
api_key = os.getenv("AT_API_KEY")
africastalking.initialize(username, api_key)

# Get SMS service
sms = africastalking.SMS

# Function to send SMS
def send_sms(recipient, message):
    try:
        response = sms.send(message, [recipient])
        return {"success": True, "response": response}
    except Exception as e:
        return {"success": False, "error": str(e)}
