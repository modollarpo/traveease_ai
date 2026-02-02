from backend.agentic.amadeus_api import AmadeusAPI
from backend.agentic.travu_api import TravuAPI

class LogisticsAgent:
    def __init__(self):
        self.amadeus = AmadeusAPI()
        self.travu = TravuAPI()

    def process(self, payload):
        flights = self.amadeus.search_flights(payload)
        cars = self.amadeus.search_cars(payload)
        buses = self.travu.search_buses(payload)
        return {
            "flights": flights,
            "cars": cars,
            "buses": buses
        }
