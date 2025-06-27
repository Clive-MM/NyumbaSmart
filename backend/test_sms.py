import africastalking
import os
from dotenv import load_dotenv

# ✅ Load environment variables
load_dotenv(dotenv_path=".env")

# ✅ Print loaded values to confirm
print("Username:", os.getenv("AT_USERNAME"))
print("API Key:", os.getenv("AT_API_KEY"))

# ✅ Credentials
username = os.getenv("AT_USERNAME")
api_key = os.getenv("AT_API_KEY")

# ✅ Initialize Africa's Talking SDK
africastalking.initialize(username, api_key)

# ✅ Get SMS service
sms = africastalking.SMS

# ✅ Message details
recipient = ["+254723176982"]
message = "Hello Clive! This is a test SMS from Africa's Talking sandbox."

# ✅ Try sending SMS
try:
    response = sms.send(message, recipient)
    print("✅ Message sent successfully:")
    print(response)
except Exception as e:
    print("❌ Error sending message:", str(e))
