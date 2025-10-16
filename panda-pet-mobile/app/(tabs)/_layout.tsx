import { BottomNav } from '@/components/BottomNav';
import { Tabs } from 'expo-router';
import * as React from 'react';

export default function TabsLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={() => <BottomNav />}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="my-pandas" />
        <Tabs.Screen name="gacha" />
        <Tabs.Screen name="explore" />
        <Tabs.Screen name="shop" />
        <Tabs.Screen name="profile" />
      </Tabs>
    </>
  );
}
