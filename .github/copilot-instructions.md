
# Traveease Enterprise Framework (v3.0 Global Production)

## Project Vision
A global AI-native Travel OS. Multivendor, Multilingual, and Multicurrency.

## Tech Stack
* Frontend: Next.js 15 (App Router), next-intl (multilingual), money.js (formatting).
* AI Backend: Python (FastAPI), LangGraph (Agentic Concierge).
* Financial Hub: Node.js (NestJS), Ledger-grade PostgreSQL schema (bitemporal).
* Global Gateways: Stripe Connect (Global Marketplace), PayPal (BNPL & Global Reach).
* Regional Gateways: Flutterwave (Pan-African Multicurrency), Paystack (Nigeria/Ghana).

## Enterprise Logic Requirements
1. **Financial Orchestration:** Implement a `PaymentGatewayOrchestrator` that routes transactions based on User IP, Currency, and Vendor location.
2. **Marketplace Splits:** Use Stripe Connect "Destination Charges" or Flutterwave "Subaccounts" to distribute funds to multiple vendors in one checkout session.
3. **Logistics Saga Pattern:** Use an orchestrated Saga for Flights and Cars: `HELD` -> `PRICE_LOCKED` -> `AUTH_CAPTURED` -> `TICKETED`.
4. **Currency Precision:** Store all amounts as `BIGINT` in minor units (e.g., cents, kobo) to avoid floating-point errors. Store both the "Transaction Currency" and "Base Ledger Currency" with the mid-market rate at the moment of authorization.

---

## Phase-by-Phase Production Prompts

### Prompt 1: The Global Payment Gateway Orchestrator

Build a **PaymentGatewayOrchestrator** in NestJS that handles global and regional routing.

**Requirements:**
1. Detect user location and currency via `Accept-Language` header and Geolocation API (MaxMind).
2. If the user is in the US/EU, prioritize **Stripe Connect** and **PayPal**. If in Africa, prioritize **Flutterwave (150+ currencies)** or **Paystack**.
3. Implement a unified `CreatePaymentIntent` interface that abstracts away gateway-specific logic.
4. Add logic for **Buy Now, Pay Later (BNPL)** via PayPal and Stripe Klarna/Afterpay, specifically for high-value flight/hotel bundles.

**Deliverables:**
- `PaymentGatewayOrchestrator` service with geolocation-based routing
- Unified payment intent interface (PaymentDTO)
- BNPL eligibility calculator
- Fallback strategy for gateway unavailability
- TypeScript types for all gateway responses

---

### Prompt 2: Stripe Connect & PayPal Split-Payment Logic

Develop the **Marketplace Split Service** to handle multi-vendor fund distribution.

**Requirements:**
1. Integrate **Stripe Connect** using 'Separate Charges and Transfers'. For a single checkout containing a flight ($1000) and a local tour ($200), calculate the platform fee (e.g., 10%) and initiate transfers to the respective connected vendor accounts.
2. Implement a fallback for **PayPal Commerce Platform** split logic (Adaptive Payments).
3. Ensure the system handles **Multi-Vendor Refunds**: if a flight is canceled but the car rental is kept, only refund the flight portion minus the non-refundable GDS fees.

**Deliverables:**
- `MarketplaceSplitService` with Stripe Connect integration
- PayPal Adaptive Payments fallback
- Multi-vendor ledger tracking
- Partial refund workflow with fee reconciliation
- Webhook handlers for charge.completed, charge.refunded events
- Unit tests with 95%+ coverage

---

### Prompt 3: Enterprise Flight Booking Workflow (Amadeus)

Implement the **Flight Logistics Service** using Amadeus Enterprise APIs.

**Requirements:**
1. Build a booking state machine: `FLIGHT_OFFER` (valid for 20 mins) -> `ORDER_CREATED` (PNR generated) -> `PAYMENT_CAPTURED` -> `ISSUED` (E-ticket).
2. Support **PNR Management** for up to 9 passengers, including seat selection logic and ancillary services (extra bags, insurance).
3. Add a 'Price Monitoring' background job: if the AI detects a 5% price drop before ticketing, notify the user or auto-reschedule if the 'Best Utility' agent approves.

