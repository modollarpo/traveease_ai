"""Phase 1: Initial SQLAlchemy models migration for FastAPI backend.

This migration captures the current state of SQLAlchemy models from the backend
and migrates them to the database. This ensures the backend ORM is in sync with
the Prisma commerce ledger system.

Revision ID: 001_initial_sqlalchemy_models
Revises: None
Create Date: 2026-02-03 08:50:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "001_initial_sqlalchemy_models"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create initial tables for FastAPI backend.
    
    This migration assumes SQLAlchemy models exist and are being 
    migrated from a non-versioned database state to a managed schema.
    """
    # NOTE: In a real scenario, this would be auto-generated from existing models
    # using: alembic revision --autogenerate -m "Initial migration"
    # 
    # For now, we create placeholder tables that mirror the commerce schema
    # to ensure backend services can query the same data structures.
    
    # Create vendors table (for supplier management)
    op.create_table(
        'vendors',
        sa.Column('id', sa.String(36), nullable=False, primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('country_code', sa.Char(2), nullable=False),
        sa.Column('merchant_category', sa.String(50), nullable=False),
        sa.Column('stripe_account_id', sa.String(255), unique=True),
        sa.Column('paypal_partner_id', sa.String(255)),
        sa.Column('bank_account_hash', sa.String(255)),
        sa.Column('status', sa.String(50), default='PENDING_KYC'),
        sa.Column('kyc_verified_at', sa.DateTime, nullable=True),
        sa.Column('created_at', sa.DateTime, default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, default=sa.func.now(), onupdate=sa.func.now()),
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_unicode_ci'
    )
    op.create_index('idx_vendor_status', 'vendors', ['status'])
    op.create_index('idx_vendor_country', 'vendors', ['country_code'])
    
    # Create users table (for traveler management)
    op.create_table(
        'users',
        sa.Column('id', sa.String(36), nullable=False, primary_key=True),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('phone', sa.String(20), nullable=True),
        sa.Column('first_name', sa.String(255), nullable=False),
        sa.Column('last_name', sa.String(255), nullable=False),
        sa.Column('country_code', sa.Char(2), nullable=False),
        sa.Column('preferred_currency', sa.Char(3), default='USD'),
        sa.Column('language_code', sa.Char(2), default='en'),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('profile_picture_url', sa.String(500), nullable=True),
        sa.Column('status', sa.String(50), default='ACTIVE'),
        sa.Column('verified_at', sa.DateTime, nullable=True),
        sa.Column('created_at', sa.DateTime, default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, default=sa.func.now(), onupdate=sa.func.now()),
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_unicode_ci'
    )
    op.create_index('idx_user_status', 'users', ['status'])
    op.create_index('idx_user_country', 'users', ['country_code'])
    
    # Create payment methods table
    op.create_table(
        'payment_methods',
        sa.Column('id', sa.String(36), nullable=False, primary_key=True),
        sa.Column('user_id', sa.String(36), nullable=False),
        sa.Column('type', sa.String(50), nullable=False),  # card, bank_transfer, wallet
        sa.Column('provider', sa.String(50), nullable=False),  # stripe, paypal, etc.
        sa.Column('token', sa.String(255), nullable=False),  # PCI-compliant token
        sa.Column('last_four', sa.String(4), nullable=True),
        sa.Column('expiry_date', sa.String(5), nullable=True),
        sa.Column('is_default', sa.Boolean, default=False),
        sa.Column('is_active', sa.Boolean, default=True),
        sa.Column('created_at', sa.DateTime, default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, default=sa.func.now(), onupdate=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_unicode_ci'
    )
    op.create_index('idx_payment_user', 'payment_methods', ['user_id'])
    
    # Create travel preferences table
    op.create_table(
        'travel_preferences',
        sa.Column('id', sa.String(36), nullable=False, primary_key=True),
        sa.Column('user_id', sa.String(36), nullable=False, unique=True),
        sa.Column('preferred_airline', sa.String(100), nullable=True),
        sa.Column('preferred_hotel_chain', sa.String(100), nullable=True),
        sa.Column('seat_preference', sa.String(50), nullable=True),  # window, aisle, middle
        sa.Column('meal_preference', sa.String(100), nullable=True),
        sa.Column('accessibility_requirements', sa.Text, nullable=True),
        sa.Column('max_budget_per_night', sa.BigInt, nullable=True),
        sa.Column('created_at', sa.DateTime, default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, default=sa.func.now(), onupdate=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_unicode_ci'
    )


def downgrade() -> None:
    """Drop initial tables."""
    op.drop_index('idx_payment_user', 'payment_methods')
    op.drop_table('travel_preferences')
    op.drop_table('payment_methods')
    op.drop_index('idx_user_country', 'users')
    op.drop_index('idx_user_status', 'users')
    op.drop_table('users')
    op.drop_index('idx_vendor_country', 'vendors')
    op.drop_index('idx_vendor_status', 'vendors')
    op.drop_table('vendors')
