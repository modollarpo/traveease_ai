"""
Prometheus Metrics Instrumentation
Provides metrics for FastAPI backend with circuit breaker, payment, and booking monitoring.
"""

from prometheus_client import Counter, Histogram, Gauge, generate_latest
from typing import Callable, Any
from functools import wraps
import time
import logging

logger = logging.getLogger(__name__)

# Circuit Breaker Metrics
circuit_breaker_state = Gauge(
    'circuit_breaker_state',
    'Circuit breaker state: 0=closed, 1=open, 2=half-open',
    labelnames=['api', 'service']
)

circuit_breaker_trips_total = Counter(
    'circuit_breaker_trips_total',
    'Total number of circuit breaker trips',
    labelnames=['api', 'service']
)

circuit_breaker_failures_total = Counter(
    'circuit_breaker_failures_total',
    'Total number of failures recorded by circuit breaker',
    labelnames=['api', 'service']
)

# HTTP Request Metrics
http_requests_total = Counter(
    'http_requests_total',
    'Total HTTP requests',
    labelnames=['method', 'endpoint', 'status']
)

http_request_duration_seconds = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration in seconds',
    labelnames=['method', 'endpoint'],
    buckets=(0.1, 0.5, 1.0, 2.0, 5.0, 10.0)
)

# API Availability Metrics
up = Gauge(
    'up',
    'Service availability: 1=up, 0=down',
    labelnames=['job', 'instance']
)

# Payment Metrics
payment_processing_total = Counter(
    'payment_processing_total',
    'Total payments processed',
    labelnames=['gateway', 'status', 'currency']
)

payment_processing_duration_seconds = Histogram(
    'payment_processing_duration_seconds',
    'Payment processing duration in seconds',
    labelnames=['gateway'],
    buckets=(0.5, 1.0, 2.0, 5.0, 10.0, 30.0)
)

payment_amount_total = Counter(
    'payment_amount_total',
    'Total payment amount processed',
    labelnames=['gateway', 'currency']
)

payment_split_distribution = Gauge(
    'payment_split_distribution',
    'Distribution of payment splits to vendors',
    labelnames=['currency', 'vendor_id']
)

# Booking Metrics
bookings_created_total = Counter(
    'bookings_created_total',
    'Total bookings created',
    labelnames=['booking_type', 'status']
)

bookings_pending = Gauge(
    'bookings_pending',
    'Number of pending bookings',
    labelnames=['booking_type']
)

bookings_cancelled_total = Counter(
    'bookings_cancelled_total',
    'Total bookings cancelled',
    labelnames=['booking_type', 'reason']
)

booking_duration_seconds = Histogram(
    'booking_duration_seconds',
    'Time from booking creation to confirmation',
    labelnames=['booking_type'],
    buckets=(1, 5, 10, 30, 60, 300)
)

# NDPR Compliance Metrics
compliance_violations_total = Counter(
    'compliance_violations_total',
    'Total NDPR compliance violations detected',
    labelnames=['violation_type']
)

data_access_events_total = Counter(
    'data_access_events_total',
    'Total PII data access events',
    labelnames=['resource_type', 'action']
)

pii_masked_records = Counter(
    'pii_masked_records',
    'Total records with PII masking applied',
    labelnames=['data_type']
)

# Database Metrics
database_connections_active = Gauge(
    'database_connections_active',
    'Number of active database connections'
)

database_queries_total = Counter(
    'database_queries_total',
    'Total database queries',
    labelnames=['operation', 'table']
)

database_query_duration_seconds = Histogram(
    'database_query_duration_seconds',
    'Database query duration',
    labelnames=['operation'],
    buckets=(0.01, 0.05, 0.1, 0.5, 1.0)
)

# Cache Metrics
cache_hits_total = Counter(
    'cache_hits_total',
    'Total cache hits',
    labelnames=['cache_key']
)

cache_misses_total = Counter(
    'cache_misses_total',
    'Total cache misses',
    labelnames=['cache_key']
)

# Error Metrics
errors_total = Counter(
    'errors_total',
    'Total errors',
    labelnames=['error_type', 'service']
)

# Business Metrics
total_revenue = Counter(
    'total_revenue',
    'Total platform revenue',
    labelnames=['currency']
)

total_commissions = Counter(
    'total_commissions',
    'Total platform commissions',
    labelnames=['currency']
)

active_users = Gauge(
    'active_users',
    'Number of active users'
)


def track_metrics(endpoint: str):
    """Decorator to track HTTP metrics for endpoints"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            start_time = time.time()
            status_code = 200
            try:
                result = await func(*args, **kwargs)
                return result
            except Exception as e:
                status_code = 500
                raise
            finally:
                duration = time.time() - start_time
                http_request_duration_seconds.labels(
                    method='POST',
                    endpoint=endpoint
                ).observe(duration)
                http_requests_total.labels(
                    method='POST',
                    endpoint=endpoint,
                    status=status_code
                ).inc()
        return wrapper
    return decorator


def track_payment_metrics(gateway: str):
    """Decorator to track payment processing metrics"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                status = "success"
                return result
            except Exception as e:
                status = "failed"
                raise
            finally:
                duration = time.time() - start_time
                payment_processing_duration_seconds.labels(
                    gateway=gateway
                ).observe(duration)
                payment_processing_total.labels(
                    gateway=gateway,
                    status=status,
                    currency='USD'
                ).inc()
        return wrapper
    return decorator


def track_booking_metrics(booking_type: str):
    """Decorator to track booking operation metrics"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                status = "created"
                bookings_created_total.labels(
                    booking_type=booking_type,
                    status=status
                ).inc()
                return result
            except Exception as e:
                status = "failed"
                errors_total.labels(
                    error_type=type(e).__name__,
                    service="booking"
                ).inc()
                raise
            finally:
                duration = time.time() - start_time
                booking_duration_seconds.labels(
                    booking_type=booking_type
                ).observe(duration)
        return wrapper
    return decorator


# Health check endpoint
def get_metrics() -> bytes:
    """Get Prometheus metrics in text format"""
    return generate_latest()
