import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { PandaRarity, useGame } from '@/contexts/GameContext';
import { Sparkles, Gift, TrendingUp } from 'lucide-react-native';
import * as React from 'react';
import { Alert, Animated, Image, ScrollView, View } from 'react-native';

// Rarity colors and display info
const rarityInfo: Record<PandaRarity, { color: string; bgColor: string; label: string; glow: string }> = {
  common: { color: '#9CA3AF', bgColor: '#F3F4F6', label: 'Common', glow: '#D1D5DB' },
  rare: { color: '#3B82F6', bgColor: '#DBEAFE', label: 'Rare', glow: '#60A5FA' },
  epic: { color: '#A855F7', bgColor: '#F3E8FF', label: 'Epic', glow: '#C084FC' },
  legendary: { color: '#F59E0B', bgColor: '#FEF3C7', label: 'Legendary', glow: '#FBBF24' },
};

export default function GachaScreen() {
  const { state, spinGacha, canUseFreeSpin } = useGame();
  const [isSpinning, setIsSpinning] = React.useState(false);
  const [showResult, setShowResult] = React.useState(false);
  const [lastResult, setLastResult] = React.useState<{ panda: any; isNew: boolean } | null>(null);
  
  // Animation values
  const spinAnimation = React.useRef(new Animated.Value(0)).current;
  const scaleAnimation = React.useRef(new Animated.Value(0)).current;
  const glowAnimation = React.useRef(new Animated.Value(0)).current;

  const hasFreeSpin = canUseFreeSpin();
  const spinCost = 100;
  const canAffordSpin = state.coins >= spinCost;

  const startSpinAnimation = () => {
    Animated.sequence([
      // Spin animation
      Animated.timing(spinAnimation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      // Scale reveal
      Animated.parallel([
        Animated.spring(scaleAnimation, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnimation, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnimation, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ),
      ]),
    ]).start();
  };

  const handleSpin = (useFreeSpin: boolean = false) => {
    if (!useFreeSpin && !canAffordSpin) {
      Alert.alert('Not enough coins!', `You need ${spinCost} coins to spin. Current: ${state.coins} coins.`);
      return;
    }

    if (useFreeSpin && !hasFreeSpin) {
      Alert.alert('No free spin available', 'Come back tomorrow for your daily free spin!');
      return;
    }

    setIsSpinning(true);
    setShowResult(false);
    spinAnimation.setValue(0);
    scaleAnimation.setValue(0);

    // Start animation
    startSpinAnimation();

    // Simulate spin delay
    setTimeout(() => {
      const result = spinGacha(useFreeSpin);
      
      if (result) {
        setLastResult(result);
        setShowResult(true);
        setIsSpinning(false);
      } else {
        Alert.alert('Error', 'Failed to spin. Please try again.');
        setIsSpinning(false);
      }
    }, 2000);
  };

  const resetResult = () => {
    setShowResult(false);
    setLastResult(null);
    scaleAnimation.setValue(0);
    spinAnimation.setValue(0);
    glowAnimation.setValue(0);
  };

  const spinRotation = spinAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '720deg'],
  });

  const glowOpacity = glowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <ScrollView className="flex-1 bg-background">
      {/* Header */}
      <View className="p-6 bg-gradient-to-b from-primary/20">
        <Text variant="h1" className="text-center mb-2">🎰 Panda Gacha</Text>
        <Text variant="muted" className="text-center mb-4">
          Spin to collect rare pandas!
        </Text>
        
        {/* Coins Display */}
        <View className="bg-card border border-border rounded-2xl p-4 flex-row items-center justify-between mb-4">
          <Text variant="large" className="font-semibold">Your Coins:</Text>
          <Text variant="h3" className="text-primary font-bold">💰 {state.coins}</Text>
        </View>

        {/* Stats */}
        <View className="flex-row gap-2">
          <View className="flex-1 bg-card border border-border rounded-xl p-3">
            <Text variant="small" className="text-muted-foreground text-center mb-1">Total Spins</Text>
            <Text variant="large" className="text-center font-bold text-primary">{state.totalSpins}</Text>
          </View>
          <View className="flex-1 bg-card border border-border rounded-xl p-3">
            <Text variant="small" className="text-muted-foreground text-center mb-1">Pandas Owned</Text>
            <Text variant="large" className="text-center font-bold text-primary">{state.pandas.length}</Text>
          </View>
        </View>
      </View>

      {/* Spin Result */}
      {showResult && lastResult && (
        <View className="p-6">
          <Animated.View 
            style={{
              transform: [{ scale: scaleAnimation }],
            }}
          >
            <View 
              className="rounded-3xl p-6 items-center border-4"
              style={{ 
                backgroundColor: rarityInfo[lastResult.panda.rarity || 'common'].bgColor,
                borderColor: rarityInfo[lastResult.panda.rarity || 'common'].color,
              }}
            >
              {/* New Badge */}
              {lastResult.isNew && (
                <View className="absolute -top-3 right-4 bg-green-500 px-4 py-1 rounded-full z-10">
                  <Text className="text-white font-bold text-xs">✨ NEW!</Text>
                </View>
              )}

              {/* Rarity Badge */}
              <View 
                className="px-6 py-2 rounded-full mb-4"
                style={{ backgroundColor: rarityInfo[lastResult.panda.rarity || 'common'].color }}
              >
                <Text className="text-white font-bold text-lg">
                  {rarityInfo[lastResult.panda.rarity || 'common'].label.toUpperCase()}
                </Text>
              </View>

              {/* Panda Image with Glow */}
              <Animated.View
                style={{
                  opacity: glowOpacity,
                }}
              >
                <View 
                  className="w-40 h-40 rounded-full items-center justify-center mb-4 overflow-hidden"
                  style={{ 
                    backgroundColor: rarityInfo[lastResult.panda.rarity || 'common'].glow,
                  }}
                >
                  <Image
                    source={lastResult.panda.image}
                    style={{ width: 160, height: 160 }}
                    resizeMode="cover"
                  />
                </View>
              </Animated.View>

              {/* Panda Info */}
              <Text variant="h2" className="text-center mb-2">
                {lastResult.panda.emoji} {lastResult.panda.name}
              </Text>
              <Text variant="large" className="text-center text-muted-foreground mb-4">
                {lastResult.panda.species}
              </Text>

              {/* Message */}
              <View className="bg-white/50 rounded-xl p-4 w-full mb-4">
                <Text className="text-center font-medium">
                  {lastResult.isNew 
                    ? '🎉 Congratulations! You got a new panda!' 
                    : '⭐ You already have this panda!'}
                </Text>
              </View>

              {/* Close Button */}
              <Button 
                variant="default" 
                className="w-full rounded-xl"
                onPress={resetResult}
              >
                <Text className="text-primary-foreground font-semibold">Continue</Text>
              </Button>
            </View>
          </Animated.View>
        </View>
      )}

      {/* Spinning Animation */}
      {isSpinning && !showResult && (
        <View className="p-6 items-center justify-center" style={{ minHeight: 300 }}>
          <Animated.View
            style={{
              transform: [{ rotate: spinRotation }],
            }}
          >
            <View className="w-32 h-32 bg-primary/20 rounded-full items-center justify-center">
              <Text className="text-6xl">🎰</Text>
            </View>
          </Animated.View>
          <Text variant="h3" className="mt-6 text-primary">Spinning...</Text>
          <Text variant="muted" className="mt-2">Get ready for your panda!</Text>
        </View>
      )}

      {/* Spin Buttons */}
      {!isSpinning && !showResult && (
        <View className="p-6 gap-4">
          {/* Free Spin Button */}
          <View className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-1">
            <View className="bg-card rounded-2xl p-6">
              <View className="flex-row items-center justify-center mb-4">
                <Icon as={Gift} size={32} className="text-green-500 mr-2" />
                <Text variant="h3" className="text-green-500 font-bold">Daily Free Spin</Text>
              </View>
              <Text variant="muted" className="text-center mb-4">
                {hasFreeSpin 
                  ? '🎁 Your free spin is ready!' 
                  : '⏰ Come back tomorrow for your free spin!'}
              </Text>
              <Button
                variant="default"
                className="w-full h-16 rounded-xl"
                style={{ backgroundColor: '#10B981' }}
                onPress={() => handleSpin(true)}
                disabled={!hasFreeSpin}
              >
                <Icon as={Sparkles} size={24} className="text-white" />
                <Text className="text-white font-bold text-lg">
                  {hasFreeSpin ? 'SPIN FREE!' : 'Not Available'}
                </Text>
              </Button>
            </View>
          </View>

          {/* Paid Spin Button */}
          <View className="bg-card border border-border rounded-2xl p-6">
            <View className="flex-row items-center justify-center mb-4">
              <Text className="text-4xl mr-2">💰</Text>
              <Text variant="h3" className="font-bold">Coin Spin</Text>
            </View>
            <Text variant="muted" className="text-center mb-4">
              Use {spinCost} coins for another spin
            </Text>
            <Button
              variant="default"
              className="w-full h-16 rounded-xl"
              onPress={() => handleSpin(false)}
              disabled={!canAffordSpin}
            >
              <Icon as={TrendingUp} size={24} className="text-primary-foreground" />
              <Text className="text-primary-foreground font-bold text-lg">
                SPIN ({spinCost} 💰)
              </Text>
            </Button>
            {!canAffordSpin && (
              <Text variant="small" className="text-red-500 text-center mt-2">
                Not enough coins! Explore to earn more.
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Rarity Info */}
      <View className="p-6">
        <Text variant="h3" className="mb-4 font-bold">Drop Rates</Text>
        <View className="bg-card border border-border rounded-2xl p-4 gap-3">
          {(Object.entries(rarityInfo) as [PandaRarity, typeof rarityInfo.common][]).map(([rarity, info]) => (
            <View key={rarity} className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: info.color }}
                />
                <Text className="font-medium">{info.label}</Text>
              </View>
              <Text className="text-muted-foreground">
                {rarity === 'common' ? '60%' : rarity === 'rare' ? '25%' : rarity === 'epic' ? '12%' : '3%'}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Tips */}
      <View className="p-6 pb-8">
        <View className="bg-primary/10 border border-primary/30 rounded-2xl p-4">
          <Text variant="large" className="font-semibold mb-2">💡 Tips:</Text>
          <Text variant="small" className="text-muted-foreground leading-relaxed">
            • Get 1 FREE spin every day!{'\n'}
            • Each spin costs 100 coins{'\n'}
            • Legendary pandas are super rare (3% chance){'\n'}
            • Explore locations to earn more coins{'\n'}
            • Duplicate pandas still add to your collection!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
