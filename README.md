# Traveease Global Travel OS

A production-ready, AI-native travel platform that orchestrates flights, hotels, cars, tours, visas, payments, and loyalty across 150+ currencies and 195+ countries.

## 1. Architecture Overview

**Monorepo layout**

- `frontend/` – Next.js 16 App Router UI (Atrium, Curator, Vault, Concierge), Tailwind design system, next-intl.
- `commerce/` – NestJS 10 commerce backend (payments, marketplace, bookings) with Prisma ledger schema.
- `backend/` – Python FastAPI + LangGraph agentic backend (Amadeus, Treepz/Travu, Viator, visas).
- `infrastructure/` – AWS, Azure, Terraform, Kubernetes manifests and CI workflows.

**High-level flow (Atrium → Curator → Vault → Concierge)**

1. **Atrium (Homepage & NL intent)**
   - User types natural-language requests (e.g. "Plan a 5-day luxury safari from Lagos to Maasai Mara in August under $4000").
   - Next.js routes to `/[locale]/search` with the query preserved.

2. **Curator (Search Bento)**
   - Bento layout shows flights, cars/mobility, and hidden gems.
   - Multi-currency presentation (NGN / USD / EUR) using ledger-safe minor units.

3. **Vault (Checkout & Payments)**
   - Calls NestJS `MarketplaceCheckoutService` to create a multi-vendor, multi-gateway payment intent.
   - PaymentGatewayOrchestrator routes via Stripe / PayPal / Flutterwave / Paystack based on IP, currency, and vendor country.
   - NigerianComplianceService applies CBN stamp duty (₦50 for NGN>₦10,000) and VAT on platform fees.

4. **Concierge (Post-booking & Re-optimisation)**
   - Floating concierge widget on `/[locale]/trips` posts to Next.js `/api/concierge`.
   - `/api/concierge` proxies to FastAPI `/agentic/agentic-query`.
   - LangGraph `SupervisorAgent` orchestrates logistics (Amadeus + Treepz/Travu), culture (Viator), financial (FX), and visa checks.
   - UI surfaces itinerary status, multi-currency prices, and visa overview.

## 2. Services & Responsibilities

### 2.1 Frontend (Next.js 16, App Router)

**Key paths**

- `frontend/app/[locale]/page.tsx` – Atrium hero + enterprise sections.
- `frontend/app/[locale]/search/page.tsx` – Curator Bento search canvas.
- `frontend/app/[locale]/checkout/page.tsx` – Vault checkout UI.
- `frontend/app/[locale]/trips/page.tsx` – My Trips + Concierge and Visa cards.
- `frontend/app/api/concierge/route.ts` – Concierge → FastAPI proxy.
- `frontend/app/api/visas/route.ts` – Visa eligibility/apply → FastAPI proxy.
- `frontend/lib/api.ts` – Commerce checkout client.

**Design system & motion**

- Tailwind theme in `frontend/tailwind.config.ts` with Traveease blue, neo-mint, heritage clay, ghost white.
- Glassmorphism & "gummy" buttons for enterprise feel.
- Framer Motion variants in `frontend/lib/motion.ts` (`puffyTap`, `fadeInUp`, `staggerContainer`).

### 2.2 Commerce Backend (NestJS)

**Entry & modules**

- `commerce/src/main.ts` – Bootstraps Nest with global prefix `/api/v1` and CORS.
- `commerce/src/app.module.ts` – Wires `PaymentsModule`, `BookingsModule`, `VendorModule`.
- `commerce/prisma/schema.prisma` – Ledger-grade Prisma schema (transactions, bookings, vendors, marketplace offers).

**Payments & marketplace**

- `commerce/src/payments/services/payment-gateway-orchestrator.service.ts`
  - Chooses gateway (Stripe, PayPal, Flutterwave, Paystack) based on IP, currency, vendor location.
  - Supports BNPL hints via PayPal / Stripe Klarna/Afterpay.
- `commerce/src/payments/services/marketplace-split.service.ts`
  - Handles Stripe Connect transfers, PayPal splits, Flutterwave/Paystack subaccount payouts.
  - Multi-vendor refund handling (partial refunds, GDS fees).
- `commerce/src/payments/services/marketplace-checkout.service.ts`
  - High-level `createMarketplaceCheckout` orchestration:
    - Sums minor-unit amounts.
    - Applies Nigerian stamp duty via `NigerianComplianceService`.
    - Calls `PaymentGatewayOrchestrator.createPaymentIntent`.
    - Registers downstream split instructions with `MarketplaceSplitService`.
- `commerce/src/payment/nigerian-compliance.service.ts`
  - CBN stamp duty, VAT on platform commission, total-with-compliance helpers.

**Vendor marketplace**

- Prisma models `Vendor`, `VendorOffer`, `VendorOfferImportJob` support CSV imports, AI-enriched offers, and per-vendor reliability scores.
- `VendorModule` exposes vendor CRUD and a public marketplace offers search.

### 2.3 Agentic Backend (FastAPI + LangGraph)

**FastAPI app**

- `backend/main.py`
  - Adds NDPR middleware and timeout handler.
  - Includes routers:
    - `/agentic` – agentic/AI orchestration endpoints.
    - `/booking` – flight/hotel/car/mobility/visa booking endpoints.
  - `GET /health` – basic health check.

**Agentic orchestration**

- `backend/agentic/routes.py`
  - `POST /agentic/agentic-query` accepts NL query and forwards to `LangGraphOrchestrator`.
- `backend/agentic/langgraph_orchestrator.py`
  - Placeholder LangGraph graph that currently delegates to `SupervisorAgent`.
