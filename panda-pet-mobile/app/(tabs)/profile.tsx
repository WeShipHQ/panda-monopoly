import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import * as React from 'react';
import { ScrollView, View } from 'react-native';

export default function ProfileScreen() {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        {/* Profile Header */}
        <View className="bg-card border border-border rounded-2xl p-6 mb-4 items-center shadow-sm">
          <View className="bg-primary/20 w-28 h-28 rounded-full items-center justify-center mb-4 border-4 border-primary/30">
            <Text className="text-6xl">🐼</Text>
          </View>
          <Text variant="h3" className="mb-2 font-bold text-primary">Panda Lover</Text>
          <View className="bg-primary/10 px-4 py-2 rounded-full">
            <Text variant="muted" className="font-semibold">Level 12 Trainer</Text>
          </View>
        </View>

        {/* Stats */}
        <View className="bg-card border border-border rounded-2xl p-5 mb-4 shadow-sm">
          <Text variant="h4" className="mb-4 font-bold text-primary">Statistics</Text>
          
          <View className="gap-3">
            <StatRow label="Total Pandas" value="3" emoji="🐼" />
            <StatRow label="Bamboo Coins" value="1,250" emoji="🎋" />
            <StatRow label="Items Collected" value="24" emoji="🎁" />
            <StatRow label="Locations Visited" value="5/10" emoji="🗺️" />
            <StatRow label="Days Active" value="45" emoji="📅" />
          </View>
        </View>

        {/* Achievements */}
        <View className="bg-card border border-border rounded-2xl p-5 mb-4 shadow-sm">
          <Text variant="h4" className="mb-4 font-bold text-primary">Achievements</Text>
          
          <View className="gap-3">
            <AchievementBadge emoji="🏆" title="First Panda" unlocked />
            <AchievementBadge emoji="🌟" title="Panda Master" unlocked />
            <AchievementBadge emoji="💎" title="Rare Collector" unlocked={false} />
            <AchievementBadge emoji="👑" title="Legendary Trainer" unlocked={false} />
          </View>
        </View>

        {/* Settings Buttons */}
        <View className="gap-3">
          <Button variant="secondary" className="h-14 rounded-2xl">
            <Text className="font-semibold">⚙️ Settings</Text>
          </Button>
          <Button variant="secondary" className="h-14 rounded-2xl">
            <Text className="font-semibold">📊 Leaderboard</Text>
          </Button>
          <Button variant="secondary" className="h-14 rounded-2xl">
            <Text className="font-semibold">❓ Help & Support</Text>
          </Button>
          <Button variant="destructive" className="h-14 rounded-2xl">
            <Text className="font-semibold">🚪 Logout</Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

function StatRow({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <View className="flex-row justify-between items-center bg-secondary/30 p-3 rounded-xl">
      <View className="flex-row items-center gap-3">
        <View className="bg-primary/10 w-10 h-10 rounded-full items-center justify-center">
          <Text className="text-xl">{emoji}</Text>
        </View>
        <Text variant="muted" className="font-medium">{label}</Text>
      </View>
      <Text variant="large" className="font-bold text-primary">{value}</Text>
    </View>
  );
}

function AchievementBadge({ emoji, title, unlocked }: { emoji: string; title: string; unlocked: boolean }) {
  return (
    <View className={`flex-row items-center gap-3 p-4 rounded-xl ${unlocked ? 'bg-primary/10 border-2 border-primary/30' : 'bg-muted/30 border-2 border-transparent'}`}>
      <View className={`w-12 h-12 rounded-full items-center justify-center ${unlocked ? 'bg-primary/20' : 'bg-muted/50'}`}>
        <Text className="text-3xl" style={{ opacity: unlocked ? 1 : 0.3 }}>{emoji}</Text>
      </View>
      <Text variant="small" className={`flex-1 font-semibold ${unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
        {title}
      </Text>
      {unlocked && (
        <View className="bg-primary px-3 py-1 rounded-full">
          <Text variant="small" className="text-primary-foreground font-bold">✓</Text>
        </View>
      )}
    </View>
  );
}
