# Minimal Enterprise Incident Resolution AI Agent

An event-driven enterprise incident investigation agent prototype built with **Python**, **FastAPI**, **LangGraph**, **SQLite**, and the **NVIDIA API** (defaulting to NVIDIA Nemotron 3.5 Lightning 30B A3B).

## Features
- **Event-Driven Architecture**: External systems trigger the agent via `POST /agent/run`.
- **LangGraph Agent Loop**: Reusable state machine supporting multi-step tool calls and model reasoning.
- **SQLite Persistence**: Stores complete audit trails (`incidents`, `agent_executions`, `tool_executions`, `agent_messages`).
- **NVIDIA LLM Baseline**: Model integration via OpenAI-compatible endpoint (`ChatOpenAI` configured with NVIDIA URL).
- **Human-in-the-Loop Ready**: `AgentState` schema designed for clean interrupt/resume capabilities in future iterations.

---

## Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and paste your NVIDIA API key:
   ```env
   NVIDIA_API_KEY=nvapi-...
   NVIDIA_MODEL=nvidia/nemotron-3-5-lightning-30b-a3b
   NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
   DATABASE_PATH=incident_agent.db
   ```

---

## Running the Application

### Option 1: Quick Launch Script (Recommended)
```bash
./run.sh
```

### Option 2: Manual Start with Virtual Environment
```bash
source /opt/python-venv/brain/bin/activate
PYTHONPATH=. uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Option 3: Python Module Direct Run
```bash
source /opt/python-venv/brain/bin/activate
PYTHONPATH=. python3 app/main.py
```

---

## API Usage Examples

### 1. Trigger Agent Investigation
```bash
curl -X POST "http://localhost:8000/agent/run" \
  -H "Content-Type: application/json" \
  -d '{
    "incident_id": "INC-001",
    "prompt": "Call any tools available to you and investigate the situation."
  }'
```

**Example Response:**
```json
{
  "execution_id": "exec-1687a844",
  "incident_id": "INC-001",
  "status": "COMPLETED",
  "final_response": "Investigation completed...",
  "tool_executions_count": 1
}
```

### 2. Inspect Incident History & Audit Trail
```bash
curl "http://localhost:8000/incidents/INC-001"
```

---

## Running Tests

```bash
pyenv
PYTHONPATH=. python3 tests/test_app.py
```
