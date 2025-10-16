# 🐼 Panda Pet Mobile - Visual Flow Diagram

## 🗺️ App Navigation Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     Root Layout (_layout.tsx)                │
│                    • GameProvider Wrapper                    │
│                    • Font Loading (Fredoka)                  │
│                    • Splash Screen                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Bottom Tab Navigator (tabs)                 │
│  ┌──────┬──────────┬─────────┬──────┬─────────┐            │
│  │ Home │ My Pandas│ Explore │ Shop │ Profile │            │
│  │  🏠  │    🐼    │   🗺️   │  🛍️ │   👤    │            │
│  └──────┴──────────┴─────────┴──────┴─────────┘            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
          ┌──────────────────────────────────┐
          │     Panda Detail Screen          │
          │   (Outside tabs - Stack)         │
          │  • Feed Panda                    │
          │  • View Stats                    │
          │  • Quick Actions                 │
          └──────────────────────────────────┘
```

---

## 🔄 Complete Game Flow

```
START
  │
  ▼
┌─────────────────────────────────────────┐
│         Initial State                    │
│  • 100 coins                            │
│  • 3x Fresh Bamboo                      │
│  • 5 pandas (Lv 1-5)                    │
│  • 1 location unlocked                  │
└─────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────┐
│    1️⃣ My Pandas Tab                     │
│  • View all pandas                      │
│  • See Level, Happiness, Hunger         │
│  • Select panda                         │
└─────────────────────────────────────────┘
  │
  │ Tap "View Details"
  ▼
┌─────────────────────────────────────────┐
│    📱 Panda Detail Screen               │
│  • View detailed stats                  │
│  • Level, XP, Happiness, Hunger bars    │
│  • Feed section                         │
└─────────────────────────────────────────┘
  │
  ├─────────────────┬─────────────────┐
  │                 │                 │
  ▼                 ▼                 ▼
┌───────┐     ┌──────────┐     ┌──────────┐
│ Feed  │     │   Buy    │     │ Explore  │
│ Panda │     │  Food    │     │ Location │
└───────┘     └──────────┘     └──────────┘
  │                 │                 │
  ▼                 ▼                 ▼
```

---

## 🎮 Flow 1: Feed Panda

```
┌───────────────────────────────────────────────────────────┐
│                  FEED PANDA FLOW                          │
└───────────────────────────────────────────────────────────┘

    My Pandas Tab
         │
         ▼
    Select Panda ──────────► selectPanda(pandaId)
         │                        │
         │                        ▼
         │                   Store in GameContext
         ▼                   (selectedPandaId)
   Panda Detail                   │
    Screen                        ▼
         │                   getSelectedPanda()
         ▼
    Feed Section
         │
    ┌────┴─────────────────────────────┐
    │                                   │
    ▼                                   ▼
 Has Item?                          No Item?
    │                                   │
    ├─ YES ──► feedPanda() ───────────► UPDATE STATE:
    │           │                        • hunger +20
    │           │                        • happiness +5
    │           │                        • experience +0
    │           │                        • inventory -1
    │           │                        • Check level up
    │           ▼                              │
    │      Success Alert ◄───────────────────┘
    │
    └─ NO ───► Error Alert
               "Buy from shop first!"
```

---

## 🛍️ Flow 2: Buy Items

```
┌───────────────────────────────────────────────────────────┐
│                   BUY ITEM FLOW                           │
└───────────────────────────────────────────────────────────┘

    Shop Tab
       │
       ▼
   Grid of Items
   (8 items, 2 columns)
       │
       ▼
   Select Item
       │
       ├─────────────────────────────┐
       │                             │
       ▼                             ▼
   Check Coins            Enough Coins?
   state.coins >= price       │
       │                      ├─ YES ──► buyItem(itemId)
       │                      │           │
       │                      │           ├─ state.coins -= price
       │                      │           │
       │                      │           ├─ Add to inventory OR
       │                      │           │  quantity += 1
       │                      │           │
       │                      │           ▼
       │                      │      Success Alert
       │                      │      "Purchased!"
       │                      │
       │                      └─ NO ───► Error Alert
       │                                  "Not enough coins!"
       ▼
   Update UI:
   • Show "Owned: X"
   • Display new coin balance
