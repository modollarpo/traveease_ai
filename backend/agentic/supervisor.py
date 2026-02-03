from backend.agentic.logistics import LogisticsAgent
from backend.agentic.culture import CultureAgent
from backend.agentic.financial import FinancialAgent
from backend.agentic.state import ItineraryState
from backend.agentic.visa import VisaAgent

class SupervisorAgent:
    def __init__(self):
        self.logistics_agent = LogisticsAgent()
        self.culture_agent = CultureAgent()
        self.financial_agent = FinancialAgent()
        self.state_machine = ItineraryState()
        self.visa_agent = VisaAgent()

    def handle_query(self, payload):
        # Step 1: Parse natural language query
        # Step 2: Query logistics, culture and visa agents
        logistics_result = self.logistics_agent.process(payload)
        culture_result = self.culture_agent.process(payload)
        visa_result = self.visa_agent.assess_trip(payload)
        # Step 3: Calculate pricing in multiple currencies
        price_info = self.financial_agent.convert_prices(
            logistics_result,
            culture_result,
        )
        # Step 4: Human-in-the-loop approval
        itinerary = self.state_machine.create_itinerary(logistics_result, culture_result)
        return {
            "itinerary": itinerary,
            "prices": price_info,
            "visa": visa_result,
            "approval_required": True
        }
