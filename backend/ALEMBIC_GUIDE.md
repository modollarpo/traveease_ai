# Backend Alembic Migration Guide

## Overview
This guide covers database migrations for the Traveease FastAPI backend using Alembic, SQLAlchemy's schema migration tool.

## Architecture
- **ORM:** SQLAlchemy 2.0+
- **Migrator:** Alembic
- **Database:** MySQL 8.0
- **Connection String:** `mysql+pymysql://user:pass@host:3306/traveease`

## Directory Structure
```
backend/
├── alembic.ini              # Alembic configuration
├── alembic/
│   ├── env.py              # Migration environment
│   ├── script.py.mako      # Migration template
│   └── versions/            # Migration files
│       ├── 001_initial_sqlalchemy_models.py
│       └── (future migrations)
└── requirements.txt         # Includes alembic, sqlalchemy, pymysql
```

## Migration Workflow

### 1. **Generate a New Migration**
```bash
# From backend directory
cd backend

# Auto-generate migration from model changes (recommended)
alembic revision --autogenerate -m "describe_your_change"

# Example:
alembic revision --autogenerate -m "add_user_preferences_table"
```

### 2. **View Migration History**
```bash
alembic history

# Output:
# <base> -> 001_initial_sqlalchemy_models (head)
```

### 3. **Apply Migrations**
```bash
# Upgrade to latest
alembic upgrade head

# Upgrade to specific version
alembic upgrade 001_initial_sqlalchemy_models

# Downgrade by 1
alembic downgrade -1

# Downgrade to base (undo all)
alembic downgrade base
```

### 4. **Check Current Database Version**
```bash
alembic current

# Output: 001_initial_sqlalchemy_models (head)
```

## Migration File Structure

Each migration file in `alembic/versions/` contains:

```python
from alembic import op
import sqlalchemy as sa

revision = '001_initial_sqlalchemy_models'
down_revision = None

def upgrade() -> None:
    """Schema changes to apply."""
    op.create_table('users', ...)
    op.create_index('idx_user_email', 'users', ['email'])

def downgrade() -> None:
    """Reverse schema changes."""
    op.drop_index('idx_user_email', 'users')
    op.drop_table('users')
```

## Production Migration Checklist

- [ ] **Before Migration:**
  1. Backup production database: `mysqldump -u root -p traveease > backup_2026_02_03.sql`
  2. Test migration on staging database
  3. Review migration file for syntax errors: `python -m py_compile alembic/versions/XXX.py`
  4. Check downgrade path: `alembic downgrade -1` (in non-prod)

- [ ] **During Migration:**
  1. Schedule maintenance window (low-traffic period)
  2. Stop application servers gracefully
  3. Run migration: `alembic upgrade head`
  4. Verify migration: `alembic current`
  5. Restart application servers

- [ ] **After Migration:**
  1. Monitor application logs for errors
  2. Verify data integrity: Query critical tables
  3. Document migration in runbook: See PRODUCTION_DEPLOYMENT.md

## Phase 2-5 Migrations (Planned)

| Phase | Tables | Status | Migration ID |
|-------|--------|--------|--------------|
| 1 | Vendors, Users, PaymentMethods | ✅ Complete | 001_initial_sqlalchemy_models |
| 2 | FlightOffers, FlightBookings | 🔄 Pending | 002_flight_booking_schema |
| 3 | HotelOffers, HotelBookings, CarOffers, CarRentals | 🔄 Pending | 003_accommodation_mobility_schema |
| 4 | TourOffers, TourBookings, VisaApplications, InsurancePolicies | 🔄 Pending | 004_tours_compliance_schema |
| 5 | Reporting views, materialized views, analytics tables | 🔄 Pending | 005_analytics_reporting_layer |

## Alembic Configuration (alembic.ini)

Key settings:
```ini
script_location = alembic          # Migration directory
sqlalchemy.url = <connection_url>  # Set via environment variable
```

Environment variables (set in `.env`):
```bash
SQLALCHEMY_URL=mysql+pymysql://root:password@localhost:3306/traveease
```

## Troubleshooting

### Issue: "Target database is not up to date"
```bash
# Solution: Check what's unapplied
alembic current
alembic heads

# Apply missing migrations
alembic upgrade head
```

### Issue: Migration fails due to existing table
```python
# In migration file, use conditional checks:
from alembic import op
from sqlalchemy import inspect

def upgrade():
    inspector = inspect(op.get_bind())
    if 'users' not in inspector.get_table_names():
        op.create_table('users', ...)
```

### Issue: Downgrade fails
```bash
# Check downgrade path
alembic show <revision_id>

# Manually inspect the downgrade function in the migration file
```

## Integration with CI/CD

### GitHub Actions Example
```yaml
name: Database Migration

on: [pull_request, push]

jobs:
  migrate:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
      - run: pip install -r backend/requirements.txt
      - run: cd backend && alembic upgrade head
```

## Data Migration Strategy (Phase 2+)

For non-breaking migrations:
```python
def upgrade() -> None:
    # 1. Add new column with default
    op.add_column('users', sa.Column('new_field', sa.String(255), default=''))
    
    # 2. Populate existing rows
    connection = op.get_bind()
    connection.execute("UPDATE users SET new_field = CONCAT(first_name, last_name)")
    
    # 3. Remove default and add constraint
    op.alter_column('users', 'new_field', existing_nullable=True, nullable=False)
    op.create_index('idx_new_field', 'users', ['new_field'])

def downgrade() -> None:
    op.drop_index('idx_new_field', 'users')
    op.drop_column('users', 'new_field')
```

## Resources
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org/en/20/)
- [MySQL with SQLAlchemy](https://docs.sqlalchemy.org/en/20/dialects/mysql.html)

## Contact
For migration support, contact: `platform-engineering@traveease.com`
