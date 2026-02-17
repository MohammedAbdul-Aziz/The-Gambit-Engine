# Frequently Asked Questions (FAQ)

Common questions about The Gambit Engine.

## General

### What is The Gambit Engine?

The Gambit Engine is a DNA-encoded, on-chain chess RPG built on Starknet and the Dojo Engine. It transforms traditional chess by introducing:

- **Genetic Logic Splicing**: Pieces inherit traits when capturing
- **Gas-Based Evolution**: Spend limited gas to evolve pieces strategically
- **Persistent Inventory**: Keep evolved pieces across matches
- **ZK-Fog**: Hidden abilities verified with zero-knowledge proofs
- **Ghost Pieces**: Autonomous AI agents that disrupt gameplay
- **ELO Matchmaking**: Fair matches based on skill level

### How is this different from traditional chess?

| Traditional Chess | Gambit Engine |
|-------------------|---------------|
| Perfect information | Hidden abilities (ZK-Fog) |
| Static pieces | Evolving hybrid pieces |
| Capture = elimination | Capture = inheritance opportunity |
| No persistence | Persistent inventory system |
| No AI interference | Ghost Pieces intervene |
| No skill ratings | ELO matchmaking system |
| Off-chain play | On-chain verifiable |

### What blockchain does it run on?

The Gambit Engine runs on **Starknet**, an L2 zk-rollup on Ethereum, providing:
- Low transaction costs
- Fast finality
- Ethereum security
- Zero-knowledge proof support

---

## Gameplay

### How do I start playing?

1. Connect your Starknet wallet
2. Create or join a game (or play vs AI)
3. Select up to 3 evolved pieces from your inventory (optional)
4. Make moves by selecting pieces and target squares
5. Capture pieces to gain evolution opportunities
6. Spend gas wisely to inherit traits
7. Save evolved pieces to inventory after the game

### What is the gas system?

**Gas** is your evolution budget for each game:

- **Starting Gas**: 10 gas per player, per game
- **Trait Costs**:
  - Pawn traits: 1 gas
  - Knight traits: 3 gas
  - Bishop traits: 3 gas
  - Rook traits: 5 gas
  - Queen traits: 10 gas

**Example**: If your pawn captures a knight, you can spend 3 gas to give your pawn the Knight's L-shaped leap ability.

### What happens when I capture a piece?

Instead of simple elimination:
1. You get an **evolution opportunity**
2. You can choose to spend gas to inherit traits from the captured piece
3. Or skip to save gas for better opportunities
4. If you evolve, your piece gains new movement abilities
5. After the game, evolved pieces can be saved to your inventory

### What is the inventory system?

Your **inventory** stores evolved pieces across matches:

- **Save Evolved Pieces**: After a game, save pieces with traits
- **Reuse in Future**: Deploy saved pieces to new matches
- **Upgrade Further**: Pieces can gain more traits over multiple games
- **Rarity Tiers**: Pieces become rarer as they gain traits and games played

### Can I use my evolved pieces in ranked matches?

Yes! You can select up to **3 evolved pieces** from your inventory for each match. This adds strategic depth:
- Do you use your best pieces now?
- Or save them for more important matches?
- Can you build a diverse army of specialized pieces?

### What are the AI bot levels?

There are **10 bot levels** (400-2200 ELO):

| Bot | ELO | Skill Level |
|-----|-----|-------------|
| Bot I | 400 | Complete beginner |
| Bot III | 800 | Casual player |
| Bot V | 1200 | Intermediate |
| Bot VII | 1600 | Advanced |
| Bot IX | 2000 | Master |
| Bot X | 2200 | Near-perfect |

You'll be matched with bots appropriate to your ELO rating.

### How does ELO matchmaking work?

- **New Players**: Start at 1200 ELO
- **Matchmaking**: Finds opponents within ±100 ELO
- **ELO Changes**: Win against higher ELO = more points gained
- **Bot Matching**: If no human opponent, matched with AI bot at your level

### Can I play against friends?

Yes! You can:
- Create a custom game and share the join code
- Play unranked matches (no ELO change)
- Practice matches with specific piece selections

### Can I see my opponent's hidden abilities?

No! That's the point of ZK-Fog. You only discover hidden abilities when they're revealed. However, you can:
- See that commitments exist
- Track which pieces have hidden abilities
- Make educated guesses based on gameplay

### What are Ghost Pieces?

Ghost Pieces are AI-controlled autonomous pieces that:
- Move independently of players
- Follow programmed AI logic
- Can capture and be captured
- Add unpredictability to games

### How do Ghost Pieces affect my game?

Ghost Pieces can:
- Capture your valuable pieces
- Block your strategies
- Be captured (you gain their traits)
- Change the entire game dynamic

---

## Technical

### What wallet do I need?

