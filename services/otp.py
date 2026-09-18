from fastapi import FastAPI
from pydantic import BaseModel
import random
import requests

app = FastAPI()


# Telegram Bot Token
BOT_TOKEN = "8368143070:AAEVc-Mi_BDypDUMYfqzoRTnRuC6_mJZr6M"


# Phone number -> Telegram Chat ID
users = {
    "9080189795": "6628696377",
    "9944393239": "8176005834"
}


# Request format
class OTPRequest(BaseModel):
    phone_number: str


# Generate OTP
def generate_otp():
    return str(random.randint(1000, 9999))


# Send OTP to Telegram
def send_telegram_message(chat_id, otp):

    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"

    data = {
        "chat_id": chat_id,
        "text": f"🔐 Your OTP is: {otp}"
    }

    response = requests.post(url, data=data)

    return response.status_code == 200


# REST API endpoint
@app.post("/send-otp")
def send_otp(request: OTPRequest):

    phone_number = request.phone_number

    # Check whether phone number exists
    if phone_number not in users:
        return {
            "status": "failed",
            "message": "Phone number is not registered"
        }

    # Get Telegram chat ID
    chat_id = users[phone_number]

    # Generate OTP
    otp = generate_otp()

    # Send OTP
    success = send_telegram_message(chat_id, otp)

    if success:
        return {
            "status": "success",
            "message": "OTP sent successfully",
            "otp": otp
        }

    else:
        return {
            "status": "failed",
            "message": "Failed to send OTP"
        }