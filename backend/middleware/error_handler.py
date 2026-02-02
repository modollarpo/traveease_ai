from fastapi.responses import JSONResponse

def api_timeout_handler(request, exc):
    return JSONResponse(
        status_code=504,
        content={
            "error": "Travel API timeout",
            "message": "A vendor API did not respond in time. Please try again later.",
        },
    )
