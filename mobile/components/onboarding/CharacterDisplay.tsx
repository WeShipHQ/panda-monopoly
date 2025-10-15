import React from 'react';
import { View, Image } from 'react-native';
import { cn } from '@/lib/utils';

export function CharacterDisplay() {
  return (
    <View className="flex-row justify-center items-end gap-4 mb-4">
      {/* Orange Character */}
      <View className={cn(
        "w-20 h-24 bg-orange-400 rounded-full border-3 border-black",
        "shadow-shadow transform -rotate-3"
      )}>
        <View className="absolute top-3 left-4">
          <View className="w-3 h-3 bg-black rounded-full" />
        </View>
        <View className="absolute top-3 right-4">
          <View className="w-3 h-3 bg-black rounded-full" />
        </View>
        <View className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <View className="w-6 h-2 bg-black rounded-full" />
        </View>
        {/* Arms */}
        <View className="absolute -left-2 top-8 w-4 h-8 bg-orange-400 rounded-full border-2 border-black transform -rotate-12" />
        <View className="absolute -right-2 top-8 w-4 h-8 bg-orange-400 rounded-full border-2 border-black transform rotate-12" />
        {/* Legs */}
        <View className="absolute -bottom-2 left-2 w-6 h-4 bg-orange-400 rounded-full border-2 border-black" />
        <View className="absolute -bottom-2 right-2 w-6 h-4 bg-orange-400 rounded-full border-2 border-black" />
      </View>

      {/* Gray Robot Character */}
      <View className={cn(
        "w-16 h-20 bg-gray-400 rounded-lg border-3 border-black",
        "shadow-shadow transform rotate-2"
      )}>
        {/* Head */}
        <View className="w-full h-8 bg-gray-500 rounded-t-lg border-b-2 border-black">
          <View className="absolute top-2 left-2">
            <View className="w-2 h-2 bg-red-500 rounded-full" />
          </View>
          <View className="absolute top-2 right-2">
            <View className="w-2 h-2 bg-red-500 rounded-full" />
          </View>
        </View>
        {/* Body */}
        <View className="flex-1 bg-gray-400">
          <View className="absolute top-2 left-1/2 transform -translate-x-1/2">
            <View className="w-6 h-3 bg-blue-500 rounded border border-black" />
          </View>
        </View>
      </View>

      {/* Purple Monster Character */}
      <View className={cn(
        "w-18 h-22 bg-purple-600 rounded-2xl border-3 border-black",
        "shadow-shadow transform -rotate-1"
      )}>
        {/* Eyes */}
        <View className="absolute top-3 left-2">
          <View className="w-4 h-4 bg-white rounded-full border-2 border-black">
            <View className="absolute top-1 left-1 w-2 h-2 bg-black rounded-full" />
          </View>
        </View>
        <View className="absolute top-3 right-2">
          <View className="w-4 h-4 bg-white rounded-full border-2 border-black">
            <View className="absolute top-1 right-1 w-2 h-2 bg-black rounded-full" />
          </View>
        </View>
        {/* Mouth with teeth */}
        <View className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <View className="w-8 h-4 bg-black rounded-lg">
            <View className="flex-row justify-around items-center h-full px-1">
              <View className="w-1 h-2 bg-white" />
              <View className="w-1 h-2 bg-white" />
              <View className="w-1 h-2 bg-white" />
            </View>
          </View>
        </View>
        {/* Arms */}
        <View className="absolute -left-1 top-8 w-3 h-6 bg-purple-600 rounded-full border-2 border-black" />
        <View className="absolute -right-1 top-8 w-3 h-6 bg-purple-600 rounded-full border-2 border-black" />
      </View>
    </View>
  );
}