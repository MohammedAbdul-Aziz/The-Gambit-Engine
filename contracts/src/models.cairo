/// Models module for The Gambit Engine
/// Core data structures and ECS components

use starknet::ContractAddress;

// ============ Types ============

/// Chess piece types
#[derive(Copy, Drop, Serde, Debug)]
pub enum PieceType {
    Pawn,
    Knight,
    Bishop,
    Rook,
    Queen,
    King,
}

/// Piece colors
#[derive(Copy, Drop, Serde, Debug)]
pub enum Color {
    White,
    Black,
}

/// Board position
#[derive(Copy, Drop, Serde, Debug)]
pub struct Position {
    pub file: u8,
    pub rank: u8,
}

/// Trait names
#[derive(Copy, Drop, Serde, Debug)]
pub enum TraitName {
    ForwardStep,
    Leap,
    Diagonal,
    Straight,
    Combined,
    Adjacent,
    ExtendedRange,
    PhantomLeap,
    DoubleMove,
    Teleport,
    HiddenAbility,
    Ethereal,
    AutonomousAI,
}

/// A genetic trait
#[derive(Copy, Drop, Serde, Debug)]
pub struct Trait {
    pub name: TraitName,
    pub cost: u32,
    pub is_hidden: bool,
}

/// Special move types
#[derive(Copy, Drop, Serde, Debug)]
pub enum SpecialMove {
    None,
    CastleKing,
    CastleQueen,
    EnPassant,
    Promotion: PieceType,
}

/// A move
#[derive(Copy, Drop, Serde, Debug)]
pub struct Move {
    pub piece_id: u32,
    pub from: Position,
    pub to: Position,
    pub is_special: bool,
    pub special_data: SpecialMove,
}

/// Genetic data
#[derive(Copy, Drop, Serde, Debug)]
pub struct GeneticData {
    pub piece_id: u32,
    pub base_type: PieceType,
    pub complexity_cost: u32,
    pub generation: u32,
}

/// Complexity budget
#[derive(Copy, Drop, Serde, Debug)]
pub struct ComplexityBudget {
    pub current: u32,
    pub max: u32,
    pub remaining: u32,
}

/// Game configuration
#[derive(Copy, Drop, Serde, Debug)]
pub struct GameConfig {
    pub max_complexity: u32,
    pub ghost_count: u8,
    pub zk_fog_enabled: bool,
    pub starting_gas: u32,
}

/// Splicing error
#[derive(Copy, Drop, Serde, Debug)]
pub enum SplicingError {
    ComplexityExceeded,
    InvalidTraitCombination,
    MaxGenerationReached,
    OwnerMismatch,
}

/// Splicing result
#[derive(Copy, Drop, Serde, Debug)]
pub struct SplicingResult {
    pub success: bool,
    pub new_complexity: u32,
    pub new_generation: u32,
    pub error: Option<SplicingError>,
}

/// Move error
#[derive(Copy, Drop, Serde, Debug)]
pub enum MoveError {
    OutOfBounds,
    Blocked,
    SameColor,
    WrongPattern,
    InCheck,
    ThroughCheck,
    NotOwner,
    NotAlive,
    WrongTurn,
}

/// Move validity
#[derive(Copy, Drop, Serde, Debug)]
pub enum MoveValidity {
    Valid,
    Invalid: MoveError,
}

/// Ghost config
#[derive(Copy, Drop, Serde, Debug)]
pub struct GhostConfig {
    pub base_elo: u32,
    pub aggression: u8,
    pub calculation_depth: u8,
    pub error_rate: u8,
    pub opening_book: bool,
    pub endgame_table: bool,
}

// ============ Constants ============

pub mod constants {
    use super::{PieceType, TraitName};

    pub const STARTING_GAS: u32 = 10;
    pub const MAX_COMPLEXITY: u32 = 100;
    pub const BOARD_SIZE: u8 = 8;

    pub fn get_piece_gas_cost(piece_type: PieceType) -> u32 {
        match piece_type {
            PieceType::Pawn => 1,
            PieceType::Knight => 3,
            PieceType::Bishop => 3,
            PieceType::Rook => 5,
            PieceType::Queen => 10,
            PieceType::King => 0,
        }
    }

