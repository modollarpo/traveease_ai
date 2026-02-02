# Test Credentials & Integration Guide
# For testing Traveease with real API sandboxes

## Payment Gateway Test Credentials

### Stripe (Global)
- **Public Key:** pk_test_51234567890abcdefghijklmnopqrst
- **Secret Key:** sk_REDACTED
- **Test Card:** 4242 4242 4242 4242 | 12/26 | 123

### PayPal (Global + BNPL)
- **Client ID:** ASc_CLIENT_TEST_ID_1234567890
- **Secret:** ASc_SECRET_TEST_1234567890
- **Mode:** sandbox
- **Test Account Email:** sb-testing@paypal.com

### Flutterwave (Pan-African)
- **Public Key:** FLWPUBK_TEST-abc123def456ghi789jkl
- **Secret Key:** FLWSECK_REDACTED
- **Test Card:** 5531 8866 5725 4957 | 09/26 | 123

### Paystack (Nigeria/Ghana)
- **Public Key:** pk_test_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
- **Secret Key:** sk_REDACTED
- **Test Card:** 4084 0343 1234 5678 | 12/26 | 123

## Travel API Test Credentials

### Amadeus (Flights, Hotels, Cars)
- **API Key:** K7XmZ2aBcDeFgHiJkLmNoPqRsTuVwXyZ
- **API Secret:** AmadeusTestSecretKey2026
- **Base URL:** https://test.api.amadeus.com

### Viator (Activities)
- **API Key:** VIA_TEST_123456789ABCDEF
- **Base URL:** https://api.sandbox.viator.com

### Treepz (African Local Transport)
- **API Key:** TREEPZ_TEST_KEY_ABC123

### Travu (African Buses)
- **API Key:** TRAVU_TEST_KEY_XYZ789

## Running Tests

