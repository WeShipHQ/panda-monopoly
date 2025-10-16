import { Text } from '@/components/ui/text';
import * as React from 'react';
import { FlatList, Pressable, View } from 'react-native';

interface Location {
  id: string;
  name: string;
  emoji: string;
  description: string;
  level: number;
}

const mockLocations: Location[] = [
  { id: '1', name: 'Bamboo Forest', emoji: '🎋', description: 'A peaceful forest full of fresh bamboo', level: 1 },
  { id: '2', name: 'Mystic Cave', emoji: '🏔️', description: 'Explore mysterious caves with hidden treasures', level: 3 },
  { id: '3', name: 'Cherry Blossom Park', emoji: '🌸', description: 'Beautiful park where pandas gather', level: 5 },
  { id: '4', name: 'Frozen Peak', emoji: '❄️', description: 'Cold mountain top with rare ice pandas', level: 7 },
  { id: '5', name: 'Golden Temple', emoji: '🏯', description: 'Ancient temple with legendary pandas', level: 10 },
];

export default function ExploreScreen() {
  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={mockLocations}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4 gap-4"
        ListHeaderComponent={
          <View className="mb-4">
            <Text variant="h2" className="mb-3 text-primary">Explore Map 🗺️</Text>
            <Text variant="muted" className="mb-4 text-base">
              Discover new locations and meet wild pandas!
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable className="bg-card border border-border rounded-2xl p-5 active:bg-accent shadow-sm">
            <View className="flex-row items-center gap-4">
              <View className="bg-primary/10 w-16 h-16 rounded-full items-center justify-center">
                <Text className="text-4xl">{item.emoji}</Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-1">
                  <Text variant="large" className="font-semibold flex-1">{item.name}</Text>
                  <View className="bg-primary px-3 py-1 rounded-full">
                    <Text variant="small" className="text-primary-foreground font-bold">Lv.{item.level}</Text>
                  </View>
                </View>
                <Text variant="muted" className="text-sm leading-relaxed">{item.description}</Text>
              </View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
