import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useGame } from '@/contexts/GameContext';
import { ShoppingBag } from 'lucide-react-native';
import * as React from 'react';
import { Alert, FlatList, View } from 'react-native';

export default function ShopScreen() {
  const { state, buyItem, getShopItem, getInventoryItem } = useGame();

  const shopItems = ['1', '2', '3', '4', '5', '6', '7', '8'];

  const handleBuyItem = (itemId: string) => {
    const item = getShopItem(itemId);
    if (!item) return;

    if (state.coins < item.price) {
      Alert.alert('Not enough coins!', `You need ${item.price} coins but only have ${state.coins} coins.`);
      return;
    }

    const success = buyItem(itemId);
    if (success) {
      const inventoryItem = getInventoryItem(itemId);
      Alert.alert(
        '✨ Purchase successful!',
        `You bought ${item.name} for ${item.price} coins!\nYou now have ${inventoryItem?.quantity || 1}x ${item.name}`
      );
    }
  };

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={shopItems}
        keyExtractor={(item) => item}
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
              <Text variant="large" className="font-semibold">Your Coins:</Text>
              <Text variant="h3" className="text-primary font-bold">💰 {state.coins}</Text>
            </View>
          </View>
        }
        renderItem={({ item: itemId }) => {
          const item = getShopItem(itemId);
          const inventoryItem = getInventoryItem(itemId);
          if (!item) return null;

          return (
            <View className="flex-1 bg-card border border-border rounded-2xl p-4 shadow-sm">
              <View className="bg-primary/5 w-full aspect-square rounded-xl items-center justify-center mb-3">
                <Text className="text-5xl">{item.emoji}</Text>
              </View>
              <Text variant="small" className="text-center text-muted-foreground mb-1 uppercase tracking-wide">
                {item.category}
              </Text>
              <Text variant="large" className="text-center mb-2 font-semibold">{item.name}</Text>
              {inventoryItem && inventoryItem.quantity > 0 && (
                <Text variant="small" className="text-center text-primary mb-1">
                  Owned: {inventoryItem.quantity}
                </Text>
              )}
              <View className="flex-row items-center justify-center gap-1 mb-3 bg-primary/10 py-2 rounded-lg">
                <Text className="text-lg">💰</Text>
                <Text variant="large" className="text-primary font-bold">{item.price}</Text>
              </View>
              <Button 
                size="sm" 
                className="rounded-xl"
                onPress={() => handleBuyItem(itemId)}
                disabled={state.coins < item.price}
              >
                <Icon as={ShoppingBag} size={16} className="text-primary-foreground" />
                <Text className="font-semibold">Buy Now</Text>
              </Button>
            </View>
          );
        }}
      />
    </View>
  );
}
