import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useGame } from '@/contexts/GameContext';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import * as React from 'react';
import { FlatList, Image, View } from 'react-native';

export default function MyPandasScreen() {
  const { state, selectPanda } = useGame();
  const router = useRouter();

  const handleSelectPanda = (pandaId: string) => {
    selectPanda(pandaId);
    router.push('/panda-detail');
  };

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={state.pandas}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4 gap-4"
        ListHeaderComponent={
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text variant="h2" className="text-primary">My Pandas</Text>
              <View className="bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                <Text className="text-primary font-semibold">{state.coins} Coins</Text>
              </View>
            </View>
            <Text variant="muted" className="mb-4 text-base">
              Take care of your adorable pandas!
            </Text>
            <Button className="h-14 rounded-2xl shadow-lg">
              <Icon as={Plus} size={20} className="text-primary-foreground" />
              <Text className="font-semibold">Adopt New Panda</Text>
            </Button>
          </View>
        }
        renderItem={({ item }) => (
          <View className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <View className="flex-row items-center gap-4 mb-4">
              <View className="bg-primary/10 w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary/20">
                <Image
                  source={item.image}
                  style={{ width: 80, height: 80 }}
                  resizeMode="cover"
                />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text variant="large" className="font-semibold">{item.name}</Text>
                  <Text className="text-xl">{item.emoji}</Text>
                </View>
                <Text variant="muted" className="text-sm">{item.species}</Text>
              </View>
            </View>
            
            <View className="gap-3 bg-secondary/50 rounded-xl p-3 mb-3">
              <View className="flex-row justify-between items-center">
                <Text variant="small" className="font-medium">Level</Text>
                <View className="bg-primary px-3 py-1 rounded-full">
                  <Text variant="small" className="text-primary-foreground font-bold">{item.level}</Text>
                </View>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text variant="small" className="font-medium">Happiness</Text>
                <Text variant="small" className="font-semibold text-primary">{item.happiness}%</Text>
              </View>

              <View className="flex-row justify-between items-center">
                <Text variant="small" className="font-medium">Hunger</Text>
                <Text variant="small" className="font-semibold text-orange-500">{item.hunger}%</Text>
              </View>
            </View>

            <Button 
              variant="default" 
              className="rounded-xl"
              onPress={() => handleSelectPanda(item.id)}
            >
              <Text className="text-primary-foreground font-semibold">View Details</Text>
            </Button>
          </View>
        )}
      />
    </View>
  );
}
