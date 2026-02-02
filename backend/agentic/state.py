class ItineraryState:
    def create_itinerary(self, logistics_result, culture_result):
        # Compose itinerary, require user approval before booking
        # ...state machine logic...
        return {
            "days": [],
            "status": "pending_approval"
        }
