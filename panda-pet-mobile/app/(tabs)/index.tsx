import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import { Heart, Map, ShoppingBag, User } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <View className="mb-8">
          <Text variant="h1" className="mb-4 text-primary">
            🐼 Welcome to PetWorld!
          </Text>
          <Text className="text-muted-foreground text-center text-lg mb-6">
            Adopt your magical panda, explore bamboo forests, and collect amazing items!
          </Text>
        </View>

        {/* Features */}
        <View className="gap-4 mb-8">
          <FeatureCard
            icon="🐼"
            title="Adopt Your Panda!"
            description="Choose from 7 magical panda species! Feed them bamboo, play together, and watch them grow into happy companions"
          />
          
          <FeatureCard
            icon="🎋"
            title="Bamboo Forest Adventure"
            description="Explore enchanted bamboo forests, discover hidden treasures, and meet other adorable pandas in this magical world!"
          />
          
          <FeatureCard
            icon="🎁"
            title="Collect & Customize"
            description="Gather bamboo treats, cute accessories, and special items. Dress up your pandas and make them uniquely yours!"
          />

          <FeatureCard
            icon="✨"
            title="Completely Free"
            description="Simply create a free account and begin your adventure into the world of PetWorld!"
          />
        </View>

        {/* Navigation Buttons */}
        <View className="gap-3">
          <Button
            onPress={() => router.push('/font-test')}
            variant="outline"
            className="h-12 rounded-xl"
          >
            <Text className="text-sm font-medium">🔤 Test Font</Text>
          </Button>

          <Button
            onPress={() => router.push('/my-pandas')}
            className="h-16 rounded-2xl shadow-lg"
          >
            <Icon as={Heart} size={24} className="text-primary-foreground" />
            <Text className="text-lg font-semibold">My Pandas</Text>
          </Button>

          <Button
            variant="secondary"
            onPress={() => router.push('/explore')}
            className="h-16 rounded-2xl"
          >
            <Icon as={Map} size={24} />
            <Text className="text-lg font-semibold">Explore Map</Text>
          </Button>

          <Button
            variant="secondary"
            onPress={() => router.push('/shop')}
            className="h-16 rounded-2xl"
          >
            <Icon as={ShoppingBag} size={24} />
            <Text className="text-lg font-semibold">Item Shop</Text>
          </Button>

          <Button
            variant="outline"
            onPress={() => router.push('/profile')}
            className="h-16 rounded-2xl"
          >
            <Icon as={User} size={24} />
            <Text className="text-lg font-semibold">Profile</Text>
          </Button>
        </View>

        {/* Additional Features */}
        <View className="mt-12 gap-4">
          <Text variant="h3" className="text-center mb-4 text-primary">More Features</Text>
          
          <View className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <Text className="text-5xl mb-3 text-center">🎋</Text>
            <Text variant="large" className="mb-2 text-center font-semibold">Daily Bamboo Rewards</Text>
            <Text variant="muted" className="text-center">
              Log in every day to receive fresh bamboo and special treats for your pandas!
            </Text>
          </View>

          <View className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <Text className="text-5xl mb-3 text-center">🎮</Text>
            <Text variant="large" className="mb-2 text-center font-semibold">Panda Mini Games</Text>
            <Text variant="muted" className="text-center">
              Play fun panda-themed games to earn bamboo coins and unlock rare items!
            </Text>
          </View>

          <View className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <Text className="text-5xl mb-3 text-center">🐼</Text>
            <Text variant="large" className="mb-2 text-center font-semibold">Panda Community</Text>
            <Text variant="muted" className="text-center">
              Trade items with friends and show off your adorable panda collection!
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <View className="flex-row gap-4 bg-card border border-border rounded-2xl p-5 shadow-sm">
      <Text className="text-4xl">{icon}</Text>
      <View className="flex-1">
        <Text variant="large" className="mb-2 font-semibold">{title}</Text>
        <Text variant="muted" className="leading-relaxed">{description}</Text>
      </View>
    </View>
  );
}