```

---

## 🗺️ Flow 3: Explore Locations

```
┌───────────────────────────────────────────────────────────┐
│                EXPLORE LOCATION FLOW                      │
└───────────────────────────────────────────────────────────┘

    Explore Tab
         │
         ▼
    List of Locations
         │
         ├─────────────┬──────────────┐
         │             │              │
         ▼             ▼              ▼
    LOCKED      UNLOCKED (Low Lv) UNLOCKED (Ok)
         │             │              │
         ▼             ▼              ▼
    Unlock?      "Need Lv.X"    Can Explore!
         │        (Disabled)          │
         │                            ▼
         │                      explorLocation()
         │                            │
         ▼                            ├─ Check panda selected?
   unlockLocation()                   │
         │                            ├─ Check location.unlocked?
         ├─ state.coins -= cost       │
         │                            ├─ Check panda.level >= location.level?
         ├─ location.unlocked = true  │
         │                            │
         ▼                            ▼
   Success Alert                  EXPLORATION:
   "Unlocked!"                    • Random coins: 20-70
                                  • Random XP: 10-40
                                  • Happiness +10
                                  • Hunger -10
                                        │
                                        ▼
                                  UPDATE STATE:
                                  • state.coins += earned
                                  • panda.experience += earned
                                  • panda.happiness += 10
                                  • panda.hunger -= 10
                                        │
                                        ├─ Check: experience >= 100?
                                        │
                                        ├─ YES ──► LEVEL UP!
                                        │          • level += 1
                                        │          • experience -= 100
                                        │
                                        ▼
                                   Success Alert
                                   "Exploration successful!
                                    +X coins, +Y XP"
```

---

## 🎯 Stats Update System

```
┌───────────────────────────────────────────────────────────┐
│              STATS CALCULATION FLOW                       │
└───────────────────────────────────────────────────────────┘

┌─────────────┐
│   ACTION    │
└──────┬──────┘
       │
   ┌───┴────────────────┬─────────────────┐
   │                    │                 │
   ▼                    ▼                 ▼
┌──────┐          ┌──────────┐      ┌──────────┐
│ FEED │          │ EXPLORE  │      │   BUY    │
└──────┘          └──────────┘      └──────────┘
   │                    │                 │
   ▼                    ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Item Effects │  │Random Rewards│  │Coins Changed │
│              │  │              │  │              │
│• Hunger +X   │  │• Coins +20-70│  │• -item.price │
│• Happy +Y    │  │• XP +10-40   │  │• inventory++ │
│• XP +Z       │  │• Happy +10   │  │              │
└──────┬───────┘  │• Hunger -10  │  └──────────────┘
       │          └──────┬───────┘
       │                 │
       └────────┬────────┘
                ▼
        ┌────────────────┐
        │ UPDATE PANDA   │
        │ STATS          │
        └────────┬───────┘
                 │
         ┌───────┴────────┐
         │                │
         ▼                ▼
    Cap at 100%    Calculate Level
    (Hunger,       (XP / 100)
     Happiness)         │
                        │
                        ▼
                  Level Up?
                   (XP >= 100)
                        │
                   ├─ YES ──► level++
                   │          XP -= 100
                   │          Show alert
                   │
                   └─ NO ───► Continue
