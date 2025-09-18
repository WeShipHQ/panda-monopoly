
export const SOUND_CONFIG = {
  // Sound durations (how long sounds play before auto-stopping)
  durations: {
    diceRoll: 1000,        // Dice roll sound duration
    buttonClick: 500,      // Button click sound duration
    propertyBuy: 2000,     // Property purchase sound duration
    jailSound: 1500,       // Jail sound duration
    winSound: 3000,        // Win sound duration
    loseSound: 2000,       // Lose sound duration
  },
  
  // Sound delays (timing between different sounds)
  delays: {
    diceLanding: 1200,     // Delay before dice landing sound
    propertyBuyFeedback: 500,  // Delay before property buy sound
    moneyChangeFeedback: 400,  // Delay before money change sounds
    movementFeedback: 300,     // Delay before movement sound
    specialEventFeedback: 200, // Delay before special event sounds
    taxPaymentFeedback: 300,   // Delay before tax payment sound
  },
  
  // Volume levels (0.0 to 1.0)
  volumes: {
    diceRoll: 0.5,
    diceLand: 0.4,
    buttonClick: 0.5,
    buttonHover: 0.2,
    propertyBuy: 0.8,
    moneyReceive: 0.5,
    moneyPay: 0.6,
    jail: 0.7,
    win: 1.0,
    lose: 0.8,
    specialEvents: 0.4,
  }
} as const;

const soundMap = {
  // Dice rolling sounds
  "dice-roll": "/sounds/dice-roll.mp3",
  "dice-land": "/sounds/dice-land.mp3",
  
  // UI interaction sounds
  "button-click": "/sounds/button-click.mp3",
  "button-hover": "/sounds/button-hover.mp3",
  "button-click2": "/sounds/button-click2.mp3",
  
  // Game event sounds
  "property-buy": "/sounds/property-buy.mp3",
  "money-receive": "/sounds/money-receive.mp3",
  "money-pay": "/sounds/money-pay.mp3",
  
  // Special events
  "jail": "/sounds/jail.mp3",
  "win": "/sounds/win.mp3",
  "lose": "/sounds/lose.mp3",
  
  // Fun sounds
  "anime-wow": "/sounds/anime-wow.mp3",
  "bruh": "/sounds/bruh.mp3",
  "vine-boom": "/sounds/vine-boom.mp3"
};


let globalVolume = 0.7;

export function setGlobalVolume(volume: number) {
  globalVolume = Math.max(0, Math.min(1, volume));
}

export function getGlobalVolume(): number {
  return globalVolume;
}

export function playSound(name: keyof typeof soundMap, volume: number = 1, duration?: number) {
  const url = soundMap[name];
  if (!url) {
    console.warn(`❌ Sound "${name}" not found!`);
    return null;
  }

  try {
    const audio = new Audio(url);
    audio.volume = Math.max(0, Math.min(1, volume * globalVolume));
    
    // Add some randomization to prevent repetitive sounds
    audio.playbackRate = 0.9 + Math.random() * 0.2; // 0.9x to 1.1x speed
    
    audio.play().catch(err => {
      console.warn(`🔇 Could not play sound "${name}":`, err.message);
    });

    // Stop audio after specified duration
    if (duration && duration > 0) {
      setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
      }, duration);
    }

    return audio;
  } catch (error) {
    console.warn(`🔇 Sound playback error for "${name}":`, error);
    return null;
  }
}

// Dice-specific sound effects with timing
export function playDiceRollSequence() {
  // Play dice roll sound and stop it after configured duration
  playSound("dice-roll", SOUND_CONFIG.volumes.diceRoll, SOUND_CONFIG.durations.diceRoll);
  
  // Play landing sound after configured delay
  setTimeout(() => {
    playSound("dice-land", SOUND_CONFIG.volumes.diceLand);
  }, SOUND_CONFIG.delays.diceLanding);
}

// Theme change sound effect
export function playThemeChangeSound() {
  playSound("button-click", SOUND_CONFIG.volumes.buttonClick, SOUND_CONFIG.durations.buttonClick);
}

// Property interaction sounds
export function playPropertySound(action: 'buy' | 'rent' | 'mortgage') {
  switch (action) {
    case 'buy':
      playSound("property-buy", SOUND_CONFIG.volumes.propertyBuy, SOUND_CONFIG.durations.propertyBuy);
      break;
    case 'rent':
      playSound("money-pay", SOUND_CONFIG.volumes.moneyPay);
      break;
    case 'mortgage':
      playSound("money-receive", SOUND_CONFIG.volumes.moneyReceive);
      break;
  }
}

// Game state sounds
export function playGameStateSound(state: 'win' | 'lose' | 'jail' | 'start') {
  switch (state) {
    case 'win':
      playSound("win", SOUND_CONFIG.volumes.win, SOUND_CONFIG.durations.winSound);
      break;
    case 'lose':
      playSound("lose", SOUND_CONFIG.volumes.lose, SOUND_CONFIG.durations.loseSound);
      break;
    case 'jail':
      playSound("jail", SOUND_CONFIG.volumes.jail, SOUND_CONFIG.durations.jailSound);
      break;
    case 'start':
      playSound("anime-wow", SOUND_CONFIG.volumes.specialEvents);
      break;
  }
}

export default {
  playSound,
  playDiceRollSequence,
  playThemeChangeSound,
  playPropertySound,
  playGameStateSound,
  setGlobalVolume,
  getGlobalVolume,
  SOUND_CONFIG
};