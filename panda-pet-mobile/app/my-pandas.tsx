import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Plus } from 'lucide-react-native';
import * as React from 'react';
import { FlatList, View } from 'react-native';

interface Panda {
  id: string;
  name: string;
  species: string;
  emoji: string;
  level: number;
  happiness: number;
}

const mockPandas: Panda[] = [
  { id: '1', name: 'Bamboo', species: 'Classic Panda', emoji: '🐼', level: 5, happiness: 95 },
  { id: '2', name: 'Snowflake', species: 'Ice Panda', emoji: '❄️', level: 3, happiness: 88 },
  { id: '3', name: 'Sunny', species: 'Golden Panda', emoji: '🌟', level: 7, happiness: 92 },
];

export default function MyPandasScreen() {
  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={mockPandas}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4 gap-4"
        ListHeaderComponent={
          <View className="mb-4">
            <Text variant="h2" className="mb-3 text-primary">My Pandas 🐼</Text>
            <Text variant="muted" className="mb-4 text-base">
              Take care of your adorable pandas and watch them grow!
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
              <View className="bg-primary/10 w-16 h-16 rounded-full items-center justify-center">
                <Text className="text-4xl">{item.emoji}</Text>
              </View>
              <View className="flex-1">
                <Text variant="large" className="font-semibold">{item.name}</Text>
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
                <View className="flex-row items-center gap-2">
                  <View className="h-2.5 w-32 bg-muted rounded-full overflow-hidden">
                    <View 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${item.happiness}%` }}
                    />
                  </View>
                  <Text variant="small" className="text-foreground font-bold w-10">{item.happiness}%</Text>
                </View>
              </View>
            </View>

            <View className="flex-row gap-2">
              <Button variant="secondary" className="flex-1 h-12 rounded-xl">
                <Text className="font-semibold">Feed 🎋</Text>
              </Button>
              <Button variant="secondary" className="flex-1 h-12 rounded-xl">
                <Text className="font-semibold">Play 🎮</Text>
              </Button>
            </View>
          </View>
        )}
      />
    </View>
  );
}
