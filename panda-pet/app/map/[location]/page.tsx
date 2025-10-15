"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { useState } from "react"

const locationData: Record<string, any> = {
  forest: {
    name: "Enchanted Forest",
    description: "A mystical woodland filled with ancient trees and magical creatures",
    image: "/enchanted-forest-location.jpg",
    activities: [
      { id: "gather-wood", name: "Gather Wood", energy: 10, reward: "Wood x3", time: "5 min" },
      { id: "pick-berries", name: "Pick Berries", energy: 5, reward: "Berries x5", time: "3 min" },
      { id: "search-herbs", name: "Search for Herbs", energy: 15, reward: "Rare Herb x1", time: "10 min" },
    ],
    items: [
      { id: "wood", name: "Wood", image: "/item-wood.jpg", rarity: "Common" },
      { id: "berries", name: "Berries", image: "/item-berries.jpg", rarity: "Common" },
      { id: "herb", name: "Rare Herb", image: "/item-herb.jpg", rarity: "Rare" },
    ],
  },
  beach: {
    name: "Sunny Beach",
    description: "Golden sands and crystal clear waters perfect for relaxation",
    image: "/sunny-beach-location.jpg",
    activities: [
      { id: "collect-shells", name: "Collect Shells", energy: 8, reward: "Shells x4", time: "4 min" },
      { id: "build-sandcastle", name: "Build Sandcastle", energy: 12, reward: "Sand x6", time: "7 min" },
      { id: "go-fishing", name: "Go Fishing", energy: 20, reward: "Rare Fish x1", time: "15 min" },
    ],
    items: [
      { id: "shells", name: "Shells", image: "/item-shells.jpg", rarity: "Common" },
      { id: "sand", name: "Sand", image: "/item-sand.jpg", rarity: "Common" },
      { id: "fish", name: "Rare Fish", image: "/item-fish.jpg", rarity: "Rare" },
    ],
  },
}

export default function LocationPage({ params }: { params: { location: string } }) {
  const router = useRouter()
  const location = locationData[params.location] || locationData.forest
  const [selectedPet, setSelectedPet] = useState("Fluffy")

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Back Button */}
          <Button variant="outline" onClick={() => router.back()} className="rounded-full">
            ← Back to Map
          </Button>

          {/* Location Header */}
          <div className="relative overflow-hidden rounded-2xl">
            <div className="aspect-[21/9] bg-accent/50">
              <img
                src={location.image || "/placeholder.svg"}
                alt={location.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
              <div className="p-8 text-white">
                <h1 className="text-4xl font-bold mb-2">{location.name}</h1>
                <p className="text-lg opacity-90">{location.description}</p>
              </div>
            </div>
          </div>

          {/* Pet Selection */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Select Your Pet</h2>
            <div className="flex items-center gap-4 p-4 bg-accent/50 rounded-lg">
              <img
                src="/cute-fluffy-cloud-cat-creature.jpg"
                alt="Fluffy"
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="font-bold">{selectedPet}</p>
                <p className="text-sm text-muted-foreground">Cloud Cat • Lv. 5</p>
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex justify-between text-sm">
                  <span>Energy</span>
                  <span className="font-medium">60/100</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
            </div>
          </Card>

          {/* Activities */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Activities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {location.activities.map((activity: any) => (
                <Card key={activity.id} className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{activity.name}</h3>
                      <p className="text-sm text-muted-foreground">Takes {activity.time}</p>
                    </div>
                    <Badge variant="outline">{activity.energy} Energy</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Reward:</span>
                    <span className="font-medium text-primary">{activity.reward}</span>
                  </div>
                  <Button className="w-full rounded-full">Start Activity</Button>
                </Card>
              ))}
            </div>
          </div>

          {/* Items Found Here */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Items Found Here</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {location.items.map((item: any) => (
                <Card key={item.id} className="p-4 space-y-3">
                  <div className="aspect-square bg-accent/50 rounded-lg flex items-center justify-center overflow-hidden">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="font-bold text-sm">{item.name}</p>
                    <Badge
                      variant="outline"
                      className={
                        item.rarity === "Rare"
                          ? "bg-purple-500/10 text-purple-700 dark:text-purple-400"
                          : "bg-gray-500/10 text-gray-700 dark:text-gray-400"
                      }
                    >
                      {item.rarity}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
