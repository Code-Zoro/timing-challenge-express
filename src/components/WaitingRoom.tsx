
import React from 'react';
import { useGameStore, Player } from '../services/socketService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClockIcon, UserIcon, CheckCircleIcon } from 'lucide-react';

const WaitingRoom: React.FC = () => {
  const { players, setReady, username } = useGameStore();
  
  const currentPlayer = players.find(p => p.username === username);
  const isReady = currentPlayer?.ready || false;
  
  return (
    <div className="flex flex-col h-full items-center justify-center max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Waiting Room</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Players ({players.length}/4)
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                <h3 className="font-semibold mb-1">How to Play:</h3>
                <p className="text-sm text-muted-foreground">
                  Click the target when it turns green. Your goal is to click as close as possible
                  to the specified target time.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-1">Game Format:</h3>
                <p className="text-sm text-muted-foreground">
                  5 rounds per game. Points are awarded based on how close your timing is to the target.
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
              Ready!
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
