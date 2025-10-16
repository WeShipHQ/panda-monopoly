import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { useFonts, Fredoka_300Light, Fredoka_400Regular, Fredoka_500Medium, Fredoka_600SemiBold, Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fredoka_300Light,
    Fredoka_400Regular,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
  });

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen 
          name="my-pandas" 
          options={{ 
            title: 'My Pandas',
            headerStyle: { backgroundColor: 'hsl(41, 25%, 96%)' },
          }} 
        />
        <Stack.Screen 
          name="explore" 
          options={{ 
            title: 'Explore Map',
            headerStyle: { backgroundColor: 'hsl(41, 25%, 96%)' },
          }} 
        />
        <Stack.Screen 
          name="shop" 
          options={{ 
            title: 'Item Shop',
            headerStyle: { backgroundColor: 'hsl(41, 25%, 96%)' },
          }} 
        />
        <Stack.Screen 
          name="profile" 
          options={{ 
            title: 'Profile',
            headerStyle: { backgroundColor: 'hsl(41, 25%, 96%)' },
          }} 
        />
      </Stack>
    </>
  );
}
