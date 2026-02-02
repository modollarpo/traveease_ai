from backend.agentic.viator_api import ViatorAPI

class CultureAgent:
    def __init__(self):
        self.viator = ViatorAPI()

    def process(self, payload):
        activities = self.viator.search_activities(payload)
        return {
            "activities": activities
        }
