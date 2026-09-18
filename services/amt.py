import os
import json
import random
import requests
import uvicorn
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel

# Load environment variables
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=BASE_DIR / ".env")
load_dotenv(dotenv_path=BASE_DIR / "agent" / ".env")

app = FastAPI(title="Payment Dispatch Telegram Service")

# Telegram Bot Token from .env
BOT_TOKEN = os.getenv("BOT_TOKEN", "8368143070:AAEVc-Mi_BDypDUMYfqzoRTnRuC6_mJZr6M")
CONFIG_PATH = BASE_DIR / "capacity_config.json"

# Phone number -> Telegram Chat ID
users = {
    "9080189795": "6628696377",
    "9944393239": "8176005834"
}

def get_capacity_config() -> dict:
    if CONFIG_PATH.exists():
        try:
            with open(CONFIG_PATH, "r") as f:
                return json.load(f)
        except Exception:
            pass
    return {"payment_timeout_seconds": 2.0}

class PaymentRequest(BaseModel):
    phone_number: str
    total_amount: float

def generate_order_reference():
    return "ORD" + str(random.randint(100000, 999999))

def generate_payment_reference():
    return "PAY" + str(random.randint(100000, 999999))

def send_telegram_message(chat_id, order_ref, payment_ref, amount, timeout_sec=2.0):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    message = (
        f"Payment Dispatch Notification\n\n"
        f"Order Reference: {order_ref}\n"
        f"Payment Reference: {payment_ref}\n"
        f"Total Amount: INR {amount:,.2f}"
    )
    data = {
        "chat_id": chat_id,
        "text": message
    }
    try:
        response = requests.post(url, data=data, timeout=min(timeout_sec, 5.0))
        return response.status_code == 200
    except Exception as e:
        print(f"[AMT SERVICE] Telegram API Exception: {e}")
        return False

@app.post("/payment")
def payment(request: PaymentRequest):
    phone_number = request.phone_number
    amount = request.total_amount

    cfg = get_capacity_config()
    timeout_sec = cfg.get("payment_timeout_seconds", 2.0)

    if amount <= 0:
        return {
            "status": "failed",
            "message": "Payment amount must be greater than 0"
        }

    clean_digits = "".join([c for c in str(phone_number) if c.isdigit()])[-10:]
    target_phone = clean_digits if clean_digits in users else "9080189795"
    chat_id = users[target_phone]

    order_ref = generate_order_reference()
    payment_ref = generate_payment_reference()

    success = send_telegram_message(chat_id, order_ref, payment_ref, amount, timeout_sec=timeout_sec)

    if success:
        return {
            "status": "success",
            "order_reference": order_ref,
            "payment_reference": payment_ref,
            "total_amount": amount,
            "notified_phone": target_phone,
            "payment_timeout_seconds": timeout_sec
        }
    else:
        return {
            "status": "failed",
            "error_code": "PAYMENT_TIMEOUT_EXCEEDED",
            "message": f"Failed to dispatch payment details within {timeout_sec}s time limit.",
            "order_reference": order_ref,
            "payment_reference": payment_ref,
            "total_amount": amount,
            "notified_phone": target_phone
        }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)