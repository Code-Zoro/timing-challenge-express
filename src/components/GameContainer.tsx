
import React, { useEffect, useState } from 'react';
import { useGameStore } from '../services/socketService';
import WaitingRoom from './WaitingRoom';
import GameArea from './GameArea';
import ResultsView from './ResultsView';
import GameOverView from './GameOverView';
import UsernamePicker from './UsernamePicker';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const GameContainer: React.FC = () => {
  const { toast } = useToast();
  const [hasUsername, setHasUsername] = useState(false);
  const { 
    connect, 
    connected, 
    joinGame, 
    gameStatus, 
    username,
    setUsername,
    error
  } = useGameStore();

  useEffect(() => {
    connect();
    
    return () => {
      useGameStore.getState().disconnect();
    };
  }, []);

  useEffect(() => {
    if (error) {
      toast({
        title: "Connection Error",
        description: error,
        variant: "destructive"
      });
    }
  }, [error, toast]);

  const handleUsernameSubmit = (name: string) => {
    setUsername(name);
    joinGame(name);
    setHasUsername(true);
  };

  const renderGameState = () => {
    if (!connected) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="animate-pulse text-xl font-semibold mb-4">Connecting to server...</div>
          <Button 
            variant="outline" 
            onClick={connect}
            className="mt-4"
          >
            Retry Connection
          </Button>
        </div>
      );
    }

    if (!hasUsername) {
      return <UsernamePicker onSubmit={handleUsernameSubmit} />;
    }

    switch (gameStatus) {
      case 'waiting':
        return <WaitingRoom />;
      case 'countdown':
      case 'started':
        return <GameArea />;
      case 'results':
        return <ResultsView />;
      case 'ended':
        return <GameOverView />;
      default:
        return <div>Unknown game state</div>;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <header className="p-4 bg-primary text-primary-foreground">
        <div className="container flex items-center justify-between">
          <h1 className="text-xl font-bold">Timing Challenge</h1>
          {hasUsername && <div className="font-medium">Playing as: {username}</div>}
        </div>
      </header>
      
      <main className="flex-1 container py-8">
        <div className="bg-card rounded-lg shadow-lg p-6 h-full">
          {renderGameState()}
        </div>
      </main>
      
      <footer className="p-4 bg-secondary text-secondary-foreground text-sm">
        <div className="container text-center">
          <p>Multiplayer Timing Challenge Game — Test your timing skills against others!</p>
        </div>
      </footer>
    </div>
  );
};

export default GameContainer;
