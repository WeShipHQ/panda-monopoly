"use client";

import { useCallback } from 'react';
import { playSound, SOUND_CONFIG } from '@/lib/soundUtil';

/**
 * Custom hook to play button click sound
 * Returns a function that plays the click sound when called
 */
export const useButtonClickSound = () => {
  const playClickSound = useCallback(() => {
    playSound("button-click", SOUND_CONFIG.volumes.buttonClick);
  }, []);

  const playHoverSound = useCallback(() => {
    playSound("button-hover", SOUND_CONFIG.volumes.buttonHover);
  }, []);

  return {
    playClickSound,
    playHoverSound,
  };
};
