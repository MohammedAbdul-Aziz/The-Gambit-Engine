# The Gambit Engine - Backend

FastAPI backend server for The Gambit Engine, providing off-chain services including matchmaking, AI integration, and API proxy to Starknet contracts.

## Features

- **Matchmaking Service**: Queue-based player matching with ELO-based pairing
- **AI Service**: Chess AI with 10 difficulty levels and Giza integration for verifiable AI
- **Starknet Service**: Blockchain interaction layer for smart contract calls
- **REST API**: Complete API for games, players, inventory, and matchmaking
- **WebSocket Support**: Real-time game state updates

## Quick Start

### Prerequisites

- Python 3.10+
- pip

### Installation

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Running the Server

```bash
# Development mode with auto-reload
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Environment Variables

Create a `.env` file:

```env
# Starknet Configuration
STARKNET_RPC_URL=https://starknet-sepolia.public.blastapi.io
CONTRACT_ADDRESS=0x...
ACCOUNT_ADDRESS=0x...
PRIVATE_KEY=0x...

# Server Configuration
HOST=0.0.0.0
PORT=8000
LOG_LEVEL=info

# Giza AI (optional)
GIZA_API_KEY=your-api-key
```

## API Endpoints

### Games

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/games/` | Create a new game |
| POST | `/api/games/{game_id}/join` | Join an existing game |
| GET | `/api/games/{game_id}` | Get game state |
| POST | `/api/games/{game_id}/move` | Execute a move |
| GET | `/api/games/{game_id}/pieces` | Get all pieces |
| GET | `/api/games/{game_id}/valid-moves/{piece_id}` | Get valid moves |
| POST | `/api/games/{game_id}/evolution` | Request evolution |
| POST | `/api/games/{game_id}/evolution/skip` | Skip evolution |
| POST | `/api/games/{game_id}/resign` | Resign from game |
| POST | `/api/games/{game_id}/draw` | Offer/accept draw |

### Players

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/players/{address}` | Get player stats |
| GET | `/api/players/{address}/elo` | Get player ELO |
| POST | `/api/players/{address}/register` | Register player |
| POST | `/api/players/{address}/update-elo` | Update ELO |
| POST | `/api/players/{address}/game-result` | Record game result |
| GET | `/api/players/leaderboard` | Get leaderboard |

### Matchmaking

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/matchmaking/queue` | Join queue |
| POST | `/api/matchmaking/queue/cancel` | Leave queue |
| GET | `/api/matchmaking/queue/status` | Get queue status |
| GET | `/api/matchmaking/match/check` | Check for match |
| POST | `/api/matchmaking/match/accept` | Accept match |

### Inventory

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory/{owner}` | Get inventory |
| POST | `/api/inventory/{owner}/save-piece` | Save piece |
| POST | `/api/inventory/{owner}/deploy-piece` | Deploy piece |
| POST | `/api/inventory/{owner}/lock-piece` | Lock piece |
| POST | `/api/inventory/{owner}/unlock-piece` | Unlock piece |
| DELETE | `/api/inventory/{owner}/piece/{piece_id}` | Delete piece |
| POST | `/api/inventory/{owner}/rename-piece` | Rename piece |

## WebSocket

Connect to real-time game updates:

```
ws://localhost:8000/ws/games/{game_id}
```

## Architecture

```
backend/
├── main.py                 # FastAPI application entry point
├── api/
│   ├── routes/
│   │   ├── games.py        # Game-related endpoints
│   │   ├── players.py      # Player stats and ELO
│   │   ├── matchmaking.py  # Matchmaking queue
│   │   └── inventory.py    # Piece inventory
├── services/
│   ├── starknet_service.py # Blockchain interaction
│   ├── matchmaking_service.py # Matchmaking logic
│   └── ai_service.py       # AI opponent and Giza
└── models/
    └── schemas.py          # Pydantic models
```

## Services

### Starknet Service

Handles all blockchain interactions:
- Contract calls (create game, make move, etc.)
- Event listening
- Transaction signing

### Matchmaking Service

Manages player queue:
- ELO-based matching
- Bot matching fallback
- Queue position tracking

### AI Service

Provides AI opponents:
- 10 difficulty levels (400-2200 ELO)
- Minimax with alpha-beta pruning
- Opening book support
- Giza integration for verifiable AI

## Development

### Running Tests

```bash
pytest tests/
```

### Code Style

```bash
# Format code
black .

# Lint code
flake8 .
```

## Integration with Frontend

The backend is designed to work with the Next.js frontend:

```typescript
// Example: Join matchmaking queue
const response = await fetch('/api/matchmaking/queue', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    player: address,
    preferred_opponent: 'ANY',
    min_elo: 0,
    max_elo: 3000,
  }),
});
```

## Production Deployment

### Docker

```bash
docker build -t gambit-engine-backend .
docker run -p 8000:8000 --env-file .env gambit-engine-backend
```

### Environment Variables for Production

```env
# Use production Starknet mainnet
STARKNET_RPC_URL=https://starknet-mainnet.public.blastapi.io
CONTRACT_ADDRESS=0x...

# Secure private key management
# Use AWS Secrets Manager or similar
```

## License

MIT
