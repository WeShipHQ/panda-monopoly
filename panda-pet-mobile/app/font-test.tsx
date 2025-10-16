import { Text } from '@/components/ui/text';
import { ScrollView, View } from 'react-native';

export default function FontTestScreen() {
  return (
    <ScrollView className="flex-1 bg-background p-4">
      <View className="gap-4">
        <Text variant="h1" className="mb-4">Font Fredoka Test 🔤</Text>

        <View className="bg-card border border-border rounded-2xl p-4 gap-2">
          <Text className="text-lg mb-2">Font Weights:</Text>
          
          <Text className="font-light text-base">
            Light (300) - The quick brown fox jumps
          </Text>
          
          <Text className="font-normal text-base">
            Regular (400) - The quick brown fox jumps
          </Text>
          
          <Text className="font-medium text-base">
            Medium (500) - The quick brown fox jumps
          </Text>
          
          <Text className="font-semibold text-base">
            SemiBold (600) - The quick brown fox jumps
          </Text>
          
          <Text className="font-bold text-base">
            Bold (700) - The quick brown fox jumps
          </Text>
        </View>

        <View className="bg-card border border-border rounded-2xl p-4 gap-2">
          <Text className="text-lg font-semibold mb-2">Typography Variants:</Text>
          
          <Text variant="h1">Heading 1 - Fredoka</Text>
          <Text variant="h2">Heading 2 - Fredoka</Text>
          <Text variant="h3">Heading 3 - Fredoka</Text>
          <Text variant="h4">Heading 4 - Fredoka</Text>
          <Text variant="large">Large text - Fredoka</Text>
          <Text variant="p">Paragraph text - Fredoka</Text>
          <Text variant="small">Small text - Fredoka</Text>
          <Text variant="muted">Muted text - Fredoka</Text>
        </View>

        <View className="bg-primary/10 border border-primary/30 rounded-2xl p-4">
          <Text className="font-bold text-primary text-center text-xl">
            ✅ If you see rounded, friendly fonts = Fredoka is working!
          </Text>
        </View>

        <View className="bg-card border border-border rounded-2xl p-4">
          <Text className="font-semibold text-base mb-2">Numbers & Symbols:</Text>
          <Text className="font-bold text-2xl">0123456789</Text>
          <Text className="font-medium text-xl">🐼 🎋 🎁 ✨ 🗺️ 🛍️</Text>
          <Text className="font-semibold text-lg">!@#$%^&*()</Text>
        </View>
      </View>
    </ScrollView>
  );
}
