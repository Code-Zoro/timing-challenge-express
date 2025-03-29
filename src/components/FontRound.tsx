
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '../services/socketService';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const AVAILABLE_FONTS = [
  { name: 'Roboto', family: 'Roboto, sans-serif' },
  { name: 'Open Sans', family: 'Open Sans, sans-serif' },
  { name: 'Lato', family: 'Lato, sans-serif' },
  { name: 'Montserrat', family: 'Montserrat, sans-serif' },
  { name: 'Raleway', family: 'Raleway, sans-serif' },
  { name: 'Poppins', family: 'Poppins, sans-serif' },
  { name: 'Playfair Display', family: 'Playfair Display, serif' },
  { name: 'Merriweather', family: 'Merriweather, serif' },
  { name: 'Ubuntu', family: 'Ubuntu, sans-serif' }
];

const SAMPLE_TEXTS = [
  "The quick brown fox jumps over the lazy dog",
  "Pack my box with five dozen liquor jugs",
  "How vexingly quick daft zebras jump!",
  "Sphinx of black quartz, judge my vow",
  "Waltz, bad nymph, for quick jigs vex"
];

const FontRound: React.FC = () => {
  const { 
    targetTime, 
    gameStatus,
    handleClick,
    waitTime,
    startTime
  } = useGameStore();
  
  const [selectedFont, setSelectedFont] = useState('');
  const [targetFont, setTargetFont] = useState<typeof AVAILABLE_FONTS[0] | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [fontOptions, setFontOptions] = useState<typeof AVAILABLE_FONTS>([]);
  const [sampleText, setSampleText] = useState('');
  
  // Handle round start
  useEffect(() => {
    if (gameStatus === 'font_round' && !isActive) {
      // Select random target font
      const shuffledFonts = [...AVAILABLE_FONTS].sort(() => 0.5 - Math.random());
      const selected = shuffledFonts[0];
      setTargetFont(selected);
      
      // Select 4 random options including the target
      const options = [selected];
      for (let i = 1; i < 4; i++) {
        options.push(shuffledFonts[i]);
      }
      
      // Shuffle the options
      setFontOptions(options.sort(() => 0.5 - Math.random()));
      
      // Select random sample text
      setSampleText(SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)]);
      
      setSelectedFont('');
      setHasSubmitted(false);
      setIsCorrect(null);
      
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
    if (!isActive || hasSubmitted || !selectedFont || !targetFont) return;
    
    // Check if correct
    const correct = selectedFont === targetFont.name;
    setIsCorrect(correct);
    setHasSubmitted(true);
    setIsActive(false);
    
    // Send to server
    handleClick();
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-2xl font-bold mb-8">Font Round</h2>
      
      {!isActive && !hasSubmitted && (
        <div className="text-center mb-8">
          <div className="text-xl font-semibold mb-2">Get ready...</div>
          <div className="text-3xl font-bold">{timeLeft}</div>
        </div>
      )}
      
      {isActive && targetFont && (
        <div className="w-full max-w-md mb-8 space-y-6">
          <div 
            className="text-2xl text-center p-6 border rounded-lg shadow-md"
            style={{ fontFamily: targetFont.family }}
          >
            {sampleText}
          </div>
          
          <div className="text-center font-medium text-lg mb-4">
            Which font is this?
          </div>
          
          <RadioGroup value={selectedFont} onValueChange={setSelectedFont} className="gap-3">
            {fontOptions.map((font) => (
              <div key={font.name} className="flex items-center space-x-2">
                <RadioGroupItem value={font.name} id={font.name} />
                <Label htmlFor={font.name} className="cursor-pointer">{font.name}</Label>
              </div>
            ))}
          </RadioGroup>
          
          <Button 
            onClick={handleSubmit}
            size="lg"
            className="w-full mt-4"
            disabled={!selectedFont}
          >
            Submit Answer
          </Button>
        </div>
      )}
      
      {hasSubmitted && isCorrect !== null && targetFont && (
        <div className="text-center">
          <div className="text-6xl mb-4">
            {isCorrect ? '🎉' : '❌'}
          </div>
          
          <div className="text-xl font-medium mb-6">
            {isCorrect ? 'Correct!' : 'Incorrect!'}
          </div>
          
          <div>
            <p className="text-lg">
              The correct font was: <span className="font-bold">{targetFont.name}</span>
            </p>
            {!isCorrect && (
              <p className="text-muted-foreground">
                You selected: {selectedFont}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FontRound;
