
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '../services/socketService';
import { Input } from '@/components/ui/input';
import { colorDistance } from '../utils/gameUtils';

declare global {
  interface Window {
    Coloris: any;
  }
}

const ColorRound: React.FC = () => {
  const { 
    targetTime, 
    gameStatus,
    handleClick,
    waitTime,
    startTime
  } = useGameStore();
  
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [targetColor, setTargetColor] = useState('#ffffff');
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  
  // Initialize Coloris when component mounts
  useEffect(() => {
    if (window.Coloris) {
      window.Coloris.init();
      window.Coloris({
        el: '.coloris',
        theme: 'large',
        themeMode: 'light',
        formatToggle: true,
        closeButton: true,
        clearButton: true,
        swatches: [
          '#264653',
          '#2a9d8f',
          '#e9c46a',
          '#f4a261',
          '#e76f51',
          '#d62828',
          '#023e8a',
          '#0077b6',
          '#0096c7',
          '#00b4d8',
          '#48cae4',
        ]
      });
    }
  }, []);
  
  // Handle round start
  useEffect(() => {
    if (gameStatus === 'color_round' && !isActive) {
      // Generate random target color
      const randomColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
      setTargetColor(randomColor);
      setSelectedColor('#ffffff');
      setHasSubmitted(false);
      setAccuracy(null);
      
      // Set the target to be active after the wait time
      const timer = setTimeout(() => {
        setIsActive(true);
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
        clearTimeout(timer);
        clearInterval(countdownInterval);
      };
    }
  }, [gameStatus, waitTime, startTime]);
  
  const handleSubmit = () => {
    if (!isActive || hasSubmitted) return;
    
    // Calculate color accuracy (distance)
    const distance = colorDistance(targetColor, selectedColor);
    setAccuracy(distance);
    setHasSubmitted(true);
    setIsActive(false);
    
    // Send to server
    handleClick();
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-2xl font-bold mb-8">Color Round</h2>
      
      {!isActive && !hasSubmitted && (
        <div className="text-center mb-8">
          <div className="text-xl font-semibold mb-2">Get ready...</div>
          <div className="text-3xl font-bold">{timeLeft}</div>
        </div>
      )}
      
      {isActive && (
        <div className="w-full max-w-md mb-8 space-y-6">
          <div 
            className="w-full h-32 rounded-lg shadow-lg mb-4" 
            style={{ backgroundColor: targetColor }}
          />
          
          <div className="text-center font-medium text-lg">
            Try to match this color!
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <Input 
                  type="text" 
                  className="coloris" 
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                />
              </div>
              <div 
                className="w-12 h-12 rounded-md shadow-md border" 
                style={{ backgroundColor: selectedColor }}
              />
            </div>
            
            <Button 
              onClick={handleSubmit}
              size="lg"
              className="w-full"
            >
              Submit Color
            </Button>
          </div>
        </div>
      )}
      
      {hasSubmitted && accuracy !== null && (
        <div className="text-center">
          <div className="mb-6 flex items-center gap-6">
            <div>
              <div className="text-sm font-medium mb-1">Target</div>
              <div 
                className="w-24 h-24 rounded-md shadow-md" 
                style={{ backgroundColor: targetColor }}
              />
              <div className="text-sm mt-1">{targetColor}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium mb-1">Your Color</div>
              <div 
                className="w-24 h-24 rounded-md shadow-md" 
                style={{ backgroundColor: selectedColor }}
              />
              <div className="text-sm mt-1">{selectedColor}</div>
            </div>
          </div>
          
          <div className="text-lg font-medium">
            Color Distance: <span className="font-bold">{Math.round(accuracy)}</span>
            <p className="text-sm text-muted-foreground mt-1">
              (Lower is better)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorRound;
