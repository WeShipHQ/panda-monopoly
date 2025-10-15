import { Card } from "./card"
import { Progress } from "./progress"

interface PetDetailCardProps {
  name: string
  species: string
  age: string
  image: string
  stats: {
    health: { current: number; max: number }
    energy: { current: number; max: number }
    hunger: { value: string; percentage: number }
    happiness: { value: string; percentage: number }
  }
  attributes: {
    level: number
    strength: number
    dexterity: number
    intelligence: number
  }
}

export function PetDetailCard({ name, species, age, image, stats, attributes }: PetDetailCardProps) {
  return (
    <Card className="overflow-hidden max-w-md mx-auto">
      {/* Pet Image Section */}
      <div className="relative  p-12 flex items-center justify-center">
        <div className="relative w-full max-w-[80%]">
          {/* Drop shadow effect */}
          <div 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[93%] h-[15%] rounded-full bg-black/20 blur-md"
          />
          <img 
            src={image} 
            alt="Pet" 
            draggable={false}
            className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
          />
        </div>
      </div>

      {/* Pet Info Section */}
      <div className="p-6 space-y-6">
        {/* Name and Age */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">{name}</h2>
          <p className="text-sm text-muted-foreground">{age} old {species}</p>
        </div>

        {/* Stats Bars */}
        <div className="space-y-3">
          {/* Health Bar */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-red-500">
                  <path d="M16.68 5.33a4.165 4.165 0 0 0-5.88 0l-.8.8-.8-.8a4.165 4.165 0 0 0-5.88 0 4.165 4.165 0 0 0 0 5.88l.8.8L10 17.89l5.88-5.88.8-.8a4.165 4.165 0 0 0 0-5.88Z"></path>
                </svg>
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{stats.health.current} / {stats.health.max}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-300"
                    style={{ width: `${(stats.health.current / stats.health.max) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Energy Bar */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-500">
                  <path d="M20.98 11.802a.995.995 0 0 0-.738-.771l-6.86-1.716 2.537-5.921a.998.998 0 0 0-.317-1.192.996.996 0 0 0-1.234.024l-11 9a1 1 0 0 0 .39 1.744l6.719 1.681-3.345 5.854A1.001 1.001 0 0 0 8 22a.995.995 0 0 0 .6-.2l12-9a1 1 0 0 0 .38-.998z"></path>
                </svg>
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{stats.energy.current} / {stats.energy.max}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-300"
                    style={{ width: `${(stats.energy.current / stats.energy.max) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Hunger Bar */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth="1.75" fill="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-orange-500">
                  <path d="M10 15l5.586 -5.585a2 2 0 1 1 3.414 -1.415a2 2 0 1 1 -1.413 3.414l-3.587 3.586"></path>
                  <path d="M12 13l-3.586 -3.585a2 2 0 1 0 -3.414 -1.415a2 2 0 1 0 1.413 3.414l3.587 3.586"></path>
                  <path d="M3 20h18c-.175 -1.671 -.046 -3.345 -2 -5h-14c-1.333 1 -2 2.667 -2 5z"></path>
                </svg>
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{stats.hunger.value}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-300"
                    style={{ width: `${stats.hunger.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Happiness Bar */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" className="w-5 h-5 text-pink-500">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="m15.44 14.57-3.01 2.16a4.24 4.24 0 0 1-4.88 0l-3.01-2.16a3.57 3.57 0 0 1-1.41-3.92L4.94 4.5l2.02 4.35a1.95 1.95 0 0 0 1.78 1.08h2.49c.77 0 1.47-.43 1.78-1.08l2.02-4.35 1.81 6.15c.43 1.45-.13 3-1.41 3.92Z"></path>
                </svg>
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{stats.happiness.value}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-500 to-pink-400 transition-all duration-300"
                    style={{ width: `${stats.happiness.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pet Attributes */}
        <div className="grid grid-cols-4 gap-4 pt-4 border-t border-border">
          <div className="text-center space-y-1">
            <div className="text-xs text-muted-foreground">Level</div>
            <div className="text-lg font-bold text-foreground">{attributes.level}</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-xs text-muted-foreground">Strength</div>
            <div className="text-lg font-bold text-foreground">{attributes.strength}</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-xs text-muted-foreground">Dexterity</div>
            <div className="text-lg font-bold text-foreground">{attributes.dexterity}</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-xs text-muted-foreground">Intelligence</div>
            <div className="text-lg font-bold text-foreground">{attributes.intelligence}</div>
          </div>
        </div>
      </div>
    </Card>
  )
}
