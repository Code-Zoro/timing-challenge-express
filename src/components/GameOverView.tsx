
import React from 'react';
import { useGameStore } from '../services/socketService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, ArrowRightCircle } from 'lucide-react';
import Leaderboard from './Leaderboard';

const GameOverView: React.FC = () => {
  const { finalScores, username, setReady } = useGameStore();

  // Format time for display
  const formatTime = (time: number) => {
    return `${time}ms`;
  };

  // Find the current player's result
  const playerResult = finalScores.find(player => player.username === username);

  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Game Over</h2>
        <p className="text-muted-foreground">
          Final results are in! See how you performed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        <div className="space-y-6">
          <Leaderboard />
          
          {playerResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Medal className="mr-2 h-5 w-5" />
                  Your Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Final Score:</span>
                    <span className="font-bold">{playerResult.score} points</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Best Time:</span>
                    <span>{formatTime(playerResult.bestTime || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rank:</span>
                    <span>{finalScores.findIndex(p => p.username === username) + 1} of {finalScores.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Leaderboard global={true} />
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
