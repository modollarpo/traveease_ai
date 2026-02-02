# ⚡ Traveease Global Payment - Quick Reference

## 🚀 Project Status
- **Phase 1**: ✅ Complete (PaymentGatewayOrchestrator)
- **Phase 2**: ✅ Complete (MarketplaceSplitService)
- **Phase 3**: ⏳ Next (FlightBookingService)
- **Phase 4**: ⏳ Next (CarRentalService)
- **Phase 5**: ⏳ Next (Ledger Schema)

---

## 📁 Key Files

### Core Implementation
```
commerce/src/payments/
├── dto/
│   └── payment.dto.ts (570 lines)
├── services/
│   ├── payment-gateway-orchestrator.service.ts (1,100 lines)
│   └── marketplace-split.service.ts (500 lines)
├── controllers/
│   └── payment.controller.ts (150 lines)
└── payments.module.ts (20 lines)
```

### Documentation
```
commerce/PAYMENT_ORCHESTRATION_GUIDE.md (450 lines)
GLOBAL_PAYMENT_IMPLEMENTATION_SUMMARY.md (400 lines)
GLOBAL_PRODUCTION_ROADMAP.md (450 lines)
```

---

## 🔧 Configuration

### Required Environment Variables
```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# Flutterwave
FLUTTERWAVE_SECRET_KEY=sk_live_...

# Paystack
PAYSTACK_SECRET_KEY=sk_live_...

# MaxMind GeoIP
MAXMIND_ACCOUNT_ID=...
MAXMIND_LICENSE_KEY=...
```

---

## 💻 API Endpoints

### Payment Creation
```
POST /payments/intents
Content-Type: application/json

{
  "amount": 115000,
  "currency": "EUR",
  "locale": "en-US",
  "email": "user@example.com",
  "metadata": {
    "orderId": "order_123",
    "tripId": "trip_456"
  },
  "splits": [
    {
      "vendorId": "airline_1",
      "amount": 80000,
      "feePercentage": 10,
      "type": "flight"
    }
  ]
}
```

### Response
```json
{
  "id": "pi_1HYwJa...",
  "clientSecret": "pi_1HYwJa_secret_...",
  "status": "requires_action",
  "gateway": "stripe",
  "amount": 115000,
  "currency": "EUR",
  "bnplProvider": "stripe_klarna"
}
```

### Refund Request
```
POST /payments/refunds
Content-Type: application/json

{
  "paymentIntentId": "pi_1HYwJa...",
  "amount": 80000,
  "reason": "booking_cancelled",
  "splits": [
    {
      "vendorId": "airline_1",
      "refundAmount": 80000,
      "deductFees": true,
      "feeDeduction": 5000
    }
  ]
}
```

---

## 🌍 Gateway Routing

### By Region
| Region | Primary | Fallback |
|--------|---------|----------|
| EU | Stripe | PayPal |
| US | Stripe | PayPal |
| Africa | Flutterwave | Paystack |
| APAC | Stripe | PayPal |
| LATAM | PayPal | Stripe |

### By Currency
| Currency | Gateway 1 | Gateway 2 |
|----------|-----------|-----------|
| USD | Stripe | PayPal |
| EUR | Stripe | PayPal |
| NGN | Paystack | Flutterwave |
| GBP | Stripe | PayPal |
| KES | Flutterwave | Stripe |

---

## 💰 Example: €1,150 European Trip

### Input
```
User Location: Germany
Amount: €1,150
Composition:
├─ Flight: €800 (Lufthansa)
├─ Hotel: €200 (Marriott)
└─ Car: €150 (Hertz)
```

### Processing
```
1. Geolocation: Germany (EU region)
2. Gateway: Stripe selected
3. Fallback: PayPal configured
4. BNPL: Klarna eligible

5. Vendor Splits (10% platform fee):
   ├─ Lufthansa: €800 - €80 = €720
   ├─ Marriott: €200 - €20 = €180
   ├─ Hertz: €150 - €15 = €135
   └─ Platform: €230 (€80 + €20 + €15 + €115 margin)

6. Stripe Connect Transfers:
   Transfer 1: €720 → Lufthansa (acct_...)
   Transfer 2: €180 → Marriott (acct_...)
   Transfer 3: €135 → Hertz (acct_...)
```

### Output
```json
{
  "id": "ch_1HYwJa...",
  "amount": 115000,
  "splits": [
    {"vendorId": "airline_lh", "amount": 72000, "fee": 8000},
    {"vendorId": "hotel_marriott", "amount": 18000, "fee": 2000},
    {"vendorId": "car_hertz", "amount": 13500, "fee": 1500}
  ],
  "transfers": {
    "airline_lh": "tr_1HYwJa...",
    "hotel_marriott": "tr_1HYwJb...",
    "car_hertz": "tr_1HYwJc..."
  }
}
```

