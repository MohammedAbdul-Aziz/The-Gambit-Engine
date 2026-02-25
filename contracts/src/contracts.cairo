#[starknet::contract]
pub mod GambitWorld {
    use dojo::world::IWorld;
    use crate::{Game, Piece, Player, PieceType, Color, GameConfig, GameEndReason};

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
    pub fn create_game(
        ref self: ContractState,
        world: IWorld,
        config: GameConfig,
    ) -> u64 {
        // Implementation using world.set_entity()
    }
}