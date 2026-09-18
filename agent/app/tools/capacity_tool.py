import json
import logging
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from langchain_core.tools import tool

logger = logging.getLogger("incident_agent")

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
CONFIG_PATH = BASE_DIR / "capacity_config.json"
DB_PATH = BASE_DIR / "backend" / "dd_techhub.db"

@tool
def get_otp_capacity() -> str:
    """Retrieves the current capacity configuration of the OTP service, including max capacity, current user count, latency, and crash state."""
    if not CONFIG_PATH.exists():
        return "Config file capacity_config.json not found."
    with open(CONFIG_PATH, "r") as f:
        config = json.load(f)
    print(f"[TOOL] get_otp_capacity called -> Current Config: {config}")
    logger.info(f"[TOOL] get_otp_capacity called -> Current Config: {config}")
    return json.dumps(config, indent=2)

@tool
def scale_up_otp_capacity(new_capacity: int = 10) -> str:
    """Scales up the OTP service maximum capacity threshold to prevent performance degradation and high latency.
    Use this tool when high latency or capacity overload alerts are detected on the OTP service.
    """
    print(f"[TOOL] scale_up_otp_capacity called with new_capacity={new_capacity}")
    logger.info(f"[TOOL] scale_up_otp_capacity called with new_capacity={new_capacity}")
    
    if not CONFIG_PATH.exists():
        config = {"otp_max_capacity": new_capacity, "current_user_count": 0, "simulate_latency_seconds": 3.0, "is_crashed": False}
    else:
        with open(CONFIG_PATH, "r") as f:
            config = json.load(f)
        config["otp_max_capacity"] = new_capacity

    with open(CONFIG_PATH, "w") as f:
        json.dump(config, f, indent=2)

    # Log operational resolution event to dd_techhub.db
    if DB_PATH.exists():
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
                event_id, request_id, "otp-service", "CAPACITY_SCALE_UP", now_iso,
                "RESOLVED", "INFO", 50, "AGENT_ACTION_SUCCESS",
                f"AI Agent dynamically scaled up OTP service capacity to {new_capacity}.", "incident-agent"
            ))
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"[TOOL] Failed to log scale_up resolution event to DB: {e}")

    result_msg = f"SUCCESS: OTP service max capacity scaled up to {new_capacity}. Latency and performance bottleneck resolved."
    print(f"[TOOL] scale_up_otp_capacity completed: {result_msg}")
    return result_msg

@tool
def restart_service(service_name: str = "otp-service") -> str:
    """Restarts a crashed microservice (such as otp-service) to recover from a service failure and bring it back online.
    Use this tool when a SERVICE_CRASHED or service unresponsive alert is detected.
    """
    print(f"[TOOL] restart_service called for service_name='{service_name}'")
    logger.info(f"[TOOL] restart_service called for service_name='{service_name}'")

    if not CONFIG_PATH.exists():
        config = {"otp_max_capacity": 10, "current_user_count": 0, "simulate_latency_seconds": 3.0, "is_crashed": False}
    else:
        with open(CONFIG_PATH, "r") as f:
            config = json.load(f)
        config["is_crashed"] = False

    with open(CONFIG_PATH, "w") as f:
        json.dump(config, f, indent=2)

    # Log operational restart event to dd_techhub.db
    if DB_PATH.exists():
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
                event_id, request_id, service_name, "SERVICE_RESTART_SUCCESS", now_iso,
                "RESOLVED", "INFO", 100, "RESTART_ACTION_SUCCESS",
                f"AI Agent successfully restarted crashed service '{service_name}'. Service health restored.", "incident-agent"
            ))
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"[TOOL] Failed to log restart resolution event to DB: {e}")

    result_msg = f"SUCCESS: Microservice '{service_name}' has been successfully restarted and is back online."
    print(f"[TOOL] restart_service completed: {result_msg}")
    return result_msg
