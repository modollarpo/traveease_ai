from fastapi import APIRouter
from backend.agentic.supervisor import SupervisorAgent
from backend.agentic.langgraph_orchestrator import LangGraphOrchestrator

router = APIRouter()
supervisor_agent = SupervisorAgent()
langgraph_orchestrator = LangGraphOrchestrator(supervisor_agent)

@router.post("/agentic-query")
def agentic_query(payload: dict):
    """
    Accepts a natural language query and returns orchestrated itinerary and pricing in NGN, USD, EUR.
    """
    query = payload.get("query", "")
    response = langgraph_orchestrator.run(query)
    return response
