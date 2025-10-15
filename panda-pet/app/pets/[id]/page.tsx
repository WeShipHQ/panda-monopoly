"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Heart, Zap, UtensilsCrossed, Smile, Star, Award } from "lucide-react"

interface PetDetailPageProps {
    params: {
        id: string
    }
}

export default function PetDetailPage({ params }: PetDetailPageProps) {
    const router = useRouter()

    // Mock data - in real app, fetch from database using params.id
    const pet = {
        id: params.id,
        name: "Mochi",
        species: "Bamboo Panda",
        age: "2 hours old",
        image: "/assets/panda-pet/panda1.png",
        level: 1,
        experience: {
            current: 45,
            max: 100,
        },
        stats: {
            health: { current: 145, max: 145, percentage: 100 },
            energy: { current: 70, max: 70, percentage: 100 },
            hunger: { value: "Full", percentage: 85.65 },
            happiness: { value: "Happy", percentage: 71.4 },
        },
        attributes: {
            strength: 9,
            dexterity: 4,
            intelligence: 6,
            charm: 8,
        },
        achievements: [
            { id: 1, name: "First Steps", icon: "🎯", unlocked: true },
            { id: 2, name: "Bamboo Lover", icon: "🎋", unlocked: true },
            { id: 3, name: "Social Butterfly", icon: "🦋", unlocked: false },
        ],
    }

    return (
        <div className="min-h-screen">
            <Navigation />
            <main className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-6 hover:bg-accent"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Pandas
                </Button>

                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Left Column - Pet Display */}
                    <div className="lg:col-span-2">
                        <Card className="overflow-hidden sticky top-24">
                            {/* Pet Image Section */}
                            <div className="relative  aspect-square flex items-center justify-center p-8">
                                {/* Level Badge */}
                                <div className="absolute top-4 right-4">
                                    <Badge className="text-lg font-bold px-4 py-2 bg-primary shadow-lg">
                                        <Star className="w-4 h-4 mr-1" fill="currentColor" />
                                        Level {pet.level}
                                    </Badge>
                                </div>

                                {/* Pet Image */}
                                <div className="relative w-full max-w-[85%]">
                                    <div
                                        className="absolute bottom-0 left-1/2 -translate-x-1/2"
                                    />
                                    <img
                                        src={pet.image}
                                        alt={pet.name}
                                        draggable={false}
                                        className="relative z-10 w-full h-full object-contain "
                                    />
                                </div>
                            </div>

                            {/* Pet Info */}
                            <div className="p-6 space-y-4">
                                <div className="text-center space-y-1">
                                    <h1 className="text-3xl font-bold text-foreground">{pet.name}</h1>
                                    <p className="text-muted-foreground">{pet.age} {pet.species}</p>
                                </div>

                                {/* Experience Bar */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground flex items-center gap-1">
                                            <Award className="w-4 h-4" />
                                            Experience
                                        </span>
                                        <span className="font-medium">
                                            {pet.experience.current} / {pet.experience.max}
                                        </span>
                                    </div>
                                    <Progress
                                        value={(pet.experience.current / pet.experience.max) * 100}
                                        className="h-3"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <Button className="w-full" variant="default">
                                        🎋 Feed Bamboo
                                    </Button>
                                    <Button className="w-full" variant="outline">
                                        🎮 Play Game
                                    </Button>
                                    <Button className="w-full" variant="outline">
                                        💤 Rest
                                    </Button>
                                    <Button className="w-full" variant="outline">
                                        🎨 Customize
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column - Stats & Info */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Stats Section */}
                        <Card className="p-6">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Heart className="w-6 h-6 text-red-500" />
                                Vital Stats
                            </h2>
                            <div className="space-y-4">
                                {/* Health Bar */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                            <Heart className="w-5 h-5 text-red-500" fill="currentColor" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium">Health</span>
                                                <span className="text-muted-foreground">
                                                    {pet.stats.health.current} / {pet.stats.health.max}
                                                </span>
                                            </div>
                                            <div className="h-3 bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-300"
                                                    style={{ width: `${pet.stats.health.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Energy Bar */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                                            <Zap className="w-5 h-5 text-yellow-500" fill="currentColor" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium">Energy</span>
                                                <span className="text-muted-foreground">
                                                    {pet.stats.energy.current} / {pet.stats.energy.max}
                                                </span>
                                            </div>
                                            <div className="h-3 bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-300"
                                                    style={{ width: `${pet.stats.energy.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Hunger Bar */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                                            <UtensilsCrossed className="w-5 h-5 text-orange-500" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium">Hunger</span>
                                                <span className="text-muted-foreground">{pet.stats.hunger.value}</span>
                                            </div>
                                            <div className="h-3 bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-300"
                                                    style={{ width: `${pet.stats.hunger.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Happiness Bar */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center flex-shrink-0">
                                            <Smile className="w-5 h-5 text-pink-500" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium">Happiness</span>
                                                <span className="text-muted-foreground">{pet.stats.happiness.value}</span>
                                            </div>
                                            <div className="h-3 bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-pink-500 to-pink-400 transition-all duration-300"
                                                    style={{ width: `${pet.stats.happiness.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Attributes Section */}
                        <Card className="p-6">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Star className="w-6 h-6 text-yellow-500" />
                                Attributes
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20">
                                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                                        {pet.attributes.strength}
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">💪 Strength</div>
                                </div>
                                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                        {pet.attributes.dexterity}
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">⚡ Dexterity</div>
                                </div>
                                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                        {pet.attributes.intelligence}
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">🧠 Intelligence</div>
                                </div>
                                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/20">
                                    <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                                        {pet.attributes.charm}
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">✨ Charm</div>
                                </div>
                            </div>
                        </Card>

                        {/* Achievements Section */}
                        <Card className="p-6">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Award className="w-6 h-6 text-yellow-500" />
                                Achievements
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {pet.achievements.map((achievement) => (
                                    <div
                                        key={achievement.id}
                                        className={`p-4 rounded-lg border-2 text-center transition-all ${achievement.unlocked
                                                ? "bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/30"
                                                : "bg-muted/30 border-muted-foreground/10 opacity-50"
                                            }`}
                                    >
                                        <div className="text-4xl mb-2">{achievement.icon}</div>
                                        <div className="text-sm font-medium">{achievement.name}</div>
                                        {achievement.unlocked && (
                                            <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                                ✓ Unlocked
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Activity History */}
                        <Card className="p-6">
                            <h2 className="text-2xl font-bold mb-6">📜 Recent Activity</h2>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                                    <div className="text-2xl">🎋</div>
                                    <div className="flex-1">
                                        <div className="font-medium text-sm">Fed bamboo</div>
                                        <div className="text-xs text-muted-foreground">30 minutes ago</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                                    <div className="text-2xl">🎮</div>
                                    <div className="flex-1">
                                        <div className="font-medium text-sm">Played mini-game</div>
                                        <div className="text-xs text-muted-foreground">1 hour ago</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                                    <div className="text-2xl">🎯</div>
                                    <div className="flex-1">
                                        <div className="font-medium text-sm">Unlocked achievement</div>
                                        <div className="text-xs text-muted-foreground">2 hours ago</div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
