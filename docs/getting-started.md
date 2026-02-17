# Getting Started

This guide will help you set up and start developing with The Gambit Engine.

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Tools

- **Git** - Version control
- **Node.js** (v18+) - JavaScript runtime
- **npm** or **yarn** - Package manager
- **Scarb** - Cairo package manager
- **Sozo** - Dojo CLI tool
- **Starknet Foundry** - Cairo testing framework

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/MohammedAbdul-Aziz/The-Gambit-Engine.git
cd The-Gambit-Engine
```

#### 2. Install Cairo and Dojo Toolchain

```bash
# Install asdf version manager (recommended)
curl https://asdf-vm.com/install.sh | bash

# Add Dojo repository
asdf plugin add dojo https://github.com/dojoengine/asdf-dojo.git
asdf plugin add scarb https://github.com/asdf-community/asdf-scarb.git

# Install latest versions
asdf install dojo latest
asdf install scarb latest
asdf global dojo latest
asdf global scarb latest
```

#### 3. Install Starknet Foundry

```bash
curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/sway/download/install.sh | bash
```

#### 4. Build Smart Contracts

```bash
cd contracts
sozo build
```

#### 5. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

#### 6. Run Development Server

```bash
npm run dev
```

## Project Structure

```
The-Gambit-Engine/
├── contracts/          # Cairo smart contracts (Dojo ECS)
│   ├── manifests/      # Dojo manifests and configurations
│   ├── src/            # Contract source code
│   └── Scarb.toml      # Cairo package configuration
├── frontend/           # React/Next.js frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── docs/               # Documentation (GitBook)
└── README.md
```

## Quick Start Commands

| Command | Description |
|---------|-------------|
| `sozo build` | Build smart contracts |
| `sozo migrate` | Deploy contracts to local/devnet |
| `sozo test` | Run contract tests |
| `npm run dev` | Start frontend development server |
| `npm run build` | Build production frontend |

## Next Steps

- [Architecture Overview](architecture/overview.md) - Understand the system design
- [Game Mechanics](mechanics/genetic-splicing.md) - Learn about core mechanics
- [Development Guide](guides/development.md) - Start building features

## Troubleshooting

### Common Issues

**Scarb build fails:**
```bash
scarb clean && sozo build
```

**Node modules issues:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Dojo version mismatch:**
```bash
asdf rescan
asdf global dojo latest
```

## Getting Help

- Check the [FAQ](community/faq.md)
- Open an issue on [GitHub](https://github.com/MohammedAbdul-Aziz/The-Gambit-Engine/issues)
- Join our community discussions