- `backend/agentic/supervisor.py`
  - Composes:
    - `LogisticsAgent` (Amadeus flights/cars + Travu/Treepz buses).
    - `CultureAgent` (Viator activities).
    - `FinancialAgent` (NGN/USD/EUR totals).
    - `VisaAgent` (visa eligibility + requirements via `VisaService`).
    - `ItineraryState` (itinerary state machine, pending approval).
  - Returns `itinerary`, `prices`, `visa`, `approval_required` to frontend.

**Downstream integrations**

- `backend/agentic/amadeus_api.py` – Amadeus flights & cars (with retries & PII masking).
- `backend/agentic/travu_api.py` – Treepz/Travu buses search.
- `backend/agentic/viator_api.py` – Viator activities.
- `backend/agentic/visa.py` – `VisaAgent` wrapper over booking `VisaService`.

### 2.4 Booking Services (Python)

- `backend/booking/routes.py` – FastAPI router for flights, cars, mobility, hotels, shortlets, visas, tours.
- `backend/booking/flight_service.py` – Flight offers, orders, ticketing (Amadeus-style).
- `backend/booking/hotel_service.py` – Hotel search/hold/book/cancel.
- `backend/booking/car_service.py`, `mobility_service.py` – Car rentals + bus mobility.
- `backend/booking/visa_service.py` – Visa eligibility, document verification, application, status tracking (with `CircuitBreaker`).
- `backend/booking/tours_service.py`, `shortlet_service.py` – Tours, rentals.
- `backend/booking/circuit_breaker.py` – Simple circuit breaker with backoff.

## 3. Local Development

### 3.1 Prerequisites

- Node.js 18+
- Python 3.11+ (your `.venv` is already configured)
- A running MySQL/Postgres instance for commerce (or a suitable DATABASE_URL via Prisma configuration)

### 3.2 Environment variables

**Frontend (`frontend/.env.local`)**

```bash
NEXT_PUBLIC_COMMERCE_BASE_URL=http://localhost:4000/api/v1
AGENTIC_BACKEND_URL=http://localhost:8000
```

**Commerce (`commerce/.env`)**

Use `commerce/.env.example` as a template, supplying database and gateway keys. Key values include:

- `PORT=4000`
- `DATABASE_URL=...` (MySQL/Postgres DSN consumed via PrismaClient/TypeORM)
- Stripe / PayPal / Flutterwave / Paystack credentials

**Backend (`backend/.env` or environment)**

- Amadeus, Viator, Treepz/Travu API keys
- Any other external provider tokens

### 3.3 Starting all services

From the repo root (`c:\xampp\htdocs\TRAVEEASE_AI`):

1. **Start FastAPI agentic backend**

```bash
# Activate venv (PowerShell)
& .\.venv\Scripts\Activate.ps1

# From repo root
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

Verify: open `http://localhost:8000/health`.

2. **Start commerce (NestJS)**

```bash
cd commerce
npm install          # first time only
npm run start:dev
```

- Base URL: `http://localhost:4000/api/v1`
- Example: `http://localhost:4000/api/v1/payments`.

3. **Start frontend (Next.js)**

```bash
cd frontend
npm install          # first time only
npm run dev
```

- Visit: `http://localhost:3000/en`.

With these three running, Atrium → Curator → Vault → Concierge flows are fully active.

## 4. Key Flows to Test

1. **NL Search (Atrium → Curator)**
   - Go to `/en`.
   - Enter an NL query like "Fly from Lagos to Nairobi next month and add a weekend safari".
   - You should land on `/en/search?q=...` with tailored bento results.

2. **Marketplace Checkout (Vault)**
   - Navigate to `/en/checkout`.
   - Use the sample cart; clicking the checkout button calls `createMarketplaceCheckout` in `frontend/lib/api.ts`.
   - Verify commerce logs a `POST /payments/checkout/marketplace` and returns a gateway + intent ID.

3. **Concierge Re-optimisation**
   - Go to `/en/trips`.
   - Open the floating Concierge bubble.
   - Send a message like "My flight to Nairobi is delayed, re-optimize my afternoon".
   - Next.js `/api/concierge` forwards to FastAPI `/agentic/agentic-query`.
   - The widget shows itinerary state, prices (NGN/USD/EUR), and visa overview.

4. **Visa Checks**
   - On `/en/trips`, use the "Visa & compliance" card → "Check visa for this trip".
   - This calls `/api/visas` → FastAPI `/booking/visas/eligibility` via `VisaService`.

## 5. Production Notes

- **Ledger & currency**
  - All amounts stored as `BIGINT` minor units (e.g., kobo, cents) in Prisma schema.
  - `ExchangeRate` model records historical mid-market rates with high precision (18, 8).
  - Transactions record both transaction and base ledger currencies.

- **Compliance & security**
  - NDPR/GDPR-aware logging (PII masking in Amadeus/Travu API wrappers).
  - CBN stamp duty and VAT applied centrally via `NigerianComplianceService`.
  - Circuit breaker patterns in booking services to protect upstreams.

- **Scalability & ops**
  - AWS CloudFormation + Azure Bicep + Terraform manifests in `infrastructure/`.
  - GitHub Actions workflows for CI/CD in `.github/workflows/`.
  - Kubernetes monitoring via Prometheus/Alertmanager manifests under `k8s/`.

## 6. GitHub: How to Push

From the repo root:

```bash
# 1. Check status
git status

# 2. Add the new root README
git add README.md

# 3. Commit with a clear message
git commit -m "Add comprehensive project README"

# 4. Push to your GitHub remote (replace origin/main as needed)
git push origin main
```

> Note: As an AI running inside your editor, I cannot push to GitHub directly. Run the above commands in your terminal to publish the updated README to your repository.
