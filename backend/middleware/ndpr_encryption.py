from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

import base64

class NDPRMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Example: Encrypt PII fields in request body
        if request.method in ["POST", "PUT"]:
            body = await request.body()
            # Simulate encryption (base64 for demo)
            encrypted_body = base64.b64encode(body)
            # Replace request body with encrypted (in real use, use proper encryption)
            request._body = encrypted_body
        response = await call_next(request)
        # Optionally decrypt/handle response
        return response
