# Panda Pet Mobile - Complete User Flow Documentation

## 📱 Overview
Panda Pet Mobile là ứng dụng nuôi thú ảo (virtual pet) với đầy đủ chức năng quản lý pandas, mua sắm items, khám phá locations, và tương tác với pets.

## 🎯 Main Features

### 1. **My Pandas** - Quản lý Pandas
### 2. **Panda Detail** - Chi tiết & Tương tác
### 3. **Shop** - Mua Items
### 4. **Explore** - Khám phá Locations

---

## 📖 Complete User Flow

### **Flow 1: Xem & Chọn Panda**
**Path**: My Pandas Tab → Select Panda → View Details

#### Steps:
1. **Mở My Pandas tab** (bottom navigation)
   - Hiển thị danh sách tất cả pandas
   - Mỗi panda card show: Image, Name, Emoji, Species, Level, Happiness, Hunger
   - Header hiển thị số coins hiện tại

2. **Tap "View Details" button** trên bất kỳ panda nào
   - Navigate to Panda Detail screen
   - Panda được chọn sẽ được lưu trong GameContext

#### Data Flow:
```typescript
state.pandas → My Pandas Screen → selectPanda(pandaId) → Navigate to /panda-detail
```

---

### **Flow 2: Feed Panda (Cho ăn)**
**Path**: Panda Detail → Select Food Item → Feed

#### Prerequisites:
- Phải có ít nhất 1 food item trong inventory
- Nếu không có → Navigate to Shop để mua

#### Steps:
1. **Trong Panda Detail screen**:
   - Xem stats của panda: Level, Experience, Happiness, Hunger
   - Scroll xuống "Feed {panda name}" section
   
2. **Chọn food item để feed**:
   - Hiển thị 3 loại food: Fresh Bamboo (10💰), Golden Bamboo (50💰), Magic Potion (200💰)
   - Mỗi item show số lượng đang owned
   - Button "Feed" chỉ active khi có item trong inventory

3. **Tap "Feed" button**:
   - Trigger `feedPanda(pandaId, itemId)`
   - Item quantity giảm 1
   - Panda stats update:
     * **Hunger** tăng (theo effect của item)
     * **Happiness** tăng (theo effect của item)
     * **Experience** tăng (theo effect của item)
     * **Level** tăng khi experience đạ 100 (experience reset về 0)
   
4. **Alert hiển thị kết quả**:
   ```
   ✨ Fed successfully!
   Bamboo enjoyed the Fresh Bamboo!
   Happiness +5, Hunger +20
   ```

#### Data Flow:
```typescript
getInventoryItem(itemId) → Check quantity > 0
feedPanda(pandaId, itemId) → Update state.pandas[pandaId]
  - hunger += item.effect.hunger
  - happiness += item.effect.happiness  
  - experience += item.effect.experience
  - level = floor(experience / 100) + 1
→ inventory[itemId].quantity -= 1
→ Alert success message
```

#### Example Scenario:
```
Initial state:
- Panda: Bamboo (Level 5, Happiness 75%, Hunger 70%, Experience 50)
- Inventory: Fresh Bamboo x3

After feeding Fresh Bamboo:
- Panda: Bamboo (Level 5, Happiness 80%, Hunger 90%, Experience 50)
- Inventory: Fresh Bamboo x2
```

---

### **Flow 3: Buy Items từ Shop**
**Path**: Shop Tab → Select Item → Purchase

#### Steps:
1. **Mở Shop tab** (bottom navigation)
   - Hiển thị grid 2 columns với 8 items
   - Header show số coins hiện có
   - Mỗi item card display:
     * Emoji icon (large)
     * Category (Food, Accessory, Toy, Special)
     * Item name
     * Price in coins
     * "Owned: X" (nếu đã mua)
     * "Buy Now" button

2. **Tap "Buy Now" button**:
   - Check nếu `state.coins >= item.price`
   - Nếu không đủ coins → Alert "Not enough coins!"

3. **Purchase successful**:
   - Trigger `buyItem(itemId)`
   - `state.coins -= item.price`
   - Add item to inventory hoặc tăng quantity +1
   - Alert success message

