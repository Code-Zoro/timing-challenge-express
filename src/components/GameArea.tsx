
import React, { useEffect, useState } from 'react';
import { useGameStore } from '../services/socketService';
import ColorRound from './ColorRound';
import FontRound from './FontRound';
import { CircleOff, Clock } from 'lucide-react';

const GameArea: React.FC = () => {
  const { 
    gameStatus, 
    currentRound, 
    totalRounds,
  } = useGameStore();
  
  const [countdown, setCountdown] = useState<number | null>(3);
  
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
      </div>
      
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
