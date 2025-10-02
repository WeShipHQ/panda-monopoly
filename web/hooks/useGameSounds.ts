"use client";

import { useEffect } from 'react';
import { playGameStateSound, playPropertySound, playSound, SOUND_CONFIG } from '@/lib/soundUtil';

export const useGameSounds = (gameState: any, previousGameState: any) => {
  useEffect(() => {
    if (!gameState || !previousGameState) {
      return;
    }
    
    console.log("🎮 Game state changed, checking for sound effects");

    // Detect game state changes and play appropriate sounds
    
    // Player moved to a new position
    if (gameState.currentPlayer?.position !== previousGameState.currentPlayer?.position) {
      // Small movement sound
      setTimeout(() => playSound("button-click", SOUND_CONFIG.volumes.buttonClick), SOUND_CONFIG.delays.movementFeedback);
    }

    // Player went to jail
    if (gameState.currentPlayer?.inJail && !previousGameState.currentPlayer?.inJail) {
      playGameStateSound('jail');
    }

    // Player got out of jail
    if (!gameState.currentPlayer?.inJail && previousGameState.currentPlayer?.inJail) {
      playSound("anime-wow", SOUND_CONFIG.volumes.specialEvents);
    }

        // Property was bought
    if (gameState.properties && previousGameState.properties) {
      // Đã xử lý âm thanh mua nhà trực tiếp trong hàm buyProperty
      // nên không cần phát âm thanh mua nhà ở đây nữa
      
      // Check for rent payment events (player landed on property owned by another player)
      if (gameState.currentAction?.type === 'pay_rent' && gameState.currentAction !== previousGameState.currentAction) {
        // Rent paid to property owner
        setTimeout(() => {
          console.log("🔊 Playing rent payment sound");
          playPropertySound('pay');
        }, SOUND_CONFIG.delays.moneyChangeFeedback);
        
        // If this game supported real-time multiplayer, we would also play a sound for the owner
        // who received the rent, but that would require websocket notifications
      }
    }

    // Player's money changed (rent payment, receiving money, etc.)
    if (gameState.currentPlayer?.cashBalance !== previousGameState?.currentPlayer?.cashBalance && 
        gameState.currentPlayer && previousGameState?.currentPlayer) {
      const moneyDiff = (gameState.currentPlayer.cashBalance || 0) - (previousGameState.currentPlayer.cashBalance || 0);
      
      if (moneyDiff > 0) {
        // Player received money
        console.log("� Playing money receive sound, balance increased by:", moneyDiff);
        setTimeout(() => playPropertySound('receive'), SOUND_CONFIG.delays.moneyChangeFeedback);
      } else if (moneyDiff < 0) {
        // Player paid money - Không cần phát âm thanh ở đây nếu đang trả tiền thuê, vì đã được xử lý ở phần trên
        // Check if this is part of a rent payment that we already played a sound for
        if (!gameState.currentAction?.type?.includes('pay_rent')) {
          console.log("� Playing money pay sound, balance decreased by:", Math.abs(moneyDiff));
          setTimeout(() => playPropertySound('pay'), SOUND_CONFIG.delays.moneyChangeFeedback);
        }
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
        setTimeout(() => playSound("anime-wow", SOUND_CONFIG.volumes.specialEvents), SOUND_CONFIG.delays.specialEventFeedback);
      }
      
      if (action.type === 'pay_tax') {
        setTimeout(() => playPropertySound('pay'), SOUND_CONFIG.delays.taxPaymentFeedback);
      }
    }

  }, [gameState, previousGameState]);
};

export default useGameSounds;