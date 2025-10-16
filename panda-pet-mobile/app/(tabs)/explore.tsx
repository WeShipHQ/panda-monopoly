import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useGame } from '@/contexts/GameContext';
import { Lock, MapPin, Unlock } from 'lucide-react-native';
import * as React from 'react';
import { Alert, FlatList, Pressable, View } from 'react-native';

export default function ExploreScreen() {
  const { state, explorLocation, unlockLocation, getSelectedPanda, getLocation } = useGame();
  const [selectedLocation, setSelectedLocation] = React.useState<string | null>(null);

  const handleExplore = (locationId: string) => {
    const panda = getSelectedPanda();
    const location = getLocation(locationId);

    if (!panda) {
      Alert.alert('No panda selected', 'Please select a panda from My Pandas first!');
      return;
    }

    if (!location) return;

    if (!location.unlocked) {
      Alert.alert('Location locked', `This location costs ${location.cost} coins to unlock.`);
      return;
    }

    if (panda.level < location.level) {
      Alert.alert('Level too low', `${panda.name} needs to be level ${location.level} to explore this location!`);
      return;
    }

    const success = explorLocation(panda.id, locationId);
    if (success) {
      const coinsEarned = Math.floor(Math.random() * 50) + 20;
      const expEarned = Math.floor(Math.random() * 30) + 10;
      Alert.alert(
        '🎉 Exploration successful!',
        `${panda.name} explored ${location.name}!\n\n💰 +${coinsEarned} coins\n✨ +${expEarned} experience\n❤️ +10 happiness\n🍚 -10 hunger`
      );
    }
  };

  const handleUnlock = (locationId: string) => {
    const location = getLocation(locationId);
    if (!location) return;

    if (state.coins < location.cost) {
      Alert.alert('Not enough coins', `You need ${location.cost} coins to unlock ${location.name}`);
      return;
    }

    Alert.alert(
      'Unlock location?',
      `Do you want to unlock ${location.name} for ${location.cost} coins?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlock',
          onPress: () => {
            const success = unlockLocation(locationId);
            if (success) {
              Alert.alert('✨ Unlocked!', `${location.name} is now available to explore!`);
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={state.locations}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4 gap-4"
        ListHeaderComponent={
          <View className="mb-4">
            <Text variant="h2" className="mb-3 text-primary">Explore Map 🗺️</Text>
            <Text variant="muted" className="mb-4 text-base">
              Discover new locations and earn rewards!
            </Text>
            <View className="bg-card border border-border rounded-2xl p-4 flex-row items-center justify-between">
              <Text variant="large" className="font-semibold">Your Coins:</Text>
              <Text variant="h3" className="text-primary font-bold">💰 {state.coins}</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const panda = getSelectedPanda();
          const canExplore = panda && panda.level >= item.level;

          return (
            <View className={`bg-card border border-border rounded-2xl p-5 shadow-sm ${!item.unlocked ? 'opacity-75' : ''}`}>
              <View className="flex-row items-center gap-4 mb-4">
                <View className={`${item.unlocked ? 'bg-primary/10' : 'bg-muted'} w-16 h-16 rounded-full items-center justify-center`}>
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
                  {!item.unlocked && (
                    <Text variant="small" className="text-orange-500 mt-2">
                      🔒 Unlock for {item.cost} coins
                    </Text>
                  )}
                </View>
              </View>

              <View className="flex-row gap-2">
                {!item.unlocked ? (
                  <Button
                    variant="default"
                    className="flex-1 rounded-xl"
                    onPress={() => handleUnlock(item.id)}
                  >
                    <Icon as={Unlock} size={18} className="text-primary-foreground" />
                    <Text className="text-primary-foreground font-semibold">Unlock ({item.cost}💰)</Text>
                  </Button>
                ) : (
                  <Button
                    variant={canExplore ? 'default' : 'outline'}
                    className="flex-1 rounded-xl"
                    onPress={() => handleExplore(item.id)}
                    disabled={!canExplore}
                  >
                    <Icon as={MapPin} size={18} className={canExplore ? 'text-primary-foreground' : 'text-muted-foreground'} />
                    <Text className={canExplore ? 'text-primary-foreground font-semibold' : 'text-muted-foreground'}>
                      {canExplore ? 'Explore' : `Need Lv.${item.level}`}
                    </Text>
                  </Button>
                )}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}
