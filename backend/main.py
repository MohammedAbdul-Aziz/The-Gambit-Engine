"""
The Gambit Engine - Backend API Server
FastAPI server for off-chain services including matchmaking, AI integration, and API proxy
"""

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
from typing import Dict, List, Optional

from api.routes import games, players, matchmaking, inventory
from services.starknet_service import StarknetService
from services.matchmaking_service import MatchmakingService
from services.ai_service import AIService
from models.schemas import HealthCheck, ServerStatus


# Global services
starknet_service: Optional[StarknetService] = None
matchmaking_service: Optional[MatchmakingService] = None
ai_service: Optional[AIService] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager - startup and shutdown"""
    global starknet_service, matchmaking_service, ai_service
    
    # Startup
    print("🚀 Starting Gambit Engine Backend...")
    
    # Initialize services
    starknet_service = StarknetService()
    matchmaking_service = MatchmakingService()
    ai_service = AIService()
    
    print("✅ Services initialized")
    print("📡 Starknet RPC: Connected")
    print("🎮 Matchmaking: Ready")
    print("🤖 AI Service: Ready")
    
    yield
    
    # Shutdown
    print("👋 Shutting down Gambit Engine Backend...")
    if matchmaking_service:
        await matchmaking_service.shutdown()
    print("✅ Shutdown complete")


app = FastAPI(
    title="The Gambit Engine API",
    description="Backend API for The Gambit Engine - DNA-encoded, on-chain chess RPG",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(games.router, prefix="/api/games", tags=["Games"])
app.include_router(players.router, prefix="/api/players", tags=["Players"])
app.include_router(matchmaking.router, prefix="/api/matchmaking", tags=["Matchmaking"])
app.include_router(inventory.router, prefix="/api/inventory", tags=["Inventory"])


@app.get("/", response_model=ServerStatus)
async def root():
    """Root endpoint - server status"""
    return ServerStatus(
        name="The Gambit Engine API",
        version="0.1.0",
        status="online",
        description="DNA-encoded, on-chain chess RPG",
    )


@app.get("/health", response_model=HealthCheck)
async def health_check():
    """Health check endpoint"""
    return HealthCheck(
        status="healthy",
        services={
            "api": "up",
            "starknet": "up" if starknet_service else "down",
            "matchmaking": "up" if matchmaking_service else "down",
            "ai": "up" if ai_service else "down",
        }
    )


@app.websocket("/ws/games/{game_id}")
async def game_websocket(websocket: WebSocket, game_id: int):
    """WebSocket endpoint for real-time game updates"""
    await websocket.accept()
    
    try:
        # Subscribe to game updates
        await websocket.send_json({
            "type": "connected",
            "game_id": game_id,
            "message": "Connected to game updates"
        })
        
        # Keep connection alive and handle messages
        while True:
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
                # Handle incoming messages (moves, chat, etc.)
                await websocket.send_json({
                    "type": "ack",
                    "message": "Message received"
                })
            except asyncio.TimeoutError:
                # Send ping to keep connection alive
                await websocket.send_json({"type": "ping"})
                
    except WebSocketDisconnect:
        print(f"Client disconnected from game {game_id}")
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close()


# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return {"detail": "Resource not found"}


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return {"detail": "Internal server error"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
