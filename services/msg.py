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

@app.get("/health")
def health_check():
    return {"service": "msg-service", "status": "healthy"}

@app.post("/send-message")
def send_message(req: MessageRequest):
    # Broadcast message to all registered Telegram user accounts
    all_chat_ids = list(set(users.values()))
    success_count = 0
    for chat_id in all_chat_ids:
        if send_telegram_notification(chat_id, req.message):
            success_count += 1

    if success_count > 0:
        return {
            "status": "success",
            "message": f"Notification sent to {success_count} Telegram chat(s) successfully",
            "sent_count": success_count
        }
    else:
        return {
            "status": "failed",
            "message": "Failed to send notification to Telegram",
            "sent_count": 0
        }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8003)
