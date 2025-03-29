
import React, { useEffect } from 'react';
import { useGameStore } from '../services/socketService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AwardIcon, ClockIcon, TrendingUpIcon } from 'lucide-react';

const ResultsView: React.FC = () => {
  const { results, scores, username, currentRound, totalRounds } = useGameStore();
  
  // Find the current player's result
  const playerResult = results.find(r => r.username === username);
  
  // Sort results by accuracy
  const sortedResults = [...results].sort((a, b) => a.accuracy - b.accuracy);
  
  // Find player's rank
  const playerRank = sortedResults.findIndex(r => r.username === username) + 1;
  
  // Find best accuracy
  const bestAccuracy = sortedResults.length > 0 ? sortedResults[0].accuracy : 0;
  
  // Calculate accuracy percentage (lower is better)
  const calculateAccuracyPercentage = (accuracy: number) => {
    if (bestAccuracy === 0) return 0;
    const maxAccuracy = 500; // Consider 500ms as the worst possible accuracy
    const inverseAccuracy = Math.max(0, maxAccuracy - accuracy);
    return (inverseAccuracy / maxAccuracy) * 100;
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-1">Round {currentRound} Results</h2>
        <p className="text-muted-foreground">Next round starting soon...</p>
      </div>
      
      {playerResult ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ClockIcon className="mr-2 h-5 w-5" />
                Your Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Your Time</span>
                  <span className="text-sm font-medium">{playerResult.reactionTime}ms</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Target Time</span>
                  <span className="text-sm font-medium">{playerResult.targetTime}ms</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Accuracy</span>
                  <span className="text-sm font-medium">{playerResult.accuracy}ms off</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Score</span>
                  <span className="text-sm font-medium">+{playerResult.score} points</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Rank</span>
                  <span className="text-sm font-medium">{playerRank} of {results.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AwardIcon className="mr-2 h-5 w-5" />
                Current Standings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scores.map((player, index) => (
                  <div key={player.playerId} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="w-6 text-muted-foreground">{index + 1}.</span>
                        <span className={`font-medium ${player.username === username ? 'text-primary' : ''}`}>
                          {player.username}
                        </span>
                      </div>
                      <span className="font-semibold">{player.score} pts</span>
                    </div>
                    <Progress value={player.score / Math.max(...scores.map(s => s.score)) * 100} className="h-1" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center text-muted-foreground mb-8">
          No result data available
        </div>
      )}
      
      <div className="flex-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUpIcon className="mr-2 h-5 w-5" />
              Round Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedResults.map((result, index) => (
                <div key={result.playerId} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="w-6 text-muted-foreground">{index + 1}.</span>
                      <span className={`font-medium ${result.username === username ? 'text-primary' : ''}`}>
                        {result.username}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">{result.accuracy}ms</span>
                      <span className="text-muted-foreground ml-1">off target</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={calculateAccuracyPercentage(result.accuracy)} 
                      className="h-1 flex-1" 
                    />
                    <span className="text-xs font-medium whitespace-nowrap">
                      +{result.score} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 text-center text-sm text-muted-foreground">
        {currentRound < totalRounds ? (
          <p>Round {currentRound + 1} starting in a few seconds...</p>
        ) : (
          <p>This was the final round. Game results coming up...</p>
        )}
      </div>
    </div>
  );
};

export default ResultsView;
