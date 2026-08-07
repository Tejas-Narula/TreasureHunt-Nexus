import sys
import os

# Ensure backend root directory is on the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import JSONResponse
import time
from fastapi.middleware.cors import CORSMiddleware
from routers import player, admin
from core.websocket import manager
from slowapi.errors import RateLimitExceeded
from core.limiter import limiter

app = FastAPI(
    title="Stranger Things Treasure Hunt API",
    description="Backend for the real-time QR code treasure hunt.",
    version="1.0.0",
)

app.state.limiter = limiter

@app.exception_handler(RateLimitExceeded)
async def custom_rate_limit_handler(request: Request, exc: RateLimitExceeded):
    reset_timestamp = getattr(exc, "reset_time", None)
    if reset_timestamp:
        retry_after = max(0, int(reset_timestamp - time.time()))
    else:
        retry_after = 60
    
    return JSONResponse(
        status_code=429,
        content={
            "error": "Rate limit exceeded",
            "message": f"Too many requests. Please try again in {retry_after} seconds.",
            "retry_after": retry_after
        }
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(player.router)
app.include_router(admin.router)

@app.websocket("/ws/game")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # We don't expect messages from client for now, just keep connection alive
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/")
def root():
    return {"message": "Welcome to the Upside Down!"}
