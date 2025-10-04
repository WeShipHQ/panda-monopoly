// Player selection step component
"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { PlayerAccount } from "@/types/schema";

interface PlayerSelectionStepProps {
  players: PlayerAccount[];
  onPlayerSelect: (player: PlayerAccount) => void;
}

// Simple format function for SOL amounts
const formatSolAmount = (amount: string): string => {
  const numAmount = parseFloat(amount) / 1000000000; // Convert lamports to SOL
  return numAmount.toFixed(3);
};

interface PlayerSelectionStepProps {
  players: PlayerAccount[];
  onPlayerSelect: (player: PlayerAccount) => void;
}

export function PlayerSelectionStep({
  players,
  onPlayerSelect,
}: PlayerSelectionStepProps) {
  if (players.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="text-muted-foreground mb-1">No other players available</div>
        <div className="text-xs text-muted-foreground">
          Wait for more players to join the game
        </div>
      </div>
    );
  }

  // Neobrutalism colors for different users
  const playerColors = [
    { bg: 'bg-[#88AAEE]', icon: 'bg-[#3366CC]' },
    { bg: 'bg-[#FF6B6B]', icon: 'bg-[#CC0000]' },
    { bg: 'bg-[#4ECDC4]', icon: 'bg-[#0E9F8F]' },
    { bg: 'bg-[#A98CFF]', icon: 'bg-[#7B3FF2]' },
    { bg: 'bg-[#FFD93D]', icon: 'bg-[#F4B000]' },
    { bg: 'bg-[#FF87CA]', icon: 'bg-[#E63980]' },
    { bg: 'bg-[#95E1D3]', icon: 'bg-[#38B2A3]' },
    { bg: 'bg-[#FFA07A]', icon: 'bg-[#FF6347]' },
  ];

  return (
    <div className="py-2 mt-1">
      <div className="grid grid-cols-1 gap-2 max-h-60 custom-scrollbar">
        {players.map((player, index) => {
          const colorIndex = index % playerColors.length;
          const colors = playerColors[colorIndex];
          
          return (
            <div
              key={player.wallet}
              className={`flex items-center py-2 px-3 border-2 border-black rounded-none cursor-pointer transition-all hover:translate-x-[2px] hover:translate-y-[2px] ${colors.bg} text-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
              onClick={() => !player.isBankrupt && onPlayerSelect(player)}
            >
              <Avatar className="h-6 w-6 mr-2 border-2 border-black rounded-none">
                <AvatarFallback className={`text-xs font-bold rounded-none ${colors.icon} text-white`}>
                  {player.wallet.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="font-bold text-sm">
                {player.wallet.slice(0, 5)}...
              </div>
            </div>
          );
        })}
      </div>
      <style>{`
        .custom-scrollbar {
          overflow-y: auto;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }
        .custom-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>
    </div>
  );
}