4. **Alert hiển thị**:
   ```
   ✨ Purchase successful!
   You bought Fresh Bamboo for 10 coins!
   You now have 4x Fresh Bamboo
   ```

#### Data Flow:
```typescript
state.coins (100) → Check >= item.price (10)
buyItem(itemId) → state.coins = 90
→ inventory.push({ itemId: '1', quantity: 1 }) OR
→ inventory[itemId].quantity += 1
→ Alert success
```

#### Item Categories & Effects:

**Food Items:**
| Item | Price | Hunger | Happiness | Experience |
|------|-------|--------|-----------|------------|
| Fresh Bamboo 🎋 | 10 | +20 | +5 | 0 |
| Golden Bamboo ✨ | 50 | +50 | +15 | +10 |
| Magic Potion 🧪 | 200 | +100 | +100 | +50 |

**Accessories:**
| Item | Price | Effect |
|------|-------|--------|
| Red Scarf 🧣 | 100 | Happiness +30 |
| Crown 👑 | 500 | Happiness +50, Experience +20 |
| Sunglasses 😎 | 150 | Happiness +20 |
| Party Hat 🎉 | 80 | Happiness +15, Experience +5 |

**Toys:**
| Item | Price | Effect |
|------|-------|--------|
| Toy Ball ⚽ | 75 | Happiness +25, Experience +5 |

---

### **Flow 4: Explore Locations**
**Path**: Explore Tab → Unlock Location (optional) → Explore with Panda

#### Prerequisites:
- Phải đã chọn panda (từ My Pandas)
- Panda level phải >= location level requirement
- Location phải unlocked (trừ location đầu tiên - Bamboo Forest)

#### Steps:

**A. Unlock New Location:**
1. **Scroll qua locations trong Explore tab**:
   - Locked locations hiển thị với opacity 75%
   - Show "🔒 Unlock for X coins"
   - Button "Unlock (Xcost💰)"

2. **Tap "Unlock" button**:
   - Alert confirm: "Do you want to unlock {location name} for {cost} coins?"
   - Nếu confirm → `unlockLocation(locationId)`
   - `state.coins -= location.cost`
   - `location.unlocked = true`

**B. Explore Location:**
1. **Select unlocked location**:
   - Check panda level >= location level
   - Button "Explore" chỉ active khi đủ level
   - Nếu chưa đủ → Button disabled với text "Need Lv.X"

2. **Tap "Explore" button**:
   - Trigger `explorLocation(pandaId, locationId)`
   - Random rewards:
     * Coins: 20-70 (random)
     * Experience: 10-40 (random)
   - Panda updates:
     * `experience += random(10-40)`
     * `happiness += 10`
     * `hunger -= 10`
     * `level` recalculate nếu experience >= 100
   - `state.coins += earned coins`

3. **Alert success**:
   ```
   🎉 Exploration successful!
   Bamboo explored Bamboo Forest!
   
   💰 +35 coins
   ✨ +25 experience
   ❤️ +10 happiness
   🍚 -10 hunger
   ```

#### Data Flow:
```typescript
// Unlock flow
getLocation(locationId) → Check unlocked
unlockLocation(locationId) → state.coins -= location.cost
→ location.unlocked = true

// Explore flow
getSelectedPanda() → Check level >= location.level
explorLocation(pandaId, locationId)
→ coinsEarned = random(20-70)
→ expEarned = random(10-40)
→ state.coins += coinsEarned
→ panda.experience += expEarned
→ panda.happiness += 10
→ panda.hunger -= 10
→ panda.level = floor(experience / 100) + 1
```

#### Locations List:
| Location | Emoji | Level | Unlock Cost | Description |
|----------|-------|-------|-------------|-------------|
| Bamboo Forest | 🎋 | 1 | FREE | A peaceful forest full of fresh bamboo |
| Mystic Cave | 🏔️ | 3 | 300💰 | Explore mysterious caves with hidden treasures |
| Cherry Blossom Park | 🌸 | 5 | 500💰 | Beautiful park where pandas gather |
| Frozen Peak | ❄️ | 7 | 700💰 | Cold mountain top with rare ice pandas |
| Golden Temple | 🏯 | 10 | 1000💰 | Ancient temple with legendary pandas |

