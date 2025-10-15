import React from 'react';
import { View } from 'react-native';
import { cn } from '@/lib/utils';

export function DecorativeElements() {
  return (
    <>
      {/* Top Left Burst */}
      <View className="absolute top-20 left-4">
        <BurstIcon size={40} color="black" />
      </View>

      {/* Top Right Burst */}
      <View className="absolute top-32 right-8">
        <BurstIcon size={32} color="black" />
      </View>

      {/* Bottom Left Burst */}
      <View className="absolute bottom-40 left-8">
        <BurstIcon size={36} color="black" />
      </View>

      {/* Bottom Right Burst */}
      <View className="absolute bottom-20 right-4">
        <BurstIcon size={44} color="black" />
      </View>

      {/* Background Shapes */}
      <View className="absolute top-40 right-20 w-16 h-16 bg-pink-200 rounded-full opacity-60 transform rotate-45" />
      <View className="absolute bottom-60 left-16 w-12 h-12 bg-yellow-200 rounded-lg opacity-60 transform -rotate-12" />
      <View className="absolute top-60 left-8 w-8 h-20 bg-pink-300 rounded-full opacity-60 transform rotate-30" />
    </>
  );
}

interface BurstIconProps {
  size: number;
  color: string;
}

function BurstIcon({ size, color }: BurstIconProps) {
  return (
    <View 
      style={{ width: size, height: size }} 
      className="items-center justify-center"
    >
      {/* Create burst effect with multiple lines */}
      {Array.from({ length: 8 }).map((_, index) => (
        <View
          key={index}
          className={cn("absolute bg-black")}
          style={{
            width: 3,
            height: size * 0.4,
            transform: [
              { rotate: `${index * 45}deg` },
              { translateY: -size * 0.2 }
            ],
          }}
        />
      ))}
      {/* Center circle */}
      <View 
        className="bg-black rounded-full"
        style={{ width: size * 0.2, height: size * 0.2 }}
      />
    </View>
  );
}