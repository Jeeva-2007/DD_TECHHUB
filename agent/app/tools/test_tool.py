import logging
from langchain_core.tools import tool

logger = logging.getLogger("incident_agent")

@tool
def test_tool(query: str = "default_check") -> str:
    """A test tool to demonstrate external tool calling capabilities of the agent.
    Use this tool when you need to verify system tools are reachable or to run a basic system test.
    """
    print(f"[TOOL] test_tool called with query: {query}")
    logger.info(f"[TOOL] test_tool called with query: {query}")
    
    # Execution message per requirement
    print("[TOOL] Tool is called and executed")
    logger.info("[TOOL] Tool is called and executed")
    
    print("[TOOL] test_tool completed")
    logger.info("[TOOL] test_tool completed")
    
    return f"test_tool output: Successfully executed test check for '{query}'. Status: OK."
