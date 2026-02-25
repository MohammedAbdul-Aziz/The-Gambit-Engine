/// The Gambit Engine - Main Library
/// A DNA-encoded, on-chain chess RPG on Starknet

pub mod models;
pub mod systems;
pub mod interfaces;
pub mod contract;

// Re-export commonly used types
pub use models::{
    PieceType, Color, Position, GameConfig,
};
pub use interfaces::GameEndReason;
pub use contract::GambitEngine;
