import uuid
import logging
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from langchain_core.messages import HumanMessage, AIMessage

from app.agent.graph import agent_graph
from app.db.database import (
    upsert_incident,
    create_agent_execution,
    update_agent_execution,
    log_agent_message,
    get_incident_history
)

logger = logging.getLogger("incident_agent")

router = APIRouter()

class RunAgentRequest(BaseModel):
    incident_id: str = Field(..., example="INC-001", description="Unique identifier for the incident")
    prompt: str = Field(..., example="Call any tools available to you and investigate the situation.", description="Instruction or query for the agent")

class RunAgentResponse(BaseModel):
    execution_id: str
    incident_id: str
    status: str
    final_response: str
    tool_executions_count: int

@router.post("/agent/run", response_model=RunAgentResponse)
async def run_agent(request: RunAgentRequest):
    execution_id = f"exec-{uuid.uuid4().hex[:8]}"
    incident_id = request.incident_id
    prompt = request.prompt
    
    print(f"[AGENT] Execution started for incident {incident_id} (Execution ID: {execution_id})")
    logger.info(f"[AGENT] Execution started for incident {incident_id} (Execution ID: {execution_id})")
    
    # Initialize DB records
    upsert_incident(incident_id=incident_id, prompt=prompt, status="IN_PROGRESS")
    create_agent_execution(execution_id=execution_id, incident_id=incident_id, status="RUNNING")
    log_agent_message(execution_id=execution_id, role="user", content=prompt)
    
    initial_state = {
        "messages": [HumanMessage(content=prompt)],
        "incident_id": incident_id,
        "execution_id": execution_id,
        "status": "RUNNING"
    }
    
    config = {"configurable": {"thread_id": incident_id}}
    
    try:
        final_state = agent_graph.invoke(initial_state, config=config)
        
        last_message = final_state["messages"][-1]
        final_text = last_message.content if isinstance(last_message.content, str) else str(last_message.content)
        
        update_agent_execution(execution_id=execution_id, status="COMPLETED")
        upsert_incident(incident_id=incident_id, prompt=prompt, status="COMPLETED")
        
        history = get_incident_history(incident_id)
        exec_info = next((e for e in history["executions"] if e["execution_id"] == execution_id), {})
        tool_count = len(exec_info.get("tool_executions", []))
        
        print(f"[AGENT] Execution finished successfully for {incident_id}")
        logger.info(f"[AGENT] Execution finished successfully for {incident_id}")
        
        return RunAgentResponse(
            execution_id=execution_id,
            incident_id=incident_id,
            status="COMPLETED",
            final_response=final_text,
            tool_executions_count=tool_count
        )
    except Exception as e:
        print(f"[AGENT] Execution failed for {incident_id}: {str(e)}")
        logger.error(f"[AGENT] Execution failed for {incident_id}: {str(e)}")
        
        update_agent_execution(execution_id=execution_id, status="FAILED")
        upsert_incident(incident_id=incident_id, prompt=prompt, status="FAILED")
        
        raise HTTPException(status_code=500, detail=f"Agent execution failed: {str(e)}")

@router.get("/incidents/{incident_id}")
async def get_incident(incident_id: str):
    history = get_incident_history(incident_id)
    if not history:
        raise HTTPException(status_code=404, detail=f"Incident '{incident_id}' not found.")
    return history
