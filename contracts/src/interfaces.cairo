/// Interfaces module for The Gambit Engine

/// Game end reasons
#[derive(Drop, Serde, Debug)]
pub enum GameEndReason {
    Checkmate,
    Stalemate,
    Resignation,
    Draw,
    Timeout,
}
