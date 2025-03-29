
import React from 'react';
import { useGameStore } from '../services/socketService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, Clock, ArrowRightCircle } from 'lucide-react';

const GameOverView: React.FC = () => {
  const { finalScores, leaderboard, username, setReady } = useGameStore();

  // Format time for display
  const formatTime = (time: number) => {
    return `${time}ms`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Game Over</h2>
        <p className="text-muted-foreground">
          Final results are in! See how you performed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="mr-2 h-5 w-5 text-game-yellow" />
              Game Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {finalScores.slice(0, 3).map((player, index) => (
                <div 
                  key={player.playerId} 
                  className={`flex items-center p-3 rounded-md ${
                    index === 0 ? 'bg-game-yellow bg-opacity-20' : 
                    index === 1 ? 'bg-secondary' : 
                    index === 2 ? 'bg-game-blue bg-opacity-10' : ''
                  }`}
                >
                  <div className="mr-3">
                    {index === 0 ? (
                      <Trophy className="h-8 w-8 text-game-yellow" />
                    ) : index === 1 ? (
                      <Medal className="h-7 w-7 text-muted-foreground" />
                    ) : (
                      <Medal className="h-6 w-6 text-game-blue" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-lg">
                      {player.username}
                      {player.username === username && (
                        <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Best time: {formatTime(player.bestTime)}
                    </div>
                  </div>
                  <div className="text-xl font-bold">
                    {player.score}
                    <span className="text-sm ml-1">pts</span>
                  </div>
                </div>
              ))}

              {finalScores.slice(3).map((player, index) => (
                <div key={player.playerId} className="flex items-center p-2">
                  <div className="w-8 text-center text-muted-foreground mr-3">
                    {index + 4}.
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">
                      {player.username}
                      {player.username === username && (
                        <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-lg font-semibold">
                    {player.score}
                    <span className="text-sm ml-1">pts</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Global Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length > 0 ? (
              <div className="space-y-4">
                {leaderboard.map((entry, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-8 text-center text-muted-foreground">
                      {index + 1}.
                    </div>
                    <div className="flex-1 font-medium">
                      {entry.username}
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground mr-2">Best:</span>
                      <span className="font-semibold">{formatTime(entry.best_time)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No leaderboard data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex justify-center">
        <Button size="lg" onClick={setReady} className="px-8">
          Play Again
          <ArrowRightCircle className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default GameOverView;
