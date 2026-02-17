# ELO Rating and Matchmaking System

The ELO Rating System ensures fair matchmaking by pairing players with opponents of similar skill levels, whether human or AI.

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    ELO SYSTEM FLOW                          │
│                                                             │
│  Player Registration                                        │
│       │                                                     │
│       ▼                                                     │
│  Assign Initial ELO (1200)                                 │
│       │                                                     │
│       ▼                                                     │
│  Queue for Matchmaking                                     │
│       │                                                     │
│       ▼                                                     │
│  Find Opponent (±100 ELO)                                  │
│       │                                                     │
│       ├──────────────┐                                      │
│       │              │                                      │
│       ▼              ▼                                      │
│  Human Player    AI Bot (matched to ELO)                   │
│       │              │                                      │
│       ▼              ▼                                      │
│  Play Match     Play Match                                  │
│       │              │                                      │
│       ▼              ▼                                      │
│  Update ELO      Update Player ELO                          │
│  (Win/Loss)     (Win/Loss/Draw)                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## ELO Ratings

### Player ELO Categories

| ELO Range | Rank | Title |
|-----------|------|-------|
| 0-799 | E0 | Beginner |
| 800-1199 | E1 | Intermediate |
| 1200-1599 | E2 | Advanced |
| 1600-1999 | E3 | Expert |
| 2000-2399 | E4 | Master |
| 2400+ | E5 | Grandmaster |

### Initial ELO

```
New Player: 1200 ELO (E2 - Advanced)
```

### ELO Calculation

```cairo
struct ELOData {
    player_address: ContractAddress,
    current_elo: u32,
    highest_elo: u32,
    games_played: u32,
    wins: u32,
    losses: u32,
    draws: u32,
    win_streak: u32,
    best_win_streak: u32,
}
```

## ELO Update Logic

### K-Factor

The K-factor determines how much ELO changes per game:

```cairo
fn get_k_factor(player: ELOData) -> u8 {
    if player.games_played < 30 {
        return 40; // New players: faster adjustment
    }

    if player.current_elo >= 2400 {
        return 10; // Masters: slower adjustment
    }

    return 20; // Standard
}
```

### ELO Change Formula

```cairo
fn calculate_elo_change(
    player_elo: u32,
    opponent_elo: u32,
    result: GameResult,
    k_factor: u8
) -> i32 {
    // Calculate expected score
    let expected = 1.0 / (1.0 + pow(10.0, (opponent_elo - player_elo) / 400.0));

    // Actual score
    let actual = match result {
        GameResult::Win => 1.0,
        GameResult::Loss => 0.0,
        GameResult::Draw => 0.5,
    };

    // Calculate change
    let change = k_factor * (actual - expected);

    return change as i32;
}
```

### Example ELO Changes

```
Scenario 1: Expected Win
- Player A (1200 ELO) vs Player B (1100 ELO)
- Player A wins
- Expected: 0.64 (64% chance to win)
- K-factor: 20
- ELO change: 20 * (1.0 - 0.64) = +7 ELO
- Player A: 1200 → 1207
- Player B: 1100 → 1093

Scenario 2: Upset Victory
- Player A (1000 ELO) vs Player B (1400 ELO)
- Player A wins
- Expected: 0.09 (9% chance to win)
- K-factor: 20
- ELO change: 20 * (1.0 - 0.09) = +18 ELO
- Player A: 1000 → 1018
- Player B: 1400 → 1382

Scenario 3: Draw
- Player A (1200 ELO) vs Player B (1200 ELO)
- Draw
- Expected: 0.5 (50% chance)
- K-factor: 20
- ELO change: 20 * (0.5 - 0.5) = 0 ELO
- No change (as expected for equal players drawing)
```

## AI Bot ELO Levels

### Bot Difficulty Tiers

| Bot Level | ELO | Title | Behavior |
|-----------|-----|-------|----------|
| **Bot I** | 400 | E0 | Random moves, no strategy |
| **Bot II** | 600 | E0 | Basic piece safety |
| **Bot III** | 800 | E1 | Simple tactics (1-move) |
| **Bot IV** | 1000 | E1 | Basic strategy |
| **Bot V** | 1200 | E2 | Intermediate play |
| **Bot VI** | 1400 | E2 | Good tactics (2-move) |
| **Bot VII** | 1600 | E3 | Strong positional |
| **Bot VIII** | 1800 | E3 | Advanced strategy |
| **Bot IX** | 2000 | E4 | Master level |
| **Bot X** | 2200 | E4 | Near-perfect play |

### Bot Configuration