---

## 🔐 Security Checklist

- ✅ No card data stored locally
- ✅ All gateway calls over TLS 1.2+
- ✅ Webhook signatures verified
- ✅ PII masking in logs
- ✅ Idempotency keys enforced
- ✅ Rate limiting enabled
- ✅ Circuit breaker for gateway failures
- ✅ IP whitelisting for webhooks

---

## 📊 Performance Targets

| Operation | Target | Current |
|-----------|--------|---------|
| Create intent | < 500ms | ✅ |
| Select gateway | < 100ms | ✅ |
| Calculate splits | < 50ms | ✅ |
| Total E2E | < 1s | ✅ |
| Settlement | < 15s | ✅ |

---

## 🎯 Testing

### Unit Tests
```bash
npm run test -- payments.service.spec.ts
npm run test -- marketplace-split.service.spec.ts
```

### Integration Tests
```bash
npm run test:e2e -- payment-flow.e2e-spec.ts
```

### Gateway Webhooks (ngrok)
```bash
ngrok http 3000
# Update gateway webhook URL to ngrok URL
curl -X POST http://localhost:3000/payments/webhooks/stripe \
  -H "stripe-signature: v1=..." \
  -d @webhook-payload.json
```

---

## 🚨 Troubleshooting

### Payment Intent Creation Fails
```
Check:
1. Environment variables set correctly
2. API keys valid (not expired/revoked)
3. Gateway account active
4. Amount in valid range
5. Currency supported by gateway
6. IP geolocation working
```

### Webhook Not Received
```
Check:
1. Webhook URL configured in gateway dashboard
2. URL accessible from internet (not localhost)
3. Signature verification passing
4. Response code 200 sent to gateway
5. Check logs: logger.log('Webhook received: ...')
```

### Transfer to Vendor Failed
```
Check:
1. Vendor Stripe account connected
2. Account in good standing (not suspended)
3. Amount > $0.25 USD (Stripe minimum)
4. Currency matches vendor account
5. Check Stripe dashboard for transfer details
```

---

## 📞 Support

- **Docs**: `commerce/PAYMENT_ORCHESTRATION_GUIDE.md`
- **Code**: `/commerce/src/payments/`
- **API Docs**: `GET /api/payments/docs`
- **Issues**: GitHub Issues with label `payments`
- **Team**: DevOps + Backend

---

## 🎓 Key Concepts

### PaymentIntent
Universal payment request object, independent of gateway

### VendorSplit
Configuration for marketplace transaction distribution

### MarketplaceCharge
Record of all splits and transfers for a single payment

### Geolocation
MaxMind GeoIP lookup for optimal gateway selection

### BNPL
Buy Now Pay Later eligibility (Klarna, Afterpay via Stripe)

### Idempotency
Safe to retry with Idempotency-Key header

---

## 🔄 Integration Flow

```
Frontend                Backend                    Gateway
   │                       │                          │
   ├─Create Intent────────►│                          │
   │                       ├─Detect Geolocation────► │
   │                       │                         │
   │                       ├─Select Gateway          │
   │                       │                         │
   │                       ├─Create Intent─────────►│
   │                       │                         │
   │                       │◄─Response───────────────┤
   │◄─Return ClientSecret─┤                          │
   │                       │                          │
   ├─Confirm Payment      │                          │
   │ (via Stripe.js)───┐   │                          │
   │                   └──►│◄─Webhook─────────────────┤
   │                       │  (charge.captured)       │
   │                       │                          │
   │◄─Return Success───────┤                          │
   │                       │                          │
   │                       ├─Create Transfers─────────► (ConnectAct)
   │                       │                         │
   │                       │◄─Transfer Complete───────┤
   │                       │                          │
   │◄─Webhook Status───────┤◄─Webhook─────────────────┤
   │ (transfer.updated)    │  (transfer.updated)      │
```

---

## 🌟 Quick Wins

### Enable Global Payments
```
// One line to enable Stripe + PayPal + Flutterwave
const intent = await orchestrator.createPaymentIntent(dto);
```

### Handle Multi-Vendor
```
// Automatic split calculation and distribution
const splits = marketplace.calculateSplits(total, vendors);
```

### BNPL Support
```
// Built-in BNPL eligibility checking
const bnpl = await orchestrator.checkBNPLEligibility(intent);
```

### Fallback Handling
```
// Automatic retry with alternative gateway
const result = await orchestrator.createPaymentIntentWithFallback(dto);
```

---

**Last Updated**: February 1, 2026  
**Status**: ✅ Production Ready (Phase 1-2)  
**Next Phase**: FlightBookingService

🚀 **Ready to scale globally!**

