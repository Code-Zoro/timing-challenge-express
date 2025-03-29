
import React, { useEffect, useState } from 'react';
import { useGameStore } from '../services/socketService';
import ColorRound from './ColorRound';
import FontRound from './FontRound';
import { Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const GameArea: React.FC = () => {
  const { 
    gameStatus, 
    currentRound, 
    totalRounds,
    waitTime,
    targetTime,
    startTime
  } = useGameStore();
  
  const [countdown, setCountdown] = useState<number | null>(3);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [showTargetTime, setShowTargetTime] = useState<boolean>(false);
  
  // Handle countdown
  useEffect(() => {
    if (gameStatus === 'countdown') {
      setCountdown(3);
      
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [gameStatus]);
  
  // Handle timer for rounds
  useEffect(() => {
    if ((gameStatus === 'color_round' || gameStatus === 'font_round') && startTime) {
      const timer = setInterval(() => {
        const now = Date.now();
        if (now >= startTime) {
          setElapsedTime(now - startTime);
          setShowTargetTime(true);
        } else {
          setElapsedTime(0);
          setShowTargetTime(false);
        }
      }, 10);
      
      return () => clearInterval(timer);
    } else {
      setElapsedTime(0);
      setShowTargetTime(false);
    }
  }, [gameStatus, startTime]);
  
  if (gameStatus === 'countdown' && countdown !== null) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold mb-8">Get Ready!</h2>
        <div className="text-6xl font-bold animate-countdown">{countdown}</div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div className="font-semibold">
          Round {currentRound} of {totalRounds}
        </div>
        
        {(gameStatus === 'color_round' || gameStatus === 'font_round') && (
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{elapsedTime.toFixed(0)}ms</span>
            {showTargetTime && (
              <span className="text-xs text-muted-foreground">
                (Target: {targetTime.toFixed(0)}ms)
              </span>
            )}
          </div>
        )}
      </div>
      
      {(gameStatus === 'color_round' || gameStatus === 'font_round') && startTime > Date.now() && (
        <div className="mb-4">
          <div className="text-sm mb-1">Waiting for round to start...</div>
          <Progress value={(1 - ((startTime - Date.now()) / waitTime)) * 100} />
        </div>
      )}
      
      <div className="flex-1">
        {gameStatus === 'color_round' && <ColorRound />}
        {gameStatus === 'font_round' && <FontRound />}
        {gameStatus === 'started' && (
          <div className="flex items-center justify-center h-full">
            <Clock className="w-8 h-8 mr-2" />
            <span className="text-xl">Starting round...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameArea;
