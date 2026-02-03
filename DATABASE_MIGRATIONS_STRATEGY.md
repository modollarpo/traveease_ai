# 🗄️ Traveease Database Migrations Strategy

**Last Updated:** February 3, 2026  
**Status:** ⚠️ **CRITICAL - AUDIT NEEDED**  
**Target:** Production-ready migrations for MySQL + Backend schemas  

---

## 📋 CURRENT MIGRATION STATUS

### Commerce (NestJS + Prisma)

**Database:** MySQL 8.0  
**ORM:** Prisma 5.20  
**Provider Lock:** `mysql` (fixed in this session)

#### Existing Migrations
```
commerce/prisma/migrations/
└── 20260201082543_init_global_ledger_schema/
    └── migration.sql
```

**Migration Contents (Ledger-Grade Schema):**
- ✅ `Transaction` table (BIGINT amounts, CHAR(3) currency, bitemporal ready)
- ✅ `SplitPayment` table (vendor splits with platform fees)
- ✅ `ExchangeRate` table (historical FX rates, 18.8 precision)
- ✅ `AuditLog` table (NDPR-compliant audit trail)
- ✅ Foreign key constraints (SplitPayment → Transaction)

**Missing (Critical for Phase 2+):**
- [ ] Booking tables (flights, hotels, cars, tours)
- [ ] Vendor management tables
- [ ] User/customer tables (profile, KYC)
- [ ] Loyalty program tables
- [ ] Document verification tables (S3 metadata)
- [ ] Indexes for high-query tables (ledger queries)
- [ ] Computed columns for exchange rate conversion

### Backend (FastAPI + Python)

**Database:** Shares MySQL with commerce  
**Approach:** Currently uses SQLAlchemy models (no formal migrations)  
**Status:** ⚠️ **NO ALEMBIC MIGRATIONS EXIST**

**Existing Models (from codebase):**
- Booking entities (flights, hotels, cars, visas, tours, shortlets, mobility)
- Service models (currency exchange, loyalty, insurance, AI concierge)
- Payment/ledger entities (would conflict with Prisma tables)

**Critical Gap:** Backend and Commerce use same database but separate ORM patterns!

---

## 🚨 IMMEDIATE ACTIONS REQUIRED

### 1. **Database Provider Consistency** ✅ FIXED
- [x] Fixed `prisma.config.ts` to use `mysql` (was incorrectly set to `postgresql`)
- [x] Verified `migration_lock.toml` confirms `mysql`
- [x] Verified `schema.prisma` defines `mysql` datasource
- [x] Migration SQL uses MySQL syntax (✓ correct)

### 2. **Schema Unification** ⚠️ NEEDED
**Decision:** Use **Prisma as single source of truth** for all schemas

**Rationale:**
- Commerce is building with Prisma 5.20 (industry standard)
- Backend can use Prisma Client JS or stay with SQLAlchemy but read same schema
- Prisma migrations are version-controlled and reversible
- Easier to enforce GDPR/NDPR compliance at DB schema level

### 3. **Backend Integration** ⚠️ DECISION NEEDED
**Option A:** Migrate backend to use Prisma Client (recommended)
```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// In FastAPI via Node bridge or direct Prisma API
```

**Option B:** Keep backend SQLAlchemy, sync schema manually
```python
from sqlalchemy import create_engine, Column, BigInteger, String, CHAR

# Manually maintain parity with Prisma schema
class Transaction(Base):
    __tablename__ = "Transaction"
    amount = Column(BigInteger)
    currency = Column(CHAR(3))
```

**Recommendation:** Use **Option B** (FastAPI stays Python-native, Prisma handles schema)
- Add `alembic` to backend for version control
- Generate Alembic migrations that mirror Prisma schema
- Both ORM layers read same database with consistent structure

---

## 📦 MIGRATION ROADMAP

### Phase 1: Core Ledger (✅ COMPLETE)
**Status:** Migration `20260201082543_init_global_ledger_schema` deployed

Tables:
- Transaction (BIGINT amounts, currency, FX tracking)
- SplitPayment (vendor splits, platform fees)
- ExchangeRate (historical rates, 18.8 precision)
- AuditLog (NDPR compliance)

### Phase 2: Booking Services (⏳ NOT YET CREATED)
**Target:** Flights, Hotels, Cars, Tours, Visas