### Backend FastAPI Tests
```bash
cd backend
uvicorn main:app --reload --port 8000

# Test Flight Search
curl -X POST http://localhost:8000/booking/flights/search \
  -H "Content-Type: application/json" \
  -d '{"originLocationCode": "LOS", "destinationLocationCode": "LHR", "departureDate": "2026-02-15", "adults": "2"}'

# Test Car Search
curl -X POST http://localhost:8000/booking/cars/search \
  -H "Content-Type: application/json" \
  -d '{"pickupLocationCode": "LOS", "pickupDate": "2026-02-15", "days": "2"}'

# Test Bus Search (Mobility)
curl -X POST http://localhost:8000/booking/mobility/buses/search \
  -H "Content-Type: application/json" \
  -d '{"origin": "Lagos", "destination": "Ibadan", "date": "2026-02-15"}'

# Test Hotel Search
curl -X POST http://localhost:8000/booking/hotels/search \
  -H "Content-Type: application/json" \
  -d '{"cityCode": "NYC", "checkInDate": "2026-02-15", "checkOutDate": "2026-02-18", "adults": 2}'

# Test Hotel Hold Room
curl -X POST http://localhost:8000/booking/hotels/hold \
  -H "Content-Type: application/json" \
  -d '{"hotelId": "AMADEUS_HOTEL_001", "roomType": "DOUBLE", "checkInDate": "2026-02-15", "checkOutDate": "2026-02-18", "numberOfRooms": 1}'

# Test Hotel Booking
curl -X POST http://localhost:8000/booking/hotels/book \
  -H "Content-Type: application/json" \
  -d '{"holdId": "HOLD_AMADEUS_HOTEL_001_1234567890", "guestName": "John Doe", "email": "john@example.com", "phone": "+1-555-0001", "numberOfGuests": 2}'

# Test Shortlet Search
curl -X POST http://localhost:8000/booking/shortlets/search \
  -H "Content-Type: application/json" \
  -d '{"city": "New York", "checkInDate": "2026-02-15", "checkOutDate": "2026-02-18", "guests": 2}'

# Test Shortlet Property Verification
curl -X POST http://localhost:8000/booking/shortlets/verify \
  -H "Content-Type: application/json" \
  -d '{"propertyId": "SHORTLET_001"}'

# Test Shortlet Instant Booking
curl -X POST http://localhost:8000/booking/shortlets/instant-book \
  -H "Content-Type: application/json" \
  -d '{"propertyId": "SHORTLET_001", "guestName": "Jane Smith", "email": "jane@example.com", "phone": "+1-555-0002", "checkInDate": "2026-02-15", "checkOutDate": "2026-02-18", "numberOfGuests": 2, "numberOfBedrooms": 1}'

# Test Visa Eligibility Check
curl -X POST http://localhost:8000/booking/visas/eligibility \
  -H "Content-Type: application/json" \
  -d '{"citizenCountry": "US", "destinationCountry": "NG"}'

# Test Visa Application
curl -X POST http://localhost:8000/booking/visas/apply \
  -H "Content-Type: application/json" \
  -d '{"applicantName": "Alex Johnson", "passportNumber": "US12345678", "citizenCountry": "US", "destinationCountry": "NG", "visaType": "TOURIST", "travelStartDate": "2026-03-01", "travelEndDate": "2026-03-15"}'

# Test Visa Document Verification
curl -X POST http://localhost:8000/booking/visas/verify-documents \
  -H "Content-Type: application/json" \
  -d '{"applicationId": "VISA_NG_1234567890", "documents": {"passport": "url/to/passport", "financial_proof": "url/to/bank_statement"}}'

# Test Visa Status Tracking
curl -X POST http://localhost:8000/booking/visas/track-status \
  -H "Content-Type: application/json" \
  -d '{"applicationId": "VISA_NG_1234567890"}'

# Test Tours Search
curl -X POST http://localhost:8000/booking/tours/search \
  -H "Content-Type: application/json" \
  -d '{"destination": "New York", "category": "SIGHTSEEING", "minPrice": 0, "maxPrice": 500}'

# Test Tour Availability Check
curl -X POST http://localhost:8000/booking/tours/availability \
  -H "Content-Type: application/json" \
  -d '{"tourId": "VIATOR_001", "tourDate": "2026-02-20", "participants": 2}'

# Test Tour Booking
curl -X POST http://localhost:8000/booking/tours/book \
  -H "Content-Type: application/json" \
  -d '{"tourId": "VIATOR_001", "customerName": "Mike Brown", "email": "mike@example.com", "phone": "+1-555-0003", "tourDate": "2026-02-20", "numberOfParticipants": 2}'

# Test Tour Cancellation
curl -X POST http://localhost:8000/booking/tours/cancel \
  -H "Content-Type: application/json" \
  -d '{"bookingId": "TOUR_VIATOR_001_1234567890", "reason": "Schedule conflict"}'

# Test Tour Rating
curl -X POST http://localhost:8000/booking/tours/rate \
  -H "Content-Type: application/json" \
  -d '{"bookingId": "TOUR_VIATOR_001_1234567890", "rating": 5, "review": "Amazing tour! Highly recommended."}'

### Commerce NestJS Tests
```bash
cd commerce
npm run start

# Test Payment Intent Creation
curl -X POST http://localhost:3001/payments/intent \
  -H "Content-Type: application/json" \
  -d '{"amount": 100000, "currency": "NGN", "userIp": "192.168.1.1", "vendorLocation": "Nigeria"}'

# Test Nigerian Compliance
curl -X POST http://localhost:3001/payments/compliance/total \
  -H "Content-Type: application/json" \
  -d '{"basePrice": 1000000, "platformCommissionPercent": 10, "currency": "NGN"}'
```

### Frontend Next.js Tests
```bash
cd frontend
npm run dev

# Access at http://localhost:3000/en
# Test multilingual routing: http://localhost:3000/es, /fr, /de, etc.
```

## Note on Production
- Replace all test credentials with production keys before deploying.
- Ensure NDPR/GDPR compliance for data storage and processing.
- Implement proper API rate limiting and caching.
- Use HTTPS in production.
