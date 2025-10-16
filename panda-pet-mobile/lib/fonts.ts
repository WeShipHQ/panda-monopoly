// Font weight mapping for Fredoka
export const FREDOKA_FONTS = {
  300: 'Fredoka_300Light',
  400: 'Fredoka_400Regular',
  500: 'Fredoka_500Medium',
  600: 'Fredoka_600SemiBold',
  700: 'Fredoka_700Bold',
} as const;

export type FredokaWeight = keyof typeof FREDOKA_FONTS;

// Map Tailwind font weight classes to Fredoka fonts
export const FONT_WEIGHT_MAP: Record<string, FredokaWeight> = {
  'font-light': 300,
  'font-normal': 400,
  'font-medium': 500,
  'font-semibold': 600,
  'font-bold': 700,
  'font-extrabold': 700,
};

// Get Fredoka font family from className
export function getFredokaFont(className?: string): string {
  if (!className) return FREDOKA_FONTS[400];
  
  // Check for font weight classes
  for (const [weightClass, weight] of Object.entries(FONT_WEIGHT_MAP)) {
    if (className.includes(weightClass)) {
      return FREDOKA_FONTS[weight];
    }
  }
  
  return FREDOKA_FONTS[400];
}
