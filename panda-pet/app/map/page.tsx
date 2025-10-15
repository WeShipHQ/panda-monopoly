"use client"

import { Navigation } from "@/components/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const locations = [
  {
    id: "forest",
    name: "Enchanted Forest",
    description: "A mystical woodland filled with ancient trees",
    image: "/enchanted-forest-location.jpg",
    difficulty: "Easy",
    rewards: ["Wood", "Berries", "Herbs"],
  },
  {
    id: "beach",
    name: "Sunny Beach",
    description: "Golden sands and crystal clear waters",
    image: "/sunny-beach-location.jpg",
    difficulty: "Easy",
    rewards: ["Shells", "Sand", "Fish"],
  },
  {
    id: "mountains",
    name: "Snowy Mountains",
    description: "Towering peaks covered in eternal snow",
    image: "/snowy-mountains-location.jpg",
    difficulty: "Medium",
    rewards: ["Ice Crystals", "Stones", "Gems"],
  },
  {
    id: "desert",
    name: "Golden Desert",
    description: "Vast dunes under the blazing sun",
    image: "/golden-desert-location.jpg",
    difficulty: "Medium",
    rewards: ["Cactus", "Gold Dust", "Fossils"],
  },
  {
    id: "volcano",
    name: "Fire Volcano",
    description: "An active volcano with rivers of lava",
    image: "/fire-volcano-location.jpg",
    difficulty: "Hard",
    rewards: ["Lava Rock", "Fire Gems", "Obsidian"],
  },
  {
    id: "sky-islands",
    name: "Sky Islands",
    description: "Floating islands high above the clouds",
    image: "/sky-islands-location.jpg",
    difficulty: "Hard",
    rewards: ["Cloud Essence", "Feathers", "Star Dust"],
  },
]

const difficultyColors = {
  Easy: "bg-green-500/10 text-green-700 dark:text-green-400",
  Medium: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  Hard: "bg-red-500/10 text-red-700 dark:text-red-400",
}

export default function MapPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Explore the World</h1>
            <p className="text-muted-foreground">Choose a location to explore with your pets!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map((location) => (
              <Link key={location.id} href={`/map/${location.id}`}>
                <Card className="overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer">
                  <div className="aspect-video bg-accent/50 flex items-center justify-center overflow-hidden">
                    <img
                      src={location.image || "/placeholder.svg"}
                      alt={location.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-foreground">{location.name}</h3>
                        <Badge className={difficultyColors[location.difficulty as keyof typeof difficultyColors]}>
                          {location.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{location.description}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">Rewards:</p>
                      <div className="flex flex-wrap gap-2">
                        {location.rewards.map((reward) => (
                          <Badge key={reward} variant="outline" className="text-xs">
                            {reward}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
