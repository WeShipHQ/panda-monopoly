import { mockItems, mockLocations, mockPandas } from '@/data/mock-data';
import * as React from 'react';

export type PandaRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Panda {
  id: string;
  name: string;
  species: string;
  image: any;
  level: number;
  happiness: number;
  hunger: number;
  emoji: string;
  experience: number;
  rarity?: PandaRarity;
}

export interface Location {
  id: string;
  name: string;
  emoji: string;
  description: string;
  level: number;
  unlocked: boolean;
  cost: number;
}

export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  category: string;
  effect: {
    hunger?: number;
    happiness?: number;
    experience?: number;
  };
}

export interface InventoryItem {
  itemId: string;
  quantity: number;
}

interface GameState {
  pandas: Panda[];
  locations: Location[];
  inventory: InventoryItem[];
  coins: number;
  selectedPandaId: string | null;
  lastDailySpinDate: string | null;
  totalSpins: number;
}

interface GameContextType {
  state: GameState;
  feedPanda: (pandaId: string, itemId: string) => boolean;
  explorLocation: (pandaId: string, locationId: string) => boolean;
  buyItem: (itemId: string) => boolean;
  unlockLocation: (locationId: string) => boolean;
  selectPanda: (pandaId: string) => void;
  getSelectedPanda: () => Panda | null;
  getInventoryItem: (itemId: string) => InventoryItem | null;
  getShopItem: (itemId: string) => ShopItem | null;
  getLocation: (locationId: string) => Location | null;
  spinGacha: (useFreeSpin?: boolean) => { panda: Panda; isNew: boolean } | null;
  canUseFreeSpin: () => boolean;
}

const GameContext = React.createContext<GameContextType | undefined>(undefined);

// Gacha Pool - Available pandas to obtain
const gachaPool: Omit<Panda, 'level' | 'happiness' | 'hunger' | 'experience'>[] = [
  // Common (60% chance)
  { id: 'gacha-1', name: 'Bamboo Jr', species: 'Baby Giant Panda', emoji: '🐼', image: require('../public/assets/panda-pet/panda1.png'), rarity: 'common' },
  { id: 'gacha-2', name: 'Cloud', species: 'White Panda', emoji: '☁️', image: require('../public/assets/panda-pet/panda2.png'), rarity: 'common' },
  { id: 'gacha-3', name: 'Cinnamon', species: 'Brown Panda', emoji: '🟤', image: require('../public/assets/panda-pet/panda3.png'), rarity: 'common' },
  
  // Rare (25% chance)
  { id: 'gacha-4', name: 'Starlight', species: 'Celestial Panda', emoji: '⭐', image: require('../public/assets/panda-pet/panda4.png'), rarity: 'rare' },
  { id: 'gacha-5', name: 'Ruby', species: 'Red Panda', emoji: '❤️', image: require('../public/assets/panda-pet/panda5.png'), rarity: 'rare' },
  
  // Epic (12% chance)
  { id: 'gacha-6', name: 'Sapphire', species: 'Blue Moon Panda', emoji: '💙', image: require('../public/assets/panda-pet/panda6.png'), rarity: 'epic' },
  { id: 'gacha-7', name: 'Thunder', species: 'Storm Panda', emoji: '⚡', image: require('../public/assets/panda-pet/panda7.png'), rarity: 'epic' },
  
  // Legendary (3% chance)
  { id: 'gacha-8', name: 'Galaxy', species: 'Cosmic Panda', emoji: '🌌', image: require('../public/assets/panda-pet/panda8.png'), rarity: 'legendary' },
];

// Rarity rates
const rarityRates = {
  common: 0.60,   // 60%
  rare: 0.25,     // 25%
  epic: 0.12,     // 12%
  legendary: 0.03, // 3%
};

// Initialize mock data with additional properties
const initialPandas: Panda[] = mockPandas.map((panda) => ({
  ...panda,
  hunger: 70,
  experience: 0,
  rarity: 'common',
}));

const initialLocations: Location[] = mockLocations.map((location, index) => ({
  ...location,
  unlocked: index === 0, // First location unlocked
  cost: location.level * 100,
}));

