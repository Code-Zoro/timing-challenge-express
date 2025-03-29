
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Set up Express
const app = express();
const server = http.createServer(app);

// Set up Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Set up SQLite database
const db = new sqlite3.Database(':memory:'); // In-memory database for development
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS leaderboard (
    id TEXT PRIMARY KEY,
    username TEXT,
    best_time INTEGER,
    games_played INTEGER,
    last_played TEXT
  )`);
});

// Game state
const rooms = {};
const players = {};

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // Handle player joining
  socket.on('join_game', (username) => {
    players[socket.id] = {
      id: socket.id,
      username: username || `Player_${socket.id.substr(0, 5)}`,
      room: null,
      ready: false,
      score: 0,
      bestTime: null
    };
    
    console.log(`${players[socket.id].username} joined the game`);
    
    // Get or create a room with less than 4 players
    let roomId = null;
    for (const id in rooms) {
      if (Object.keys(rooms[id].players).length < 4) {
        roomId = id;
        break;
      }
    }
    
    if (!roomId) {
      roomId = 'room_' + Date.now();
      rooms[roomId] = {
        id: roomId,
        status: 'waiting',
        players: {},
        startTime: null,
        targetTime: null,
        results: {}
      };
    }
    
    // Join the room
    socket.join(roomId);
    players[socket.id].room = roomId;
    rooms[roomId].players[socket.id] = players[socket.id];
    
    // Notify all clients in the room
    io.to(roomId).emit('player_joined', {
      playerId: socket.id,
      username: players[socket.id].username,
      players: Object.values(rooms[roomId].players),
      roomStatus: rooms[roomId].status
    });
  });
  
  // Handle player ready
  socket.on('player_ready', () => {
    const player = players[socket.id];
    if (!player || !player.room) return;
    
    const room = rooms[player.room];
    if (!room) return;
    
    player.ready = true;
    
    // Check if all players are ready
    const allReady = Object.values(room.players).every(p => p.ready);
    if (allReady && Object.keys(room.players).length >= 2) {
      startGame(room);
    } else {
      io.to(player.room).emit('player_status', {
        playerId: socket.id,
        ready: true,
        players: Object.values(room.players)
      });
    }
  });
  
  // Handle player click
  socket.on('player_click', (timestamp) => {
    const player = players[socket.id];
    if (!player || !player.room) return;
    
    const room = rooms[player.room];
    if (!room || room.status !== 'started' || !room.targetTime) return;
    
    // Calculate reaction time
    const reactionTime = timestamp - room.startTime;
    const targetTime = room.targetTime;
    const accuracy = Math.abs(reactionTime - targetTime);
    
    // Save result
    room.results[socket.id] = { 
      reactionTime,
      accuracy,
      score: calculateScore(accuracy)
    };
    
    player.score += room.results[socket.id].score;
    
    // Check if all players have clicked
    if (Object.keys(room.results).length === Object.keys(room.players).length) {
      endRound(room);
    } else {
      // Notify the player of their result
      socket.emit('click_result', {
        reactionTime,
        accuracy,
        score: room.results[socket.id].score,
        targetTime
      });
    }
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    const player = players[socket.id];
    if (player && player.room) {
      const room = rooms[player.room];
      if (room) {
        delete room.players[socket.id];
        
        // If room is empty, delete it
        if (Object.keys(room.players).length === 0) {
          delete rooms[player.room];
        } else {
          // Notify remaining players
          io.to(player.room).emit('player_left', {
            playerId: socket.id,
            players: Object.values(room.players)
          });
          
          // If game was started and not enough players, end game
          if (room.status === 'started' && Object.keys(room.players).length < 2) {
            room.status = 'waiting';
            io.to(player.room).emit('game_ended', {
              reason: 'Not enough players',
              players: Object.values(room.players)
            });
          }
        }
      }
    }
    
    // Update leaderboard if player had a score
    if (player && player.username && player.bestTime) {
      updateLeaderboard(player);
    }
    
    delete players[socket.id];
    console.log('User disconnected:', socket.id);
  });
});

// Start a game in a room
function startGame(room) {
  room.status = 'countdown';
  room.round = 1;
  
  // Reset player scores
  Object.values(room.players).forEach(player => {
    player.score = 0;
    player.ready = false;
  });
  
  // Notify all players
  io.to(room.id).emit('game_starting', {
    countdown: 3,
    players: Object.values(room.players)
  });
  
  // Start countdown
  setTimeout(() => {
    startRound(room);
  }, 3000);
}

// Start a round
function startRound(room) {
  room.status = 'started';
  room.results = {};
  
  // Random wait between 1-5 seconds
  const waitTime = 1000 + Math.random() * 4000;
  
  // Random target time between 200-1000ms
  const targetTime = 200 + Math.random() * 800;
  
  // Start time and target time
  room.startTime = Date.now() + waitTime;
  room.targetTime = targetTime;
  
  // Send target to players
  io.to(room.id).emit('round_started', {
    round: room.round,
    waitTime,
    targetTime
  });
}

// End a round and show results
function endRound(room) {
  room.status = 'results';
  
  // Calculate ranking
  const results = Object.entries(room.results).map(([playerId, result]) => ({
    playerId,
    username: room.players[playerId].username,
    ...result
  }));
  
  results.sort((a, b) => a.accuracy - b.accuracy);
  
  // Update best times
  results.forEach(result => {
    const player = players[result.playerId];
    if (!player) return;
    
    if (!player.bestTime || result.accuracy < player.bestTime) {
      player.bestTime = result.accuracy;
    }
  });
  
  // Send results to players
  io.to(room.id).emit('round_ended', {
    results,
    scores: Object.values(room.players).map(p => ({
      playerId: p.id,
      username: p.username,
      score: p.score
    })).sort((a, b) => b.score - a.score)
  });
  
  // Start next round or end game
  room.round++;
  if (room.round <= 5) {
    setTimeout(() => {
      startRound(room);
    }, 5000);
  } else {
    endGame(room);
  }
}

// End the game
function endGame(room) {
  room.status = 'ended';
  
  // Calculate final results
  const finalScores = Object.values(room.players).map(p => ({
    playerId: p.id,
    username: p.username,
    score: p.score,
    bestTime: p.bestTime
  })).sort((a, b) => b.score - a.score);
  
  // Update leaderboard
  finalScores.forEach(player => {
    if (players[player.playerId]) {
      updateLeaderboard(players[player.playerId]);
    }
  });
  
  // Send final results to players
  io.to(room.id).emit('game_ended', {
    finalScores,
    leaderboard: getTopPlayers(10)
  });
  
  // Reset room after 10 seconds
  setTimeout(() => {
    if (rooms[room.id]) {
      room.status = 'waiting';
      room.round = 0;
      room.startTime = null;
      room.targetTime = null;
      room.results = {};
      
      Object.values(room.players).forEach(p => {
        p.ready = false;
        p.score = 0;
      });
      
      io.to(room.id).emit('room_reset', {
        roomStatus: 'waiting',
        players: Object.values(room.players)
      });
    }
  }, 10000);
}

// Calculate score based on accuracy
function calculateScore(accuracy) {
  if (accuracy <= 50) {
    return 100;
  } else if (accuracy <= 100) {
    return 80;
  } else if (accuracy <= 200) {
    return 60;
  } else if (accuracy <= 300) {
    return 40;
  } else if (accuracy <= 500) {
    return 20;
  } else {
    return 10;
  }
}

// Update leaderboard
function updateLeaderboard(player) {
  const now = new Date().toISOString();
  
  db.get('SELECT * FROM leaderboard WHERE id = ?', [player.id], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return;
    }
    
    if (row) {
      // Update existing player
      if (!row.best_time || player.bestTime < row.best_time) {
        db.run(
          'UPDATE leaderboard SET best_time = ?, games_played = games_played + 1, last_played = ? WHERE id = ?',
          [player.bestTime, now, player.id]
        );
      } else {
        db.run(
          'UPDATE leaderboard SET games_played = games_played + 1, last_played = ? WHERE id = ?',
          [now, player.id]
        );
      }
    } else {
      // Insert new player
      db.run(
        'INSERT INTO leaderboard (id, username, best_time, games_played, last_played) VALUES (?, ?, ?, ?, ?)',
        [player.id, player.username, player.bestTime, 1, now]
      );
    }
  });
}

// Get top players from leaderboard
function getTopPlayers(limit) {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT username, best_time, games_played FROM leaderboard ORDER BY best_time ASC LIMIT ?',
      [limit],
      (err, rows) => {
        if (err) {
          console.error('Database error:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
}

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
