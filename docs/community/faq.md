# Frequently Asked Questions (FAQ)

Common questions about The Gambit Engine.

## General

### What is The Gambit Engine?

The Gambit Engine is a DNA-encoded, on-chain chess RPG built on Starknet and the Dojo Engine. It transforms traditional chess by introducing:

- **Genetic Logic Splicing**: Pieces inherit traits when capturing
- **ZK-Fog**: Hidden abilities verified with zero-knowledge proofs
- **Ghost Pieces**: Autonomous AI agents that disrupt gameplay

### How is this different from traditional chess?

| Traditional Chess | Gambit Engine |
|-------------------|---------------|
| Perfect information | Hidden abilities (ZK-Fog) |
| Static pieces | Evolving hybrid pieces |
| Capture = elimination | Capture = inheritance |
| No AI interference | Ghost Pieces intervene |
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
2. Create or join a game
3. Make moves by selecting pieces and target squares
4. Capture pieces to gain their traits
5. Use hidden abilities strategically
6. Watch out for Ghost Pieces!

### What happens when I capture a piece?

Instead of simple elimination:
1. The captured piece is removed from the board
2. Its genetic traits are extracted
3. Your piece inherits those traits (within complexity budget)
4. Your piece becomes a unique hybrid

### What is complexity budget?

Each piece has a maximum complexity limit (default: 100). Traits have costs:
- Knight's Leap: 15
- Bishop's Diagonal: 25
- Rook's Straight: 25
- Queen's Combined: 50

You cannot inherit traits that would exceed your budget.

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
