import sys
import os

# Ensure backend root directory is on the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import player, admin

app = FastAPI(
    title="Stranger Things Treasure Hunt API",
    description="Backend for the real-time QR code treasure hunt.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(player.router)
app.include_router(admin.router)

@app.get("/")
def root():
    return {"message": "Welcome to the Upside Down!"}
