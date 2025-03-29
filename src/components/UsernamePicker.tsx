
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface UserNamePickerProps {
  onSubmit: (username: string) => void;
}

const UsernamePicker: React.FC<UserNamePickerProps> = ({ onSubmit }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    if (username.length > 15) {
      setError('Username must be 15 characters or less');
      return;
    }
    
    onSubmit(username);
  };

  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Timing Challenge</CardTitle>
          <CardDescription>
            Test your timing skills against other players in real-time!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-2">
                  Enter your username
                </label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  placeholder="Your username"
                  className="w-full"
                  autoFocus
                />
                {error && <p className="text-destructive text-sm mt-1">{error}</p>}
              </div>
            </div>
            <Button type="submit" className="w-full mt-4">
              Join Game
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Get ready to test your reaction time and timing precision!
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UsernamePicker;
