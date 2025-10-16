# 🐼 Panda Pet Mobile# Panda Pet Mobile



Virtual pet app built with React Native (Expo), NativeWind, and TypeScript.A React Native mobile app for Panda Pet World - Adopt, care for, and adventure with your adorable pandas!



## 🚀 Quick Start## Features



```bash- 🐼 **My Pandas**: Adopt and care for magical pandas

# Install dependencies- 🗺️ **Explore Map**: Discover new locations and wild pandas

pnpm install- 🛍️ **Item Shop**: Buy food, accessories, and special items

- 👤 **Profile**: Track stats, achievements, and progress

# Start development server

pnpm dev## Tech Stack



# Run on iOS- React Native with Expo

pnpm ios- Expo Router for navigation

- NativeWind (Tailwind CSS for React Native)

# Run on Android- TypeScript

pnpm android

```## Getting Started



## 📱 Features```bash

# Install dependencies

### ✅ Implementedpnpm install

- **My Pandas**: View and manage your panda collection

- **Panda Details**: Feed pandas, view stats, increase happiness & hunger# Start the development server

- **Shop**: Buy food and items using coinspnpm dev

- **Explore**: Unlock locations and explore to earn coins & experience

- **Bottom Navigation**: 5 tabs with active state animations# Run on Android

- **State Management**: GameContext with React Context APIpnpm android

- **Leveling System**: Pandas level up when experience reaches 100

# Run on iOS

### 🎮 Game Mechanicspnpm ios

```

**Starting Resources:**

- 100 coins## Project Structure

- 3x Fresh Bamboo

- 5 pandas (levels 1-5)```

- 1 location unlocked (Bamboo Forest)app/              # Expo Router screens

components/       # Reusable UI components

**Core Loop:**  ui/            # Base UI components (Button, Text, Icon)

1. Feed pandas → Increase statslib/             # Utilities

2. Explore locations → Earn coins & XP```

3. Buy items from shop

4. Unlock new locations## Development

5. Level up pandas

This app uses:

## 📖 Complete Documentation- **className** for styling (via NativeWind)

- **Expo Router** for file-based routing

See [GAME_FLOW_DOCUMENTATION.md](./GAME_FLOW_DOCUMENTATION.md) for:- **Lucide React Native** for icons

- Complete user flows

- All item effectsBuilt with ❤️ for Panda lovers!

- Location details
- Economy balance
- Progression system
- Testing checklist

## 🎨 Design System

- **Color Scheme**: Warm beige/orange theme
- **Font**: Fredoka (5 weights: 300, 400, 500, 600, 700)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Icons**: Lucide React Native

## 📁 Project Structure

```
panda-pet-mobile/
├── app/
│   ├── (tabs)/           # Bottom tab screens
│   │   ├── index.tsx     # Home
│   │   ├── my-pandas.tsx # Pandas list
│   │   ├── explore.tsx   # Explore locations
│   │   ├── shop.tsx      # Shop items
│   │   └── profile.tsx   # User profile
│   ├── panda-detail.tsx  # Panda detail & feeding
│   └── _layout.tsx       # Root layout with GameProvider
├── components/
│   ├── ui/               # Reusable UI components
│   └── BottomNav.tsx     # Custom bottom navigation
├── contexts/
│   └── GameContext.tsx   # Game state management
├── data/
│   └── mock-data.ts      # Mock data & interfaces
└── public/assets/
    └── panda-pet/        # Panda images (panda1-8.png)
```

## 🎯 Quick Test Flow

### Test 1: Feed Panda
1. Open "My Pandas" tab
2. Tap "View Details" on any panda
3. Scroll to "Feed" section
4. Tap "Feed" on Fresh Bamboo (you have 3)
5. ✅ See alert "Fed successfully!" with stat changes

### Test 2: Buy Item
1. Open "Shop" tab
2. Tap "Buy Now" on Fresh Bamboo (10 coins)
3. ✅ See alert "Purchase successful!"
4. Check coins decreased: 100 → 90
5. See "Owned: 4" on item

### Test 3: Explore Location
1. Select a panda from "My Pandas" (level 1+)
2. Open "Explore" tab
3. Tap "Explore" on Bamboo Forest
4. ✅ See alert with earned coins & XP
5. Check panda stats updated

### Test 4: Unlock Location
1. Explore Bamboo Forest multiple times
2. Earn 300+ coins
3. Tap "Unlock" on Mystic Cave
4. Confirm unlock
5. ✅ Location now available to explore

### Test 5: Level Up
1. Feed panda with Golden Bamboo (+10 XP)
2. Explore locations multiple times
3. When experience reaches 100:
   - ✅ Level increases
   - ✅ Experience resets to 0

## 🔧 Tech Stack

- **Framework**: Expo 54.0.13
- **React Native**: 0.81.4
- **Routing**: Expo Router 6.0.12 (file-based)
- **Styling**: NativeWind 4.2.1
- **State Management**: React Context API
- **Fonts**: @expo-google-fonts/fredoka
- **Icons**: lucide-react-native
- **Language**: TypeScript 5.9.3

## 📊 Game Balance

### Economy
- **Exploration**: 20-70 coins (avg 45)
- **Food**: 10-200 coins
- **Locations**: 300-1000 coins to unlock

### Leveling
- **XP to level**: 100
- **Exploration**: 10-40 XP (avg 25)
- **Food bonus**: 0-50 XP

### Stats
- **Hunger**: -10 per exploration
- **Happiness**: +10 per exploration
- **Caps**: All stats max at 100%

## 🎨 Color Palette

```css
Primary: hsl(25, 80%, 60%)      /* Orange */
Background: hsl(41, 25%, 96%)   /* Warm Beige */
Card: hsl(41, 20%, 98%)         /* Light Beige */
Border: hsl(41, 10%, 90%)       /* Border Gray */
Muted: hsl(0, 0%, 60%)          /* Text Gray */
```

## 📝 Key Functions

```typescript
// Context functions
feedPanda(pandaId, itemId)      // Feed panda with item
explorLocation(pandaId, locationId) // Explore with panda
buyItem(itemId)                 // Buy item from shop
unlockLocation(locationId)      // Unlock new location
selectPanda(pandaId)           // Set active panda
getSelectedPanda()             // Get active panda
```

## 🐛 Known Issues

- TypeScript module declaration errors (non-blocking)
- No persistent storage yet (state resets on app restart)
- No animations on stat changes (instant updates)

## 🚀 Next Steps

1. **Persistence**: Add AsyncStorage for state
2. **Animations**: Add smooth stat transitions
3. **Sound effects**: Add audio feedback
4. **More features**: See Future Enhancements in full documentation

## 📄 License

MIT

## 👥 Credits

- Panda images from panda-pet web project
- Icons by Lucide
- Font by Google Fonts (Fredoka)

---

**Happy Panda Gaming! 🐼✨**
