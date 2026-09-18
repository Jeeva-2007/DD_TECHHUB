import os
import json
import uuid
import time
import random
import sqlite3
import requests
from datetime import datetime, timezone
from pathlib import Path
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="OTP Service with Capacity, Latency & Crash Simulation")

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
CONFIG_PATH = BASE_DIR / "capacity_config.json"
DB_PATH = BASE_DIR / "backend" / "dd_techhub.db"

# Telegram Bot Token
BOT_TOKEN = "8368143070:AAEVc-Mi_BDypDUMYfqzoRTnRuC6_mJZr6M"

# Phone number -> Telegram Chat ID
users = {
    "9080189795": "6628696377",
    "9944393239": "8176005834"
}

class OTPRequest(BaseModel):
    phone_number: str

class ConfigUpdateRequest(BaseModel):
    otp_max_capacity: int = None
    current_user_count: int = None
    simulate_latency_seconds: float = None
    is_crashed: bool = None

def get_capacity_config() -> dict:
    if not CONFIG_PATH.exists():
        default_config = {"otp_max_capacity": 1, "current_user_count": 0, "simulate_latency_seconds": 3.0, "is_crashed": False}
        with open(CONFIG_PATH, "w") as f:
            json.dump(default_config, f, indent=2)
        return default_config
    with open(CONFIG_PATH, "r") as f:
        return json.load(f)

def save_capacity_config(config: dict):
    with open(CONFIG_PATH, "w") as f:
        json.dump(config, f, indent=2)