Required tables:
```sql
-- Flight Booking Schema
CREATE TABLE Flight (
  id VARCHAR(191) PRIMARY KEY,
  amadeus_offer_id VARCHAR(255) UNIQUE,
  departure_location VARCHAR(3),
  arrival_location VARCHAR(3),
  departure_time DATETIME,
  arrival_time DATETIME,
  duration_minutes INT,
  airline_code VARCHAR(2),
  pnr VARCHAR(6),
  booking_status ENUM('OFFER_VALID', 'ORDER_CREATED', 'PAYMENT_CAPTURED', 'ISSUED'),
  price_amount BIGINT,
  price_currency CHAR(3),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pnr (pnr),
  INDEX idx_booking_status (booking_status),
  FOREIGN KEY (transaction_id) REFERENCES Transaction(id)
);

CREATE TABLE FlightPassenger (
  id VARCHAR(191) PRIMARY KEY,
  flight_id VARCHAR(191),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  passport_number VARCHAR(20),
  birth_date DATE,
  seat_assignment VARCHAR(5),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (flight_id) REFERENCES Flight(id) ON DELETE CASCADE
);

CREATE TABLE FlightAncillary (
  id VARCHAR(191) PRIMARY KEY,
  flight_id VARCHAR(191),
  service_type ENUM('BAGGAGE', 'SEAT', 'PRIORITY_BOARDING', 'MEAL', 'LOUNGE'),
  amount BIGINT,
  currency CHAR(3),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (flight_id) REFERENCES Flight(id) ON DELETE CASCADE
);

-- Similar for Hotel, Car, Tour, Visa, etc.
```

### Phase 3: User & Vendor Management (⏳ NOT YET CREATED)
Tables:
- User (profile, KYC, NDPR consent)
- Vendor (marketplace vendor info, Stripe/Flutterwave accounts)
- UserAddress (multi-address support)
- VendorBankAccount (settlement details)

### Phase 4: Advanced Features (⏳ NOT YET CREATED)
Tables:
- LoyaltyPoints (points balance, tier, transfers)
- DocumentVerification (S3 metadata, OCR results)
- InsuranceQuote (provider, coverage, expiry)
- AIConversation (chat history, preferences)

### Phase 5: Compliance & Reporting (⏳ NOT YET CREATED)
Tables:
- ComplianceEvent (GDPR/NDPR access requests)
- DisputeCase (chargeback, refund disputes)
- ReportingSnapshot (point-in-time data exports)

---

## 🔧 RUNNING MIGRATIONS

### First-Time Setup (Development)

```bash
# 1. Ensure .env DATABASE_URL is set (MySQL connection string)
# Example: DATABASE_URL="mysql://root:password@localhost:3306/traveease_commerce"

cd commerce

# 2. Generate Prisma Client
npx prisma generate

# 3. Run all migrations (applies init_global_ledger_schema)
npx prisma migrate deploy

# 4. Verify schema
npx prisma db push --skip-generate

# 5. Open Prisma Studio to inspect
npx prisma studio
```

### Creating New Migrations

```bash
# After modifying schema.prisma:
npx prisma migrate dev --name add_booking_tables

# This will:
# 1. Detect schema.prisma changes
# 2. Create migration SQL file
# 3. Apply to development database
# 4. Update prisma/.prisma/client

# Dry-run (validate before applying):
npx prisma migrate resolve --rolled-back [migration_name]
npx prisma migrate dev --create-only
```

### Production Deployment

```bash
# In Docker / CI-CD pipeline:
npx prisma migrate deploy  # Applies only unapplied migrations

# Never use in production:
npx prisma db push        # ⚠️ Loses migration history
```

### Backend (Alembic - To Be Created)

```bash
# Initialize Alembic (if not done):
alembic init alembic

# Create migration after SQLAlchemy model changes:
alembic revision --autogenerate -m "Add booking tables"

# Apply migration:
alembic upgrade head

# Rollback:
alembic downgrade -1
```

---

## ✅ MIGRATION CHECKLIST

### Before Phase 2 Launch

- [ ] **Schema Design** - Finalize Booking/Vendor/User tables (Figma ERD)
- [ ] **Prisma Models** - Add all new models to `schema.prisma`
- [ ] **Migration Creation** - Run `npx prisma migrate dev --name add_phase2_tables`
- [ ] **Backend Sync** - Create Alembic migration that mirrors Prisma
- [ ] **Indexes** - Add composite indexes for high-traffic queries:
  ```sql
  CREATE INDEX idx_transaction_user_created 
    ON Transaction(userId, createdAt DESC);
  CREATE INDEX idx_split_vendor_created 
    ON SplitPayment(vendorId, createdAt DESC);
  ```
