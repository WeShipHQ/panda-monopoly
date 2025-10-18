import React from 'react';
import { View, SafeAreaView, StatusBar } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CharacterDisplay } from './CharacterDisplay';
import { DecorativeElements } from './DecorativeElements';

interface OnboardingScreenProps {
  onGetStarted: () => void;
}

export function OnboardingScreen({ onGetStarted }: OnboardingScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" /> */}

      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pb-2 pt-4">
        <View className="w-6" />
        <Text className="text-lg font-semibold">10:00</Text>
        <View className="flex-row items-center gap-1">
          <View className="h-2 w-4 rounded-sm bg-black" />
          <View className="h-2 w-4 rounded-sm bg-black" />
          <View className="h-2 w-4 rounded-sm bg-black" />
          <View className="h-2 w-4 rounded-sm bg-gray-300" />
          <View className="h-3 w-6 rounded-sm bg-green-500" />
        </View>
      </View>

      {/* Main Content */}
      <View className="flex-1 justify-center px-6">
        {/* Decorative Elements */}
        <DecorativeElements />

        {/* Title */}
        <View className="mb-8 items-center">
          <Text
            className={cn(
              'mb-4 text-center text-4xl font-black',
              '-rotate-2 transform text-yellow-400'
            )}
            style={{
              textShadowColor: '#000000',
              textShadowOffset: { width: 3, height: 3 },
              textShadowRadius: 0,
            }}>
            LET'S PLAY!
          </Text>
          <View className="h-1 w-8 rotate-12 transform bg-red-500" />
        </View>

        {/* Question Card */}
        <Card className="mb-8 -rotate-1 transform border-4 border-black bg-white shadow-shadow">
          <View className="p-6">
            <Text className="text-center text-xl font-bold leading-tight text-black">
              How well do you know the{'\n'}
              Place your travelling too?
            </Text>
          </View>
        </Card>

        {/* Characters */}
        <CharacterDisplay />

        {/* Get Started Button */}
        <View className="mt-8 items-center">
          <Button
            onPress={onGetStarted}
            className={cn(
              'border-4 border-black bg-yellow-400 shadow-shadow',
              'rotate-1 transform px-12 py-4'
            )}>
            <Text className="text-lg font-black text-black">GET STARTED</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
