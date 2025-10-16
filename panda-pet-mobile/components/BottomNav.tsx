import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'expo-router';
import { Heart, Home, Map, ShoppingBag, Sparkles, User } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';

interface TabItem {
  name: string;
  label: string;
  icon: typeof Home;
  path: string;
}

const tabs: TabItem[] = [
  { name: 'home', label: 'Home', icon: Home, path: '/(tabs)' },
  { name: 'my-pandas', label: 'Pandas', icon: Heart, path: '/(tabs)/my-pandas' },
  { name: 'gacha', label: 'Gacha', icon: Sparkles, path: '/(tabs)/gacha' },
  { name: 'explore', label: 'Explore', icon: Map, path: '/(tabs)/explore' },
  { name: 'shop', label: 'Shop', icon: ShoppingBag, path: '/(tabs)/shop' },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => {
    // For home route
    if (path === '/(tabs)') {
      return pathname === '/(tabs)' || pathname === '/';
    }
    return pathname === path;
  };

  return (
    <View className="bg-card border-t border-border">
      <View className="flex-row items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <Pressable
              key={tab.name}
              onPress={() => router.push(tab.path as any)}
              className={cn(
                'flex-1 items-center justify-center h-full gap-1',
                'active:bg-primary/10 rounded-xl transition-colors'
              )}
            >
              {/* Icon with active state */}
              <View
                className={cn(
                  'items-center justify-center transition-all',
                  active && 'scale-110'
                )}
              >
                <Icon
                  as={tab.icon}
                  size={active ? 26 : 22}
                  className={cn(
                    'transition-colors',
                    active ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
              </View>

              {/* Label with active state */}
              <Text
                className={cn(
                  'text-xs font-medium transition-colors',
                  active ? 'text-primary font-semibold' : 'text-muted-foreground'
                )}
              >
                {tab.label}
              </Text>

              {/* Active indicator dot */}
              {active && (
                <View className="absolute top-1 w-1 h-1 bg-primary rounded-full" />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
