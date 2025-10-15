"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Moon, Sun } from "lucide-react"
import { useState } from "react"

export function AppNavigation() {
  const pathname = usePathname()
  const [isDarkMode, setIsDarkMode] = useState(false)

  const navItems = [
    { href: "/map", label: "Map", icon: "/map-icon.png" },
    { href: "/pets", label: "Pets", icon: "/paw-print-icon.png" },
    { href: "/items", label: "Items", icon: "/backpack-items-icon.jpg" },
    { href: "/profile", label: "Profile", icon: "/user-profile-icon.png" },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-primary">Mochia</div>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <img src={item.icon || "/placeholder.svg"} alt="" className="w-6 h-6" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}

            {/* Currency Display */}
            <div className="flex items-center gap-2 px-4 py-2 bg-accent rounded-full">
              <img src="/scroll-icon.jpg" alt="MP" className="w-5 h-5" />
              <span className="text-sm font-bold">2,500 MP</span>
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-around pb-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <img src={item.icon || "/placeholder.svg"} alt="" className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
