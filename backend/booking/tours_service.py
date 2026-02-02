"""
Tours & Activities Booking Service
Handles tour search, availability checking, booking, ratings, and cancellations.
Integrates with Viator and local tour operator APIs.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum
import logging

from circuit_breaker import CircuitBreaker

logger = logging.getLogger(__name__)


class TourBookingState(Enum):
    """Tour booking state machine"""
    SEARCH_INITIATED = "SEARCH_INITIATED"
    AVAILABILITY_CHECKED = "AVAILABILITY_CHECKED"
    BOOKING_CONFIRMED = "BOOKING_CONFIRMED"
    BOOKING_CANCELLED = "BOOKING_CANCELLED"
    TOUR_COMPLETED = "TOUR_COMPLETED"
    TOUR_RATED = "TOUR_RATED"
    REFUND_PROCESSED = "REFUND_PROCESSED"


@dataclass
class TourActivity:
    """Tour/Activity listing"""
    tour_id: str
    tour_name: str
    destination: str
    country: str
    category: str  # "SIGHTSEEING", "ADVENTURE", "CULTURAL", "FOOD", "NATURE"
    description: str
    duration_hours: float
    price_per_person: float
    currency: str  # ISO 4217
    max_participants: int
    current_participants: int
    available_dates: List[str]  # ISO 8601
    rating: float  # 1-5 stars
    reviews_count: int
    operator_name: str
    operator_rating: float
    included_features: List[str]
    exclusions: List[str]
    cancellation_policy: str
    availability: bool


@dataclass
class TourBooking:
    """Tour booking confirmation"""
    booking_id: str
    tour_id: str
    tour_name: str
    customer_name: str
    customer_email: str
    customer_phone: str
    tour_date: str  # ISO 8601
    number_of_participants: int
    price_per_person: float
    total_price: float
    currency: str
    status: str
    confirmation_code: str
    meeting_location: str
    meeting_time: str
    tour_itinerary: str
    operator_contact: str
    created_at: str


class ToursService:
    """Service for tour and activity booking operations"""
    
    def __init__(self, config: Any):
        """
        Initialize ToursService
        Args:
            config: Configuration object with API credentials
        """
        self.config = config
        self.viator_api_key = getattr(config, 'VIATOR_API_KEY', 'VIATOR_SANDBOX_KEY')
        self.circuit_breaker = CircuitBreaker(failure_threshold=5, timeout=60)
        self.bookings: Dict[str, Dict] = {}
        self.ratings: Dict[str, List[Dict]] = {}
        logger.info("ToursService initialized")
    
    def search_tours(
        self,
        destination: str,
        category: Optional[str] = None,
        min_price: float = 0,
        max_price: float = 10000,
        duration_min: int = 0,
        duration_max: int = 24,
        max_results: int = 20
    ) -> List[TourActivity]:
        """
        Search for tours and activities in a destination
        Args:
            destination: City or location name
            category: Filter by category (SIGHTSEEING, ADVENTURE, CULTURAL, FOOD, NATURE)
            min_price: Minimum price per person
            max_price: Maximum price per person
            duration_min: Minimum duration in hours
            duration_max: Maximum duration in hours
            max_results: Maximum number of results
        Returns:
            List of TourActivity objects
        """
        try:
            if not self.circuit_breaker.is_available():
                logger.warning(f"Circuit breaker OPEN for tour search in {destination}")
                return []
            
            logger.info(f"Searching tours in {destination}, category: {category or 'all'}")
            
            # Mock Viator API search call
            tours = self._mock_viator_search(destination, category, min_price, max_price, duration_min, duration_max)
            
            self.circuit_breaker.record_success()
            return tours[:max_results]
            
        except Exception as e:
            self.circuit_breaker.record_failure()
            logger.error(f"Tour search failed: {str(e)}")
            raise
    
    def check_availability(
        self,
        tour_id: str,
        tour_date: str,
        participants: int
    ) -> Dict[str, Any]:
        """
        Check real-time availability for a specific tour date
        Args:
            tour_id: Tour ID
            tour_date: Desired tour date (ISO 8601)
            participants: Number of participants
        Returns:
            Availability status
        """
        try:
            if not self.circuit_breaker.is_available():
                logger.warning(f"Circuit breaker OPEN for availability check {tour_id}")
                raise Exception("Tours service unavailable")
            
            # In production: Check against real tour schedule
            available = True
            spots_available = 15
            
            # Check if tour date is booked out
            for booking_id, booking in self.bookings.items():
                if (booking["tour_id"] == tour_id and 
                    booking["tour_date"] == tour_date):
                    spots_available -= booking["number_of_participants"]
            
            available = spots_available >= participants
            
            logger.info(f"Tour {tour_id} on {tour_date}: available={available}, spots={spots_available}")
            self.circuit_breaker.record_success()
            
            return {
                "tour_id": tour_id,
                "tour_date": tour_date,
                "available": available,
                "spots_available": max(0, spots_available),
                "checked_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.circuit_breaker.record_failure()
            logger.error(f"Availability check failed: {str(e)}")
            raise
    
    def book_tour(
        self,
        tour_id: str,
        customer_name: str,
        customer_email: str,
        customer_phone: str,
        tour_date: str,
        number_of_participants: int
    ) -> TourBooking:
        """
        Book a tour for the specified date and number of participants
        Args:
            tour_id: Tour ID
            customer_name: Customer name
            customer_email: Customer email
            customer_phone: Customer phone
            tour_date: Tour date (ISO 8601)
            number_of_participants: Number of participants
        Returns:
            TourBooking confirmation
        """
        try:
            if not self.circuit_breaker.is_available():
                logger.warning(f"Circuit breaker OPEN for tour booking {tour_id}")
                raise Exception("Tours service unavailable")
            
            # Check availability first
            availability = self.check_availability(tour_id, tour_date, number_of_participants)
            if not availability["available"]:
                raise ValueError(f"Not enough spots available for {tour_id} on {tour_date}")
            
            booking_id = f"TOUR_{tour_id}_{int(datetime.now().timestamp())}"
            confirmation_code = f"TUR{int(datetime.now().timestamp()) % 1000000:06d}"
            
            # Mock tour details
            tour_details = self._get_tour_details(tour_id)
            
            booking = TourBooking(
                booking_id=booking_id,
                tour_id=tour_id,
                tour_name=tour_details["name"],
                customer_name=customer_name,
                customer_email=customer_email,
                customer_phone=customer_phone,
                tour_date=tour_date,
                number_of_participants=number_of_participants,
                price_per_person=tour_details["price"],
                total_price=tour_details["price"] * number_of_participants,
                currency="USD",
                status=TourBookingState.BOOKING_CONFIRMED.value,
                confirmation_code=confirmation_code,
                meeting_location=tour_details["meeting_location"],
                meeting_time="08:00 AM",
                tour_itinerary=tour_details["itinerary"],
                operator_contact="+1-555-TOUR-01",
                created_at=datetime.now().isoformat()
            )
            
            self.bookings[booking_id] = {
                "tour_id": tour_id,
                "customer": customer_name,
                "tour_date": tour_date,
                "participants": number_of_participants,
                "status": TourBookingState.BOOKING_CONFIRMED.value,
                "booking_time": datetime.now().isoformat()
            }
            
            logger.info(f"Tour booking confirmed: {booking_id}, confirmation: {confirmation_code}")
            self.circuit_breaker.record_success()
            
            return booking
            
        except Exception as e:
            self.circuit_breaker.record_failure()
            logger.error(f"Tour booking failed: {str(e)}")
            raise
    
    def cancel_tour(
        self,
        booking_id: str,
        reason: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Cancel a tour booking and process refund
        Args:
            booking_id: Booking ID to cancel
            reason: Cancellation reason
        Returns:
            Cancellation confirmation with refund
        """
        try:
            if not self.circuit_breaker.is_available():
                logger.warning(f"Circuit breaker OPEN for tour cancellation {booking_id}")
                raise Exception("Tours service unavailable")
            
            if booking_id not in self.bookings:
                raise ValueError(f"Booking {booking_id} not found")
            
            booking = self.bookings[booking_id]
            
            # Calculate refund based on days to tour
            tour_date = datetime.fromisoformat(booking["tour_date"])
            days_until_tour = (tour_date - datetime.now()).days
            
            if days_until_tour > 7:
                refund_percentage = 100  # Full refund if cancelled >7 days before
            elif days_until_tour > 3:
                refund_percentage = 75
            elif days_until_tour > 0:
                refund_percentage = 50
            else:
                refund_percentage = 0  # No refund if tour already started/passed
            
            tour_details = self._get_tour_details(booking["tour_id"])
            refund_amount = tour_details["price"] * booking["participants"] * (refund_percentage / 100)
            
            del self.bookings[booking_id]
            
            logger.info(f"Tour booking {booking_id} cancelled. Refund: ${refund_amount:.2f} ({refund_percentage}%)")
            self.circuit_breaker.record_success()
            
            return {
                "booking_id": booking_id,
                "status": TourBookingState.BOOKING_CANCELLED.value,
                "refund_amount": refund_amount,
                "refund_percentage": refund_percentage,
                "currency": "USD",
                "cancelled_at": datetime.now().isoformat(),
                "reason": reason or "Guest requested"
            }
            
        except Exception as e:
            self.circuit_breaker.record_failure()
            logger.error(f"Tour cancellation failed: {str(e)}")
            raise
    
    def rate_tour(
        self,
        booking_id: str,
        rating: float,
        review: str
    ) -> Dict[str, Any]:
        """
        Rate and review a completed tour
        Args:
            booking_id: Booking ID (tour must be completed)
            rating: Rating (1-5 stars)
            review: Review text
        Returns:
            Rating confirmation
        """
        try:
            if not self.circuit_breaker.is_available():
                logger.warning(f"Circuit breaker OPEN for tour rating {booking_id}")
                raise Exception("Tours service unavailable")
            
            if rating < 1 or rating > 5:
                raise ValueError("Rating must be between 1 and 5")
            
            if booking_id not in self.bookings:
                raise ValueError(f"Booking {booking_id} not found")
            
            booking = self.bookings[booking_id]
            tour_id = booking["tour_id"]
            
            # Store rating
            if tour_id not in self.ratings:
                self.ratings[tour_id] = []
            
            self.ratings[tour_id].append({
                "booking_id": booking_id,
                "rating": rating,
                "review": review,
                "reviewer": booking["customer"],
                "created_at": datetime.now().isoformat()
            })
            
            # Update booking status
            self.bookings[booking_id]["status"] = TourBookingState.TOUR_RATED.value
            
            logger.info(f"Tour rating submitted: {booking_id}, rating: {rating}/5")
            self.circuit_breaker.record_success()
            
            return {
                "booking_id": booking_id,
                "tour_id": tour_id,
                "rating": rating,
                "review_submitted": True,
                "submitted_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.circuit_breaker.record_failure()
            logger.error(f"Tour rating failed: {str(e)}")
            raise
    
    def _mock_viator_search(
        self,
        destination: str,
        category: Optional[str],
        min_price: float,
        max_price: float,
        duration_min: int,
        duration_max: int
    ) -> List[TourActivity]:
        """Mock Viator API search results"""
        tours = [
            {
                "tour_id": "VIATOR_001",
                "tour_name": "City Highlights Walking Tour",
                "destination": destination,
                "country": "US",
                "category": "SIGHTSEEING",
                "description": "Explore the city's most iconic landmarks with a knowledgeable guide.",
                "duration_hours": 3.0,
                "price_per_person": 49.99,
                "currency": "USD",
                "max_participants": 20,
                "current_participants": 8,
                "available_dates": [
                    (datetime.now() + timedelta(days=i)).isoformat()
                    for i in range(1, 30)
                ],
                "rating": 4.8,
                "reviews_count": 342,
                "operator_name": "City Tours Operator",
                "operator_rating": 4.9,
                "included_features": ["Expert guide", "Walking route map", "Small group"],
                "exclusions": ["Meals", "Entrance fees"],
                "cancellation_policy": "FREE_CANCELLATION_24_HOURS",
                "availability": True
            },
            {
                "tour_id": "VIATOR_002",
                "tour_name": "Adventure Hiking & Nature Trail",
                "destination": destination,
                "country": "US",
                "category": "ADVENTURE",
                "description": "Hike scenic nature trails and discover local wildlife.",
                "duration_hours": 5.0,
                "price_per_person": 79.99,
                "currency": "USD",
                "max_participants": 15,
                "current_participants": 12,
                "available_dates": [
                    (datetime.now() + timedelta(days=i)).isoformat()
                    for i in range(2, 25)
                ],
                "rating": 4.9,
                "reviews_count": 156,
                "operator_name": "Wilderness Adventures",
                "operator_rating": 5.0,
                "included_features": ["Professional guide", "Equipment", "Snacks", "Insurance"],
                "exclusions": ["Meals"],
                "cancellation_policy": "STRICT",
                "availability": True
            },
            {
                "tour_id": "VIATOR_003",
                "tour_name": "Local Cuisine Food Tour",
                "destination": destination,
                "country": "US",
                "category": "FOOD",
                "description": "Taste authentic local dishes at neighborhood restaurants.",
                "duration_hours": 4.0,
                "price_per_person": 89.99,
                "currency": "USD",
                "max_participants": 10,
                "current_participants": 6,
                "available_dates": [
                    (datetime.now() + timedelta(days=i)).isoformat()
                    for i in range(1, 30)
                ],
                "rating": 4.7,
                "reviews_count": 289,
                "operator_name": "Culinary Experiences Inc.",
                "operator_rating": 4.8,
                "included_features": ["All meals", "Drinks", "Expert food guide"],
                "exclusions": [],
                "cancellation_policy": "FREE_CANCELLATION_48_HOURS",
                "availability": True
            }
        ]
        
        return [TourActivity(**tour) for tour in tours]
    
    def _get_tour_details(self, tour_id: str) -> Dict[str, Any]:
        """Get tour details by ID"""
        tours_db = {
            "VIATOR_001": {
                "name": "City Highlights Walking Tour",
                "price": 49.99,
                "meeting_location": "Central Park, Main Gate",
                "itinerary": "1. Start at Central Park (8:00 AM)\n2. Visit City Hall (8:45 AM)\n3. Tour Cathedral (9:30 AM)\n4. End at Market Square (11:00 AM)"
            },
            "VIATOR_002": {
                "name": "Adventure Hiking & Nature Trail",
                "price": 79.99,
                "meeting_location": "Mountain Ridge Trail Head",
                "itinerary": "1. Meet at trailhead (8:00 AM)\n2. Begin hiking (8:15 AM)\n3. Lunch break at scenic overlook (11:00 AM)\n4. Return to trailhead (1:00 PM)"
            },
            "VIATOR_003": {
                "name": "Local Cuisine Food Tour",
                "price": 89.99,
                "meeting_location": "Downtown Food Market",
                "itinerary": "1. Market tour (10:00 AM)\n2. First restaurant (11:00 AM)\n3. Second restaurant (12:30 PM)\n4. Third restaurant & dessert (2:00 PM)"
            }
        }
        
        return tours_db.get(tour_id, {
            "name": "Custom Tour",
            "price": 99.99,
            "meeting_location": "Tour operator office",
            "itinerary": "To be confirmed"
        })