**Deliverables:**
- `FlightBookingService` with Amadeus API integration
- Booking state machine (NestJS Bull queues)
- PNR management with multi-passenger support
- Seat selection and ancillary service logic
- Background price monitoring job (Bull processor)
- GraphQL subscriptions for real-time booking updates
- Database schema for flights, bookings, PNRs

---

### Prompt 4: Car Rental & Local Mobility (Document Verification)

Build the **Car Rental & Mobility Service** with secure document verification.

**Requirements:**
1. Integrate **Amadeus Car API** for global rentals and **Treepz/Travu APIs** for African localized shuttle/bus inventory.
2. Create a secure workflow for **Document Verification**: allow users to upload Driver's Licenses and Insurance PDFs to a private S3 bucket, then pass the metadata to the vendor API for pre-verification.
3. Implement 'Pick-up/Drop-off' location logic based on city codes and geo-coordinates.

**Deliverables:**
- `CarRentalService` with Amadeus Car API integration
- `LocalMobilityService` for Treepz/Travu APIs
- Secure document upload flow (S3 with encryption)
- Document verification webhook handlers
- Pick-up/Drop-off location resolver with fallback to geo-coordinates
- Database schema for rentals, documents, locations
- Pre-verification AI agent (LangGraph chain)

---

### Prompt 5: Multilingual/Multicurrency Ledger & Audit

Design a **Ledger-Grade Database Schema** for multi-currency transactions with full audit trails.

**Requirements:**
1. Create a `transactions` table using `BIGINT` for amounts and `CHAR(3)` for ISO 4217 currency codes.
2. Implement an `exchange_rates` table that stores historical mid-market rates with high precision (18, 8).
3. Ensure all logs are **GDPR/NDPR-compliant**: mask PII (names, passports, last 4 digits of CC) in the console and Winston/Pino logs.
4. Export the entire trip itinerary and financial breakdown as a localized PDF (using PDFKit) in the user's preferred language.

**Deliverables:**
- Bitemporal database schema (valid_from, valid_to, updated_at)
- Transaction ledger with BIGINT amounts and currency tracking
- Exchange rate history table with precision (18, 8)
- PII masking middleware (Winston transport)
- Trip summary exporter to PDF with multilingual support
- Audit trail views for compliance teams
- Read replicas for reporting without impacting transactions

---

## Key Production Benchmarks for Copilot
* **Atomic Holds:** Never call a booking API without an atomic inventory hold (with TTL) to prevent double bookings during high-traffic events.
* **Merchant of Record:** Ensure Traveease acts as the **Merchant of Record** for all experiences and localized transport to maintain a unified checkout experience.
* **Safety Score:** Every car rental or transport option should have an AI-calculated **"Reliability Score"** based on historical vendor data and user reviews.
* **Payment Retry Logic:** Implement exponential backoff with jitter for failed payment captures; retry up to 3 times within 48 hours.
* **Currency Conversion:** Always store the original transaction currency alongside the converted amount; never rely on post-hoc conversion.
* **Webhook Idempotency:** All webhook handlers must be idempotent; use `idempotency_key` to prevent duplicate charges.
* **SLA Guarantees:** Payment settlement within 15 seconds; booking confirmation within 30 seconds.

---

## What this achieves
By following these prompts, you are building a **Global Financial Hub** that can:

1. **Accept a payment in Euros** via Stripe in Berlin
2. **Automatically route** to the optimal regional gateway (Flutterwave, Paystack, or Stripe)
3. **Convert to NGN** and split funds to vendors in Lagos (flight provider, car rental, hotel)
4. **Issue a flight ticket** via Amadeus GDS in Madrid within 15 seconds
5. **Generate a localized PDF receipt** in Portuguese with full audit trails
6. **Handle refunds** for canceled flights while keeping car rental active
7. All within a **single, multilingual user session** with **GDPR/NDPR compliance**

This transforms Traveease into a **true global enterprise platform** capable of serving travelers in 150+ countries with real-time financial orchestration and logistics management.
