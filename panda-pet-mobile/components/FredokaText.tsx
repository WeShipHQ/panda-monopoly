import * as React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';

/**
 * Enhanced Text component that automatically uses Fredoka font family
 * Based on font-weight classes in className
 */
export function Text({ style, className, ...props }: RNTextProps & { className?: string }) {
  // Determine font family from className
  const getFontFamily = (className?: string): string => {
    if (!className) return 'Fredoka_400Regular';
    
    if (className.includes('font-light')) return 'Fredoka_300Light';
    if (className.includes('font-bold') || className.includes('font-extrabold')) return 'Fredoka_700Bold';
    if (className.includes('font-semibold')) return 'Fredoka_600SemiBold';
    if (className.includes('font-medium')) return 'Fredoka_500Medium';
    
    return 'Fredoka_400Regular';
  };

  const fontFamily = getFontFamily(className);

  return (
    <RNText
      {...props}
      style={[{ fontFamily }, style]}
    />
  );
}