```

---

## 💰 Economy Flow

```
┌───────────────────────────────────────────────────────────┐
│                  COIN ECONOMY FLOW                        │
└───────────────────────────────────────────────────────────┘

            START: 100 coins
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
   ┌────────┐  ┌────────┐  ┌─────────┐
   │ EARN   │  │ SPEND  │  │ BALANCE │
   └────────┘  └────────┘  └─────────┘
        │           │
        ▼           ▼
   Exploration   Buy Items
   +20-70       -10 to -500
        │           │
        ▼           ▼
   Unlock Loc.  Food Items
   (earn more)  (feed panda)
        │           │
        └─────┬─────┘
              ▼
    ┌──────────────────┐
    │  Example Cycle:  │
    │                  │
    │ 1. Start: 100💰  │
    │ 2. Explore: +45  │
    │ 3. Total: 145💰  │
    │ 4. Buy Food: -20 │
    │ 5. Total: 125💰  │
    │ 6. Explore: +52  │
    │ 7. Total: 177💰  │
    └──────────────────┘
              │
              ▼
    ┌──────────────────┐
    │  After 7-15      │
    │  explorations:   │
    │  300-1000 coins  │
    │  → Unlock next   │
    │     location     │
    └──────────────────┘
```

---

## 📈 Progression System

```
┌───────────────────────────────────────────────────────────┐
│              LEVEL PROGRESSION FLOW                       │
└───────────────────────────────────────────────────────────┘

Level 1
   │ ┌────────────────────────────────┐
   │ │ • Explore: Bamboo Forest       │
   │ │ • Buy: Fresh Bamboo (10💰)     │
   │ │ • Earn: 20-70 coins            │
   │ └────────────────────────────────┘
   ▼
Level 3
   │ ┌────────────────────────────────┐
   │ │ • Unlock: Mystic Cave (300💰)  │
   │ │ • Buy: Golden Bamboo (50💰)    │
   │ │ • Explore: 2 locations         │
   │ └────────────────────────────────┘
   ▼
Level 5
   │ ┌────────────────────────────────┐
   │ │ • Unlock: Cherry Park (500💰)  │
   │ │ • Buy: Accessories (100-500💰) │
   │ │ • Explore: 3 locations         │
   │ └────────────────────────────────┘
   ▼
Level 7
   │ ┌────────────────────────────────┐
   │ │ • Unlock: Frozen Peak (700💰)  │
   │ │ • Buy: Crown, Toys             │
   │ │ • Explore: 4 locations         │
   │ └────────────────────────────────┘
   ▼
Level 10
   │ ┌────────────────────────────────┐
   │ │ • Unlock: Golden Temple (1k💰) │
   │ │ • Buy: Magic Potion (200💰)    │
   │ │ • Explore: All 5 locations     │
   │ └────────────────────────────────┘
   ▼
MAX LEVEL
```

---

## 🔄 Complete Session Example

```
┌───────────────────────────────────────────────────────────┐
│           TYPICAL 10-MINUTE SESSION                       │
└───────────────────────────────────────────────────────────┘

00:00 │ START
      │ • Coins: 100
      │ • Inventory: 3x Fresh Bamboo
      │ • Panda: Lv5, Happy 75%, Hunger 70%
      ▼
00:30 │ 1️⃣ MY PANDAS → Select "Bamboo"
      ▼
01:00 │ 2️⃣ PANDA DETAIL → Feed 1x Fresh Bamboo
      │ Result: Happy 80%, Hunger 90%, XP 50
      │ Inventory: 2x remaining
      ▼
02:00 │ 3️⃣ EXPLORE → Bamboo Forest
      │ Earned: +45 coins, +28 XP
      │ Coins: 100 → 145
      │ Panda: XP 50 → 78, Happy 90%, Hunger 80%
      ▼
03:30 │ 4️⃣ SHOP → Buy 2x Fresh Bamboo
      │ Cost: -20 coins
      │ Coins: 145 → 125
      │ Inventory: 2 + 2 = 4x
      ▼
04:30 │ 5️⃣ PANDA DETAIL → Feed 1x Fresh Bamboo
      │ Result: Happy 95%, Hunger 100%
      │ Inventory: 3x remaining
      ▼
05:30 │ 6️⃣ EXPLORE → Bamboo Forest
      │ Earned: +52 coins, +35 XP
      │ Coins: 125 → 177
      │ XP: 78 + 35 = 113
      │ 🎉 LEVEL UP! Lv5 → Lv6, XP reset to 13
      ▼
