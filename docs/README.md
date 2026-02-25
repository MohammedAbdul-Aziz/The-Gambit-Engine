# Welcome to The Gambit Engine

> **Recursive Grandmaster: The Evolution of Strategy**

> *"Stop playing the past. Code the future of the board."*

---

## What is The Gambit Engine?

**The Gambit Engine** transforms the world's oldest strategy game into a **DNA-encoded, on-chain RPG** where every move is a mutation. Built on the Dojo Engine and Starknet, it introduces revolutionary mechanics that blend chess strategy with genetic evolution and zero-knowledge privacy.

## 🎯 Key Features

### ⚡ Gas-Based Evolution System

**NEW**: Strategic evolution with limited gas resources:

- **10 Gas Per Game**: Each player starts with 10 gas to spend on evolution
- **Trait Costs**: Pawn (1), Knight (3), Bishop (3), Rook (5), Queen (10)
- **Strategic Choices**: Decide when to evolve and when to save gas
- **Persistent Pieces**: Evolved pieces saved to inventory for future matches

### 🧬 Genetic Logic Splicing

Powered by **Cairo** and **Dojo ECS**, the Gambit Engine reimagines piece capture:

- **Inheritance Over Elimination**: Capturing a piece triggers genetic inheritance, not simple removal
- **Trait Splicer**: Capture a Bishop with your Knight? It gains the Diagonal Leap trait
- **Provable Mutation**: All genetic shifts are calculated and verified on-chain
- **Complexity Budgets**: Balance piece power against Gas Limits for strategic depth

### 🎯 ELO Matchmaking

Skill-based matchmaking for fair games:

- **Player ELO Ratings**: From Beginner (E0) to Grandmaster (E5)
- **AI Bot Levels**: 10 bot difficulties (400-2200 ELO)
- **Fair Matches**: Automatically matched with players of similar skill
- **Persistent Stats**: Track wins, losses, and improvement over time

### 📦 Persistent Inventory

Your pieces evolve across matches:

- **On-Chain Storage**: Evolved pieces saved to your inventory
- **Upgrade Over Time**: Use pieces in multiple matches, gaining more traits
- **Rarity System**: Common → Uncommon → Rare → Epic → Legendary → Mythic
- **Deploy to Battle**: Select up to 3 evolved pieces per match

### 🌫️ The ZK-Fog (Confidential Warfare)

Introduces strategic uncertainty via **STARKs**:

- **Hidden Enchantments**: Secret abilities like "3-Square Pawn Move" remain concealed until execution
- **Zero-Knowledge Proofs**: Keep your strategies hidden while maintaining verifiability
- **Fog of War**: Traditional chess perfect information becomes dynamic uncertainty

### 👻 Verifiable AI: Ghost Pieces

Autonomous agents that move according to their own on-chain AI logic, disrupting the board and challenging players with unpredictable, provably fair strategies.

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Smart Contracts** | Cairo | High-performance, provable game logic |
| **Framework** | Dojo ECS | Entity-Component-System for game state |
| **Blockchain** | Starknet | L2 scaling with ZK-rollup security |
| **Indexer** | Torii | GraphQL API for game state queries |
| **AI** | Giza Network | Verifiable AI "Ghost Pieces" |
| **Privacy** | STARKs | ZK-Fog and hidden move validation |
| **Backend** | FastAPI | Off-chain services, matchmaking, AI integration |
| **Frontend** | Next.js | React-based UI with wallet integration |

## 📖 Quick Navigation

### For New Users

- **[Getting Started](getting-started.md)** - Setup and installation guide
- **[Gas Evolution System](mechanics/gas-evolution.md)** - Learn the new gas-based evolution mechanics
- **[ELO Matchmaking](mechanics/elo-system.md)** - Understand skill-based matchmaking
- **[Inventory System](mechanics/inventory-system.md)** - Manage your evolved pieces

### For Developers

- **[Architecture Overview](architecture/overview.md)** - System design and component interaction
- **[Cairo Contracts](reference/cairo-contracts.md)** - Smart contract API reference
- **[Dojo ECS Components](reference/ecs-components.md)** - Entity-Component-System reference
- **[Deployment Guide](guides/deployment.md)** - Deploy to local, testnet, or mainnet
- **[Backend API](../backend/README.md)** - REST API and WebSocket documentation

### For Contributors

- **[Contributing Guide](community/contributing.md)** - How to contribute
- **[Development Workflow](guides/development.md)** - Daily development practices
- **[Testing Strategy](guides/testing.md)** - Testing contracts and frontend
- **[FAQ](community/faq.md)** - Frequently asked questions

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/MohammedAbdul-Aziz/The-Gambit-Engine.git
cd The-Gambit-Engine

# Build contracts
cd contracts
sozo build

# Install and run frontend
cd ../frontend
npm install
npm run dev
```

For detailed setup instructions, see the [Getting Started Guide](getting-started.md).

## 📚 Documentation Sections

| Section | Description |
|---------|-------------|
| **[Introduction](getting-started.md)** | Setup, installation, and quick start |
| **[Architecture](architecture/overview.md)** | System design and technical architecture |
| **[Core Mechanics](mechanics/genetic-splicing.md)** | Game rules and mechanics |
| **[Advanced Features](advanced/ghost-pieces.md)** | Ghost pieces, ZK-proofs, complexity budgets |
| **[Technical Reference](reference/cairo-contracts.md)** | API documentation and data structures |
| **[Guides](guides/deployment.md)** | Deployment, development, and testing guides |
| **[Backend API](../backend/README.md)** | REST API and WebSocket documentation |

## 👥 Team

| Member | Role |
|--------|------|
| **Mohammed Abdul Aziz** | Cairo, Python, and GIZA deployments |
| **Ahmed** | Visionary behind the Genetic Arena and ZK strategist |

## 🔗 Community & Resources

- **[GitHub Repository](https://github.com/MohammedAbdul-Aziz/The-Gambit-Engine)** - Source code and issues
- **[Contributing Guide](community/contributing.md)** - How to contribute
- **[FAQ](community/faq.md)** - Frequently asked questions

## 📜 License

This project is open-source and available under the **MIT License**.

---

## Ready to Evolve Your Strategy?

Dive into the documentation and start building on the Gambit Engine. Whether you're a player, developer, or contributor, you'll find everything you need to get started.

**Next Steps:**
- 🎮 [Set up your development environment](getting-started.md)
- 🏗️ [Learn the architecture](architecture/overview.md)
- ⚔️ [Understand the game mechanics](mechanics/genetic-splicing.md)
- 🚀 [Deploy your own instance](guides/deployment.md)
