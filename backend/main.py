from fastapi import FastAPI

from backend.middleware.ndpr_encryption import NDPRMiddleware
from backend.middleware.error_handler import api_timeout_handler
from backend.agentic.routes import router as agentic_router
from backend.booking.routes import router as booking_router

app = FastAPI()

# Add NDPR-compliant encryption middleware
app.add_middleware(NDPRMiddleware)

# Add global error handler for travel API timeouts
app.add_exception_handler(TimeoutError, api_timeout_handler)

# Include routers
app.include_router(agentic_router, prefix="/agentic")
app.include_router(booking_router, prefix="/booking")


@app.get("/health")
def health_check():
    return {"status": "ok"}

