"""
Hotel Booking Service
Handles hotel search, hold management, booking creation, and cancellation.
Integrates with Amadeus Hotel API and circuit breaker pattern.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum
import logging

from circuit_breaker import CircuitBreaker

logger = logging.getLogger(__name__)


class HotelBookingState(Enum):
    """Hotel booking state machine"""
    SEARCH_INITIATED = "SEARCH_INITIATED"
    ROOM_HELD = "ROOM_HELD"
    PAYMENT_PENDING = "PAYMENT_PENDING"
    BOOKING_CONFIRMED = "BOOKING_CONFIRMED"
    BOOKING_CANCELLED = "BOOKING_CANCELLED"
    REFUND_PROCESSED = "REFUND_PROCESSED"


@dataclass
class HotelOffer:
    """Hotel offer structure"""
    hotel_id: str
    hotel_name: str
    city: str
    country: str
    rating: float  # 1-5 stars
    address: str
    latitude: float
    longitude: float
    check_in_date: str  # ISO 8601
    check_out_date: str
    room_type: str  # "SINGLE", "DOUBLE", "SUITE"
    price_per_night: float  # Major currency
    currency: str  # ISO 4217
    total_price: float
    available_rooms: int
    amenities: List[str]
    cancellation_policy: str
    booking_id: Optional[str] = None


@dataclass
class HotelBooking:
    """Hotel booking confirmation"""
    reservation_id: str
    hotel_id: str
    hotel_name: str
    guest_name: str
    email: str
    phone: str
    check_in_date: str
    check_out_date: str
    room_type: str
    number_of_rooms: int
    number_of_guests: int
    price_per_night: float
    total_price: float
    currency: str
    status: str
    confirmation_code: str
    check_in_instructions: str
    hotel_contact: str
    created_at: str


class HotelBookingService:
    """Service for hotel booking operations with circuit breaker"""
    
    def __init__(self, config: Any):
        """
        Initialize HotelBookingService
        Args:
            config: Configuration object with API credentials
        """
        self.config = config
        self.amadeus_api_key = config.AMADEUS_API_KEY
        self.amadeus_api_secret = config.AMADEUS_API_SECRET
        self.circuit_breaker = CircuitBreaker(failure_threshold=5, timeout=60)
        self.held_rooms: Dict[str, Dict] = {}  # TTL-based room holds
        logger.info("HotelBookingService initialized")
    
    def search_hotels(
        self,
        city_code: str,
        check_in_date: str,
        check_out_date: str,
        adults: int,
        children: int = 0,
        max_results: int = 10
    ) -> List[HotelOffer]:
        """
        Search hotels in a city with given dates
        Args:
            city_code: IATA city code (e.g., 'NYC' for New York, 'PAR' for Paris)
            check_in_date: Check-in date in YYYY-MM-DD format
            check_out_date: Check-out date in YYYY-MM-DD format
            adults: Number of adults
            children: Number of children
            max_results: Maximum number of results
        Returns:
            List of HotelOffer objects
        """
        try:
            if not self.circuit_breaker.is_available():
                logger.warning(f"Circuit breaker OPEN for hotel search in {city_code}")
                return self._get_cached_hotels(city_code) or []
            
            logger.info(f"Searching hotels in {city_code} for {check_in_date} to {check_out_date}")
            
            # Simulate Amadeus Hotel Search API call
            # In production: call real Amadeus API: /v2/shopping/hotel-offers
            offers = self._mock_amadeus_hotel_search(
                city_code, check_in_date, check_out_date, adults, children
            )
            
            self.circuit_breaker.record_success()
            return offers[:max_results]
            
        except Exception as e:
            self.circuit_breaker.record_failure()
            logger.error(f"Hotel search failed: {str(e)}")
            raise
    
    def hold_room(
        self,
        hotel_id: str,
        room_type: str,
        check_in_date: str,
        check_out_date: str,
        number_of_rooms: int,
        ttl_minutes: int = 10
    ) -> Dict[str, Any]:
        """
        Place a hold on hotel rooms (non-binding, TTL-based)
        Args:
            hotel_id: Hotel ID
            room_type: Room type (SINGLE, DOUBLE, SUITE)
            check_in_date: Check-in date
            check_out_date: Check-out date
            number_of_rooms: Number of rooms to hold
            ttl_minutes: Time-to-live for the hold (default 10 minutes)
        Returns:
            Hold confirmation with hold_id and expiration time
        """
        try:
            if not self.circuit_breaker.is_available():
                logger.warning(f"Circuit breaker OPEN for room hold {hotel_id}")
                raise Exception("Hotel service unavailable")
            
            hold_id = f"HOLD_{hotel_id}_{int(datetime.now().timestamp())}"
            expiration = datetime.now() + timedelta(minutes=ttl_minutes)
            
            self.held_rooms[hold_id] = {
                "hotel_id": hotel_id,
                "room_type": room_type,
                "check_in_date": check_in_date,
                "check_out_date": check_out_date,
                "number_of_rooms": number_of_rooms,
                "expiration": expiration.isoformat()
            }
            
            logger.info(f"Room hold created: {hold_id}, expires at {expiration.isoformat()}")
            self.circuit_breaker.record_success()
            
            return {
                "hold_id": hold_id,
                "hotel_id": hotel_id,
                "room_type": room_type,
                "number_of_rooms": number_of_rooms,
                "expiration_time": expiration.isoformat(),
                "status": "HELD"
            }
            
        except Exception as e:
            self.circuit_breaker.record_failure()
            logger.error(f"Room hold failed: {str(e)}")
            raise
    
    def create_booking(
        self,
        hold_id: str,
        guest_name: str,
        email: str,
        phone: str,
        number_of_guests: int,
        special_requests: Optional[str] = None
    ) -> HotelBooking:
        """
        Create a confirmed hotel booking from a hold
        Args:
            hold_id: ID of the held room
            guest_name: Guest name
            email: Guest email
            phone: Guest phone
            number_of_guests: Total number of guests
            special_requests: Any special requests
        Returns:
            HotelBooking confirmation
        """
        try:
            if not self.circuit_breaker.is_available():
                logger.warning(f"Circuit breaker OPEN for booking creation")
                raise Exception("Hotel service unavailable")
            
            if hold_id not in self.held_rooms:
                raise ValueError(f"Hold ID {hold_id} not found or expired")
            
            hold = self.held_rooms[hold_id]
            
            # In production: POST to /v1/booking/hotel-bookings
            reservation_id = f"RES_{hold['hotel_id']}_{int(datetime.now().timestamp())}"
            confirmation_code = f"HOT{int(datetime.now().timestamp()) % 1000000:06d}"
            
            booking = HotelBooking(
                reservation_id=reservation_id,
                hotel_id=hold["hotel_id"],
                hotel_name=f"Luxury Hotel {hold['hotel_id'][-3:].upper()}",
                guest_name=guest_name,
                email=email,
                phone=phone,
                check_in_date=hold["check_in_date"],
                check_out_date=hold["check_out_date"],
                room_type=hold["room_type"],
                number_of_rooms=hold["number_of_rooms"],
                number_of_guests=number_of_guests,
                price_per_night=250.00,
                total_price=250.00 * ((datetime.fromisoformat(hold["check_out_date"]) - 
                                      datetime.fromisoformat(hold["check_in_date"])).days),
                currency="USD",
                status=HotelBookingState.BOOKING_CONFIRMED.value,
                confirmation_code=confirmation_code,
                check_in_instructions="Check-in available from 2:00 PM. Please present photo ID and booking confirmation.",
                hotel_contact="+1-555-HOTEL-01",
                created_at=datetime.now().isoformat()
            )
            
            # Clean up hold
            del self.held_rooms[hold_id]
            
            logger.info(f"Hotel booking confirmed: {reservation_id}, confirmation: {confirmation_code}")
            self.circuit_breaker.record_success()
            
            return booking
            
        except Exception as e:
            self.circuit_breaker.record_failure()
            logger.error(f"Booking creation failed: {str(e)}")
            raise
    
    def cancel_reservation(
        self,
        reservation_id: str,
        reason: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Cancel a hotel reservation and process refund
        Args:
            reservation_id: Reservation ID to cancel
            reason: Cancellation reason
        Returns:
            Cancellation confirmation with refund details
        """
        try:
            if not self.circuit_breaker.is_available():
                logger.warning(f"Circuit breaker OPEN for cancellation {reservation_id}")
                raise Exception("Hotel service unavailable")
            
            # In production: DELETE /v1/booking/hotel-bookings/{reservationId}
            refund_amount = 250.00 * 2  # Mock calculation
            
            logger.info(f"Reservation {reservation_id} cancelled. Refund: ${refund_amount:.2f}")
            self.circuit_breaker.record_success()
            
            return {
                "reservation_id": reservation_id,
                "status": HotelBookingState.BOOKING_CANCELLED.value,
                "refund_amount": refund_amount,
                "currency": "USD",
                "refund_status": HotelBookingState.REFUND_PROCESSED.value,
                "cancelled_at": datetime.now().isoformat(),
                "reason": reason or "Guest requested"
            }
            
        except Exception as e:
            self.circuit_breaker.record_failure()
            logger.error(f"Cancellation failed: {str(e)}")
            raise
    
    def _mock_amadeus_hotel_search(
        self,
        city_code: str,
        check_in_date: str,
        check_out_date: str,
        adults: int,
        children: int
    ) -> List[HotelOffer]:
        """Mock Amadeus hotel search response"""
        hotels = [
            {
                "hotel_id": "AMADEUS_HOTEL_001",
                "hotel_name": "Grand Plaza Suites",
                "city": city_code,
                "country": "US",
                "rating": 4.8,
                "address": "123 Main Street",
                "latitude": 40.7128,
                "longitude": -74.0060,
                "check_in_date": check_in_date,
                "check_out_date": check_out_date,
                "room_type": "DOUBLE",
                "price_per_night": 250.00,
                "currency": "USD",
                "total_price": 500.00,
                "available_rooms": 5,
                "amenities": ["WiFi", "Gym", "Pool", "Restaurant"],
                "cancellation_policy": "FREE_CANCELLATION_UNTIL_3_DAYS_BEFORE"
            },
            {
                "hotel_id": "AMADEUS_HOTEL_002",
                "hotel_name": "Budget Inn Downtown",
                "city": city_code,
                "country": "US",
                "rating": 4.0,
                "address": "456 Commerce Ave",
                "latitude": 40.7150,
                "longitude": -74.0070,
                "check_in_date": check_in_date,
                "check_out_date": check_out_date,
                "room_type": "SINGLE",
                "price_per_night": 100.00,
                "currency": "USD",
                "total_price": 200.00,
                "available_rooms": 12,
                "amenities": ["WiFi", "Restaurant"],
                "cancellation_policy": "NON_REFUNDABLE"
            },
            {
                "hotel_id": "AMADEUS_HOTEL_003",
                "hotel_name": "Luxury Tower Executive",
                "city": city_code,
                "country": "US",
                "rating": 5.0,
                "address": "789 Elite Boulevard",
                "latitude": 40.7100,
                "longitude": -74.0050,
                "check_in_date": check_in_date,
                "check_out_date": check_out_date,
                "room_type": "SUITE",
                "price_per_night": 500.00,
                "currency": "USD",
                "total_price": 1000.00,
                "available_rooms": 2,
                "amenities": ["WiFi", "Gym", "Pool", "Restaurant", "Spa", "Concierge"],
                "cancellation_policy": "FREE_CANCELLATION_UNTIL_24_HOURS_BEFORE"
            }
        ]
        return [HotelOffer(**hotel) for hotel in hotels]
    
    def _get_cached_hotels(self, city_code: str) -> Optional[List[HotelOffer]]:
        """Get cached hotel data as fallback (for circuit breaker open state)"""
        logger.info(f"Returning cached hotel data for {city_code}")
        return None  # Placeholder for actual cache implementation
