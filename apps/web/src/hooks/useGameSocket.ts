'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/providers/SocketProvider';
import { joinGameRoom, leaveGameRoom } from '@/lib/socket';

export function useGameSocket(gameId: string) {
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !isConnected || !gameId) return;

    // Join game room
    joinGameRoom(gameId);

    // Listen for game updates
    const handleGameUpdated = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['game', gameId] });
    };

    const handlePlayerJoined = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['game', gameId] });
    };

    const handlePlayerLeft = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['game', gameId] });
    };

    socket.on('game-updated', handleGameUpdated);
    socket.on('player-joined', handlePlayerJoined);
    socket.on('player-left', handlePlayerLeft);

    return () => {
      leaveGameRoom(gameId);
      socket.off('game-updated', handleGameUpdated);
      socket.off('player-joined', handlePlayerJoined);
      socket.off('player-left', handlePlayerLeft);
    };
  }, [socket, isConnected, gameId, queryClient]);
}
