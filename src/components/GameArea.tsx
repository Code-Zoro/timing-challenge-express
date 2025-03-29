
import React, { useEffect, useState, useRef } from 'react';
import { useGameStore } from '../services/socketService';
import { Progress } from '@/components/ui/progress';
import { CircleOff, Clock } from 'lucide-react';

const GameArea: React.FC = () => {
  const { 
    gameStatus, 
    currentRound, 
    totalRounds,
    waitTime,
    targetTime,
    startTime,
    handleClick,
    players,
    username
  } = useGameStore();
  
  const [countdown, setCountdown] = useState<number | null>(3);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [targetState, setTargetState] = useState<'waiting' | 'ready' | 'clicked' | 'expired'>('waiting');
  const [targetActive, setTargetActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
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
  
  // Handle round start
  useEffect(() => {
    if (gameStatus === 'started') {
      setTargetState('waiting');
      setTargetActive(false);
      setElapsedTime(0);
      setProgress(0);
      
      // Clear any existing timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Set the target to be active after the wait time
      timeoutRef.current = setTimeout(() => {
        setTargetState('ready');
        setTargetActive(true);
        
        // Start tracking elapsed time
        const startTracking = Date.now();
        intervalRef.current = setInterval(() => {
          const elapsed = Date.now() - startTracking;
          setElapsedTime(elapsed);
          
          // Calculate progress (as percentage of target time)
          const targetMs = targetTime;
          const progressPercent = Math.min(100, (elapsed / targetMs) * 100);
          setProgress(progressPercent);
          
          // If too much time has passed, mark as expired
          if (elapsed > targetMs + 1000) {
            setTargetState('expired');
            setTargetActive(false);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
          }
        }, 10);
      }, waitTime);
      
      // Display countdown to target activation
      const countdownInterval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, startTime - now);
        setTimeLeft(Math.ceil(remaining / 1000));
        
        if (remaining <= 0) {
          clearInterval(countdownInterval);
        }
      }, 100);
      
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        
        clearInterval(countdownInterval);
      };
    }
  }, [gameStatus, startTime, waitTime, targetTime]);
  
  const handleTargetClick = () => {
    if (targetState === 'ready') {
      setTargetState('clicked');
      setTargetActive(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      handleClick();
    }
  };
  
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
        
        <div className="flex gap-4">
          {players.map(player => (
            <div 
              key={player.id} 
              className={`py-1 px-3 rounded-full text-sm font-medium ${
                player.username === username ? 'bg-primary text-primary-foreground' : 'bg-secondary'
              }`}
            >
              {player.username}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center">
        {targetState === 'waiting' && (
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-6 h-6 mr-2" />
              <span className="text-xl font-semibold">Get ready...</span>
            </div>
            <div className="text-3xl font-bold">{timeLeft}</div>
          </div>
        )}
        
        <div className="w-full max-w-md mb-8">
          <h3 className="text-sm font-medium mb-2 flex justify-between">
            <span>Target Timing</span>
            <span>{targetTime}ms</span>
          </h3>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div
          className={`
            w-64 h-64 rounded-full flex items-center justify-center text-2xl font-bold cursor-pointer
            transform transition-all duration-300 game-target
            ${targetState === 'waiting' ? 'bg-game-dark text-white' : ''}
            ${targetState === 'ready' ? 'bg-game-green text-white scale-110 clickable' : ''}
            ${targetState === 'clicked' ? 'bg-game-blue text-white scale-100' : ''}
            ${targetState === 'expired' ? 'bg-game-red text-white' : ''}
          `}
          onClick={handleTargetClick}
        >
          {targetState === 'waiting' && 'Wait...'}
          {targetState === 'ready' && 'CLICK!'}
          {targetState === 'clicked' && (
            <div className="flex flex-col items-center">
              <span>{elapsedTime}ms</span>
            </div>
          )}
          {targetState === 'expired' && (
            <div className="flex flex-col items-center">
              <CircleOff className="w-10 h-10 mb-2" />
              <span>Too Late!</span>
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center">
          {targetState === 'waiting' && (
            <p className="text-muted-foreground">The target will turn green when it's time to click</p>
          )}
          {targetState === 'ready' && (
            <p className="text-game-green font-bold animate-pulse-light">Click now!</p>
          )}
          {targetState === 'clicked' && (
            <p className="text-muted-foreground">
              Your time: <span className="font-bold">{elapsedTime}ms</span>
            </p>
          )}
          {targetState === 'expired' && (
            <p className="text-destructive">You missed the target time</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameArea;
