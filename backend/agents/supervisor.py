from backend.agents.logistics import LogisticsAgent
from backend.agents.culture import CultureAgent

class SupervisorAgent:
    def __init__(self):
        self.logistics_agent = LogisticsAgent()
        self.culture_agent = CultureAgent()

    def handle_query(self, payload):
        # Orchestrate agents based on query type
        logistics_result = self.logistics_agent.process(payload)
        culture_result = self.culture_agent.process(payload)
        return {
            "logistics": logistics_result,
            "culture": culture_result
        }
