import { useEffect, useMemo } from 'react';
import { useGameStore } from './useGameStore';
import { SocketController } from '@/store/socket-controller';

export function useSocket(roomId: string) {
  const gameStore = useGameStore();

  const socketController = useMemo(() => {
    if (roomId && roomId.length >= 5) {
      return new SocketController(gameStore, roomId);
    }
    return null;
  }, [gameStore, roomId]);

  useEffect(() => {
    if (!socketController) return;

    const savedName = localStorage.getItem('game-name');
    const savedAvatar = localStorage.getItem('game-avatar');

    if (savedName) socketController.sendMyName(savedName);
    if (savedAvatar) socketController.sendMyAvatar(savedAvatar);

    return () => {
      socketController.disconnect();
    };
  }, [socketController]);

  return socketController;
}
