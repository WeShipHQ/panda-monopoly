"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Star, MapPin, Heart, Zap } from "lucide-react"

const achievements = [
  { id: 1, name: "First Pet", description: "Create your first pet", icon: "🐾", unlocked: true },
  { id: 2, name: "Explorer", description: "Visit 5 different locations", icon: "🗺️", unlocked: true },
  { id: 3, name: "Collector", description: "Collect 50 items", icon: "📦", unlocked: true },
  { id: 4, name: "Master Trainer", description: "Reach level 10 with a pet", icon: "⭐", unlocked: false },
  { id: 5, name: "Wealthy", description: "Earn 10,000 MP", icon: "💰", unlocked: false },
  { id: 6, name: "Adventurer", description: "Complete 100 activities", icon: "🎯", unlocked: false },
]

const stats = [
  { label: "Total Pets", value: "2", icon: Heart },
  { label: "Locations Visited", value: "5", icon: MapPin },
  { label: "Items Collected", value: "47", icon: Star },
  { label: "Activities Completed", value: "23", icon: Zap },
]

const recentActivity = [
  { action: "Explored Enchanted Forest", time: "2 hours ago", reward: "+15 MP" },
  { action: "Fed Fluffy", time: "3 hours ago", reward: "+5 Happiness" },
  { action: "Created new pet: Bubbles", time: "1 day ago", reward: "New Pet!" },
  { action: "Collected Rare Herb", time: "1 day ago", reward: "+1 Rare Item" },
]

export default function ProfilePage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Profile Header */}
          <Card className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-4xl font-bold text-white">
                M
              </div>
              <div className="flex-1 text-center md:text-left space-y-2">
                <h1 className="text-3xl font-bold text-foreground">MochiaPlayer</h1>
                <p className="text-muted-foreground">Member since January 2025</p>
                <div className="flex items-center gap-4 justify-center md:justify-start">
                  <Badge className="bg-primary/10 text-primary">Level 8</Badge>
                  <Badge variant="outline">2 Pets</Badge>
                  <Badge variant="outline">2,500 MP</Badge>
                </div>
              </div>
              <Button variant="outline" className="rounded-full bg-transparent">
                Edit Profile
              </Button>
            </div>

            {/* Level Progress */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Level 8 Progress</span>
                <span className="font-medium">750/1000 XP</span>
              </div>
              <Progress value={75} className="h-3" />
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="p-6 text-center space-y-2">
                <stat.icon className="w-8 h-8 mx-auto text-primary" />
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </Card>
            ))}
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="achievements" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Achievements</h2>
                <p className="text-muted-foreground">3 of 6 unlocked</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <Card key={achievement.id} className={`p-6 ${achievement.unlocked ? "" : "opacity-50"}`}>
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{achievement.icon}</div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{achievement.name}</h3>
                          {achievement.unlocked && <Trophy className="w-5 h-5 text-yellow-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Recent Activity Tab */}
            <TabsContent value="activity" className="space-y-4">
              <h2 className="text-2xl font-bold">Recent Activity</h2>
              <Card className="divide-y">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                    <Badge variant="outline" className="text-primary">
                      {activity.reward}
                    </Badge>
                  </div>
                ))}
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <h2 className="text-2xl font-bold">Settings</h2>
              <Card className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Account Settings</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start rounded-full bg-transparent">
                      Change Username
                    </Button>
                    <Button variant="outline" className="w-full justify-start rounded-full bg-transparent">
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start rounded-full bg-transparent">
                      Email Preferences
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-lg">Game Settings</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start rounded-full bg-transparent">
                      Notification Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start rounded-full bg-transparent">
                      Privacy Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start rounded-full bg-transparent">
                      Language
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button variant="destructive" className="w-full rounded-full">
                    Log Out
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