```cairo
struct BotConfig {
    bot_id: u8,
    base_elo: u32,
    aggression: u8,        // 0-100
    calculation_depth: u8, // Moves ahead
    error_rate: u8,        // 0-100 (chance of suboptimal move)
    opening_book: bool,    // Use standard openings
    endgame_table: bool,   // Perfect endgame play
}

const BOT_LEVELS: Map<u8, BotConfig> = {
    1 => BotConfig {
        bot_id: 1,
        base_elo: 400,
        aggression: 10,
        calculation_depth: 1,
        error_rate: 80,
        opening_book: false,
        endgame_table: false,
    },
    5 => BotConfig {
        bot_id: 5,
        base_elo: 1200,
        aggression: 50,
        calculation_depth: 3,
        error_rate: 20,
        opening_book: true,
        endgame_table: false,
    },
    10 => BotConfig {
        bot_id: 10,
        base_elo: 2200,
        aggression: 70,
        calculation_depth: 6,
        error_rate: 5,
        opening_book: true,
        endgame_table: true,
    },
};
```

## Matchmaking

### Matchmaking Queue

```cairo
struct MatchmakingRequest {
    player: ContractAddress,
    player_elo: u32,
    preferred_opponent: OpponentType, // Human or AI
    min_elo: u32,
    max_elo: u32,
    queued_at: u64,
}

enum OpponentType {
    Human,
    AI,
    Any,
}
```

### Matchmaking Algorithm

```cairo
fn find_opponent(request: MatchmakingRequest) -> Result<Match, MatchmakingError> {
    // ELO range: ±100
    let min_elo = request.player_elo - 100;
    let max_elo = request.player_elo + 100;

    if request.preferred_opponent == OpponentType::AI || 
       request.preferred_opponent == OpponentType::Any {
        // Find appropriate bot
        let bot_level = get_bot_level_for_elo(request.player_elo);
        return Result::Ok(Match::vsAI(bot_level));
    }

    // Search for human opponent
    let queue = get_human_queue();

    for other_request in queue {
        // Check ELO compatibility
        if other_request.player_elo >= min_elo && 
           other_request.player_elo <= max_elo {
            // Found match!
            return Result::Ok(Match::vsHuman(
                request.player,
                other_request.player
            ));
        }
    }

    // No human match found, offer AI
    return Result::Err(MatchmakingError::NoHumanOpponent);
}
```

### Queue Priority

```cairo
fn get_queue_priority(request: MatchmakingRequest) -> u32 {
    let wait_time = block_number - request.queued_at;

    // Priority increases with wait time
    // Higher ELO players get slight priority
    return wait_time + (request.player_elo / 100);
}
```

## Cairo Implementation

### Player Registration

```cairo
#[external(v0)]
fn register_player(
    ref self: ContractState,
    player: ContractAddress
) {
    // Check if already registered
    let exists = self.player_elo.has(player);
    assert(!exists, "Player already registered");

    // Initialize with default ELO
    let elo_data = ELOData {
        player_address: player,
        current_elo: 1200,
        highest_elo: 1200,
        games_played: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        win_streak: 0,
        best_win_streak: 0,
    };

    self.player_elo.write(player, elo_data);

    self.emit(PlayerRegistered {
        player,
        initial_elo: 1200,
    });
}
```

### Queue for Matchmaking

```cairo
#[external(v0)]
fn queue_for_match(
    ref self: ContractState,
    preferred_opponent: OpponentType
) {
    let player = get_caller_address();
    let elo_data = self.player_elo.read(player);

    let request = MatchmakingRequest {
        player,
        player_elo: elo_data.current_elo,
        preferred_opponent,
        min_elo: elo_data.current_elo - 100,
        max_elo: elo_data.current_elo + 100,
        queued_at: block_number,
    };

    self.matchmaking_queue.write(request.player, request);

    self.emit(PlayerQueued {
        player,
        preferred_opponent,
        elo: elo_data.current_elo,
    });
}
```

### Complete Match

