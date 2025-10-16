import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { mockItems } from '@/data/mock-data';
import * as React from 'react';
import { FlatList, View } from 'react-native';

export default function ShopScreen() {
  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={mockItems}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerClassName="p-4 gap-4"
        columnWrapperClassName="gap-4"
        ListHeaderComponent={
          <View className="mb-4">
            <Text variant="h2" className="mb-3 text-primary">Item Shop 🛍️</Text>
            <Text variant="muted" className="mb-3 text-base">
              Buy items to make your pandas happier!
            </Text>
            <View className="bg-primary/10 border border-primary/30 rounded-2xl p-4 flex-row items-center justify-between shadow-sm">
              <Text variant="large" className="font-semibold">Your Bamboo Coins:</Text>
              <Text variant="h3" className="text-primary font-bold">🎋 1,250</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View className="flex-1 bg-card border border-border rounded-2xl p-4 shadow-sm">
            <View className="bg-primary/5 w-full aspect-square rounded-xl items-center justify-center mb-3">
              <Text className="text-5xl">{item.emoji}</Text>
            </View>
            <Text variant="small" className="text-center text-muted-foreground mb-1 uppercase tracking-wide">
              {item.category}
            </Text>
            <Text variant="large" className="text-center mb-2 font-semibold">{item.name}</Text>
            <View className="flex-row items-center justify-center gap-1 mb-3 bg-primary/10 py-2 rounded-lg">
              <Text className="text-lg">🎋</Text>
              <Text variant="large" className="text-primary font-bold">{item.price}</Text>
            </View>
            <Button size="sm" className="rounded-xl">
              <Text className="font-semibold">Buy Now</Text>
            </Button>
          </View>
        )}
      />
    </View>
  );
}
