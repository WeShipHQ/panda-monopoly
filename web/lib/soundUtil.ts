// Sound utility for Panda Monopoly game
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


// Global volume control
let globalVolume = 0.7;

export function setGlobalVolume(volume: number) {
  globalVolume = Math.max(0, Math.min(1, volume));
}

export function getGlobalVolume(): number {
  return globalVolume;
}

export function playSound(name: keyof typeof soundMap, volume: number = 1) {
  const url = soundMap[name];
  if (!url) {
    console.warn(`❌ Sound "${name}" not found!`);
    return;
  }

  try {
    const audio = new Audio(url);
    audio.volume = Math.max(0, Math.min(1, volume * globalVolume));
    
    // Add some randomization to prevent repetitive sounds
    audio.playbackRate = 0.9 + Math.random() * 0.2; // 0.9x to 1.1x speed
    
    audio.play().catch(err => {
      console.warn(`🔇 Could not play sound "${name}":`, err.message);
    });
  } catch (error) {
    console.warn(`🔇 Sound playback error for "${name}":`, error);
  }
}

// Dice-specific sound effects with timing
export function playDiceRollSequence() {
  playSound("dice-roll", 0.6);
  
  // Play landing sound after roll animation completes
  setTimeout(() => {
    playSound("dice-land", 0.4);
  }, 1200);
}

// Theme change sound effect
export function playThemeChangeSound() {
  playSound("button-click", 0.5);
}

// Property interaction sounds
export function playPropertySound(action: 'buy' | 'rent' | 'mortgage') {
  switch (action) {
    case 'buy':
      playSound("property-buy", 0.8);
      break;
    case 'rent':
      playSound("money-pay", 0.6);
      break;
    case 'mortgage':
      playSound("money-receive", 0.5);
      break;
  }
}

// Game state sounds
export function playGameStateSound(state: 'win' | 'lose' | 'jail' | 'start') {
  switch (state) {
    case 'win':
      playSound("win", 1.0);
      break;
    case 'lose':
      playSound("lose", 0.8);
      break;
    case 'jail':
      playSound("jail", 0.7);
      break;
    case 'start':
      playSound("anime-wow", 0.6);
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
  getGlobalVolume
};