```cairo
#[external(v0)]
fn complete_match(
    ref self: ContractState,
    game_id: u64,
    winner: Option<ContractAddress>
) {
    let game = self.games.read(game_id);
    let player_white = game.player_white;
    let player_black = game.player_black;

    // Get ELO data
    let mut white_elo = self.player_elo.read(player_white);
    let mut black_elo = self.player_elo.read(player_black);

    // Determine result
    let white_result = match winner {
        Option::Some(w) if w == player_white => GameResult::Win,
        Option::Some(w) if w == player_black => GameResult::Loss,
        _ => GameResult::Draw,
    };

    let black_result = match white_result {
        GameResult::Win => GameResult::Loss,
        GameResult::Loss => GameResult::Win,
        GameResult::Draw => GameResult::Draw,
    };

    // Calculate ELO changes
    let k_white = get_k_factor(white_elo);
    let k_black = get_k_factor(black_elo);

    let white_change = calculate_elo_change(
        white_elo.current_elo,
        black_elo.current_elo,
        white_result,
        k_white
    );

    let black_change = calculate_elo_change(
        black_elo.current_elo,
        white_elo.current_elo,
        black_result,
        k_black
    );

    // Update ELO
    white_elo.current_elo = (white_elo.current_elo as i32 + white_change) as u32;
    black_elo.current_elo = (black_elo.current_elo as i32 + black_change) as u32;

    // Update stats
    update_player_stats(ref white_elo, white_result);
    update_player_stats(ref black_elo, black_result);

    // Update highest ELO
    if white_elo.current_elo > white_elo.highest_elo {
        white_elo.highest_elo = white_elo.current_elo;
    }
    if black_elo.current_elo > black_elo.highest_elo {
        black_elo.highest_elo = black_elo.current_elo;
    }

    // Save updated ELO data
    self.player_elo.write(player_white, white_elo);
    self.player_elo.write(player_black, black_elo);

    // Remove from queue
    self.matchmaking_queue.delete(player_white);
    self.matchmaking_queue.delete(player_black);

    self.emit(MatchCompleted {
        game_id,
        winner,
        white_elo_change: white_change,
        black_elo_change: black_change,
        white_new_elo: white_elo.current_elo,
        black_new_elo: black_elo.current_elo,
    });
}
```

### Helper Functions

```cairo
fn update_player_stats(
    ref elo_data: ELOData,
    result: GameResult
) {
    elo_data.games_played += 1;

    match result {
        GameResult::Win => {
            elo_data.wins += 1;
            elo_data.win_streak += 1;
            if elo_data.win_streak > elo_data.best_win_streak {
                elo_data.best_win_streak = elo_data.win_streak;
            }
        },
        GameResult::Loss => {
            elo_data.losses += 1;
            elo_data.win_streak = 0;
        },
        GameResult::Draw => {
            elo_data.draws += 1;
            // Win streak continues on draw (optional rule)
        },
    }
}

fn get_bot_level_for_elo(player_elo: u32) -> u8 {
    if player_elo < 600 {
        return 1;
    } else if player_elo < 800 {
        return 2;
    } else if player_elo < 1000 {
        return 3;
    } else if player_elo < 1200 {
        return 4;
    } else if player_elo < 1400 {
        return 5;
    } else if player_elo < 1600 {
        return 6;
    } else if player_elo < 1800 {
        return 7;
    } else if player_elo < 2000 {
        return 8;
    } else if player_elo < 2200 {
        return 9;
    } else {
        return 10;
    }
}
```

## Matchmaking UI Flow

```
Player clicks "Play"
        │
        ▼
┌─────────────────────────┐
│  SELECT OPPONENT TYPE   │
│  ○ Human Player         │
│  ○ AI Bot               │
│  ○ Any                  │
└─────────────────────────┘
        │
        ▼
┌─────────────────────────┐
│  SEARCHING FOR MATCH... │
│                         │
│  Your ELO: 1200         │
│  Looking for: 1100-1300 │
│                         │
│  Queue position: 3      │
│  Wait time: ~30s        │
│                         │
│  [Cancel]               │
└─────────────────────────┘
        │
        ▼
┌─────────────────────────┐
│  MATCH FOUND!           │
│                         │
│  vs AI Bot VI           │
│  Bot ELO: 1400          │
│                         │
│  [Accept] [Decline]     │
└─────────────────────────┘
```

## Statistics Dashboard

### Player Profile

```typescript
interface PlayerStats {
  // ELO
  currentElo: number;
  highestElo: number;
  rank: 'E0' | 'E1' | 'E2' | 'E3' | 'E4' | 'E5';

  // Record
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;

  // Streaks
  currentWinStreak: number;
  bestWinStreak: number;

  // Performance
  avgEloChange: number;
  favoriteOpening: string;
  mostUsedPiece: string;
}
```

### Leaderboard

```graphql
query GetLeaderboard($limit: Int!) {
  players(orderBy: { field: CURRENT_ELO, direction: DESC }, first: $limit) {
    address
    currentElo
    highestElo
    wins
    losses
    winRate
  }
}
```

## Next Steps

- [Gas Evolution](gas-evolution.md) - Gas-based trait inheritance
- [Inventory System](inventory-system.md) - Persistent piece storage
- [AI Bot Implementation](../advanced/ai-bots.md) - Bot behavior details
