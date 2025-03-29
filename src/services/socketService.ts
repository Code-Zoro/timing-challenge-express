import { io, Socket } from 'socket.io-client';
import { create } from 'zustand';

// Define types
export type Player = {
  id: string;
  username: string;
  ready: boolean;
  score: number;
  bestTime?: number;
};

export type GameState = {
  connected: boolean;
  roomId: string | null;
  players: Player[];
  gameStatus: 'waiting' | 'lobby' | 'color_round' | 'font_round' | 'scores' | 'ended';
  currentRound: number;
  totalRounds: number;
  waitTime: number;
  targetTime: number;
  startTime: number;
  results: any[];
  scores: any[];
  finalScores: any[];
  leaderboard: any[];
  error: string | null;
  latestClick: {
    reactionTime: number;
    accuracy: number;
    score: number;
  } | null;
};

export type GameStore = GameState & {
  socket: Socket | null;
  username: string;
  connect: () => void;
  disconnect: () => void;
  joinGame: (username: string) => void;
  createRoom: () => void;
  joinRoom: (roomId: string) => void;
  setReady: () => void;
  handleClick: () => void;
  resetGame: () => void;
  setUsername: (username: string) => void;
};

// Create socket store
export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  socket: null,
  connected: false,
  username: '',
  roomId: null,
  players: [],
  gameStatus: 'lobby',
  currentRound: 0,
  totalRounds: 5,
  waitTime: 0,
  targetTime: 0,
  startTime: 0,
  results: [],
  scores: [],
  finalScores: [],
  leaderboard: [],
  error: null,
  latestClick: null,

  // Actions
  connect: () => {
    const socket = io('http://localhost:3001');
    
    socket.on('connect', () => {
      set({ socket, connected: true, error: null });
      console.log('Connected to server with ID:', socket.id);
    });
    
    socket.on('connect_error', (error) => {
      set({ error: 'Failed to connect to server' });
      console.error('Connection error:', error);
    });
    
    socket.on('player_joined', (data) => {
      set({ 
        roomId: data.roomId,
        players: data.players,
        gameStatus: data.roomStatus 
      });
    });
    
    socket.on('player_status', (data) => {
      set({ players: data.players });
    });
    
    socket.on('player_left', (data) => {
      set({ players: data.players });
    });
    
    socket.on('game_starting', (data) => {
      set({ 
        gameStatus: 'color_round',
        players: data.players,
        latestClick: null
      });
    });
    
    socket.on('round_started', (data) => {
      set({ 
        gameStatus: data.roundType || 'color_round',
        currentRound: data.round,
        waitTime: data.waitTime,
        targetTime: data.targetTime,
        startTime: Date.now() + data.waitTime,
        latestClick: null
      });
    });
    
    socket.on('click_result', (data) => {
      set({ 
        latestClick: {
          reactionTime: data.reactionTime,
          accuracy: data.accuracy,
          score: data.score
        }
      });
    });
    
    socket.on('round_ended', (data) => {
      set({ 
        gameStatus: data.nextRound === 'font_round' ? 'font_round' : 'scores',
        results: data.results,
        scores: data.scores
      });
    });
    
    socket.on('game_ended', (data) => {
      set({ 
        gameStatus: 'ended',
        finalScores: data.finalScores,
        leaderboard: data.leaderboard || []
      });
    });
    
    socket.on('room_reset', (data) => {
      set({ 
        gameStatus: data.roomStatus,
        players: data.players
      });
    });
    
    socket.on('disconnect', () => {
      set({ connected: false });
    });
    
    set({ socket });
  },
  
  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ 
        socket: null,
        connected: false,
        roomId: null,
        players: [],
        gameStatus: 'lobby'
      });
    }
  },
  
  joinGame: (username: string) => {
    const { socket } = get();
    if (socket && socket.connected) {
      socket.emit('join_game', username);
      set({ username });
    }
  },

  createRoom: () => {
    const { socket } = get();
    if (socket && socket.connected) {
      socket.emit('create_room');
    }
  },

  joinRoom: (roomId: string) => {
    const { socket } = get();
    if (socket && socket.connected) {
      socket.emit('join_room', roomId);
    }
  },
  
  setReady: () => {
    const { socket } = get();
    if (socket && socket.connected) {
      socket.emit('player_ready');
    }
  },
  
  handleClick: () => {
    const { socket, gameStatus } = get();
    if (socket && socket.connected && (gameStatus === 'color_round' || gameStatus === 'font_round')) {
      socket.emit('player_click', Date.now());
    }
  },
  
  resetGame: () => {
    set({
      currentRound: 0,
      results: [],
      scores: [],
      finalScores: [],
      latestClick: null
    });
  },
  
  setUsername: (username: string) => {
    set({ username });
  }
}));
