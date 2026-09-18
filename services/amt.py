from fastapi import FastAPI
from pydantic import BaseModel
import random
import requests
import uvicorn

app = FastAPI(title="Payment Dispatch Telegram Service")

# Telegram Bot Token
BOT_TOKEN = "8368143070:AAEVc-Mi_BDypDUMYfqzoRTnRuC6_mJZr6M"

# Phone number -> Telegram Chat ID
users = {
    "9080189795": "6628696377",
    "9944393239": "8176005834"
}


# Request body
class PaymentRequest(BaseModel):
    phone_number: str
    total_amount: float


# Generate Order Reference
def generate_order_reference():
    return "ORD" + str(random.randint(100000, 999999))


# Generate Payment Reference
def generate_payment_reference():
    return "PAY" + str(random.randint(100000, 999999))


# Send payment details to Telegram
def send_telegram_message(chat_id, order_ref, payment_ref, amount):

    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"

    message = (
        f"🛒 Order Reference: {order_ref}\n"
        f"💳 Payment Reference: {payment_ref}\n"
        f"💰 Total Amount: ₹{amount:.2f}"
    )

    data = {
        "chat_id": chat_id,
        "text": message
    }

    try:
        response = requests.post(url, data=data, timeout=5)
        return response.status_code == 200
    except Exception as e:
        print(f"Telegram API Exception: {e}")
        return False


# REST API
@app.post("/payment")
def payment(request: PaymentRequest):

    phone_number = request.phone_number
    amount = request.total_amount

    # Check amount
    if amount <= 0:
        return {
            "status": "failed",
            "message": "Payment amount must be greater than 0"
        }

    # Clean 10 digits
    clean_digits = "".join([c for c in str(phone_number) if c.isdigit()])[-10:]
    
    # Default to 9080189795 if number is not registered directly
    target_phone = clean_digits if clean_digits in users else "9080189795"
    chat_id = users[target_phone]

    # Generate references
    order_ref = generate_order_reference()
    payment_ref = generate_payment_reference()

    # Send details to Telegram
    success = send_telegram_message(
        chat_id,
        order_ref,
        payment_ref,
        amount
    )

    if success:
        return {
            "status": "success",
            "order_reference": order_ref,
            "payment_reference": payment_ref,
            "total_amount": amount,
            "notified_phone": target_phone
        }

    else:
        return {
            "status": "failed",
            "message": "Failed to send payment details to Telegram",
            "order_reference": order_ref,
            "payment_reference": payment_ref,
            "total_amount": amount,
            "notified_phone": target_phone
        }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)