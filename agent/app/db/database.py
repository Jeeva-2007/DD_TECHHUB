import sqlite3
import json
from datetime import datetime, timezone
from pathlib import Path
from app.config import DATABASE_PATH

# ponytail: simple direct sqlite3 connection without ORM abstraction to minimize overhead.
# Upgrade path: standard SQLAlchemy async session if migrating to Postgres.

def get_db():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS incidents (
                incident_id TEXT PRIMARY KEY,
                prompt TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS agent_executions (
                execution_id TEXT PRIMARY KEY,
                incident_id TEXT NOT NULL,
                status TEXT NOT NULL,
                started_at TEXT NOT NULL,
                completed_at TEXT,
                FOREIGN KEY (incident_id) REFERENCES incidents (incident_id)
            );
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tool_executions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                execution_id TEXT NOT NULL,
                tool_name TEXT NOT NULL,
                tool_input TEXT,
                tool_output TEXT,
                status TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                FOREIGN KEY (execution_id) REFERENCES agent_executions (execution_id)
            );
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS agent_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                execution_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT,
                tool_calls TEXT,
                timestamp TEXT NOT NULL,
                FOREIGN KEY (execution_id) REFERENCES agent_executions (execution_id)
            );
        """)
        conn.commit()

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def upsert_incident(incident_id: str, prompt: str, status: str = "IN_PROGRESS"):
    current_time = now_iso()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT incident_id FROM incidents WHERE incident_id = ?", (incident_id,))
        exists = cursor.fetchone()
        if exists:
            cursor.execute("""
                UPDATE incidents 
                SET prompt = ?, status = ?, updated_at = ?
                WHERE incident_id = ?
            """, (prompt, status, current_time, incident_id))
        else:
            cursor.execute("""
                INSERT INTO incidents (incident_id, prompt, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?)
            """, (incident_id, prompt, status, current_time, current_time))
        conn.commit()

def create_agent_execution(execution_id: str, incident_id: str, status: str = "RUNNING"):
    current_time = now_iso()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO agent_executions (execution_id, incident_id, status, started_at)
            VALUES (?, ?, ?, ?)
        """, (execution_id, incident_id, status, current_time))
        conn.commit()

def update_agent_execution(execution_id: str, status: str):
    completed_at = now_iso() if status in ["COMPLETED", "FAILED"] else None
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE agent_executions
            SET status = ?, completed_at = COALESCE(?, completed_at)
            WHERE execution_id = ?
        """, (status, completed_at, execution_id))
        conn.commit()

def log_tool_execution(execution_id: str, tool_name: str, tool_input: str, tool_output: str, status: str = "SUCCESS"):
    current_time = now_iso()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO tool_executions (execution_id, tool_name, tool_input, tool_output, status, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (execution_id, tool_name, tool_input, tool_output, status, current_time))
        conn.commit()

def log_agent_message(execution_id: str, role: str, content: str, tool_calls: list = None):
    current_time = now_iso()
    tool_calls_str = json.dumps(tool_calls) if tool_calls else None
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO agent_messages (execution_id, role, content, tool_calls, timestamp)
            VALUES (?, ?, ?, ?, ?)
        """, (execution_id, role, content, tool_calls_str, current_time))
        conn.commit()

def get_incident_history(incident_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM incidents WHERE incident_id = ?", (incident_id,))
        incident = cursor.fetchone()
        if not incident:
            return None

        cursor.execute("SELECT * FROM agent_executions WHERE incident_id = ?", (incident_id,))
        executions = [dict(row) for row in cursor.fetchall()]

        for ex in executions:
            exec_id = ex["execution_id"]
            cursor.execute("SELECT * FROM tool_executions WHERE execution_id = ? ORDER BY id ASC", (exec_id,))
            ex["tool_executions"] = [dict(row) for row in cursor.fetchall()]

            cursor.execute("SELECT * FROM agent_messages WHERE execution_id = ? ORDER BY id ASC", (exec_id,))
            ex["agent_messages"] = [dict(row) for row in cursor.fetchall()]

        return {
            "incident": dict(incident),
            "executions": executions
        }