---

## 🔄 Complete Game Loop

### **Optimal Gameplay Flow:**

```
1. START → My Pandas → Select Panda
   ↓
2. Shop → Buy Food Items (spend coins)
   ↓
3. Panda Detail → Feed Panda (increase stats)
   ↓
4. Explore → Explore Location (earn coins & exp)
   ↓
5. Check Stats → Level up
   ↓
6. Shop → Buy more items
   ↓
7. Explore → Unlock new locations
   ↓
LOOP back to step 2
```

### **Progression System:**

**Level 1-3:**
- Explore: Bamboo Forest (FREE)
- Buy: Fresh Bamboo (10💰)
- Earn: 20-70 coins per exploration
- Goal: Reach Level 3 to unlock Mystic Cave

**Level 3-5:**
- Unlock: Mystic Cave (300💰)
- Buy: Golden Bamboo (50💰) 
- Explore both locations
- Goal: Reach Level 5 to unlock Cherry Blossom Park

**Level 5-7:**
- Unlock: Cherry Blossom Park (500💰)
- Buy: Accessories (Red Scarf, Party Hat)
- Explore 3 locations
- Goal: Reach Level 7 to unlock Frozen Peak

**Level 7-10:**
- Unlock: Frozen Peak (700💰)
- Buy: Crown (500💰), Toy Ball (75💰)
- Explore 4 locations
- Goal: Reach Level 10 to unlock Golden Temple

**Level 10+:**
- Unlock: Golden Temple (1000💰)
- Buy: Magic Potion (200💰)
- Explore all 5 locations
- Goal: Max out all pandas

---

## 💾 State Management

### **GameContext State Structure:**
```typescript
interface GameState {
  pandas: Panda[];          // All owned pandas
  locations: Location[];     // All locations (locked/unlocked)
  inventory: InventoryItem[]; // Owned items
  coins: number;            // Currency
  selectedPandaId: string | null; // Currently selected panda
}
```

### **Starting State:**
```typescript
{
  pandas: [5 pandas with level 1-5],
  locations: [5 locations, only Bamboo Forest unlocked],
  inventory: [{ itemId: '1', quantity: 3 }], // 3x Fresh Bamboo
  coins: 100,
  selectedPandaId: 'panda1'
}
```

---

## 🎮 Example Complete Playthrough

### **Session 1: First 10 Minutes**

**1. Start Game**
- Initial: 100 coins, 3x Fresh Bamboo
- Selected Panda: Bamboo (Level 5, Happiness 75%, Hunger 70%)

**2. Feed Panda**
- Feed 1x Fresh Bamboo
- Result: Happiness 80%, Hunger 90%, Experience 50 → 50
- Inventory: 2x Fresh Bamboo remaining

**3. Explore Bamboo Forest**
- Earned: +45 coins, +28 experience
- Coins: 100 → 145
- Panda: Experience 50 → 78, Happiness 90%, Hunger 80%

**4. Buy Items from Shop**
- Buy 2x Fresh Bamboo (10 each = 20 total)
- Coins: 145 → 125
- Inventory: 2 + 2 = 4x Fresh Bamboo

**5. Feed Again**
- Feed 1x Fresh Bamboo
- Hunger 80% → 100%, Happiness 90% → 95%
- Inventory: 3x Fresh Bamboo

**6. Explore Again**
- Earned: +52 coins, +35 experience
- Coins: 125 → 177
- Experience: 78 + 35 = 113 → **LEVEL UP to 6!** (Experience reset to 13)

**7. Unlock Mystic Cave**
- Cost: 300 coins
- Need: 300 - 177 = 123 more coins
- Continue exploring...

**End of Session:**
- Level: 6
- Coins: 177
- Inventory: 3x Fresh Bamboo
- Progress: Ready to unlock Mystic Cave with a bit more exploring

---

## 🎯 Core Gameplay Metrics

### **Economy Balance:**
- **Starting coins**: 100
- **Exploration rewards**: 20-70 coins (avg 45)
- **Food costs**: 10-200 coins
- **Location unlock costs**: 300-1000 coins
- **Explorations needed to unlock next location**: 7-15 times