    pub fn get_base_trait(piece_type: PieceType) -> TraitName {
        match piece_type {
            PieceType::Pawn => TraitName::ForwardStep,
            PieceType::Knight => TraitName::Leap,
            PieceType::Bishop => TraitName::Diagonal,
            PieceType::Rook => TraitName::Straight,
            PieceType::Queen => TraitName::Combined,
            PieceType::King => TraitName::Adjacent,
        }
    }
}

// ============ Components ============

/// Game component
#[derive(Copy, Drop, Serde, Debug)]
pub struct Game {
    pub id: u64,
    pub player_white: ContractAddress,
    pub player_black: ContractAddress,
    pub current_turn: ContractAddress,
    pub move_count: u32,
    pub is_check: bool,
    pub is_checkmate: bool,
    pub is_stalemate: bool,
    pub winner: Option<ContractAddress>,
    pub gas_white: u32,
    pub gas_black: u32,
    pub config: GameConfig,
    pub created_at: u64,
    pub last_move_at: u64,
}

/// Piece component
#[derive(Copy, Drop, Serde, Debug)]
pub struct Piece {
    pub id: u32,
    pub game_id: u64,
    pub piece_type: PieceType,
    pub color: Color,
    pub position_file: u8,
    pub position_rank: u8,
    pub is_alive: bool,
    pub owner: ContractAddress,
    pub complexity: u32,
    pub generation: u32,
    pub gas_cost: u32,
    pub capture_count: u32,
}

/// Genetic trait component
#[derive(Copy, Drop, Serde, Debug)]
pub struct GeneticTrait {
    pub piece_id: u32,
    pub trait_name: TraitName,
    pub trait_cost: u32,
    pub is_hidden: bool,
    pub inherited_at: u32,
}

/// Position component
#[derive(Copy, Drop, Serde, Debug)]
pub struct PositionComponent {
    pub file: u8,
    pub rank: u8,
    pub occupied_by: Option<u32>,
}

/// Player component
#[derive(Copy, Drop, Serde, Debug)]
pub struct Player {
    pub address: ContractAddress,
    pub current_elo: u32,
    pub highest_elo: u32,
    pub games_played: u32,
    pub wins: u32,
    pub losses: u32,
    pub draws: u32,
    pub win_streak: u32,
    pub best_win_streak: u32,
    pub gas_remaining: u32,
}

/// Inventory component
#[derive(Copy, Drop, Serde, Debug)]
pub struct Inventory {
    pub owner: ContractAddress,
    pub piece_id: u32,
    pub base_type: PieceType,
    pub games_played: u32,
    pub captures_made: u32,
    pub evolution_count: u32,
    pub name: felt252,
    pub is_available: bool,
    pub is_locked: bool,
}

/// Ghost component
#[derive(Copy, Drop, Serde, Debug)]
pub struct Ghost {
    pub id: u32,
    pub game_id: u64,
    pub piece_id: u32,
    pub base_elo: u32,
    pub aggression: u8,
    pub calculation_depth: u8,
    pub is_active: bool,
    pub moves_made: u32,
}

/// Capture component
#[derive(Copy, Drop, Serde, Debug)]
pub struct Capture {
    pub game_id: u64,
    pub attacker_id: u32,
    pub defender_id: u32,
    pub attacker_type: PieceType,
    pub defender_type: PieceType,
    pub turn: u32,
    pub evolution_pending: bool,
}

/// Move history component
#[derive(Copy, Drop, Serde, Debug)]
pub struct MoveHistory {
    pub game_id: u64,
    pub move_number: u32,
    pub piece_id: u32,
    pub from_file: u8,
    pub from_rank: u8,
    pub to_file: u8,
    pub to_rank: u8,
    pub is_capture: bool,
    pub is_special: bool,
}

/// ZK commitment component
#[derive(Copy, Drop, Serde, Debug)]
pub struct ZKCommitment {
    pub piece_id: u32,
    pub ability_hash: felt252,
    pub timestamp: u64,
    pub revealed: bool,
}
