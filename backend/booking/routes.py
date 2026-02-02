from fastapi import APIRouter
from backend.booking.flight_service import FlightBookingService
from backend.booking.car_service import CarRentalService
from backend.booking.mobility_service import MobilityService
from backend.booking.hotel_service import HotelBookingService
from backend.booking.shortlet_service import ShortletService
from backend.booking.visa_service import VisaService
from backend.booking.tours_service import ToursService
from backend.config import Config

router = APIRouter()

# Initialize services with test credentials
flight_service = FlightBookingService(Config)
car_service = CarRentalService(Config)
mobility_service = MobilityService(Config)
hotel_service = HotelBookingService(Config)
shortlet_service = ShortletService(Config)
visa_service = VisaService(Config)
tours_service = ToursService(Config)

@router.post("/flights/search")
async def search_flights(payload: dict):
    return await flight_service.search_flights(payload)

@router.post("/flights/order")
async def create_flight_order(payload: dict):
    return await flight_service.create_order(payload.get("offer"), payload.get("passengers", []))

@router.post("/flights/ticket")
async def issue_ticket(payload: dict):
    return await flight_service.issue_ticket(payload.get("orderId"))

@router.post("/cars/search")
async def search_cars(payload: dict):
    return await car_service.search_cars(payload)

@router.post("/cars/verify-documents")
async def verify_documents(payload: dict):
    return await car_service.verify_documents(payload.get("rentalId"), payload.get("documents", {}))

@router.post("/cars/book")
async def book_car(payload: dict):
    return await car_service.create_booking(payload.get("rentalId"), payload.get("driverInfo", {}))

@router.post("/mobility/buses/search")
async def search_buses(payload: dict):
    return await mobility_service.search_buses(payload)

@router.post("/mobility/buses/select-seats")
async def select_seats(payload: dict):
    return await mobility_service.select_seats(payload.get("busId"), payload.get("seatNumbers", []))

@router.post("/mobility/buses/book")
async def book_journey(payload: dict):
    return await mobility_service.book_journey(payload.get("reservationId"), payload.get("passengerInfo", {}))

# Hotel endpoints
@router.post("/hotels/search")
async def search_hotels(payload: dict):
    return hotel_service.search_hotels(
        city_code=payload.get("cityCode"),
        check_in_date=payload.get("checkInDate"),
        check_out_date=payload.get("checkOutDate"),
        adults=payload.get("adults", 1),
        children=payload.get("children", 0),
        max_results=payload.get("maxResults", 10)
    )

@router.post("/hotels/hold")
async def hold_room(payload: dict):
    return hotel_service.hold_room(
        hotel_id=payload.get("hotelId"),
        room_type=payload.get("roomType"),
        check_in_date=payload.get("checkInDate"),
        check_out_date=payload.get("checkOutDate"),
        number_of_rooms=payload.get("numberOfRooms", 1),
        ttl_minutes=payload.get("ttlMinutes", 10)
    )

@router.post("/hotels/book")
async def book_hotel(payload: dict):
    return hotel_service.create_booking(
        hold_id=payload.get("holdId"),
        guest_name=payload.get("guestName"),
        email=payload.get("email"),
        phone=payload.get("phone"),
        number_of_guests=payload.get("numberOfGuests"),
        special_requests=payload.get("specialRequests")
    )

@router.post("/hotels/cancel")
async def cancel_hotel(payload: dict):
    return hotel_service.cancel_reservation(
        reservation_id=payload.get("reservationId"),
        reason=payload.get("reason")
    )

# Shortlet endpoints
@router.post("/shortlets/search")
async def search_shortlets(payload: dict):
    return shortlet_service.search_shortlets(
        city=payload.get("city"),
        check_in_date=payload.get("checkInDate"),
        check_out_date=payload.get("checkOutDate"),
        guests=payload.get("guests", 1),
        property_type=payload.get("propertyType"),
        min_price=payload.get("minPrice", 0),
        max_price=payload.get("maxPrice", 10000),
        max_results=payload.get("maxResults", 15)
    )

