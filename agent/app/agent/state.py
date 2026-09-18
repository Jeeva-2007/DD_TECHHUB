from typing import TypedDict, Annotated, List, Optional
from langchain_core.messages import AnyMessage
from langgraph.graph.message import add_messages

# ponytail: AgentState definition with messages reducer. Structured to cleanly support future interrupt/approval nodes.
class AgentState(TypedDict):
    messages: Annotated[List[AnyMessage], add_messages]
    incident_id: str
    execution_id: str
    status: Optional[str]
