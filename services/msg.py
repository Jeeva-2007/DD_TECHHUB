import os
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

app = FastAPI(title="Telegram Notification Service")

# Telegram Bot Token from .env
BOT_TOKEN = os.getenv("BOT_TOKEN", "8368143070:AAEVc-Mi_BDypDUMYfqzoRTnRuC6_mJZr6M")

# Phone number -> Telegram Chat ID
users = {
    "9080189795": "6628696377",
    "9944393239": "8176005834"
}

class MessageRequest(BaseModel):
    phone_number: str
    message: str

class MessageContent(BaseModel):
    message: str

def send_telegram_notification(chat_id: str, message: str) -> bool:
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    data = {
        "chat_id": chat_id,
        "text": message
    }
    try:
        response = requests.post(url, data=data, timeout=5)
        return response.status_code == 200
    except Exception as e:
        print(f"[MSG SERVICE] Telegram API Error: {e}")
        return False

def send_message_internal(raw_phone: str, message_text: str):
    clean_digits = "".join([c for c in str(raw_phone) if c.isdigit()])[-10:]
    target_phone = clean_digits if clean_digits in users else "9080189795"
    chat_id = users[target_phone]

    print(f"\n[MSG SERVICE LOG] ==========================================")
    print(f"[MSG SERVICE LOG] Incoming Send Message Request")
    print(f"[MSG SERVICE LOG] 📞 Raw Phone Input  : {raw_phone}")
    print(f"[MSG SERVICE LOG] 🎯 Target Phone Num : {target_phone}")
    print(f"[MSG SERVICE LOG] 📲 Telegram Chat ID : {chat_id}")
    print(f"[MSG SERVICE LOG] 💬 Message Text     : {message_text[:70]}...")
    print(f"[MSG SERVICE LOG] ==========================================\n")

    success = send_telegram_notification(chat_id, message_text)
    if success:
        print(f"[MSG SERVICE LOG] ✅ Message successfully DELIVERED to Phone: {target_phone} (Chat ID: {chat_id})")
        return {
            "status": "success",
            "message": f"Notification sent to phone {target_phone} (Chat ID: {chat_id}) successfully",
            "target_phone": target_phone,
            "target_chat_id": chat_id
        }
    else:
        print(f"[MSG SERVICE LOG] ❌ Message delivery FAILED for Phone: {target_phone} (Chat ID: {chat_id})")
        return {
            "status": "failed",
            "message": f"Failed to send notification to phone {target_phone}",
            "target_phone": target_phone,
            "target_chat_id": chat_id
        }

@app.get("/health")
def health_check():
    return {"service": "msg-service", "status": "healthy"}

@app.post("/send-message/{phone_number}")
def send_message_by_phone(phone_number: str, req: MessageContent):
    """POST /send-message/{phone_number} with JSON body {"message": "..."}"""
    return send_message_internal(phone_number, req.message)

@app.post("/send-message")
def send_message(req: MessageRequest):
    """POST /send-message with JSON body {"phone_number": "...", "message": "..."}"""
    return send_message_internal(req.phone_number, req.message)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8003)