@router.post("/shortlets/verify")
async def verify_property(payload: dict):
    return shortlet_service.verify_property(
        property_id=payload.get("propertyId")
    )

@router.post("/shortlets/instant-book")
async def instant_book_shortlet(payload: dict):
    return shortlet_service.instant_booking(
        property_id=payload.get("propertyId"),
        guest_name=payload.get("guestName"),
        guest_email=payload.get("email"),
        guest_phone=payload.get("phone"),
        check_in_date=payload.get("checkInDate"),
        check_out_date=payload.get("checkOutDate"),
        number_of_guests=payload.get("numberOfGuests"),
        number_of_bedrooms=payload.get("numberOfBedrooms")
    )

@router.post("/shortlets/availability")
async def check_shortlet_availability(payload: dict):
    return shortlet_service.check_availability(
        property_id=payload.get("propertyId"),
        check_in_date=payload.get("checkInDate"),
        check_out_date=payload.get("checkOutDate")
    )

@router.post("/shortlets/cancel")
async def cancel_shortlet(payload: dict):
    return shortlet_service.instant_cancellation(
        booking_id=payload.get("bookingId"),
        reason=payload.get("reason")
    )

# Visa endpoints
@router.post("/visas/eligibility")
async def check_visa_eligibility(payload: dict):
    return visa_service.visa_eligibility_check(
        citizen_country=payload.get("citizenCountry"),
        destination_country=payload.get("destinationCountry"),
        passport_number=payload.get("passportNumber")
    )

@router.post("/visas/verify-documents")
async def verify_visa_documents(payload: dict):
    return visa_service.document_verification(
        application_id=payload.get("applicationId"),
        documents=payload.get("documents", {})
    )

@router.post("/visas/apply")
async def apply_visa(payload: dict):
    return visa_service.apply_visa(
        applicant_name=payload.get("applicantName"),
        passport_number=payload.get("passportNumber"),
        citizen_country=payload.get("citizenCountry"),
        destination_country=payload.get("destinationCountry"),
        visa_type=payload.get("visaType"),
        travel_start_date=payload.get("travelStartDate"),
        travel_end_date=payload.get("travelEndDate")
    )

@router.post("/visas/track-status")
async def track_visa_status(payload: dict):
    return visa_service.track_status(
        application_id=payload.get("applicationId"),
        reference_number=payload.get("referenceNumber")
    )

# Tours endpoints
@router.post("/tours/search")
async def search_tours(payload: dict):
    return tours_service.search_tours(
        destination=payload.get("destination"),
        category=payload.get("category"),
        min_price=payload.get("minPrice", 0),
        max_price=payload.get("maxPrice", 10000),
        duration_min=payload.get("durationMin", 0),
        duration_max=payload.get("durationMax", 24),
        max_results=payload.get("maxResults", 20)
    )

@router.post("/tours/availability")
async def check_tour_availability(payload: dict):
    return tours_service.check_availability(
        tour_id=payload.get("tourId"),
        tour_date=payload.get("tourDate"),
        participants=payload.get("participants", 1)
    )

@router.post("/tours/book")
async def book_tour(payload: dict):
    return tours_service.book_tour(
        tour_id=payload.get("tourId"),
        customer_name=payload.get("customerName"),
        customer_email=payload.get("email"),
        customer_phone=payload.get("phone"),
        tour_date=payload.get("tourDate"),
        number_of_participants=payload.get("numberOfParticipants")
    )

@router.post("/tours/cancel")
async def cancel_tour(payload: dict):
    return tours_service.cancel_tour(
        booking_id=payload.get("bookingId"),
        reason=payload.get("reason")
    )

@router.post("/tours/rate")
async def rate_tour(payload: dict):
    return tours_service.rate_tour(
        booking_id=payload.get("bookingId"),
        rating=payload.get("rating"),
        review=payload.get("review")
    )
