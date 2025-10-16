import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useGame } from '@/contexts/GameContext';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Heart, Sparkles } from 'lucide-react-native';
import * as React from 'react';
import { Alert, FlatList, Image, Pressable, ScrollView, View } from 'react-native';

export default function PandaDetailScreen() {
  const { state, getSelectedPanda, feedPanda, getInventoryItem, getShopItem } = useGame();
  const router = useRouter();
  const panda = getSelectedPanda();

  if (!panda) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-4">
        <Text variant="h3" className="mb-4">No panda selected</Text>
        <Button onPress={() => router.back()}>
          <Text className="text-primary-foreground">Go Back</Text>
        </Button>
      </View>
    );
  }

  const handleFeed = (itemId: string) => {
    const item = getShopItem(itemId);
    const inventoryItem = getInventoryItem(itemId);

    if (!inventoryItem || inventoryItem.quantity === 0) {
      Alert.alert('Not enough items', 'You need to buy this item from the shop first!');
      return;
    }

    const success = feedPanda(panda.id, itemId);
    if (success) {
      Alert.alert(
        '✨ Fed successfully!',
        `${panda.name} enjoyed the ${item?.name}! ${item?.effect.happiness ? `Happiness +${item.effect.happiness}` : ''} ${item?.effect.hunger ? `Hunger +${item.effect.hunger}` : ''}`
      );
    }
  };

  const foodItems = ['1', '2', '6']; // Fresh Bamboo, Golden Bamboo, Magic Potion

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: panda.name,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className="mr-4">
              <Icon as={ArrowLeft} size={24} className="text-foreground" />
            </Pressable>
          ),
        }}
      />
      <ScrollView className="flex-1 bg-background">
        {/* Panda Hero Section */}
        <View className="bg-card border-b border-border p-6">
          <View className="items-center">
            <View className="bg-primary/10 w-40 h-40 rounded-3xl overflow-hidden border-4 border-primary/20 mb-4">
              <Image
                source={panda.image}
                style={{ width: 160, height: 160 }}
                resizeMode="cover"
              />
            </View>
            <Text variant="h1" className="text-center mb-2">
              {panda.emoji} {panda.name}
            </Text>
            <Text variant="muted" className="text-lg">{panda.species}</Text>
          </View>
        </View>

        {/* Stats Section */}
        <View className="p-6 gap-4">
          <View className="bg-card border border-border rounded-2xl p-5">
            <Text variant="large" className="font-semibold mb-4">Stats</Text>
            
            <View className="gap-4">
              <View>
                <View className="flex-row justify-between mb-2">
                  <Text variant="small" className="font-medium">Level</Text>
                  <Text variant="small" className="font-bold text-primary">{panda.level}</Text>
                </View>
              </View>

              <View>
                <View className="flex-row justify-between mb-2">
                  <Text variant="small" className="font-medium">Experience</Text>
                  <Text variant="small" className="font-semibold text-purple-500">{panda.experience % 100}/100</Text>
                </View>
                <View className="h-3 w-full bg-muted rounded-full overflow-hidden">
                  <View 
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${(panda.experience % 100)}%` }}
                  />
                </View>
              </View>

              <View>
                <View className="flex-row justify-between mb-2">
                  <Text variant="small" className="font-medium">Happiness</Text>
                  <Text variant="small" className="font-semibold text-primary">{panda.happiness}%</Text>
                </View>
                <View className="h-3 w-full bg-muted rounded-full overflow-hidden">
                  <View 
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${panda.happiness}%` }}
                  />
                </View>
              </View>

              <View>
                <View className="flex-row justify-between mb-2">
                  <Text variant="small" className="font-medium">Hunger</Text>
                  <Text variant="small" className="font-semibold text-orange-500">{panda.hunger}%</Text>
                </View>
                <View className="h-3 w-full bg-muted rounded-full overflow-hidden">
                  <View 
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: `${panda.hunger}%` }}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Feed Section */}
          <View className="bg-card border border-border rounded-2xl p-5">
            <Text variant="large" className="font-semibold mb-4">Feed {panda.name}</Text>
            <View className="gap-3">
              {foodItems.map((itemId) => {
                const item = getShopItem(itemId);
                const inventoryItem = getInventoryItem(itemId);
                if (!item) return null;

                return (
                  <View key={itemId} className="flex-row items-center justify-between bg-secondary/50 rounded-xl p-4">
                    <View className="flex-1">
                      <Text className="font-semibold">{item.emoji} {item.name}</Text>
                      <Text variant="small" className="text-muted-foreground">
                        Owned: {inventoryItem?.quantity || 0}
                      </Text>
                    </View>
                    <Button
                      variant={inventoryItem && inventoryItem.quantity > 0 ? 'default' : 'outline'}
                      onPress={() => handleFeed(itemId)}
                      disabled={!inventoryItem || inventoryItem.quantity === 0}
                    >
                      <Text className={inventoryItem && inventoryItem.quantity > 0 ? 'text-primary-foreground' : 'text-muted-foreground'}>
                        Feed
                      </Text>
                    </Button>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Quick Actions */}
          <View className="flex-row gap-3">
            <Button 
              variant="outline" 
              className="flex-1 h-14 rounded-xl"
              onPress={() => router.push('/(tabs)/shop')}
            >
              <Icon as={Sparkles} size={20} className="text-primary" />
              <Text className="text-primary font-semibold">Buy Food</Text>
            </Button>
            <Button 
              variant="default" 
              className="flex-1 h-14 rounded-xl"
              onPress={() => router.push('/(tabs)/explore')}
            >
              <Icon as={Heart} size={20} className="text-primary-foreground" />
              <Text className="text-primary-foreground font-semibold">Explore</Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
