import { Text } from '@/components/ui/text';
import { mockLocations } from '@/data/mock-data';
import * as React from 'react';
import { FlatList, Pressable, View } from 'react-native';

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
