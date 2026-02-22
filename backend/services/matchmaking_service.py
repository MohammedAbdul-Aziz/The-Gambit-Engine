"""
Matchmaking Service - Handles player matchmaking and queue management
"""

import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
import logging
import random

from models.schemas import OpponentType, MatchmakingRequest, MatchFound, QueueStatus, PieceColor

logger = logging.getLogger(__name__)


@dataclass
class QueuedPlayer:
    """Player waiting in matchmaking queue"""
    player_address: str
    elo: int
    preferred_opponent: OpponentType
    queued_at: datetime
    min_elo: int = 0
    max_elo: int = 3000
    
    def wait_time(self) -> float:
        """Get time waiting in seconds"""
        return (datetime.utcnow() - self.queued_at).total_seconds()


@dataclass
class MatchResult:
    """Result of a matchmaking attempt"""
    player1: str
    player2: str
    player1_elo: int
    player2_elo: int
    game_id: int
    is_bot_match: bool = False
    bot_level: Optional[int] = None


class MatchmakingService:
    """Service for managing player matchmaking"""
    
    # ELO range for matching (± this value)
    ELO_RANGE = 200
    
    # Maximum wait time before expanding ELO range
    MAX_WAIT_EXPAND_TIME = 30  # seconds
    
    # ELO range expansion rate
    ELO_EXPAND_RATE = 50  # additional ELO per expansion
    
    def __init__(self):
        # Queue organized by opponent type
        self.human_queue: Dict[int, QueuedPlayer] = {}  # elo -> player
        self.ai_queue: Dict[int, QueuedPlayer] = {}
        self.any_queue: Dict[int, QueuedPlayer] = {}
        
        # Player lookup by address
        self.player_lookup: Dict[str, int] = {}  # address -> elo bucket
        
        # Active matches
        self.active_games: Dict[int, MatchResult] = {}
        
        # Bot configurations
        self.bot_configs = self._init_bot_configs()
        
        # Lock for thread safety
        self._lock = asyncio.Lock()
        
        # Background task for matchmaking
        self._match_task: Optional[asyncio.Task] = None
        
    def _init_bot_configs(self) -> Dict[int, Dict]:
        """Initialize bot difficulty configurations"""
        return {
            1: {"elo": 400, "aggression": 10, "error_rate": 30},
            2: {"elo": 600, "aggression": 15, "error_rate": 25},
            3: {"elo": 800, "aggression": 20, "error_rate": 20},
            4: {"elo": 1000, "aggression": 25, "error_rate": 15},
            5: {"elo": 1200, "aggression": 30, "error_rate": 12},
            6: {"elo": 1400, "aggression": 35, "error_rate": 10},
            7: {"elo": 1600, "aggression": 40, "error_rate": 8},
            8: {"elo": 1800, "aggression": 45, "error_rate": 6},
            9: {"elo": 2000, "aggression": 50, "error_rate": 4},
            10: {"elo": 2200, "aggression": 55, "error_rate": 2},
        }
    
    async def start(self):
        """Start the matchmaking service"""
        self._match_task = asyncio.create_task(self._matchmaking_loop())
        logger.info("Matchmaking service started")
    
    async def shutdown(self):
        """Shutdown the matchmaking service"""
        if self._match_task:
            self._match_task.cancel()
            try:
                await self._match_task
            except asyncio.CancelledError:
                pass
        logger.info("Matchmaking service stopped")
    
    async def queue_player(self, request: MatchmakingRequest) -> QueueStatus:
        """Add a player to the matchmaking queue"""
        async with self._lock:
            # Determine which queue to use
            queue = self._get_queue(request.preferred_opponent)
            
            # Create ELO bucket (round to nearest 100)
            elo_bucket = round(request.player_elo / 100) * 100
            
            player = QueuedPlayer(
                player_address=request.player,
                elo=request.player_elo,
                preferred_opponent=request.preferred_opponent,
                queued_at=datetime.utcnow(),
                min_elo=request.min_elo,
                max_elo=request.max_elo,
            )
            
            # Add to queue
            queue[elo_bucket] = player
            self.player_lookup[request.player] = elo_bucket
            
            logger.info(f"Player {request.player} queued (ELO: {request.player_elo})")
            
            return QueueStatus(
                is_queued=True,
                queue_position=self._get_queue_position(player),
                estimated_wait_seconds=self._estimate_wait_time(request.preferred_opponent),
                preferred_opponent=request.preferred_opponent,
            )
    
    async def cancel_queue(self, player_address: str) -> bool:
        """Remove a player from the matchmaking queue"""
        async with self._lock:
            if player_address not in self.player_lookup:
                return False
            
            elo_bucket = self.player_lookup[player_address]
            
            # Remove from all queues
            for queue in [self.human_queue, self.ai_queue, self.any_queue]:
                queue.pop(elo_bucket, None)
            
            del self.player_lookup[player_address]
            logger.info(f"Player {player_address} left queue")
            
            return True
    
    async def get_queue_status(self, player_address: str) -> Optional[QueueStatus]:
        """Get current queue status for a player"""
        if player_address not in self.player_lookup:
            return None
        
        async with self._lock:
            elo_bucket = self.player_lookup[player_address]
            
            # Find player in queues
            player = None
            queue_type = OpponentType.ANY
            
            for queue_name, queue in [
                ("human", self.human_queue),
                ("ai", self.ai_queue),
                ("any", self.any_queue),
            ]:
                if elo_bucket in queue:
                    player = queue[elo_bucket]
                    queue_type = OpponentType(queue_name)
                    break
            
            if not player:
                return None
            
            return QueueStatus(
                is_queued=True,
                queue_position=self._get_queue_position(player),
                estimated_wait_seconds=self._estimate_wait_time(queue_type),
                preferred_opponent=queue_type,
            )
    
    def _get_queue(self, opponent_type: OpponentType) -> Dict[int, QueuedPlayer]:
        """Get the appropriate queue for opponent type"""
        if opponent_type == OpponentType.HUMAN:
            return self.human_queue
        elif opponent_type == OpponentType.AI:
            return self.ai_queue
        else:
            return self.any_queue
    
    def _get_queue_position(self, player: QueuedPlayer) -> int:
        """Calculate player's position in queue"""
        # Simple implementation - count players with similar ELO who queued earlier
        queue = self._get_queue(player.preferred_opponent)
        position = 1
        
        for elo_bucket, queued in queue.items():
            if abs(elo_bucket - player.elo) <= self.ELO_RANGE:
                if queued.queued_at < player.queued_at:
                    position += 1
        
        return position
    
    def _estimate_wait_time(self, opponent_type: OpponentType) -> int:
        """Estimate wait time in seconds"""
        queue = self._get_queue(opponent_type)
        queue_size = len(queue)
        
        if queue_size == 0:
            return 5
        elif queue_size < 5:
            return 15
        elif queue_size < 10:
            return 30
        else:
            return 60
    
    async def _matchmaking_loop(self):
        """Background loop to process matchmaking"""
        while True:
            try:
                await asyncio.sleep(2)  # Check every 2 seconds
                await self._process_matches()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Matchmaking loop error: {e}")
    
    async def _process_matches(self):
        """Try to create matches from queued players"""
        async with self._lock:
            # Process human queue
            await self._match_players(self.human_queue, OpponentType.HUMAN)
            
            # Process any queue (can match with humans or bots)
            await self._match_players(self.any_queue, OpponentType.ANY)
            
            # Process AI queue (always match with bot)
            await self._match_ai_players()
    
    async def _match_players(
        self,
        queue: Dict[int, QueuedPlayer],
        queue_type: OpponentType,
    ):
        """Try to match players in a queue"""
        to_remove = []
        
        for elo_bucket, player in list(queue.items()):
            if player in to_remove:
                continue
                
            # Expand ELO range based on wait time
            wait_time = player.wait_time()
            expanded_range = self.ELO_RANGE
            if wait_time > self.MAX_WAIT_EXPAND_TIME:
                expansions = int((wait_time - self.MAX_WAIT_EXPAND_TIME) / 10)
                expanded_range += expansions * self.ELO_EXPAND_RATE
            
            # Find potential match
            for other_bucket, other_player in list(queue.items()):
                if other_player == player or other_player in to_remove:
                    continue
                
                # Check ELO compatibility
                if abs(other_player.elo - player.elo) <= expanded_range:
                    # Create match
                    await self._create_match(player, other_player, is_bot=False)
                    to_remove.extend([player, other_player])
                    break
            
            # If no human match and queue_type is ANY, try bot match
            if queue_type == OpponentType.ANY and player not in to_remove:
                if player.wait_time() > 10:  # Wait at least 10 seconds for human
                    await self._create_bot_match(player)
                    to_remove.append(player)
        
        # Remove matched players
        for player in to_remove:
            elo_bucket = round(player.elo / 100) * 100
            queue.pop(elo_bucket, None)
            self.player_lookup.pop(player.player_address, None)
    
    async def _match_ai_players(self):
        """Match AI queue players with bots immediately"""
        to_remove = []
        
        for elo_bucket, player in list(self.ai_queue.items()):
            await self._create_bot_match(player)
            to_remove.append(player)
        
        for player in to_remove:
            elo_bucket = round(player.elo / 100) * 100
            self.ai_queue.pop(elo_bucket, None)
            self.player_lookup.pop(player.player_address, None)
    
    async def _create_match(
        self,
        player1: QueuedPlayer,
        player2: QueuedPlayer,
        is_bot: bool = False,
        bot_level: Optional[int] = None,
    ):
        """Create a match between two players"""
        # Generate game ID
        game_id = self._generate_game_id()
        
        # Determine colors (higher ELO plays white)
        if player1.elo >= player2.elo:
            white_player = player1.player_address
            black_player = player2.player_address
            white_color = PieceColor.WHITE
        else:
            white_player = player2.player_address
            black_player = player1.player_address
            white_color = PieceColor.BLACK
        
        match = MatchResult(
            player1=white_player,
            player2=black_player,
            player1_elo=player1.elo if white_player == player1.player_address else player2.elo,
            player2_elo=player2.elo if black_player == player2.player_address else player1.elo,
            game_id=game_id,
            is_bot_match=is_bot,
            bot_level=bot_level,
        )
        
        self.active_games[game_id] = match
        
        logger.info(f"Match created: Game {game_id} - {white_player} vs {black_player}")
    
    async def _create_bot_match(self, player: QueuedPlayer):
        """Create a match between player and bot"""
        # Find appropriate bot level
        bot_level = self._find_bot_level(player.elo)
        bot_config = self.bot_configs[bot_level]
        
        # Generate game ID
        game_id = self._generate_game_id()
        
        # Player always plays white against bot
        match = MatchResult(
            player1=player.player_address,
            player2=f"bot_{bot_level}",
            player1_elo=player.elo,
            player2_elo=bot_config["elo"],
            game_id=game_id,
            is_bot_match=True,
            bot_level=bot_level,
        )
        
        self.active_games[game_id] = match
        
        logger.info(f"Bot match created: Game {game_id} - {player.player_address} vs Bot {bot_level}")
    
    def _find_bot_level(self, player_elo: int) -> int:
        """Find appropriate bot level for player's ELO"""
        # Simple linear mapping
        level = max(1, min(10, (player_elo - 200) // 200 + 1))
        return level
    
    def _generate_game_id(self) -> int:
        """Generate unique game ID"""
        import time
        return int(time.time() * 1000) % 10000000000
    
    def get_match_result(self, player_address: str) -> Optional[MatchFound]:
        """Get match result for a player if found"""
        for game_id, match in self.active_games.items():
            if match.player1 == player_address or match.player2 == player_address:
                is_white = match.player1 == player_address
                return MatchFound(
                    game_id=game_id,
                    opponent=match.player2 if is_white else match.player1,
                    opponent_elo=match.player2_elo if is_white else match.player1_elo,
                    is_bot=match.is_bot_match,
                    bot_level=match.bot_level,
                    color=PieceColor.WHITE if is_white else PieceColor.BLACK,
                )
        return None
