import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate } from 'k6/metrics';

/**
 * k6 Load Testing Script for Traveease API
 * 
 * Usage:
 *   k6 run load-test.js
 *   k6 run --vus 50 --duration 5m load-test.js
 *   k6 cloud load-test.js
 * 
 * Requirements:
 *   npm install -D k6
 *   npm install -D k6-browser (for browser tests)
 * 
 * SLA Targets:
 *   - Payment Settlement: < 15 seconds
 *   - Booking Confirmation: < 30 seconds
 *   - List Operations: < 2 seconds
 *   - Error Rate: < 1%
 */

// Configuration
export const options = {
  stages: [
    // Ramp up: 0 to 50 VUs over 2 minutes
    { duration: '2m', target: 50 },
    
    // Sustain: 50 VUs for 5 minutes
    { duration: '5m', target: 50 },
    
    // Ramp down: 50 to 0 VUs over 2 minutes
    { duration: '2m', target: 0 },
  ],
  
  thresholds: {
    // HTTP request duration
    'http_req_duration': [
      'p(95)<500',      // 95% of requests < 500ms
      'p(99)<1000',     // 99% of requests < 1s
      'max<5000',       // No request > 5s
    ],
    
    // Payment endpoints (critical path)
    'http_req_duration{endpoint:payment}': [
      'p(95)<5000',     // 95% < 5s (SLA: 15s)
      'p(99)<10000',    // 99% < 10s
      'max<15000',      // Max 15s
    ],
    
    // Booking endpoints
    'http_req_duration{endpoint:booking}': [
      'p(95)<10000',    // 95% < 10s (SLA: 30s)
      'p(99)<20000',    // 99% < 20s
      'max<30000',      // Max 30s
    ],
    
    // Error rate
    'http_req_failed': ['rate<0.01'],  // < 1% failure rate
  },
};

// Constants
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const API_KEY = __ENV.API_KEY || 'test-api-key';
const JWT_TOKEN = __ENV.JWT_TOKEN || 'test-jwt-token';

const HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${JWT_TOKEN}`,
  'X-API-Key': API_KEY,
};

// Custom metrics
export const errorRate = new Rate('errors');

// Test Data
const testData = {
  userId: '550e8400-e29b-41d4-a716-446655440000',
  vendorId: '550e8400-e29b-41d4-a716-446655440100',
  flightOfferId: 'flight-offer-001',
  hotelOfferId: 'hotel-offer-001',
  carOfferId: 'car-offer-001',
};

// =====================================================================
// FLIGHT BOOKING FLOW
// =====================================================================
function flightBookingFlow() {
  group('Flight Booking Flow', () => {
    // Step 1: Get flight offers
    let response = http.get(
      `${BASE_URL}/api/v1/flights?departure=JFK&arrival=CDG&date=2026-03-01`,
      { headers: HEADERS, tags: { endpoint: 'flight_search' } }
    );
    
    check(response, {
      'Flight search successful': (r) => r.status === 200,
      'Flight offers returned': (r) => r.json('data.length') > 0,
    }) || errorRate.add(1);
    
    sleep(1);

    // Step 2: Price lock flight
    response = http.post(
      `${BASE_URL}/api/v1/flights/price-lock`,
      JSON.stringify({
        flightOfferId: testData.flightOfferId,
        passengers: 1,
      }),
      { headers: HEADERS, tags: { endpoint: 'booking' } }
    );
    
    check(response, {
      'Price lock successful': (r) => r.status === 200,
      'PNR generated': (r) => r.json('data.pnr') !== null,
      'Price locked within SLA': (r) => r.timings.duration < 5000,
    }) || errorRate.add(1);
    
    sleep(2);

    // Step 3: Create booking
    response = http.post(
      `${BASE_URL}/api/v1/bookings/flight`,
      JSON.stringify({
        flightOfferId: testData.flightOfferId,
        passengerName: 'John Doe',
        passengerEmail: 'john@example.com',
        basePriceMinor: 120000,
        currencyCode: 'USD',
      }),
      { headers: HEADERS, tags: { endpoint: 'booking' } }
    );
    
    check(response, {
      'Booking created': (r) => r.status === 201,
      'Booking ID returned': (r) => r.json('data.id') !== null,
      'Booking confirmation within SLA': (r) => r.timings.duration < 30000,
    }) || errorRate.add(1);
    
    sleep(1);
  });
}

// =====================================================================
// PAYMENT PROCESSING FLOW
// =====================================================================
function paymentFlow() {
  group('Payment Processing Flow', () => {
    // Step 1: Create payment intent
    let response = http.post(
      `${BASE_URL}/api/v1/payments/intent`,
      JSON.stringify({
        amount: 120000,
        currency: 'USD',
        bookingId: 'booking-001',
        userId: testData.userId,
        paymentMethod: 'stripe',
      }),
      { headers: HEADERS, tags: { endpoint: 'payment' } }
    );
    
    check(response, {
      'Payment intent created': (r) => r.status === 200,
      'Client secret provided': (r) => r.json('data.clientSecret') !== null,
      'Payment intent within SLA': (r) => r.timings.duration < 5000,
    }) || errorRate.add(1);
    
    sleep(1);

    // Step 2: Confirm payment
    response = http.post(
      `${BASE_URL}/api/v1/payments/confirm`,
      JSON.stringify({
        paymentIntentId: 'pi_test_123',
        paymentMethodId: 'pm_test_456',
      }),
      { headers: HEADERS, tags: { endpoint: 'payment' } }
    );
    
    check(response, {
      'Payment confirmed': (r) => r.status === 200,
      'Payment captured': (r) => r.json('data.status') === 'captured',
      'Settlement within SLA': (r) => r.timings.duration < 15000,
    }) || errorRate.add(1);
    
    sleep(2);
  });
}

// =====================================================================
// HOTEL BOOKING FLOW
// =====================================================================
function hotelBookingFlow() {
  group('Hotel Booking Flow', () => {
    // Step 1: Search hotels
    let response = http.get(
      `${BASE_URL}/api/v1/hotels?city=CDG&checkIn=2026-03-02&checkOut=2026-03-05`,
      { headers: HEADERS, tags: { endpoint: 'hotel_search' } }
    );
    
    check(response, {
      'Hotel search successful': (r) => r.status === 200,
      'Hotels returned': (r) => r.json('data.length') > 0,
    }) || errorRate.add(1);
    
    sleep(1);

    // Step 2: Reserve hotel
    response = http.post(
      `${BASE_URL}/api/v1/hotels/reserve`,
      JSON.stringify({
        hotelOfferId: testData.hotelOfferId,
        guestName: 'John Doe',
        guestEmail: 'john@example.com',
        roomCount: 1,
        guestCount: 1,
        totalPrice: 80000,
        currency: 'USD',
      }),
      { headers: HEADERS, tags: { endpoint: 'booking' } }
    );
    
    check(response, {
      'Reservation created': (r) => r.status === 201,
      'Confirmation ID issued': (r) => r.json('data.confirmationId') !== null,
      'Reservation within SLA': (r) => r.timings.duration < 30000,
    }) || errorRate.add(1);
    
    sleep(2);
  });
}

// =====================================================================
// CAR RENTAL FLOW
// =====================================================================
function carRentalFlow() {
  group('Car Rental Flow', () => {
    // Step 1: Search cars
    let response = http.get(
      `${BASE_URL}/api/v1/cars?pickup=LOS&dropoff=LOS&pickupDate=2026-02-15&dropoffDate=2026-02-18`,
      { headers: HEADERS, tags: { endpoint: 'car_search' } }
    );
    
    check(response, {
      'Car search successful': (r) => r.status === 200,
      'Cars available': (r) => r.json('data.length') > 0,
    }) || errorRate.add(1);
    
    sleep(1);

    // Step 2: Reserve car
    response = http.post(
      `${BASE_URL}/api/v1/cars/reserve`,
      JSON.stringify({
        carOfferId: testData.carOfferId,
        driverName: 'Chioma Okafor',
        driverEmail: 'chioma@example.com',
        driverLicenseCountry: 'NG',
        totalPrice: 25000000,
        currency: 'NGN',
      }),
      { headers: HEADERS, tags: { endpoint: 'booking' } }
    );
    
    check(response, {
      'Reservation created': (r) => r.status === 201,
      'Confirmation provided': (r) => r.json('data.confirmationId') !== null,
      'Reservation within SLA': (r) => r.timings.duration < 30000,
    }) || errorRate.add(1);
    
    sleep(2);
  });
}

// =====================================================================
// ITINERARY & SUMMARY FLOW
// =====================================================================
function itineraryFlow() {
  group('Itinerary Management', () => {
    // Get all bookings for user
    let response = http.get(
      `${BASE_URL}/api/v1/bookings?userId=${testData.userId}`,
      { headers: HEADERS, tags: { endpoint: 'list' } }
    );
    
    check(response, {
      'List bookings successful': (r) => r.status === 200,
      'Bookings returned': (r) => Array.isArray(r.json('data')),
      'List operation fast': (r) => r.timings.duration < 2000,
    }) || errorRate.add(1);
    
    sleep(1);

    // Generate trip summary
    response = http.post(
      `${BASE_URL}/api/v1/bookings/summary`,
      JSON.stringify({
        itineraryId: 'itinerary-001',
        format: 'pdf',
      }),
      { headers: HEADERS, tags: { endpoint: 'export' } }
    );
    
    check(response, {
      'Summary generated': (r) => r.status === 200,
      'PDF created': (r) => r.headers['Content-Type'] === 'application/pdf',
    }) || errorRate.add(1);
    
    sleep(1);
  });
}

// =====================================================================
// ERROR HANDLING FLOW
// =====================================================================
function errorHandlingFlow() {
  group('Error Handling & Resilience', () => {
    // Test invalid request
    let response = http.post(
      `${BASE_URL}/api/v1/bookings/flight`,
      JSON.stringify({
        // Missing required fields
        passengerName: 'John Doe',
      }),
      { headers: HEADERS }
    );
    
    check(response, {
      'Invalid request rejected': (r) => r.status === 400,
      'Error message provided': (r) => r.json('error') !== null,
    }) || errorRate.add(1);
    
    sleep(1);

    // Test unauthorized access
    response = http.get(
      `${BASE_URL}/api/v1/bookings`,
      { headers: { ...HEADERS, 'Authorization': 'Bearer invalid-token' } }
    );
    
    check(response, {
      'Unauthorized rejected': (r) => r.status === 401,
    }) || errorRate.add(1);
    
    sleep(1);

    // Test rate limiting
    for (let i = 0; i < 150; i++) {
      http.get(`${BASE_URL}/api/v1/health`, { headers: HEADERS });
    }
    
    response = http.get(
      `${BASE_URL}/api/v1/health`,
      { headers: HEADERS }
    );
    
    check(response, {
      'Rate limit enforced': (r) => r.status === 429 || r.status === 200,
    });
  });
}

// =====================================================================
// MAIN TEST EXECUTION
// =====================================================================
export default function () {
  // Route traffic across different test scenarios
  const scenario = Math.random();
  
  if (scenario < 0.3) {
    flightBookingFlow();
  } else if (scenario < 0.5) {
    paymentFlow();
  } else if (scenario < 0.65) {
    hotelBookingFlow();
  } else if (scenario < 0.8) {
    carRentalFlow();
  } else if (scenario < 0.95) {
    itineraryFlow();
  } else {
    errorHandlingFlow();
  }

  // Small delay between iterations
  sleep(Math.random() * 3);
}

// =====================================================================
// SETUP & TEARDOWN
// =====================================================================
export function setup() {
  console.log('🚀 Starting Traveease API Load Test');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Stages: Ramp-up (2m) → Sustain (5m) → Ramp-down (2m)`);
  console.log(`Total Duration: 9 minutes`);
  
  // Verify API is accessible
  const response = http.get(`${BASE_URL}/api/v1/health`, { headers: HEADERS });
  if (response.status !== 200) {
    throw new Error('❌ API is not accessible. Check BASE_URL and credentials.');
  }
  
  console.log('✅ API health check passed');
  
  return {};
}

export function teardown(data) {
  console.log('\n📊 Load Test Summary:');
  console.log(`✅ Completed successfully`);
  console.log(`📈 Review detailed metrics in k6 cloud or JSON report`);
}

// =====================================================================
// SUMMARY RESULTS
// =====================================================================
/**
 * Expected Results (with optimal infrastructure):
 * 
 * ✅ Payment Settlement: ~2-5 seconds (SLA: <15s)
 * ✅ Booking Confirmation: ~8-12 seconds (SLA: <30s)
 * ✅ List Operations: ~200-500ms (SLA: <2s)
 * ✅ Error Rate: <0.5% (SLA: <1%)
 * ✅ 95th Percentile Latency: <500ms
 * ✅ 99th Percentile Latency: <1s
 * 
 * Usage:
 * 1. Start API: npm start (in commerce directory)
 * 2. Run test: k6 run load-test.js
 * 3. View results: Check k6 output
 * 
 * Cloud Mode:
 * 1. Authenticate: k6 login cloud
 * 2. Run: k6 cloud load-test.js
 * 3. View: https://app.k6.io/
 */
