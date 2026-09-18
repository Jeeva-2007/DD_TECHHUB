import os
import logging
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Monitoring Service")

# Use Port 9000 (default agent port) or environment variable
AGENT_RUN_URL = os.getenv("AGENT_RUN_URL", "http://localhost:9000/agent/run")

class AlertPayload(BaseModel):
    service_name: str
    alert_type: str
    error_code: str = None
    message: str
    response_time_ms: int = None

@app.get("/health")
def health_check():
    return {"service": "monitoring-service", "status": "healthy", "target_agent_url": AGENT_RUN_URL}

@app.post("/report-alert")
def report_alert(payload: AlertPayload):
    """Monitoring service receives alerts from backend/microservices,
    filters relevant performance/capacity events, and triggers AI agent on port 9000.
    """
    print(f"[MONITORING] Alert received: Service '{payload.service_name}' - {payload.alert_type} ({payload.error_code}): {payload.message}")
    logging.info(f"[MONITORING] Alert received: {payload}")

    incident_id = f"INC-{payload.service_name.upper()}-001"
    prompt = (
        f"ALERT DETECTED on '{payload.service_name}': Alert Type '{payload.alert_type}' "
        f"with error code '{payload.error_code}'. Message: '{payload.message}'. "
        f"Response Time: {payload.response_time_ms}ms. "
        f"Inspect current capacity using get_otp_capacity tool and scale up capacity using scale_up_otp_capacity tool to resolve performance bottleneck."
    )

    agent_req = {
        "incident_id": incident_id,
        "prompt": prompt
    }

    # Try primary agent URL (Port 9000) first, then fallback to Port 8000 if needed
    urls_to_try = [AGENT_RUN_URL, "http://localhost:9000/agent/run", "http://localhost:8000/agent/run"]
    # Deduplicate while preserving order
    urls_to_try = list(dict.fromkeys(urls_to_try))

    last_error = ""
    for target_url in urls_to_try:
        try:
            print(f"[MONITORING] Sending alert payload to Agent at {target_url}...")
            res = requests.post(target_url, json=agent_req, timeout=35)
            if res.status_code == 200:
                agent_data = res.json()
                print(f"[MONITORING] Agent successfully executed via {target_url}! Response: {agent_data.get('final_response')}")
                return {
                    "status": "alert_processed",
                    "agent_triggered": True,
                    "agent_url": target_url,
                    "agent_response": agent_data
                }
            else:
                last_error = f"Status {res.status_code}: {res.text}"
        except Exception as e:
            last_error = str(e)
            print(f"[MONITORING] Failed connection to {target_url}: {e}")

    return {
        "status": "agent_unreachable",
        "agent_triggered": False,
        "error": last_error
    }