def log_operational_event(
    event_type: str,
    status: str,
    severity: str,
    response_time_ms: int,
    error_code: str = None,
    error_message: str = None
):
    if not DB_PATH.exists():
        return
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        event_id = f"evt-{uuid.uuid4().hex[:8]}"
        request_id = f"req-{uuid.uuid4().hex[:8]}"
        now_iso = datetime.now(timezone.utc).isoformat()
        
        cursor.execute("""
            INSERT INTO operational_events (
                event_id, request_id, service_name, event_type, timestamp,
                status, severity, response_time_ms, error_code, error_message, dependency
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            event_id, request_id, "otp-service", event_type, now_iso,
            status, severity, response_time_ms, error_code, error_message, "telegram-bot-provider"
        ))
        conn.commit()
        conn.close()

        # Non-blocking notification to Monitoring Service & Agent on HIGH or CRITICAL alerts
        if severity in ["HIGH", "CRITICAL"]:
            alert_payload = {
                "service_name": "otp-service",
                "alert_type": event_type,
                "error_code": error_code,
                "message": error_message or f"Event {event_type} occurred",
                "response_time_ms": response_time_ms
            }
            # Try Monitoring Service first
            try:
                res = requests.post("http://localhost:8002/report-alert", json=alert_payload, timeout=2)
                if res.status_code == 200:
                    return
            except Exception:
                pass
            
            # Fallback direct call to Agent on Port 9000 (and Port 8000)
            action_hint = "Call restart_service tool to bring the service back online." if event_type == "SERVICE_CRASHED" else "Inspect capacity with get_otp_capacity tool and scale up capacity with scale_up_otp_capacity tool."
            agent_payload = {
                "incident_id": f"INC-OTP-{uuid.uuid4().hex[:4]}",
                "prompt": f"ALERT DETECTED on 'otp-service': Alert Type '{event_type}' ({error_code}). Message: '{error_message}'. {action_hint}"
            }
            for agent_url in ["http://localhost:9000/agent/run", "http://localhost:8000/agent/run"]:
                try:
                    res_agent = requests.post(agent_url, json=agent_payload, timeout=3)
                    if res_agent.status_code == 200:
                        print(f"[OTP SERVICE] Direct Alert successfully sent to Agent at {agent_url}")
                        break
                except Exception:
                    pass
    except Exception as e:
        print(f"[OTP SERVICE] Failed to log operational event to DB: {e}")

def generate_otp():
    return str(random.randint(1000, 9999))

def send_telegram_message(chat_id, otp):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    data = {
        "chat_id": chat_id,
        "text": f"🔐 Your OTP is: {otp}"
    }
    try:
        response = requests.post(url, data=data, timeout=5)
        return response.status_code == 200
    except Exception:
        return False

@app.get("/health")
def health_check():
    """Health check endpoint showing capacity, user count, crash state, and performance state."""
    config = get_capacity_config()
    is_crashed = config.get("is_crashed", False)
    max_cap = config.get("otp_max_capacity", 1)
    current = config.get("current_user_count", 0)
    latency = config.get("simulate_latency_seconds", 3.0)
    
    if is_crashed:
        return {
            "service": "otp-service",
            "status": "crashed",
            "error_code": "OTP_SERVICE_500_CRASH",
            "message": "OTP service is CRASHED and unresponsive.",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    is_degraded = current >= max_cap
    return {
        "service": "otp-service",
        "status": "degraded" if is_degraded else "healthy",
        "current_user_count": current,
        "otp_max_capacity": max_cap,
        "simulate_latency_seconds": latency,
        "latency_active": is_degraded,
        "is_crashed": False,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/config")
def get_config():
    return get_capacity_config()

@app.post("/config/update")
def update_config(req: ConfigUpdateRequest):
    config = get_capacity_config()
    if req.otp_max_capacity is not None:
        config["otp_max_capacity"] = req.otp_max_capacity
    if req.current_user_count is not None:
        config["current_user_count"] = req.current_user_count
    if req.simulate_latency_seconds is not None:
        config["simulate_latency_seconds"] = req.simulate_latency_seconds
    if req.is_crashed is not None:
        config["is_crashed"] = req.is_crashed
    save_capacity_config(config)
    return {"message": "Config updated successfully", "config": config}

@app.post("/send-otp")
def send_otp(request: OTPRequest):
    start_time = time.time()
    phone_number = request.phone_number
    
    config = get_capacity_config()
    is_crashed = config.get("is_crashed", False)

    # 1. CRASH SIMULATION CHECK
    if is_crashed:
        elapsed_ms = int((time.time() - start_time) * 1000)
        error_msg = "CRITICAL: OTP service has CRASHED and is completely unresponsive."
        print(f"[SERVICE CRASHED] is_crashed is True! Returning 500 error and triggering alert...")
        
        log_operational_event(
            event_type="SERVICE_CRASHED",
            status="FAILED",
            severity="CRITICAL",
            response_time_ms=elapsed_ms,
            error_code="OTP_SERVICE_500_CRASH",
            error_message=error_msg
        )
        return {
            "status": "failed",
            "error_code": "OTP_SERVICE_500_CRASH",
            "message": error_msg,
            "response_time_ms": elapsed_ms
        }

    max_capacity = config.get("otp_max_capacity", 1)
    current_users = config.get("current_user_count", 0)
    latency_sec = config.get("simulate_latency_seconds", 3.0)

    # 2. CAPACITY & LATENCY CHECK
    if current_users >= max_capacity:
        print(f"[LATENCY ALERT] Reached/Exceeded capacity limit ({current_users} >= {max_capacity}). Applying {latency_sec}s latency...")
        time.sleep(latency_sec)
        
        if current_users > max_capacity:
            elapsed_ms = int((time.time() - start_time) * 1000)
            error_msg = f"CRITICAL: OTP service capacity exceeded (Current: {current_users}, Max: {max_capacity}). Severe performance degradation."
            log_operational_event(
                event_type="OTP_CAPACITY_OVERLOAD",
                status="FAILED",
                severity="CRITICAL",
                response_time_ms=elapsed_ms,
                error_code="OTP_CAPACITY_EXCEEDED_503",
                error_message=error_msg
            )
            return {
                "status": "failed",
                "error_code": "OTP_CAPACITY_EXCEEDED_503",
                "message": error_msg,
                "current_user_count": current_users,
                "max_capacity": max_capacity,
                "response_time_ms": elapsed_ms
            }
        else:
            elapsed_ms = int((time.time() - start_time) * 1000)
            log_operational_event(
                event_type="OTP_HIGH_LATENCY_ALERT",
                status="DEGRADED",
                severity="HIGH",
                response_time_ms=elapsed_ms,
                error_code="HIGH_LATENCY_THRESHOLD_REACHED",
                error_message=f"High latency detected on OTP service: {elapsed_ms}ms (Capacity Limit: {max_capacity})"
            )

    # Validate phone number
    if phone_number not in users:
        elapsed_ms = int((time.time() - start_time) * 1000)
        log_operational_event(
            event_type="OTP_SEND",
            status="FAILED",
            severity="LOW",
            response_time_ms=elapsed_ms,
            error_code="PHONE_NOT_REGISTERED",
            error_message="Phone number is not registered"
        )
        return {
            "status": "failed",
            "message": "Phone number is not registered"
        }

    chat_id = users[phone_number]
    otp = generate_otp()
    success = send_telegram_message(chat_id, otp)
    elapsed_ms = int((time.time() - start_time) * 1000)

    if success:
        log_operational_event(
            event_type="OTP_SEND",
            status="SUCCESS",
            severity="LOW",
            response_time_ms=elapsed_ms
        )
        return {
            "status": "success",
            "message": "OTP sent successfully",
            "otp": otp,
            "response_time_ms": elapsed_ms
        }
    else:
        log_operational_event(
            event_type="OTP_SEND",
            status="FAILED",
            severity="HIGH",
            response_time_ms=elapsed_ms,
            error_code="TELEGRAM_API_ERROR",
            error_message="Failed to send OTP via Telegram"
        )
        return {
            "status": "failed",
            "message": "Failed to send OTP"
        }