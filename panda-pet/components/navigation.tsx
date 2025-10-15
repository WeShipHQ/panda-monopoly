"use client"

import type React from "react"

import { Map, Heart, Package, User, Sun, Moon, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"

export function Navigation() {
  const [isDark, setIsDark] = useState(false)
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark")
    setIsDark(isDarkMode)
  }, [])

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark")
    setIsDark(!isDark)
  }

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-3xl font-bold text-primary hover:opacity-80 transition-opacity flex items-center gap-2">
              <span className="text-2xl">🐼</span>
              Panda Pet World
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <NavItem 
                icon={<span className="text-xl">🗺️</span>} 
                label="Map" 
                href="/map" 
                active={pathname?.startsWith("/map")} 
              />
              <NavItem 
                icon={<span className="text-xl">❤️</span>} 
                label="Pets" 
                href="/pets" 
                active={pathname?.startsWith("/pets")} 
              />
              <NavItem 
                icon={<span className="text-xl">📦</span>} 
                label="Items" 
                href="/items" 
                active={pathname?.startsWith("/items")} 
              />
              <NavItem 
                icon={<span className="text-xl">👤</span>} 
                label="Profile" 
                href="/profile" 
                active={pathname?.startsWith("/profile")} 
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* MP Display - Only show when not on homepage */}
            {!isHomePage && (
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Zap className="w-4 h-4 text-yellow-500" strokeWidth={2.5} />
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-primary">1250</span>
                  <span className="text-xs text-muted-foreground">MP</span>
                </div>
              </div>
            )}
            
            <Button variant="ghost" size="sm" className="hidden md:flex">
              Sign In
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="rounded-full">
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-500" strokeWidth={2} />
              ) : (
                <Moon className="w-5 h-5 text-indigo-500" strokeWidth={2} />
              )}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

function NavItem({ icon, label, href, active }: { icon: React.ReactNode; label: string; href: string; active?: boolean }) {
  return (
    <Link 
      href={href}
      className={`flex items-center gap-2 transition-colors ${
        active 
          ? "text-primary font-semibold" 
          : "text-foreground/70 hover:text-foreground"
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  )
}
