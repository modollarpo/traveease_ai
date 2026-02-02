# Traveease API & Settings Reference

## API Integrations

### Payment Gateways
- Stripe
- PayPal
- Flutterwave
- Paystack

### Travel APIs
- Amadeus
- GetYourGuide
- Viator
- Airbnb
- Booking.com
- Treepz
- Travu

### Geolocation & Currency
- MaxMind
- XE.com
- Wise

### Visa & Insurance
- Sherpa°
- iVisa
- Allianz
- World Nomads
- SafetyWing

### AI & ML
- OpenAI
- Anthropic

---

## Environment Variables (Sample)

```
# Payment Gateways
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=...
PAYPAL_MODE=sandbox
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-...
PAYSTACK_SECRET_KEY=sk_test_...

# Travel APIs
AMADEUS_API_KEY=...
AMADEUS_ENVIRONMENT=test
GETYOURGUIDE_API_KEY=...
VIATOR_API_KEY=...
AIRBNB_API_KEY=...
BOOKING_API_KEY=...
TREEPZ_API_KEY=...
TRAVU_API_KEY=...

# Geolocation & Currency
MAXMIND_LICENSE_KEY=...
XE_API_KEY=...
WISE_API_KEY=...

# Visa & Insurance
SHERPA_API_KEY=...
IVISA_API_KEY=...
ALLIANZ_API_KEY=...
WORLD_NOMADS_API_KEY=...
SAFETYWING_API_KEY=...

# AI
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Database & Infrastructure
DATABASE_URL=postgresql://...
REDIS_HOST=localhost
REDIS_PORT=6379
AWS_S3_BUCKET=traveease-documents-test
SENDGRID_API_KEY=...

# Application
NODE_ENV=development
PORT=3000
JWT_SECRET=...
ENABLE_BNPL=true
ENABLE_AI_CONCIERGE=true
ENABLE_LOYALTY_PROGRAM=true
```

---

## Key Settings
- All API keys are set in `commerce/.env` (excluded from git)
- Database migrations are in `prisma/migrations/` or `migrations/`
- All endpoints are documented in `PLATFORM_READY.md` and `READY_TO_RUN.md`
- .gitignore excludes node_modules, build, .env, and sensitive files

---

## Security Note
- Never commit real API keys or secrets to a public repository.
- Use environment variables and GitHub Actions secrets for production.

---

## For more details, see:
- `PLATFORM_READY.md` (full endpoint reference)
- `SESSION_SUMMARY.md` (session deliverables)
- `FINAL_STATUS_REPORT.md` (architecture overview)
