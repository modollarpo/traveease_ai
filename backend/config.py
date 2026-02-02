import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Amadeus
    AMADEUS_API_KEY = os.getenv("AMADEUS_API_KEY", "")
    AMADEUS_API_SECRET = os.getenv("AMADEUS_API_SECRET", "")
    AMADEUS_BASE_URL = os.getenv("AMADEUS_BASE_URL", "https://test.api.amadeus.com")
    
    # Viator
    VIATOR_API_KEY = os.getenv("VIATOR_API_KEY", "")
    VIATOR_BASE_URL = os.getenv("VIATOR_BASE_URL", "https://api.sandbox.viator.com")
    
    # Treepz/Travu
    TREEPZ_API_KEY = os.getenv("TREEPZ_API_KEY", "")
    TRAVU_API_KEY = os.getenv("TRAVU_API_KEY", "")
    
    # Payment Gateways
    STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
    PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID", "")
    PAYPAL_SECRET = os.getenv("PAYPAL_SECRET", "")
    FLW_SECRET_KEY = os.getenv("FLW_SECRET_KEY", "")
    PAYSTACK_SECRET_KEY = os.getenv("PAYSTACK_SECRET_KEY", "")
    
    # Compliance
    NDPR_ENCRYPTION_KEY = os.getenv("NDPR_ENCRYPTION_KEY", "")
    
    # Logging
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
