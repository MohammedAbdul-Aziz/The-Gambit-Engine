/// Gambit Engine - Simple Starknet Contract
/// Compatible with Cairo 2.8.2

#[starknet::contract]
pub mod GambitEngine {
    use starknet::ContractAddress;
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};

    #[storage]
    pub struct Storage {
        next_game_id: u64,
        next_piece_id: u32,
    }

    #[constructor]
    pub fn constructor(ref self: ContractState) {
        self.next_game_id.write(1);
        self.next_piece_id.write(1);
    }

    #[external(v0)]
    pub fn create_game(ref self: ContractState, starting_gas: u32) -> u64 {
        let game_id = self.next_game_id.read();
        self.next_game_id.write(game_id + 1);

        let caller = starknet::get_caller_address();
        let timestamp = starknet::get_block_timestamp();

        self.emit(Event::GameCreated(GameCreatedEvent {
            game_id,
            player: caller,
            starting_gas,
            created_at: timestamp,
        }));

        game_id
    }

    #[external(v0)]
    pub fn join_game(ref self: ContractState, game_id: u64) {
        let caller = starknet::get_caller_address();
        let timestamp = starknet::get_block_timestamp();

        self.emit(Event::GameJoined(GameJoinedEvent {
            game_id,
            player: caller,
            joined_at: timestamp,
        }));
    }

    #[external(v0)]
    pub fn create_piece(
        ref self: ContractState,
        game_id: u64,
        piece_type: u8,
        color: u8,
        file: u8,
        rank: u8,
    ) -> u32 {
        let caller = starknet::get_caller_address();
        let piece_id = self.next_piece_id.read();
        self.next_piece_id.write(piece_id + 1);

        self.emit(Event::PieceCreated(PieceCreatedEvent {
            piece_id,
            game_id,
            piece_type,
            color,
            file,
            rank,
            owner: caller,
        }));

        piece_id
    }

    #[external(v0)]
    pub fn make_move(
        ref self: ContractState,
        game_id: u64,
        piece_id: u32,
        to_file: u8,
        to_rank: u8,
    ) {
        let caller = starknet::get_caller_address();

        self.emit(Event::MoveMade(MoveMadeEvent {
            game_id,
            piece_id,
            player: caller,
            to_file,
            to_rank,
        }));
    }

    #[event]
    #[derive(Drop, Serde, starknet::Event)]
    pub enum Event {
        GameCreated: GameCreatedEvent,
        GameJoined: GameJoinedEvent,
        PieceCreated: PieceCreatedEvent,
        MoveMade: MoveMadeEvent,
    }

    #[derive(Drop, Serde, starknet::Event)]
    pub struct GameCreatedEvent {
        pub game_id: u64,
        pub player: ContractAddress,
        pub starting_gas: u32,
        pub created_at: u64,
    }

    #[derive(Drop, Serde, starknet::Event)]
    pub struct GameJoinedEvent {
        pub game_id: u64,
        pub player: ContractAddress,
        pub joined_at: u64,
    }

    #[derive(Drop, Serde, starknet::Event)]
    pub struct PieceCreatedEvent {
        pub piece_id: u32,
        pub game_id: u64,
        pub piece_type: u8,
        pub color: u8,
        pub file: u8,
        pub rank: u8,
        pub owner: ContractAddress,
    }

    #[derive(Drop, Serde, starknet::Event)]
    pub struct MoveMadeEvent {
        pub game_id: u64,
        pub piece_id: u32,
        pub player: ContractAddress,
        pub to_file: u8,
        pub to_rank: u8,
    }
}
