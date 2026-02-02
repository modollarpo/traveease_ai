"""
Shortlet (Vacation Rental) Booking Service
Handles shortlet/vacation rental search, verification, booking, and cancellation.
Integrates with Airbnb-like APIs and instant booking logic.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum
import logging

from circuit_breaker import CircuitBreaker

logger = logging.getLogger(__name__)


class ShortletBookingState(Enum):
    """Shortlet booking state machine"""
    SEARCH_INITIATED = "SEARCH_INITIATED"
    PROPERTY_VERIFIED = "PROPERTY_VERIFIED"
    INSTANT_BOOKING_CONFIRMED = "INSTANT_BOOKING_CONFIRMED"
    PENDING_OWNER_APPROVAL = "PENDING_OWNER_APPROVAL"
    BOOKING_CONFIRMED = "BOOKING_CONFIRMED"
    BOOKING_CANCELLED = "BOOKING_CANCELLED"
    GUEST_CHECKED_IN = "GUEST_CHECKED_IN"
    GUEST_CHECKED_OUT = "GUEST_CHECKED_OUT"


@dataclass
class ShortletProperty:
    """Shortlet property listing"""
    property_id: str
    property_name: str
    property_type: str  # "APARTMENT", "HOUSE", "VILLA", "CONDO"
    city: str
    country: str
    latitude: float
    longitude: float
    address: str
    bedrooms: int
    bathrooms: int
    max_guests: int
    price_per_night: float  # Major currency
    currency: str  # ISO 4217
    total_price: float
    check_in_date: str  # ISO 8601
    check_out_date: str
    amenities: List[str]
    rating: float  # 1-5 stars
    reviews_count: int
    host_name: str
    host_rating: float
    instant_booking: bool
    cancellation_policy: str
    availability: bool


@dataclass
class ShortletBooking:
    """Shortlet booking confirmation"""
    booking_id: str
    property_id: str
    property_name: str
    guest_name: str
    guest_email: str
    guest_phone: str
    check_in_date: str
    check_out_date: str
    number_of_guests: int
    number_of_bedrooms: int
    total_price: float
    currency: str
    status: str
    confirmation_code: str
    check_in_instructions: str
    access_code: Optional[str]
    wifi_password: Optional[str]
    host_contact: str
    house_rules: str
    created_at: str


class ShortletService:
    """Service for shortlet/vacation rental booking operations"""
    
    def __init__(self, config: Any):
        """
        Initialize ShortletService
        Args:
            config: Configuration object with API credentials
        """
        self.config = config
        self.circuit_breaker = CircuitBreaker(failure_threshold=5, timeout=60)
        self.verified_properties: Dict[str, bool] = {}
        self.bookings: Dict[str, Dict] = {}
        logger.info("ShortletService initialized")
    
    def search_shortlets(
        self,
        city: str,
        check_in_date: str,
        check_out_date: str,
        guests: int,
        property_type: Optional[str] = None,
        min_price: float = 0,
        max_price: float = 10000,
        max_results: int = 15
    ) -> List[ShortletProperty]:
        """
        Search for available shortlet properties
        Args:
            city: City name
            check_in_date: Check-in date (YYYY-MM-DD)
            check_out_date: Check-out date (YYYY-MM-DD)
            guests: Number of guests
            property_type: Filter by property type
            min_price: Minimum price per night
            max_price: Maximum price per night
            max_results: Maximum number of results
        Returns:
            List of ShortletProperty objects
        """
        try:
            if not self.circuit_breaker.is_available():
                logger.warning(f"Circuit breaker OPEN for shortlet search in {city}")
                return []
            
            logger.info(f"Searching shortlets in {city} from {check_in_date} to {check_out_date}")
            
            # Mock shortlet search
            properties = self._mock_shortlet_search(
                city, check_in_date, check_out_date, guests, property_type, min_price, max_price
            )
            
            self.circuit_breaker.record_success()
            return properties[:max_results]
            
        except Exception as e:
            self.circuit_breaker.record_failure()
            logger.error(f"Shortlet search failed: {str(e)}")
            raise
    
    def verify_property(
        self,
        property_id: str
    ) -> Dict[str, Any]:
        """
        Verify property details and ownership
        Args:
            property_id: Property ID to verify
        Returns:
            Verification status with property details
        """
        try:
            if not self.circuit_breaker.is_available():
                logger.warning(f"Circuit breaker OPEN for property verification {property_id}")
                raise Exception("Shortlet service unavailable")
            
            # In production: Verify against property database and conduct compliance checks
            verification_data = {
                "property_id": property_id,
                "verified": True,
                "verification_timestamp": datetime.now().isoformat(),
                "compliance_checks": {
                    "owner_identity_verified": True,
                    "property_ownership_confirmed": True,
                    "insurance_valid": True,
                    "property_standards_met": True
                },
                "risk_score": 0.05  # Low risk
            }
            
            self.verified_properties[property_id] = True
            logger.info(f"Property {property_id} verified successfully")
            self.circuit_breaker.record_success()
            
            return verification_data
            
        except Exception as e:
            self.circuit_breaker.record_failure()
            logger.error(f"Property verification failed: {str(e)}")
            raise
    
    def instant_booking(
        self,
        property_id: str,
        guest_name: str,
        guest_email: str,
        guest_phone: str,
        check_in_date: str,
        check_out_date: str,
        number_of_guests: int,
        number_of_bedrooms: int
    ) -> ShortletBooking:
        """
        Create an instant booking for a property (if instant booking enabled)
        Args:
            property_id: Property ID
            guest_name: Guest name
            guest_email: Guest email
            guest_phone: Guest phone
            check_in_date: Check-in date
            check_out_date: Check-out date
            number_of_guests: Total guests
            number_of_bedrooms: Bedrooms to reserve
        Returns:
            ShortletBooking confirmation
        """
        try:
            if not self.circuit_breaker.is_available():
                logger.warning(f"Circuit breaker OPEN for instant booking {property_id}")
                raise Exception("Shortlet service unavailable")
            
            if property_id not in self.verified_properties:
                raise ValueError(f"Property {property_id} not verified")
            
            booking_id = f"SLT_{property_id}_{int(datetime.now().timestamp())}"
            confirmation_code = f"SHT{int(datetime.now().timestamp()) % 1000000:06d}"
            
            num_nights = (datetime.fromisoformat(check_out_date) - 
                         datetime.fromisoformat(check_in_date)).days
            
            booking = ShortletBooking(
                booking_id=booking_id,
                property_id=property_id,
                property_name=f"Beautiful {number_of_bedrooms}BR Property in {property_id[-3:].upper()}",
                guest_name=guest_name,
                guest_email=guest_email,
                guest_phone=guest_phone,
                check_in_date=check_in_date,
                check_out_date=check_out_date,
                number_of_guests=number_of_guests,
                number_of_bedrooms=number_of_bedrooms,
                total_price=150.00 * num_nights,
                currency="USD",
                status=ShortletBookingState.INSTANT_BOOKING_CONFIRMED.value,
                confirmation_code=confirmation_code,
                check_in_instructions="Check-in after 2:00 PM. Use keypad code for entry.",
                access_code="2468",
                wifi_password="ShortletGuest2024!",
                host_contact="+1-555-HOST-01",
                house_rules="No smoking, no pets, quiet hours 10PM-8AM",
                created_at=datetime.now().isoformat()
            )
            
            self.bookings[booking_id] = {
                "guest": guest_name,
                "property_id": property_id,
                "dates": (check_in_date, check_out_date),
                "status": ShortletBookingState.INSTANT_BOOKING_CONFIRMED.value
            }
            
            logger.info(f"Instant booking confirmed: {booking_id}, confirmation: {confirmation_code}")
            self.circuit_breaker.record_success()
            
            return booking
            
        except Exception as e:
            self.circuit_breaker.record_failure()
            logger.error(f"Instant booking failed: {str(e)}")
            raise
    
    def check_availability(
        self,
        property_id: str,
        check_in_date: str,
        check_out_date: str
    ) -> Dict[str, Any]:
        """
        Check real-time availability of a property
        Args:
            property_id: Property ID
            check_in_date: Check-in date
            check_out_date: Check-out date
        Returns:
            Availability status
        """
        try:
            if not self.circuit_breaker.is_available():
                logger.warning(f"Circuit breaker OPEN for availability check {property_id}")
                raise Exception("Shortlet service unavailable")
            
            # Check against booking calendar
            available = True
            for booking_id, booking in self.bookings.items():
                if booking["property_id"] == property_id:
                    booked_in, booked_out = booking["dates"]
                    # Check for overlap
                    if not (check_out_date <= booked_in or check_in_date >= booked_out):
                        available = False
                        break
            
            logger.info(f"Property {property_id} availability: {available}")
            self.circuit_breaker.record_success()
            
            return {
                "property_id": property_id,
                "check_in_date": check_in_date,
                "check_out_date": check_out_date,
                "available": available,
                "checked_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.circuit_breaker.record_failure()
            logger.error(f"Availability check failed: {str(e)}")
            raise
    
    def instant_cancellation(
        self,
        booking_id: str,
        reason: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Cancel a shortlet booking with instant refund (if within policy)
        Args:
            booking_id: Booking ID to cancel
            reason: Cancellation reason
        Returns:
            Cancellation confirmation with refund
        """
        try:
            if not self.circuit_breaker.is_available():
                logger.warning(f"Circuit breaker OPEN for cancellation {booking_id}")
                raise Exception("Shortlet service unavailable")
            
            if booking_id not in self.bookings:
                raise ValueError(f"Booking {booking_id} not found")
            
            # Calculate refund based on cancellation policy
            refund_percentage = 100  # Instant booking allows full refund within 48 hours
            refund_amount = 150.00 * 3 * (refund_percentage / 100)
            
            del self.bookings[booking_id]
            
            logger.info(f"Booking {booking_id} cancelled. Refund: ${refund_amount:.2f}")
            self.circuit_breaker.record_success()
            
            return {
                "booking_id": booking_id,
                "status": ShortletBookingState.BOOKING_CANCELLED.value,
                "refund_amount": refund_amount,
                "currency": "USD",
                "refund_policy": "INSTANT_REFUND",
                "cancelled_at": datetime.now().isoformat(),
                "reason": reason or "Guest requested"
            }
            
        except Exception as e:
            self.circuit_breaker.record_failure()
            logger.error(f"Cancellation failed: {str(e)}")
            raise
    
    def _mock_shortlet_search(
        self,
        city: str,
        check_in_date: str,
        check_out_date: str,
        guests: int,
        property_type: Optional[str],
        min_price: float,
        max_price: float
    ) -> List[ShortletProperty]:
        """Mock shortlet search results"""
        properties = [
            {
                "property_id": "SHORTLET_001",
                "property_name": "Modern 2BR Apartment Downtown",
                "property_type": "APARTMENT",
                "city": city,
                "country": "US",
                "latitude": 40.7128,
                "longitude": -74.0060,
                "address": "123 Vacation Lane",
                "bedrooms": 2,
                "bathrooms": 1,
                "max_guests": 4,
                "price_per_night": 150.00,
                "currency": "USD",
                "total_price": 450.00,
                "check_in_date": check_in_date,
                "check_out_date": check_out_date,
                "amenities": ["WiFi", "Kitchen", "AC", "Washer", "TV"],
                "rating": 4.9,
                "reviews_count": 127,
                "host_name": "Sarah M.",
                "host_rating": 4.95,
                "instant_booking": True,
                "cancellation_policy": "FLEXIBLE",
                "availability": True
            },
            {
                "property_id": "SHORTLET_002",
                "property_name": "Cozy Studio with City View",
                "property_type": "APARTMENT",
                "city": city,
                "country": "US",
                "latitude": 40.7150,
                "longitude": -74.0070,
                "address": "456 Vista Road",
                "bedrooms": 1,
                "bathrooms": 1,
                "max_guests": 2,
                "price_per_night": 120.00,
                "currency": "USD",
                "total_price": 360.00,
                "check_in_date": check_in_date,
                "check_out_date": check_out_date,
                "amenities": ["WiFi", "Kitchenette", "AC"],
                "rating": 4.7,
                "reviews_count": 89,
                "host_name": "John D.",
                "host_rating": 4.85,
                "instant_booking": True,
                "cancellation_policy": "MODERATE",
                "availability": True
            },
            {
                "property_id": "SHORTLET_003",
                "property_name": "Luxury 3BR Villa with Pool",
                "property_type": "VILLA",
                "city": city,
                "country": "US",
                "latitude": 40.7100,
                "longitude": -74.0050,
                "address": "789 Luxury Lane",
                "bedrooms": 3,
                "bathrooms": 2,
                "max_guests": 6,
                "price_per_night": 350.00,
                "currency": "USD",
                "total_price": 1050.00,
                "check_in_date": check_in_date,
                "check_out_date": check_out_date,
                "amenities": ["WiFi", "Full Kitchen", "Pool", "Garden", "AC", "TV", "Washer"],
                "rating": 5.0,
                "reviews_count": 56,
                "host_name": "Resort Properties Inc.",
                "host_rating": 5.0,
                "instant_booking": False,
                "cancellation_policy": "STRICT",
                "availability": True
            }
        ]
        
        return [ShortletProperty(**prop) for prop in properties]