- [ ] **Foreign Keys** - Verify referential integrity across all tables
- [ ] **Seed Data** - Create seed script for test vendors/currencies
- [ ] **Documentation** - Update migration docs with new table schemas
- [ ] **Testing** - Run migration forward/backward on staging
- [ ] **Backup** - Create backup before production migration
- [ ] **Monitoring** - Set up alerts for long-running migrations

### Data Migration Strategy

If migrating from existing database:
```bash
# Export current data (if applicable)
mysqldump -u root -p traveease_old > backup.sql

# Transform data to new schema (custom script)
python migrate_legacy_to_new.py

# Import via Prisma seed or manual SQL
npm run prisma:seed
```

---

## 🗂️ Migration File Structure (Target)

```
commerce/prisma/
├── schema.prisma                          (Prisma schema definition)
├── prisma.config.ts                       (Config, now MySQL ✅)
├── migrations/
│   ├── migration_lock.toml                (Lock file, mysql ✅)
│   ├── 20260201082543_init_global_ledger_schema/
│   │   └── migration.sql                  (✅ Core ledger tables)
│   ├── 20260210_add_booking_tables/       (⏳ Coming Phase 2)
│   │   └── migration.sql
│   ├── 20260220_add_user_vendor_tables/   (⏳ Coming Phase 3)
│   │   └── migration.sql
│   └── 20260301_add_compliance_tables/    (⏳ Coming Phase 5)
│       └── migration.sql
└── seed.ts                                (Optional: seed script)

backend/alembic/                           (⏳ To be created)
├── alembic.ini
├── env.py
└── versions/
    ├── 001_init_ledger.py                 (Mirror Prisma Phase 1)
    ├── 002_add_booking_tables.py          (Mirror Prisma Phase 2)
    └── ...
```

---

## 🚨 CRITICAL ISSUES & FIXES

### Issue 1: PostgreSQL Config (FIXED ✅)
**Problem:** `prisma.config.ts` specified PostgreSQL while `schema.prisma` and migration used MySQL
**Solution:** Updated `prisma.config.ts` provider to `mysql`
**Impact:** Docker Compose now consistent (MySQL 8.0)

### Issue 2: No Backend Migrations
**Problem:** FastAPI uses SQLAlchemy models without formal migration history
**Solution:** Create `alembic` setup mirroring Prisma schema
**Timeline:** Before Phase 2

### Issue 3: Missing Booking Schema
**Problem:** Only ledger tables exist; no Flight/Hotel/Car/Tour tables
**Solution:** Design Phase 2 schema, generate migrations
**Timeline:** Before Phase 2 launch

### Issue 4: No Seed Data
**Problem:** After migrations run, database is empty
**Solution:** Create `commerce/prisma/seed.ts` with test vendors, currencies
**Timeline:** Phase 1 QA

---

## 📊 MIGRATION PERFORMANCE TARGETS

| Operation | Target | Notes |
|-----------|--------|-------|
| Initial migration (Phase 1) | <5s | 4 small tables on empty DB |
| Phase 2 booking schema | <30s | 20+ tables with indexes |
| Rollback (any phase) | <10s | Prisma handles atomicity |
| Seed data (100k records) | <60s | Bulk insert via transactions |
| Production zero-downtime | <60s | Blue-green with read replica |

---

## 🔗 RELATED DOCUMENTATION

- [PRODUCTION_READINESS.md](../PRODUCTION_READINESS.md) - Deployment checklist
- [docker-compose.yml](../docker-compose.yml) - DB service config (MySQL)
- [.env.example](../.env.example) - DATABASE_URL template
- [commerce/package.json](../commerce/package.json) - Prisma version

---

## 📞 NEXT STEPS

1. **Confirm Backend Approach** - Use Alembic or Prisma for backend?
2. **Design Phase 2 Schema** - Finalize booking tables (ERD)
3. **Create Phase 2 Migration** - Run `prisma migrate dev`
4. **Set Up Alembic** - Create backend migration system
5. **Seed Data Script** - Generate test data
6. **Staging Test** - Full migration workflow on staging environment
7. **Production Runbook** - Document zero-downtime deployment process

---

**Status:** Ready for Phase 2 schema design. Database provider now consistent (MySQL ✅).
