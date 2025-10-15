"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { PetCard } from "@/components/ui/pet-card"
import { PetDetailCard } from "@/components/ui/pet-detail-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import { useRouter } from "next/navigation"

const petSpecies = [
  {
    id: "bamboo-panda",
    name: "Bamboo Panda",
    description: "Classic black and white panda who loves munching on bamboo all day long. Peaceful and gentle, brings harmony wherever they go",
    image: "/assets/panda-pet/panda1.png",
  },
  {
    id: "red-panda",
    name: "Red Panda",
    description: "Adorable rust-colored panda with a bushy tail. Playful and energetic, loves climbing trees and eating sweet berries",
    image: "/assets/panda-pet/panda2.png",
  },
  {
    id: "snow-panda",
    name: "Snow Panda",
    description: "Rare white panda from snowy mountains. Calm and wise, with beautiful ice-blue eyes that sparkle in the moonlight",
    image: "/assets/panda-pet/panda3.png",
  },
  {
    id: "golden-panda",
    name: "Golden Panda",
    description: "Legendary golden-furred panda said to bring fortune and prosperity. Friendly and social, loves making new friends",
    image: "/assets/panda-pet/panda4.png",
  },
  {
    id: "forest-panda",
    name: "Forest Panda",
    description: "Green-tinted panda who lives in magical bamboo forests. Nature-loving and gentle, can communicate with forest spirits",
    image: "/assets/panda-pet/panda5.png",
  },
  {
    id: "starlight-panda",
    name: "Starlight Panda",
    description: "Mystical purple panda with sparkly fur that glows at night. Curious explorer who loves stargazing and adventures",
    image: "/assets/panda-pet/panda6.png",
  },
  {
    id: "sakura-panda",
    name: "Sakura Panda",
    description: "Pink panda surrounded by cherry blossom petals. Cheerful and artistic, spreads joy and beauty everywhere",
    image: "/assets/panda-pet/panda7.png",
  },
  {
    id: "cloud-panda",
    name: "Cloud Panda",
    description: "Fluffy white panda that can float on clouds. Dreamy and peaceful, brings calm and tranquility to everyone around",
    image: "/assets/panda-pet/panda8.png",
  },
]

export default function CreatePetPage() {
  const router = useRouter()
  const [step, setStep] = useState<"select" | "preview">("select")
  const [petName, setPetName] = useState("")
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null)

  const handleCreatePet = () => {
    if (!petName || !selectedSpecies) {
      alert("Please enter a name and select a species!")
      return
    }
    setStep("preview")
  }

  const selectedSpeciesData = petSpecies.find((s) => s.id === selectedSpecies)

  // Preview step - show created pet
  if (step === "preview" && selectedSpeciesData) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-3">
                <span className="text-5xl">🐼</span>
                Welcome to the Family!
              </h1>
              <p className="text-lg text-muted-foreground">Your adorable panda is ready to begin the adventure!</p>
            </div>

            <div className="flex justify-center">
              <PetDetailCard
                name={petName}
                species={selectedSpeciesData.name}
                age="13 minute"
                image={selectedSpeciesData.image}
                stats={{
                  health: { current: 145, max: 145 },
                  energy: { current: 70, max: 70 },
                  hunger: { value: "Full", percentage: 85.65 },
                  happiness: { value: "Happy", percentage: 71.4 },
                }}
                attributes={{
                  level: 1,
                  strength: 9,
                  dexterity: 4,
                  intelligence: 6,
                }}
              />
            </div>

            <div className="flex justify-center gap-4">
              <Button size="lg" className="rounded-full" onClick={() => router.push("/pets")}>
                View My Pets
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-full bg-transparent" 
                onClick={() => {
                  setStep("select")
                  setPetName("")
                  setSelectedSpecies(null)
                }}
              >
                Create Another Pet
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Selection step
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="space-y-8">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
              <span className="text-5xl">🐼</span>
              Adopt Your Panda
            </h1>
            <p className="text-lg text-muted-foreground">Choose your magical panda companion and give them a name</p>
          </div>

          {/* Pet Name Input */}
          <Card className="p-6 max-w-2xl">
            <div className="space-y-4">
              <Label htmlFor="pet-name" className="text-lg font-semibold">
                🎋 Panda Name
              </Label>
              <Input
                id="pet-name"
                placeholder="Enter your pet's name..."
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                className="text-lg"
                maxLength={20}
              />
              <p className="text-sm text-muted-foreground">{petName.length}/20 characters</p>
            </div>
          </Card>

          {/* Species Selection Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {petSpecies.map((species) => (
              <div
                key={species.id}
                onClick={() => setSelectedSpecies(species.id)}
                className={`${
                  selectedSpecies === species.id ? "ring-4 ring-primary" : ""
                }`}
              >
                <PetCard
                  name={species.name}
                  description={species.description}
                  image={species.image}
                />
              </div>
            ))}
          </div>

          {/* Create Button */}
          <div className="flex justify-center gap-4 pt-4">
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-full bg-transparent" 
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              size="lg"
              className="rounded-full px-8"
              onClick={handleCreatePet}
              disabled={!petName || !selectedSpecies}
            >
              Create Pet
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
