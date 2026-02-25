/// Systems module for The Gambit Engine

use starknet::ContractAddress;
use crate::models::GameConfig;

/// Game system errors
#[derive(Drop, Serde, Debug)]
pub enum GameError {
    GameNotFound,
    GameAlreadyExists,
    GameFull,
    NotPlayerTurn,
    InvalidPlayer,
}

/// Generate unique game ID
fn generate_game_id() -> u64 {
    let block_num = starknet::get_block_number();
    let timestamp = starknet::get_block_timestamp();
    (block_num.into() % 1000000_u64) * 10000000000_u64 + timestamp.into()
}

// ============ Events ============

#[derive(Drop, Serde, Debug)]
pub struct GameCreatedEvent {
    pub game_id: u64,
    pub player_white: ContractAddress,
    pub config: GameConfig,
    pub created_at: u64,
}
