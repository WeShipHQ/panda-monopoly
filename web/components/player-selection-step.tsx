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
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-muted-foreground mb-2">No other players available</div>
        <div className="text-sm text-muted-foreground">
          Wait for more players to join the game
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        Select a player to create a trade with:
      </div>
      
      <div className="grid gap-3">
        {players.map((player) => (
          <div
            key={player.wallet}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {player.wallet.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <div className="font-medium">
                  {player.wallet.slice(0, 8)}...{player.wallet.slice(-4)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Balance: {formatSolAmount(player.cashBalance)} SOL
                </div>
                <div className="text-xs text-muted-foreground">
                  Properties: {player.propertiesOwned.length}
                  {player.isBankrupt && " • Bankrupt"}
                  {player.inJail && " • In Jail"}
                </div>
              </div>
            </div>

            <Button
              onClick={() => onPlayerSelect(player)}
              disabled={player.isBankrupt}
              className="min-w-[100px]"
            >
              {player.isBankrupt ? "Bankrupt" : "Select"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}