"""
Starknet Service - Handles blockchain interactions via HTTP
"""

import asyncio
import logging
from typing import Optional, List, Dict, Any
import httpx

logger = logging.getLogger(__name__)


class StarknetService:
    """Service for interacting with Starknet blockchain via HTTP RPC"""
    
    def __init__(
        self,
        rpc_url: str = "https://starknet-sepolia.public.blastapi.io",
        contract_address: Optional[str] = None,
    ):
        self.rpc_url = rpc_url
        self.contract_address = contract_address
        self.client = httpx.AsyncClient(timeout=30.0)
        
    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()
    
    async def call_contract(
        self,
        function_name: str,
        calldata: List[int],
        contract_address: Optional[str] = None,
    ) -> List[int]:
        """Call a contract read function"""
        addr = contract_address or self.contract_address
        if not addr:
            raise ValueError("Contract address not provided")
        
        # Convert function name to selector (felt252)
        selector = self._get_selector_from_name(function_name)
        
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "starknet_call",
            "params": [
                {
                    "contract_address": addr,
                    "entry_point_selector": hex(selector),
                    "calldata": [hex(x) for x in calldata],
                },
                "latest"
            ]
        }
        
        try:
            response = await self.client.post(self.rpc_url, json=payload)
            response.raise_for_status()
            result = response.json()
            
            if "error" in result:
                logger.error(f"Contract call error: {result['error']}")
                return []
            
            return [int(x, 16) for x in result.get("result", [])]
            
        except Exception as e:
            logger.error(f"Failed to call contract: {e}")
            return []
    
    async def get_transaction_status(self, tx_hash: str) -> Dict[str, Any]:
        """Get transaction status"""
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "starknet_getTransactionStatus",
            "params": [tx_hash]
        }
        
        try:
            response = await self.client.post(self.rpc_url, json=payload)
            response.raise_for_status()
            result = response.json()
            return result.get("result", {})
        except Exception as e:
            logger.error(f"Failed to get transaction status: {e}")
            return {}
    
    async def get_block_number(self) -> int:
        """Get current block number"""
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "starknet_blockNumber",
            "params": []
        }
        
        try:
            response = await self.client.post(self.rpc_url, json=payload)
            response.raise_for_status()
            result = response.json()
            return result.get("result", 0)
        except Exception as e:
            logger.error(f"Failed to get block number: {e}")
            return 0
    
    def _get_selector_from_name(self, name: str) -> int:
        """Convert function name to selector (simplified)"""
        # In production, use starknet.keccak
        import hashlib
        hash_bytes = hashlib.sha3_256(name.encode()).digest()
        return int.from_bytes(hash_bytes[:31], 'big')
    
    # High-level game methods (would be implemented with full starknet.py in production)
    async def create_game(self, player_white: str, config: Dict[str, Any]) -> int:
        """Create a new game - placeholder for production implementation"""
        logger.info(f"Would create game for {player_white}")
        # In production: invoke contract with starknet.py
        return 0
    
    async def join_game(self, game_id: int, player_black: str):
        """Join a game - placeholder"""
        logger.info(f"Would join game {game_id} as {player_black}")
    
    async def make_move(self, game_id: int, move: Dict[str, Any]) -> Dict[str, Any]:
        """Make a move - placeholder"""
        logger.info(f"Would make move in game {game_id}")
        return {"success": True, "is_capture": False}
    
    async def get_game_state(self, game_id: int) -> Dict[str, Any]:
        """Get game state - placeholder"""
        return {
            "id": game_id,
            "status": "pending",
        }