You need a **Starknet wallet**:
- **Argent X** (recommended)
- **Braavos**
- **Okx Wallet**

### Is my data on-chain?

Yes! Everything is verifiably on-chain:
- Game state
- Piece positions
- Genetic data
- Move history
- AI decisions (via proofs)

### How much does it cost to play?

Transaction costs on Starknet are typically **$0.01 - $0.10** per move, depending on network congestion.

### Can I play for free?

Yes! We offer:
- **Local mode**: Play offline without transactions
- **Testnet**: Free test tokens for practice
- **Sponsored transactions**: For new players (limited)

### What happens if a transaction fails?

Failed transactions:
- Are reverted (no state change)
- Cost a small gas fee
- Display an error message
- Can be retried

Common failure reasons:
- Insufficient balance
- Invalid move
- Complexity budget exceeded
- Network congestion

---

## Development

### How do I contribute?

See our [Contributing Guide](contributing.md) for:
- Setting up development environment
- Finding issues to work on
- Submitting pull requests
- Code style guidelines

### What programming languages are used?

- **Cairo**: Smart contracts
- **TypeScript/React**: Frontend
- **Python**: AI model training (optional)

### How do I run it locally?

```bash
# Start Katana (local devnet)
katana

# Build and deploy contracts
cd contracts
sozo build
sozo migrate apply

# Start frontend
cd frontend
npm install
npm run dev
```

### Where is the documentation?

- **[Getting Started](../getting-started.md)**: Setup guide
- **[Architecture](../architecture/overview.md)**: System design
- **[API Reference](../reference/cairo-contracts.md)**: Contract documentation
- **[Guides](../guides/development.md)**: Development tutorials

### How do I test my changes?

```bash
# Contract tests
sozo test

# Frontend tests
npm test

# E2E tests
npm run test:e2e
```

---

## Security

### Are smart contracts audited?

Yes! Our contracts undergo professional security audits before mainnet deployment. Audit reports are published in our repository.

### Can someone cheat?

No! All game logic is:
- **On-chain**: Executed by smart contracts
- **Verifiable**: Anyone can verify moves
- **Provable**: ZK-proofs ensure correctness

### What if I lose my wallet?

Your game progress is tied to your wallet address. If you lose access:
- Game state remains on-chain
- You need wallet recovery to access games
- Consider using a wallet with backup options

### Is my private key safe?

**Never share your private key!** The Gambit Engine:
- Never asks for your private key
- Only requests transaction signatures
- Uses standard wallet connect protocols

---

## Troubleshooting

### "Transaction failed" error

**Solutions:**
1. Check your wallet balance
2. Verify it's your turn
3. Ensure the move is legal
4. Try increasing gas limit
5. Wait for network congestion to clear

### "Complexity exceeded" error

**Solutions:**
1. Capture pieces with cheaper traits
2. Sacrifice high-complexity pieces
3. Plan evolution paths carefully
4. Check trait costs before capturing

### Frontend not loading

**Solutions:**
1. Clear browser cache
2. Check wallet connection
3. Verify network (mainnet/testnet)
4. Try different browser
5. Check console for errors

### Ghost Pieces not moving

**Solutions:**
1. Verify ghost AI is enabled
2. Check move frequency setting
3. Ensure Giza Network is accessible
4. Review ghost configuration

---

## Community

### Where can I discuss the game?

- **GitHub Discussions**: Feature requests and Q&A
- **Discord**: Real-time chat
- **Twitter**: @GambitEngine for updates
- **Reddit**: r/GambitEngine (community-run)

### How do I report a bug?

Open an issue on GitHub with:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

### Can I create content about Gambit Engine?

Absolutely! We encourage:
- Tutorial videos
- Strategy guides
- Stream gameplay
- Blog posts

Just credit the project and link to our repository.

### Are there tournaments?

Yes! We host regular tournaments:
- **Weekly**: Community tournaments
- **Monthly**: Official tournaments with prizes
- **Special events**: Holiday tournaments

Check our Discord for announcements.

---

## Licensing

### What license is used?

The Gambit Engine is **MIT licensed**:
- Free to use
- Free to modify
- Free to distribute
- Attribution appreciated

### Can I fork this project?

Yes! Forks are welcome. We ask that you:
- Credit the original project
- Use a different name to avoid confusion
- Share your improvements back (optional but appreciated)

---

## Contact

### How do I reach the team?

- **Email**: team@gambit.engineer
- **Twitter**: @GambitEngine
- **Discord**: Join our server
- **GitHub**: Open an issue

### Who created this?

**Team:**
- **Mohammed Abdul Aziz**: Cairo, Python, and GIZA deployments
- **Ahmed**: Visionary behind the Genetic Arena and ZK strategist

---

Still have questions? Join our Discord or open a GitHub discussion!
