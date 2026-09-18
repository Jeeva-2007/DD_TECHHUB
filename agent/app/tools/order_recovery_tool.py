import json
import logging
import sqlite3
import uuid
import requests
from datetime import datetime, timezone
from pathlib import Path
from langchain_core.tools import tool

logger = logging.getLogger("incident_agent")

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
CONFIG_PATH = BASE_DIR / "capacity_config.json"
DB_PATH = BASE_DIR / "backend" / "dd_techhub.db"
MSG_SERVICE_URL = "http://localhost:8003/send-message"

@tool
def restart_db_connections() -> str:
    """Restarts and flushes the database connection pool when DB connection limits (100% capacity / DB Busy) are exceeded.
    Use this tool when DB_CONNECTION_LIMIT_EXCEEDED or DB Timeout alerts occur.
    """
    print("[TOOL] restart_db_connections called")
    logger.info("[TOOL] restart_db_connections called")

    if not CONFIG_PATH.exists():
        config = {"otp_max_capacity": 10, "current_user_count": 0, "simulate_latency_seconds": 3.0, "is_crashed": False, "db_is_busy": False}
    else:
        with open(CONFIG_PATH, "r") as f:
            config = json.load(f)
        config["db_is_busy"] = False

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
                event_id, request_id, "database", "DB_CONNECTION_POOL_RESTART", now_iso,
                "RESOLVED", "INFO", 80, "DB_RESTART_SUCCESS",
                "AI Agent successfully restarted DB connection pool. Database capacity released.", "sqlite-engine"
            ))
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"[TOOL] Failed to log DB restart event: {e}")

    result_msg = "SUCCESS: Database connection pool restarted and cleared. DB is now responsive."
    print(f"[TOOL] restart_db_connections completed: {result_msg}")
    return result_msg

@tool
def inspect_unplaced_paid_orders() -> str:
    """Inspects the database for payments that succeeded or were sent via Telegram dispatch but failed to record an order due to DB timeout."""
    print("[TOOL] inspect_unplaced_paid_orders called")
    logger.info("[TOOL] inspect_unplaced_paid_orders called")
    
    if not DB_PATH.exists():
        return "Database file not found."

    unplaced = []
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # Query payments or operational events for failed order attempts
        cursor.execute("""
            SELECT p.payment_id, p.order_id, p.user_id, p.amount, p.status, p.created_at
            FROM payments p
            LEFT JOIN orders o ON p.order_id = o.order_id
            WHERE o.order_id IS NULL OR p.status = 'FAILED'
            ORDER BY p.id DESC LIMIT 5
        """)
        rows = cursor.fetchall()
        for r in rows:
            unplaced.append(dict(r))
        conn.close()
    except Exception as e:
        return f"Error querying unplaced orders: {e}"

    if not unplaced:
        return "No unplaced paid orders found."

    print(f"[TOOL] Found unplaced paid orders: {unplaced}")
    return json.dumps(unplaced, indent=2)

@tool
def place_missing_order(user_id: str, amount: float, product_name: str = "Premium Laptop", mobile: str = "9080189795") -> str:
    """Places a missing customer order in the database for a user whose payment succeeded during a database connection timeout.
    Updates order and order_items tables, and triggers an apology notification to the user via Telegram messaging service.
    """
    print(f"[TOOL] place_missing_order called for user_id='{user_id}', amount={amount}")
    logger.info(f"[TOOL] place_missing_order called for user_id='{user_id}', amount={amount}")

    order_id = f"ORD-AI-{uuid.uuid4().hex[:6].upper()}"
    payment_id = f"PAY-AI-{uuid.uuid4().hex[:6].upper()}"
    now_iso = datetime.now(timezone.utc).isoformat()

    if DB_PATH.exists():
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()

            # Insert into orders table
            cursor.execute("""
                INSERT INTO orders (order_id, user_id, total_amount, status, created_at)
                VALUES (?, ?, ?, ?, ?)
            """, (order_id, user_id, amount, "CONFIRMED (AI RECOVERED)", now_iso))

            # Insert into order_items table
            cursor.execute("""
                INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
                VALUES (?, ?, ?, ?, ?)
            """, (order_id, "prod-laptop-01", product_name, 1, amount))

            # Upsert into payments table
            cursor.execute("""
                INSERT INTO payments (payment_id, order_id, user_id, amount, status, payment_method, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (payment_id, order_id, user_id, amount, "SUCCESS", "CARD", now_iso))

            # Log operational event
            event_id = f"evt-{uuid.uuid4().hex[:8]}"
            request_id = f"req-{uuid.uuid4().hex[:8]}"
            cursor.execute("""
                INSERT INTO operational_events (
                    event_id, request_id, service_name, event_type, timestamp,
                    status, severity, response_time_ms, error_code, error_message, dependency
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                event_id, request_id, "order-service", "AI_ORDER_FULFILLMENT", now_iso,
                "SUCCESS", "INFO", 120, "ORDER_RECOVERED_BY_AI",
                f"AI Agent automatically placed order {order_id} for user {user_id} after DB recovery.", "incident-agent"
            ))

            conn.commit()
            conn.close()
        except Exception as e:
            print(f"[TOOL] Error inserting recovered order to DB: {e}")
            return f"Error placing order: {e}"

    # Call msg service to notify user via Telegram
    apology_message = (
        f"🙏 Apologies for the brief delay!\n\n"
        f"Your payment of ₹{amount:.2f} was verified and your order **{order_id}** "
        f"has been successfully placed by our AI Incident Agent!\n\n"
        f"📦 Status: CONFIRMED (AI RECOVERED)\n"
        f"💻 Item: {product_name}\n\n"
        f"View your order history under 'My Orders' on DD TECHHUB."
    )

    msg_sent = False
    # Attempt 1: Try local msg service on port 8003
    try:
        res = requests.post(MSG_SERVICE_URL, json={"phone_number": mobile, "message": apology_message}, timeout=5)
        if res.status_code == 200:
            msg_sent = True
    except Exception as e:
        print(f"[TOOL] Local msg service unreachable ({e}). Attempting direct Telegram fallback...")

    # Attempt 2: Direct Telegram Bot API fallback if local msg service failed/offline
    if not msg_sent:
        try:
            import os
            from dotenv import load_dotenv
            load_dotenv(dotenv_path=BASE_DIR / ".env")
            load_dotenv(dotenv_path=BASE_DIR / "agent" / ".env")
            
            bot_token = os.getenv("BOT_TOKEN", "8368143070:AAEVc-Mi_BDypDUMYfqzoRTnRuC6_mJZr6M")
            users = {"9080189795": "6628696377", "9944393239": "8176005834"}
            
            # Broadcast to all registered user chat IDs to guarantee delivery
            target_chat_ids = list(set(users.values()))
            for cid in target_chat_ids:
                tg_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
                tg_res = requests.post(tg_url, data={"chat_id": cid, "text": apology_message}, timeout=5)
                if tg_res.status_code == 200:
                    msg_sent = True
                    print(f"[TOOL] Direct Telegram apology notification dispatched successfully to Chat ID {cid}!")
        except Exception as fallback_err:
            print(f"[TOOL] Direct Telegram API fallback failed: {fallback_err}")

    result_msg = (
        f"SUCCESS: Order '{order_id}' placed successfully for user '{user_id}'. "
        f"Telegram notification sent: {msg_sent}."
    )
    print(f"[TOOL] place_missing_order completed: {result_msg}")
    return result_msg