### **Experience & Leveling:**
- **Experience to level up**: 100 XP
- **Exploration rewards**: 10-40 XP (avg 25)
- **Food XP bonus**: 0-50 XP
- **Explorations to level up** (without food): 3-4 times
- **Explorations to level up** (with Golden Bamboo): 2-3 times

### **Stats Management:**
- **Hunger**: Depletes -10 per exploration
- **Happiness**: Increases +10 per exploration
- **Food refills**: +20 to +100 hunger depending on item
- **Optimal play**: Feed before hunger drops below 30%

---

## 🔧 Technical Implementation

### **Key Functions:**

```typescript
// Feed panda with food item
feedPanda(pandaId: string, itemId: string): boolean

// Explore location with panda  
explorLocation(pandaId: string, locationId: string): boolean

// Buy item from shop
buyItem(itemId: string): boolean

// Unlock new location
unlockLocation(locationId: string): boolean

// Select active panda
selectPanda(pandaId: string): void

// Get selected panda data
getSelectedPanda(): Panda | null

// Get inventory item
getInventoryItem(itemId: string): InventoryItem | null

// Get shop item details
getShopItem(itemId: string): ShopItem | null

// Get location details
getLocation(locationId: string): Location | null
```

### **Navigation Structure:**
```
Root
├── (tabs)
│   ├── index (Home)
│   ├── my-pandas (My Pandas List)
│   ├── explore (Explore Locations)
│   ├── shop (Shop Items)
│   └── profile (User Profile)
└── panda-detail (Panda Details & Feeding)
```

---

## ✅ Testing Checklist

### **Feed Flow:**
- [ ] Feed with Fresh Bamboo → Stats increase correctly
- [ ] Feed with Golden Bamboo → Level up when experience >= 100
- [ ] Feed without inventory → Show error alert
- [ ] Stats cap at 100% (happiness, hunger)

### **Shop Flow:**
- [ ] Buy item with enough coins → Purchase successful
- [ ] Buy item without enough coins → Show error alert
- [ ] Buy same item multiple times → Quantity increases
- [ ] Inventory displays correct quantity

### **Explore Flow:**
- [ ] Explore without selected panda → Show error
- [ ] Explore locked location → Show unlock prompt
- [ ] Explore with low level panda → Button disabled
- [ ] Explore successful → Coins & XP added, stats updated
- [ ] Level up during exploration → Level increases, experience resets

### **Navigation Flow:**
- [ ] My Pandas → Select panda → Navigate to detail
- [ ] Panda Detail → Quick action "Buy Food" → Navigate to Shop
- [ ] Panda Detail → Quick action "Explore" → Navigate to Explore
- [ ] Bottom navigation active state works correctly

---

## 📊 Success Metrics

### **Engagement Goals:**
- **Session length**: 5-15 minutes
- **Actions per session**: 10-20 (feed, explore, buy)
- **Progression**: Level up 1-2 times per session
- **Unlock rate**: 1 new location every 2-3 sessions

### **User Satisfaction:**
- Clear feedback on all actions (Alerts)
- Visual stat changes (progress bars)
- Rewarding exploration (random coins/XP)
- Balanced economy (not too easy/hard)

---

## 🚀 Future Enhancements

### **Planned Features:**
1. **Mini-games**: Play with pandas to earn bonus rewards
2. **Breeding system**: Combine pandas to create new species
3. **Social features**: Visit friends' pandas
4. **Achievements**: Unlock badges for milestones
5. **Daily rewards**: Login bonuses
6. **Panda customization**: Dress up with purchased accessories
7. **Battle system**: Friendly panda competitions
8. **Garden**: Grow bamboo to feed pandas

---

## 📝 Notes

- All mock data is stored in `@/data/mock-data.ts`
- Game state managed by `@/contexts/GameContext.tsx`
- Images stored in `public/assets/panda-pet/` (panda1.png - panda8.png)
- Uses NativeWind for styling (Tailwind CSS for React Native)
- Fredoka font family for all text
- Warm beige/orange color scheme

---

**Created**: October 16, 2025  
**Version**: 1.0.0  
**Platform**: React Native (Expo) + NativeWind
