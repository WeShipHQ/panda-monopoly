export const PANDA_SPECIES = [
  {
    id: 'pango',
    name: 'Pango',
    image: require('../public/assets/pango.svg'),
    description: 'A friendly and playful panda',
    rarity: 'common',
  },
  {
    id: 'flunny',
    name: 'Flunny',
    image: require('../public/assets/flunny.svg'),
    description: 'A cute fluffy panda with big eyes',
    rarity: 'common',
  },
  {
    id: 'lyco',
    name: 'Lyco',
    image: require('../public/assets/lyco.svg'),
    description: 'A mystical panda with magical powers',
    rarity: 'rare',
  },
  {
    id: 'kazyl',
    name: 'Kazyl',
    image: require('../public/assets/kazyl.svg'),
    description: 'A wise and ancient panda',
    rarity: 'rare',
  },
  {
    id: 'drakin',
    name: 'Drakin',
    image: require('../public/assets/drakin.svg'),
    description: 'A dragon-inspired legendary panda',
    rarity: 'legendary',
  },
  {
    id: 'tauro',
    name: 'Tauro',
    image: require('../public/assets/tauro.svg'),
    description: 'A strong and brave panda warrior',
    rarity: 'epic',
  },
  {
    id: 'marmen',
    name: 'Marmen',
    image: require('../public/assets/marmen.svg'),
    description: 'A water-loving panda from the seas',
    rarity: 'epic',
  },
] as const;

export type PandaSpecies = typeof PANDA_SPECIES[number];
export type PandaRarity = 'common' | 'rare' | 'epic' | 'legendary';

export const RARITY_COLORS: Record<PandaRarity, string> = {
  common: 'text-gray-600',
  rare: 'text-blue-600',
  epic: 'text-purple-600',
  legendary: 'text-orange-600',
};

export const RARITY_BG: Record<PandaRarity, string> = {
  common: 'bg-gray-100 dark:bg-gray-800',
  rare: 'bg-blue-100 dark:bg-blue-900',
  epic: 'bg-purple-100 dark:bg-purple-900',
  legendary: 'bg-orange-100 dark:bg-orange-900',
};
