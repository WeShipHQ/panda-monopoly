"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { PetCard } from "@/components/ui/pet-card"
import Link from "next/link"

// Panda species data
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

export default function PetsPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-8 space-y-3">
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
            <span className="text-5xl">🐼</span>
            Choose Your Panda
          </h1>
          <p className="text-lg text-muted-foreground">Select one of the magical panda species to begin your journey</p>
        </div>

        {/* Pets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {petSpecies.map((pet) => (
            <PetCard
              key={pet.id}
              name={pet.name}
              description={pet.description}
              image={pet.image}
              // href={`/pets/create/${pet.id}`}
              href={`/pets/create`}

            />
          ))}
        </div>
      </main>
    </div>
  )
}