const shopItems: ShopItem[] = [
  {
    id: '1',
    name: 'Fresh Bamboo',
    emoji: '🎋',
    price: 10,
    category: 'Food',
    effect: { hunger: 20, happiness: 5 },
  },
  {
    id: '2',
    name: 'Golden Bamboo',
    emoji: '✨',
    price: 50,
    category: 'Food',
    effect: { hunger: 50, happiness: 15, experience: 10 },
  },
  {
    id: '3',
    name: 'Red Scarf',
    emoji: '🧣',
    price: 100,
    category: 'Accessory',
    effect: { happiness: 30 },
  },
  {
    id: '4',
    name: 'Crown',
    emoji: '👑',
    price: 500,
    category: 'Accessory',
    effect: { happiness: 50, experience: 20 },
  },
  {
    id: '5',
    name: 'Toy Ball',
    emoji: '⚽',
    price: 75,
    category: 'Toy',
    effect: { happiness: 25, experience: 5 },
  },
  {
    id: '6',
    name: 'Magic Potion',
    emoji: '🧪',
    price: 200,
    category: 'Special',
    effect: { hunger: 100, happiness: 100, experience: 50 },
  },
  {
    id: '7',
    name: 'Sunglasses',
    emoji: '😎',
    price: 150,
    category: 'Accessory',
    effect: { happiness: 20 },
  },
  {
    id: '8',
    name: 'Party Hat',
    emoji: '🎉',
    price: 80,
    category: 'Accessory',
    effect: { happiness: 15, experience: 5 },
  },
];

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<GameState>({
    pandas: initialPandas,
    locations: initialLocations,
    inventory: [
      { itemId: '1', quantity: 3 }, // Start with 3 Fresh Bamboo
    ],
    coins: 10000, // Starting coins
    selectedPandaId: initialPandas[0]?.id || null,
    lastDailySpinDate: null,
    totalSpins: 0,
  });

  const feedPanda = React.useCallback(
    (pandaId: string, itemId: string): boolean => {
      const panda = state.pandas.find((p) => p.id === pandaId);
      const inventoryItem = state.inventory.find((i) => i.itemId === itemId);
      const shopItem = shopItems.find((i) => i.id === itemId);

      if (!panda || !inventoryItem || inventoryItem.quantity <= 0 || !shopItem) {
        return false;
      }

      setState((prev) => ({
        ...prev,
        pandas: prev.pandas.map((p) => {
          if (p.id === pandaId) {
            const newHunger = Math.min(100, p.hunger + (shopItem.effect.hunger || 0));
            const newHappiness = Math.min(100, p.happiness + (shopItem.effect.happiness || 0));
            const newExperience = p.experience + (shopItem.effect.experience || 0);
            const newLevel = Math.floor(newExperience / 100) + 1;

            return {
              ...p,
              hunger: newHunger,
              happiness: newHappiness,
              experience: newExperience,
              level: newLevel,
            };
          }
          return p;
        }),
        inventory: prev.inventory
          .map((i) => {
            if (i.itemId === itemId) {
              return { ...i, quantity: i.quantity - 1 };
            }
            return i;
          })
          .filter((i) => i.quantity > 0),
      }));

      return true;
    },
    [state.pandas, state.inventory]
  );

  const explorLocation = React.useCallback(
    (pandaId: string, locationId: string): boolean => {
      const panda = state.pandas.find((p) => p.id === pandaId);
      const location = state.locations.find((l) => l.id === locationId);

      if (!panda || !location || !location.unlocked || panda.level < location.level) {
        return false;
      }

      // Random rewards from exploration
      const coinsEarned = Math.floor(Math.random() * 50) + 20;
      const expEarned = Math.floor(Math.random() * 30) + 10;

      setState((prev) => ({
        ...prev,
        coins: prev.coins + coinsEarned,
        pandas: prev.pandas.map((p) => {
          if (p.id === pandaId) {
            const newExperience = p.experience + expEarned;
            const newLevel = Math.floor(newExperience / 100) + 1;
            const newHunger = Math.max(0, p.hunger - 10); // Exploring makes hungry

            return {
              ...p,
              experience: newExperience,
              level: newLevel,
              hunger: newHunger,
              happiness: Math.min(100, p.happiness + 10),
            };
          }
          return p;
        }),
      }));

      return true;
    },
    [state.pandas, state.locations]
  );

  const buyItem = React.useCallback(
    (itemId: string): boolean => {
      const shopItem = shopItems.find((i) => i.id === itemId);

      if (!shopItem || state.coins < shopItem.price) {
        return false;
      }

      setState((prev) => {
        const existingItem = prev.inventory.find((i) => i.itemId === itemId);

        return {
          ...prev,
          coins: prev.coins - shopItem.price,
          inventory: existingItem
            ? prev.inventory.map((i) =>
                i.itemId === itemId ? { ...i, quantity: i.quantity + 1 } : i
              )
            : [...prev.inventory, { itemId, quantity: 1 }],
        };
      });

      return true;
    },
    [state.coins, state.inventory]
  );

  const unlockLocation = React.useCallback(
    (locationId: string): boolean => {
      const location = state.locations.find((l) => l.id === locationId);

      if (!location || location.unlocked || state.coins < location.cost) {
        return false;
      }

      setState((prev) => ({
        ...prev,
        coins: prev.coins - location.cost,
        locations: prev.locations.map((l) =>
          l.id === locationId ? { ...l, unlocked: true } : l
        ),
      }));

      return true;
    },
    [state.locations, state.coins]
  );

  const selectPanda = React.useCallback((pandaId: string) => {
    setState((prev) => ({ ...prev, selectedPandaId: pandaId }));
  }, []);

  const getSelectedPanda = React.useCallback((): Panda | null => {
    return state.pandas.find((p) => p.id === state.selectedPandaId) || null;
  }, [state.pandas, state.selectedPandaId]);

  const getInventoryItem = React.useCallback(
    (itemId: string): InventoryItem | null => {
      return state.inventory.find((i) => i.itemId === itemId) || null;
    },
    [state.inventory]
  );

  const getShopItem = React.useCallback((itemId: string): ShopItem | null => {
    return shopItems.find((i) => i.id === itemId) || null;
  }, []);

  const getLocation = React.useCallback(
    (locationId: string): Location | null => {
      return state.locations.find((l) => l.id === locationId) || null;
    },
    [state.locations]
  );

  const canUseFreeSpin = React.useCallback((): boolean => {
    if (!state.lastDailySpinDate) return true;
    
    const lastDate = new Date(state.lastDailySpinDate);
    const today = new Date();
    
    // Check if it's a different day
    return lastDate.toDateString() !== today.toDateString();
  }, [state.lastDailySpinDate]);

  const spinGacha = React.useCallback(
    (useFreeSpin: boolean = false): { panda: Panda; isNew: boolean } | null => {
      // Check if can use free spin
      if (useFreeSpin && !canUseFreeSpin()) {
        return null;
      }

      // Check coins for paid spin
      if (!useFreeSpin && state.coins < 100) {
        return null;
      }

      // Determine rarity based on rates
      const random = Math.random();
      let rarity: PandaRarity = 'common';
      let cumulative = 0;

      for (const [rarityKey, rate] of Object.entries(rarityRates)) {
        cumulative += rate;
        if (random <= cumulative) {
          rarity = rarityKey as PandaRarity;
          break;
        }
      }

      // Get pandas of that rarity
      const pandasOfRarity = gachaPool.filter((p) => p.rarity === rarity);
      if (pandasOfRarity.length === 0) {
        rarity = 'common';
      }

      // Randomly select one panda from that rarity
      const filteredPandas = gachaPool.filter((p) => p.rarity === rarity);
      const selectedGachaPanda = filteredPandas[Math.floor(Math.random() * filteredPandas.length)];

      // Check if player already has this panda
      const isNew = !state.pandas.some((p) => p.id === selectedGachaPanda.id);

      // Create full panda object
      const newPanda: Panda = {
        ...selectedGachaPanda,
        level: 1,
        happiness: 100,
        hunger: 100,
        experience: 0,
      };

      // Update state
      setState((prev) => {
        const updates: Partial<GameState> = {
          totalSpins: prev.totalSpins + 1,
        };

        // Add panda if new
        if (isNew) {
          updates.pandas = [...prev.pandas, newPanda];
        }

        // Deduct coins if paid spin
        if (!useFreeSpin) {
          updates.coins = prev.coins - 100;
        }

        // Update last free spin date if free spin
        if (useFreeSpin) {
          updates.lastDailySpinDate = new Date().toISOString();
        }

        return { ...prev, ...updates };
      });

      return { panda: newPanda, isNew };
    },
    [state.coins, state.pandas, state.totalSpins, canUseFreeSpin]
  );

  const value: GameContextType = {
    state,
    feedPanda,
    explorLocation,
    buyItem,
    unlockLocation,
    selectPanda,
    getSelectedPanda,
    getInventoryItem,
    getShopItem,
    getLocation,
    spinGacha,
    canUseFreeSpin,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = React.useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
