export interface Panda {
  id: string;
  name: string;
  species: string;
  image: any;
  level: number;
  happiness: number;
  emoji: string;
}

// Mock pandas với hình ảnh thật
export const mockPandas: Panda[] = [
  {
    id: '1',
    name: 'Bamboo',
    species: 'Classic Panda',
    image: require('../public/assets/panda-pet/panda1.png'),
    level: 5,
    happiness: 95,
    emoji: '🐼',
  },
  {
    id: '2',
    name: 'Snowflake',
    species: 'Ice Panda',
    image: require('../public/assets/panda-pet/panda2.png'),
    level: 3,
    happiness: 88,
    emoji: '❄️',
  },
  {
    id: '3',
    name: 'Sunny',
    species: 'Golden Panda',
    image: require('../public/assets/panda-pet/panda3.png'),
    level: 7,
    happiness: 92,
    emoji: '🌟',
  },
  {
    id: '4',
    name: 'Cherry',
    species: 'Cherry Blossom Panda',
    image: require('../public/assets/panda-pet/panda4.png'),
    level: 4,
    happiness: 90,
    emoji: '🌸',
  },
  {
    id: '5',
    name: 'Ocean',
    species: 'Water Panda',
    image: require('../public/assets/panda-pet/panda5.png'),
    level: 6,
    happiness: 85,
    emoji: '🌊',
  },
];

export interface Location {
  id: string;
  name: string;
  emoji: string;
  description: string;
  level: number;
  image?: any;
}

export const mockLocations: Location[] = [
  {
    id: '1',
    name: 'Bamboo Forest',
    emoji: '🎋',
    description: 'A peaceful forest full of fresh bamboo',
    level: 1,
    image: require('../public/assets/background.png'),
  },
  {
    id: '2',
    name: 'Mystic Cave',
    emoji: '🏔️',
    description: 'Explore mysterious caves with hidden treasures',
    level: 3,
  },
  {
    id: '3',
    name: 'Cherry Blossom Park',
    emoji: '🌸',
    description: 'Beautiful park where pandas gather',
    level: 5,
  },
  {
    id: '4',
    name: 'Frozen Peak',
    emoji: '❄️',
    description: 'Cold mountain top with rare ice pandas',
    level: 7,
  },
  {
    id: '5',
    name: 'Golden Temple',
    emoji: '🏯',
    description: 'Ancient temple with legendary pandas',
    level: 10,
  },
];

export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  category: string;
}

export const mockItems: ShopItem[] = [
  { id: '1', name: 'Fresh Bamboo', emoji: '🎋', price: 10, category: 'Food' },
  { id: '2', name: 'Golden Bamboo', emoji: '✨', price: 50, category: 'Food' },
  { id: '3', name: 'Red Scarf', emoji: '🧣', price: 100, category: 'Accessory' },
  { id: '4', name: 'Crown', emoji: '👑', price: 500, category: 'Accessory' },
  { id: '5', name: 'Toy Ball', emoji: '⚽', price: 75, category: 'Toy' },
  { id: '6', name: 'Magic Potion', emoji: '🧪', price: 200, category: 'Special' },
  { id: '7', name: 'Rainbow Bamboo', emoji: '🌈', price: 150, category: 'Food' },
  { id: '8', name: 'Star Hat', emoji: '⭐', price: 300, category: 'Accessory' },
];
