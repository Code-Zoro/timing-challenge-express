
import React from 'react';
import { useGameStore } from '../services/socketService';
import { sortLeaderboardByTime, formatTime } from '../utils/gameUtils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LeaderboardProps {
  global?: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ global = false }) => {
  const { leaderboard, finalScores, username } = useGameStore();

  const data = global ? leaderboard : finalScores;
  const sortedData = global ? sortLeaderboardByTime(data) : data;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          {global ? (
            <>
              <Trophy className="mr-2 h-5 w-5 text-game-yellow" />
              Global Leaderboard
            </>
          ) : (
            <>
              <Users className="mr-2 h-5 w-5" />
              Game Results
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedData.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead>{global ? 'Best Time' : 'Score'}</TableHead>
                {global && <TableHead className="text-right">Games</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((player, index) => (
                <TableRow 
                  key={index}
                  className={player.username === username ? 'bg-primary/10' : ''}
                >
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    {player.username}
                    {player.username === username && (
                      <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {global ? (
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatTime(player.best_time)}
                      </span>
                    ) : (
                      <span className="font-bold">{player.score} pts</span>
                    )}
                  </TableCell>
                  {global && (
                    <TableCell className="text-right">{player.games_played}</TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No leaderboard data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
