import { useContext } from 'react';
import { GameContext } from '@/store/context';
import type { GameStore } from '@/store/game';

export function useGameStore(): GameStore {
  const store = useContext(GameContext);
  if (!store) {
    throw new Error('useGameStore must be used within a GameContext.Provider');
  }
  return store;
}
