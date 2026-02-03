# Prisma Seed Script Guide

## Overview
The Prisma seed script populates the commerce database with realistic test data for development and staging environments.

## Usage

### 1. Run Seed Script (Create Data Only)
```bash
cd commerce

# Install dependencies first
npm install

# Run seed
npm run seed

# Output:
# 🌱 Starting database seed...
# 💱 Seeding exchange rates...
# ✅ Created 8 exchange rates
# 💳 Seeding transactions...
# ✅ Created 3 transactions
# ✈️  Seeding flight offers and bookings...
# ✅ Created flight offer and booking
# ... (rest of output)
# ✨ Database seeding completed successfully!
```

### 2. Reset Database + Seed (Full Reset)
```bash
npm run seed:reset

# This will:
# 1. Run all pending migrations
# 2. Reset the database to initial state
# 3. Execute seed script
# 4. Populate with fresh test data
```

### 3. Seed with Custom Environment
```bash
# Development (cleans before seeding)
NODE_ENV=development npm run seed

# Production (skips cleanup, adds data only)
NODE_ENV=production npm run seed

# Staging (skips cleanup, adds data only)
NODE_ENV=staging npm run seed
```

## Test Data Structure

### Users & Transactions
| User | Currency | Booking | Amount | Status |
|------|----------|---------|--------|--------|
| 550e8400...0000 | USD | Flight + Hotel + Tour | $2,000 | CAPTURED |
| 550e8400...0001 | NGN | Car Rental + Visa | ₦250,000 | PENDING |

### Exchange Rates (Seeded)
- USD ↔ EUR (0.92)
- USD ↔ GBP (0.79)
- USD ↔ NGN (1,548.5)
- USD ↔ ZAR (18.2)
- USD ↔ INR (83.1)
- USD ↔ KES (130.5)

### Sample Bookings
1. **Flight**: JFK → CDG (Air France AF007, March 1, 2026)
   - PNR: ABC123
   - Price: $1,200 USD
   - Status: ISSUED
   - Vendor: Airline

2. **Hotel**: Marriott Champs-Élysées, Paris
   - Dates: March 2-5, 2026 (3 nights)
   - Price: $800 USD
   - Status: CONFIRMED
   - Vendor: Hotel

3. **Car Rental**: Hertz Lagos, Toyota Corolla
   - Dates: Feb 15-18, 2026 (3 days)
   - Price: ₦250,000 NGN
   - Status: RESERVED
   - Vendor: Car Rental

4. **Tour**: Eiffel Tower & Louvre Tour
   - Date: March 3, 2026
   - Duration: 8 hours
   - Price: $150 USD
   - Status: CONFIRMED
   - Vendor: GetYourGuide

5. **Visa Application**: US Tourist Visa (Nigeria)
   - Status: DOCUMENTS_SUBMITTED
   - Price: $150 USD

6. **Insurance**: Allianz Travel Insurance
   - Coverage: €500k medical, trip cancellation, baggage loss
   - Premium: $35 USD
   - Status: ACTIVE

### Audit Logs
- 4 sample audit logs documenting user actions
- PII is masked per GDPR requirements

## Development Workflow

### Initial Setup
```bash
# 1. Clone repo
git clone <repo>
cd traveease_ai/commerce

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env
# Edit .env with your local database credentials

# 4. Generate Prisma client
npx prisma generate

# 5. Apply migrations
npx prisma migrate dev

# 6. Run seed
npm run seed
```

### After Schema Changes
```bash
# If you modified schema.prisma:

# 1. Create migration
npx prisma migrate dev --name describe_change

# 2. Update seed script with new fields (if needed)
# Edit prisma/seed.ts

# 3. Re-seed
npm run seed:reset
```

## Data Cleanup

### Remove Specific Records
```bash
# Prisma Studio UI for manual deletion
npx prisma studio

# Or via Prisma client:
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

await prisma.flightBooking.deleteMany({
  where: { status: 'CANCELLED' }
});
```

### Clear All Data (Development Only)
```bash
npm run seed:reset
```

## Customization

### Modify Seed Data
Edit `commerce/prisma/seed.ts`:

```typescript
// Example: Change user count
const users = [
  { id: "user-1", name: "User One", ... },
  { id: "user-2", name: "User Two", ... },
  // Add more users
];

for (const user of users) {
  await prisma.user.create({ data: user });
}
```

### Add Custom Data
```typescript
// In seed.ts, after existing seed:

const customTransaction = await prisma.transaction.create({
  data: {
    amount: 50000n,
    currency: "USD",
    userId: "custom-user-id",
    // ... other fields
  },
});
```

### Generate Realistic Data
For production-like testing, use libraries:
```bash
npm install @faker-js/faker
```

```typescript
import { faker } from '@faker-js/faker';

const transaction = await prisma.transaction.create({
  data: {
    amount: BigInt(faker.number.int({ min: 10000, max: 500000 })),
    currency: faker.location.countryCode(),
    userId: faker.string.uuid(),
    // ... etc
  },
});
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Seed Database

on: [workflow_dispatch]  # Manual trigger

jobs:
  seed:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: traveease
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install --prefix commerce
      - run: npm run seed --prefix commerce
        env:
          DATABASE_URL: mysql://root:root@localhost:3306/traveease
```

## Troubleshooting

### Error: "connect ECONNREFUSED"
```
❌ Cannot connect to database

Solution:
1. Verify MySQL is running: `docker ps`
2. Check DATABASE_URL in .env
3. Ensure database exists: `mysql -u root -p -e "CREATE DATABASE traveease;"`
```

### Error: "Prisma client not found"
```bash
# Solution:
npx prisma generate
npm run seed
```

### Error: "Foreign key constraint failed"
```
❌ Insert failed due to missing parent record

Solution:
1. Check transaction.create() succeeds before flightBooking.create()
2. Verify vendor IDs are created before assignments
3. Seed data order matters - parents before children
```

### Duplicate Entry Error
```bash
# Solution: Reset database
npm run seed:reset
```

## Performance Notes
- Seed script takes ~2-5 seconds depending on MySQL performance
- Creates ~30 total records across all tables
- Includes indexes for optimal query performance

## Data Retention
Seeded data is **test data only**:
- ✅ Safe to modify
- ✅ Safe to delete
- ❌ Do NOT use in production
- ❌ Do NOT commit real customer data

## Resources
- [Prisma Seeding](https://www.prisma.io/docs/guides/migrate/seed-database)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [SQLAlchemy to Prisma Migration](https://www.prisma.io/docs/guides/migrate/existing-database)

## Support
For seed-related issues, contact: `platform-engineering@traveease.com`