07:00 │ 7️⃣ EXPLORE → Bamboo Forest (again)
      │ Earned: +38 coins, +22 XP
      │ Coins: 177 → 215
      │ Panda: XP 35, Happy 95%, Hunger 60%
      ▼
08:30 │ 8️⃣ EXPLORE → Bamboo Forest (again)
      │ Earned: +61 coins, +31 XP
      │ Coins: 215 → 276
      │ Panda: XP 66, Hunger 50%
      ▼
10:00 │ END SESSION
      │ • Final coins: 276 (need 24 more for Mystic Cave)
      │ • Panda: Lv6, XP 66/100
      │ • Inventory: 3x Fresh Bamboo
      │ • Progress: Almost ready to unlock 2nd location!
      └─────────────────────────────────────────────
```

---

## 📊 State Management Diagram

```
┌───────────────────────────────────────────────────────────┐
│                  GameContext State                        │
└───────────────────────────────────────────────────────────┘

                    GameProvider
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   ┌─────────┐     ┌──────────┐    ┌──────────┐
   │ pandas  │     │locations │    │inventory │
   │ array   │     │  array   │    │  array   │
   └─────────┘     └──────────┘    └──────────┘
        │                │                │
        ▼                ▼                ▼
   5 Panda objs    5 Location objs   Items objs
   • id            • id               • itemId
   • name          • name             • quantity
   • level         • unlocked
   • happiness     • cost
   • hunger        • level req
   • experience
   • image

        │
        ▼
   ┌──────────────────────────────────────┐
   │           Context Functions          │
   ├──────────────────────────────────────┤
   │ • feedPanda(pandaId, itemId)        │
   │ • explorLocation(pandaId, locId)    │
   │ • buyItem(itemId)                   │
   │ • unlockLocation(locId)             │
   │ • selectPanda(pandaId)              │
   │ • getSelectedPanda()                │
   │ • getInventoryItem(itemId)          │
   │ • getShopItem(itemId)               │
   │ • getLocation(locId)                │
   └──────────────────────────────────────┘
                    │
                    ▼
        ┌──────────────────────┐
        │   All Screens        │
        │   use useGame()      │
        │   hook to access     │
        │   state & functions  │
        └──────────────────────┘
```

---

## 🎨 Component Hierarchy

```
App (_layout.tsx)
│
├─ GameProvider ◄────────── Global State
│   │
│   └─ Stack
│       │
│       ├─ (tabs) Layout ◄── Bottom Navigation
│       │   │
│       │   ├─ index.tsx (Home)
│       │   │
│       │   ├─ my-pandas.tsx
│       │   │   └─ FlatList
│       │   │       └─ PandaCard
│       │   │           ├─ Image
│       │   │           ├─ Stats
│       │   │           └─ Button → Navigate
│       │   │
│       │   ├─ explore.tsx
│       │   │   └─ FlatList
│       │   │       └─ LocationCard
│       │   │           ├─ Emoji
│       │   │           ├─ Info
│       │   │           └─ Buttons (Unlock/Explore)
│       │   │
│       │   ├─ shop.tsx
│       │   │   └─ FlatList (2 columns)
│       │   │       └─ ItemCard
│       │   │           ├─ Emoji
│       │   │           ├─ Price
│       │   │           └─ Buy Button
│       │   │
│       │   └─ profile.tsx
│       │
│       └─ panda-detail.tsx ◄── Outside tabs
│           │
│           ├─ ScrollView
│           │   ├─ Hero Section (Image + Name)
│           │   ├─ Stats Card (Progress bars)
│           │   ├─ Feed Section (Food items)
│           │   └─ Quick Actions (Shop/Explore)
│           │
│           └─ Stack.Screen Header
```

---

**Visual Documentation Complete! 🎨**

For detailed text documentation, see [GAME_FLOW_DOCUMENTATION.md](./GAME_FLOW_DOCUMENTATION.md)
