# Contributing to The Gambit Engine

Thank you for your interest in contributing to The Gambit Engine! This document provides guidelines and instructions for contributing.

## Code of Conduct

### Our Pledge

We pledge to make participation in The Gambit Engine project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity, level of experience, nationality, personal appearance, race, religion, or sexual identity.

### Our Standards

Examples of behavior that contributes to creating a positive environment:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

## Getting Started

### 1. Fork the Repository

```bash
# Click "Fork" on GitHub, then clone your fork
git clone https://github.com/your-username/The-Gambit-Engine.git
cd The-Gambit-Engine
```

### 2. Set Up Development Environment

```bash
# Install Cairo and Dojo
curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | bash
curl --proto '=https' --tlsv1.2 -sSf https://install.dojoengine.org | bash

# Install dependencies
cd contracts
sozo build

cd ../frontend
npm install
```

### 3. Create a Branch

```bash
# Create feature branch
git checkout -b feature/your-feature-name
```

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the behavior
- **Expected vs actual behavior**
- **Screenshots** if applicable
- **Environment details** (OS, browser, versions)

**Example:**
```markdown
**Bug**: Knight cannot capture Bishop with genetic splicing

**Steps to Reproduce:**
1. Start a new game
2. Move Knight to capture Bishop
3. Observe error

**Expected:** Capture succeeds, Knight gains Diagonal trait
**Actual:** Transaction reverts with "Splicing failed"

**Environment:**
- OS: Ubuntu 22.04
- Browser: Chrome 120
- Network: Starknet Testnet
```

### Suggesting Features

Feature suggestions are welcome! Please provide:

- **Use case**: Why is this feature needed?
- **Proposed solution**: How should it work?
- **Alternatives considered**: Other approaches
- **Additional context**: Screenshots, mockups, etc.

### Pull Requests

#### Before Submitting

1. **Test your changes**
   ```bash
   sozo test
   npm test
   ```

2. **Format code**
   ```bash
   scarb fmt
   npm run lint
   ```

3. **Update documentation** if needed

4. **Rebase on main**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

#### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] E2E tests pass

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
```

## Development Guidelines

### Cairo Code Style

```cairo
// Use descriptive names
fn validate_move_legality(piece: Piece, target: Position) -> bool {
    // Implementation
}

// Add doc comments for public functions
/// Splices genetic traits from defender to attacker.
/// Returns error if complexity budget exceeded.
fn splice_traits(
    attacker: Piece,
    defender: Piece
) -> Result<SplicedPiece, SplicingError> {
    // Implementation
}

// Use early returns for guard clauses
fn process_capture(piece: Piece) -> Result<(), CaptureError> {
    if !piece.is_alive {
        return Result::Err(CaptureError::PieceDead);
    }
    
    if piece.complexity >= MAX_COMPLEXITY {
        return Result::Err(CaptureError::BudgetFull);
    }
    
    // Continue processing...
}
```

### TypeScript Code Style

```typescript
// Use TypeScript types
interface PieceProps {
  piece: PieceData;
  isSelected: boolean;
  onClick: (pieceId: number) => void;
}

// Use functional components with hooks
export function Piece({ piece, isSelected, onClick }: PieceProps) {
  const handleClick = useCallback(() => {
    onClick(piece.id);
  }, [piece.id, onClick]);
  
  return (
    <div className={isSelected ? 'selected' : ''} onClick={handleClick}>
      <PieceIcon type={piece.pieceType} />
    </div>
  );
}

// Use async/await for async operations
async function makeMove(move: Move): Promise<void> {
  try {
    await contract.makeMove(move);
  } catch (error) {
    handleError(error);
  }
}
```

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: Add new ghost piece AI model
fix: Resolve complexity budget overflow bug
docs: Update deployment guide
style: Format Cairo contracts
refactor: Extract genetic splicing logic
test: Add ZK-Fog unit tests
chore: Update dependencies
```

**Examples:**
```bash
git commit -m "feat: add ZK-Fog commitment system"
git commit -m "fix: resolve ghost piece move validation"
git commit -m "docs: update architecture diagrams"
```

## Areas Needing Contribution

### Smart Contracts

- [ ] Optimize gas costs for genetic splicing
- [ ] Add new trait types
- [ ] Implement advanced ghost behaviors
- [ ] Add tournament mode contracts

### Frontend

- [ ] Improve board accessibility
- [ ] Add move history visualization
- [ ] Create piece evolution tree UI
- [ ] Implement replay mode

### Documentation

- [ ] Tutorial for new players
- [ ] Strategy guides
- [ ] API reference updates
- [ ] Video tutorials

### Testing

- [ ] Increase test coverage
- [ ] Add performance benchmarks
- [ ] Create fuzzing tests
- [ ] Add security test suite

### Infrastructure

- [ ] CI/CD improvements
- [ ] Monitoring and alerting
- [ ] Performance optimization
- [ ] Deployment automation

## Review Process

### 1. Automated Checks

- Tests must pass
- Linting must pass
- Coverage requirements met

### 2. Code Review

A maintainer will review your PR for:

- Code quality and style
- Test coverage
- Documentation
- Security considerations

### 3. Approval and Merge

Once approved:
- Maintainer merges the PR
- Changes included in next release
- Contributor credited in release notes

## Release Process

### Versioning

We use [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Schedule

- **Patch releases**: Weekly (bug fixes)
- **Minor releases**: Monthly (new features)
- **Major releases**: Quarterly (breaking changes)

## Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and ideas
- **Discord**: Real-time chat with contributors
- **Twitter**: @GambitEngine for updates

## Recognition

Contributors are recognized in:

- Release notes
- CONTRIBUTORS.md file
- Project website
- Social media shoutouts

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to The Gambit Engine! 🎉
