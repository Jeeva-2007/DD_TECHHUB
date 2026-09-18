import json
import logging
from typing import Dict, Any, List
from langchain_core.messages import AnyMessage, ToolMessage, AIMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

from app.config import NVIDIA_API_KEY, NVIDIA_MODEL, NVIDIA_BASE_URL
from app.agent.state import AgentState
from app.tools.test_tool import test_tool
from app.tools.capacity_tool import get_otp_capacity, scale_up_otp_capacity, restart_service
from app.tools.order_recovery_tool import restart_db_connections, inspect_unplaced_paid_orders, place_missing_order
from app.db.database import log_tool_execution, log_agent_message

logger = logging.getLogger("incident_agent")

tools = [test_tool, get_otp_capacity, scale_up_otp_capacity, restart_service, restart_db_connections, inspect_unplaced_paid_orders, place_missing_order]
tools_by_name = {t.name: t for t in tools}

def get_llm():
    # Replaceable LLM integration via OpenAI-compatible endpoint for NVIDIA
    return ChatOpenAI(
        model=NVIDIA_MODEL,
        api_key=NVIDIA_API_KEY or "missing_key",
        base_url=NVIDIA_BASE_URL,
        temperature=0.2,
    )

def agent_node(state: AgentState) -> Dict[str, Any]:
    execution_id = state.get("execution_id", "unknown")
    incident_id = state.get("incident_id", "unknown")
    
    print(f"[AGENT] Execution running for incident {incident_id}")
    logger.info(f"[AGENT] Execution running for incident {incident_id}")
    
    llm = get_llm()
    llm_with_tools = llm.bind_tools(tools)
    
    # Execute model prediction
    response = llm_with_tools.invoke(state["messages"])
    
    tool_calls_data = []
    if hasattr(response, "tool_calls") and response.tool_calls:
        for tc in response.tool_calls:
            print(f"[AGENT] Model requested tool: {tc['name']}")
            logger.info(f"[AGENT] Model requested tool: {tc['name']}")
            tool_calls_data.append({"name": tc['name'], "args": tc['args'], "id": tc['id']})
    else:
        print("[AGENT] Final response generated")
        logger.info("[AGENT] Final response generated")
        
    # Log message to database
    log_agent_message(
        execution_id=execution_id,
        role="assistant",
        content=response.content if isinstance(response.content, str) else str(response.content),
        tool_calls=tool_calls_data if tool_calls_data else None
    )
    
    return {"messages": [response]}

def tool_node(state: AgentState) -> Dict[str, Any]:
    execution_id = state.get("execution_id", "unknown")
    last_message = state["messages"][-1]
    
    tool_outputs = []
    if isinstance(last_message, AIMessage) and hasattr(last_message, "tool_calls"):
        for call in last_message.tool_calls:
            tool_name = call["name"]
            tool_args = call["args"]
            tool_id = call["id"]
            
            print(f"[TOOL] {tool_name} called")
            logger.info(f"[TOOL] {tool_name} called")
            
            tool = tools_by_name.get(tool_name)
            if tool:
                try:
                    output = tool.invoke(tool_args)
                    status = "SUCCESS"
                except Exception as e:
                    output = f"Tool execution failed: {str(e)}"
                    status = "ERROR"
            else:
                output = f"Tool {tool_name} not found."
                status = "ERROR"
                
            print(f"[TOOL] {tool_name} completed")
            logger.info(f"[TOOL] {tool_name} completed")
            
            # Persist execution to SQLite
            log_tool_execution(
                execution_id=execution_id,
                tool_name=tool_name,
                tool_input=json.dumps(tool_args),
                tool_output=str(output),
                status=status
            )
            
            # Persist tool message to SQLite
            log_agent_message(
                execution_id=execution_id,
                role="tool",
                content=str(output)
            )
            
            tool_outputs.append(ToolMessage(content=str(output), tool_call_id=tool_id))
            
    print("[AGENT] Continuing execution")
    logger.info("[AGENT] Continuing execution")
    
    return {"messages": tool_outputs}

def should_continue(state: AgentState) -> str:
    last_message = state["messages"][-1]
    if isinstance(last_message, AIMessage) and hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"
    return END

# Build LangGraph workflow
# ponytail: MemorySaver used for in-memory graph checkpointing; execution details persisted to SQLite via custom db functions.
def create_agent_graph():
    workflow = StateGraph(AgentState)
    
    workflow.add_node("agent", agent_node)
    workflow.add_node("tools", tool_node)
    
    workflow.set_entry_point("agent")
    workflow.add_conditional_edges("agent", should_continue, {"tools": "tools", END: END})
    workflow.add_edge("tools", "agent")
    
    checkpointer = MemorySaver()
    return workflow.compile(checkpointer=checkpointer)

agent_graph = create_agent_graph()
