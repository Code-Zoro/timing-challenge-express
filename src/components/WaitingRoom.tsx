
import React from 'react';
import { useGameStore, Player } from '../services/socketService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClockIcon, UserIcon, CheckCircleIcon, UsersIcon } from 'lucide-react';

const WaitingRoom: React.FC = () => {
  const { players, setReady, username, roomId, createRoom, joinRoom } = useGameStore();
  
  const currentPlayer = players.find(p => p.username === username);
  const isReady = currentPlayer?.ready || false;
  
  return (
    <div className="flex flex-col h-full items-center justify-center max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Game Lobby</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5" />
              Room: {roomId || 'Joining...'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Players ({players.length}/4)</h3>
              <ul className="space-y-2">
                {players.length === 0 ? (
                  <li className="text-muted-foreground italic">No players have joined yet</li>
                ) : (
                  players.map((player: Player) => (
                    <li key={player.id} className="flex items-center justify-between p-2 rounded bg-secondary">
                      <span className="font-medium">{player.username}</span>
                      {player.ready ? (
                        <Badge variant="secondary" className="bg-game-green text-white">Ready</Badge>
                      ) : (
                        <Badge variant="outline">Not Ready</Badge>
                      )}
                    </li>
                  ))
                )}
              </ul>
              
              {players.length < 2 && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Waiting for more players to join...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              Game Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">Game Rounds:</h3>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  <li>
                    <span className="font-medium">Color Round:</span> Click when you see the specified color
                  </li>
                  <li>
                    <span className="font-medium">Font Round:</span> Identify the correct font style
                  </li>
                  <li>
                    <span className="font-medium">Final Scores:</span> Compare your performance with others
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-1">How to Win:</h3>
                <p className="text-sm text-muted-foreground">
                  Points are awarded based on your reaction time and accuracy in each round.
                  The player with the most points at the end wins!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-center w-full">
        <Button 
          size="lg" 
          onClick={setReady}
          disabled={isReady}
          className={`px-8 ${isReady ? 'bg-game-green hover:bg-game-green' : ''}`}
        >
          {isReady ? (
            <>
              <CheckCircleIcon className="mr-2 h-5 w-5" />
              Ready to Play!
            </>
          ) : (
            'I\'m Ready'
          )}
        </Button>
      </div>
      
      {isReady && (
        <p className="mt-4 text-sm text-muted-foreground">
          Waiting for other players to be ready...
        </p>
      )}
    </div>
  );
};

export default WaitingRoom;
