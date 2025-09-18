"use client";

import { useEffect } from 'react';
import { playGameStateSound, playPropertySound, playSound } from '@/lib/soundUtil';

export const useGameSounds = (gameState: any, previousGameState: any) => {
  useEffect(() => {
    if (!gameState || !previousGameState) return;

    // Detect game state changes and play appropriate sounds
    
    // Player moved to a new position
    if (gameState.currentPlayer?.position !== previousGameState.currentPlayer?.position) {
      // Small movement sound
      setTimeout(() => playSound("button-click", 0.4), 300);
    }

    // Player went to jail
    if (gameState.currentPlayer?.inJail && !previousGameState.currentPlayer?.inJail) {
      playGameStateSound('jail');
    }

    // Player got out of jail
    if (!gameState.currentPlayer?.inJail && previousGameState.currentPlayer?.inJail) {
      playSound("anime-wow", 0.6);
    }

    // Property was bought
    if (gameState.properties && previousGameState.properties) {
      const currentOwnedCount = Object.values(gameState.properties).filter((p: any) => p.owner).length;
      const previousOwnedCount = Object.values(previousGameState.properties).filter((p: any) => p.owner).length;
      
      if (currentOwnedCount > previousOwnedCount) {
        // Property was purchased
        setTimeout(() => playPropertySound('buy'), 500);
      }
    }

    // Player's money changed (rent payment, receiving money, etc.)
    if (gameState.currentPlayer?.money !== previousGameState.currentPlayer?.money) {
      const moneyDiff = gameState.currentPlayer.money - previousGameState.currentPlayer.money;
      
      if (moneyDiff > 0) {
        // Player received money
        setTimeout(() => playSound("money-receive", 0.5), 400);
      } else if (moneyDiff < 0) {
        // Player paid money
        setTimeout(() => playSound("money-pay", 0.6), 400);
      }
    }

    // Game ended
    if (gameState.winner && !previousGameState.winner) {
      // Game has a winner
      if (gameState.winner === gameState.currentPlayer?.id) {
        playGameStateSound('win');
      } else {
        playGameStateSound('lose');
      }
    }

    // Special space events
    if (gameState.currentAction && gameState.currentAction !== previousGameState.currentAction) {
      const action = gameState.currentAction;
      
      if (action.type === 'draw_chance' || action.type === 'draw_community_chest') {
        setTimeout(() => playSound("anime-wow", 0.4), 200);
      }
      
      if (action.type === 'pay_tax') {
        setTimeout(() => playSound("money-pay", 0.7), 300);
      }
    }

  }, [gameState, previousGameState]);
};

export default useGameSounds;