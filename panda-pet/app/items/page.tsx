"use client"

import { Navigation } from "@/components/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useState } from "react"

interface Item {
  id: string
  name: string
  description: string
  image: string
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary"
  category: "Material" | "Food" | "Tool" | "Treasure"
  quantity: number
}

const rarityColors = {
  Common: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  Uncommon: "bg-green-500/10 text-green-700 dark:text-green-400",
  Rare: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  Epic: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  Legendary: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
}

export default function ItemsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const items: Item[] = [
    {
      id: "1",
      name: "Wood",
      description: "Sturdy wood from the Enchanted Forest",
      image: "/item-wood.jpg",
      rarity: "Common",
      category: "Material",
      quantity: 15,
    },
    {
      id: "2",
      name: "Berries",
      description: "Sweet berries that pets love",
      image: "/item-berries.jpg",
      rarity: "Common",
      category: "Food",
      quantity: 23,
    },
    {
      id: "3",
      name: "Rare Herb",
      description: "A mystical herb with healing properties",
      image: "/item-herb.jpg",
      rarity: "Rare",
      category: "Material",
      quantity: 3,
    },
    {
      id: "4",
      name: "Shells",
      description: "Beautiful shells from the Sunny Beach",
      image: "/item-shells.jpg",
      rarity: "Common",
      category: "Treasure",
      quantity: 18,
    },
    {
      id: "5",
      name: "Sand",
      description: "Golden sand perfect for crafting",
      image: "/item-sand.jpg",
      rarity: "Common",
      category: "Material",
      quantity: 31,
    },
    {
      id: "6",
      name: "Rare Fish",
      description: "A delicious and rare catch",
      image: "/item-fish.jpg",
      rarity: "Rare",
      category: "Food",
      quantity: 2,
    },
    {
      id: "7",
      name: "Ice Crystal",
      description: "A frozen crystal from the mountains",
      image: "/item-ice-crystal.jpg",
      rarity: "Uncommon",
      category: "Material",
      quantity: 7,
    },
    {
      id: "8",
      name: "Fire Gem",
      description: "A blazing gem from the volcano",
      image: "/item-fire-gem.jpg",
      rarity: "Epic",
      category: "Treasure",
      quantity: 1,
    },
    {
      id: "9",
      name: "Star Dust",
      description: "Magical dust from the Sky Islands",
      image: "/item-star-dust.jpg",
      rarity: "Legendary",
      category: "Material",
      quantity: 1,
    },
  ]

  const filterItemsByCategory = (category: string) => {
    if (category === "all") return items
    return items.filter((item) => item.category === category)
  }

  const filteredItems = items.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const ItemCard = ({ item }: { item: Item }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <div className="aspect-square bg-accent/50 flex items-center justify-center overflow-hidden relative">
        <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
        <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-bold">
          x{item.quantity}
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-foreground">{item.name}</h3>
            <Badge className={rarityColors[item.rarity]}>{item.rarity}</Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
        </div>
        <Badge variant="outline" className="text-xs">
          {item.category}
        </Badge>
      </div>
    </Card>
  )

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold text-foreground">My Items</h1>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {items.reduce((sum, item) => sum + item.quantity, 0)} Total Items
              </Badge>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabs for Categories */}
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="Material">Materials</TabsTrigger>
              <TabsTrigger value="Food">Food</TabsTrigger>
              <TabsTrigger value="Tool">Tools</TabsTrigger>
              <TabsTrigger value="Treasure">Treasures</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="Material" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filterItemsByCategory("Material")
                  .filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="Food" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filterItemsByCategory("Food")
                  .filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="Tool" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filterItemsByCategory("Tool")
                  .filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="Treasure" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filterItemsByCategory("Treasure")
                  .filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
