"use client";

import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useGameContext } from "@/components/providers/game-provider";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { showGameEndedToast } from "@/lib/toast-utils";
import { GameEndReason } from "@/lib/sdk/generated";

export function DebugUI() {
  const { currentPlayerState, refetch, leaveGame } = useGameContext();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateBalance = async () => {
    showGameEndedToast({
      winner: "XLXwXZ6gEDERzH2H3N928Xf3DtCtLy2rpLFi9bArZQF",
      reason: GameEndReason.BankruptcyVictory,
      winnerNetWorth: 1000000,
      currentPlayerAddress: "XLXwXZ6gEDERzH2H3N928Xf3DtCtLy2rpLFi9bArZQF",
    });

    // const balanceChange = "100";

    // if (!currentPlayerState || !mutate || !balanceChange) {
    //   toast.error("Missing required data for balance update");
    //   return;
    // }

    // const changeAmount = parseInt(balanceChange);
    // if (isNaN(changeAmount)) {
    //   toast.error("Please enter a valid number");
    //   return;
    // }

    // setIsUpdating(true);
    // try {
    //   // Update the cached data directly using mutate
    //   await mutate((currentData: any) => {
    //     if (!currentData) return currentData;

    //     // Create a deep copy of the current data
    //     const updatedData = JSON.parse(JSON.stringify(currentData));

    //     // Find and update the current player's balance
    //     const playerIndex = updatedData.players.findIndex(
    //       (player: any) => player.wallet === currentPlayerState.wallet
    //     );
    //     console.log("playerIndex", playerIndex);
    //     if (playerIndex !== -1) {
    //       const newBalance =
    //         Number(updatedData.players[playerIndex].cashBalance) + changeAmount;
    //       console.log("newBalance", newBalance);
    //       updatedData.players[playerIndex].cashBalance = Math.max(
    //         0,
    //         newBalance
    //       ); // Prevent negative balance
    //     }

    //     return updatedData;
    //   }, false); // false means don't revalidate from server

    //   // await refetch();

    //   toast.success(
    //     `Balance updated by ${changeAmount > 0 ? "+" : ""}${changeAmount}`
    //   );
    //   // setBalanceChange("");
    // } catch (error) {
    //   console.error("Failed to update balance:", error);
    //   toast.error("Failed to update balance");
    // } finally {
    //   setIsUpdating(false);
    // }
  };

  return (
    <div className="flex items-start w-full flex-col gap-2">
      <Button
        onClick={() => {
          handleUpdateBalance();
        }}
      >
        CHANCE
      </Button>
      <Button onClick={leaveGame}>LEAVE</Button>
      <GameInfo />
      <DiceTestForm />
    </div>
  );
}

function DiceTestForm() {
  const { setDemoDices } = useGameContext();

  const [dice1, setDice1] = useState("");
  const [dice2, setDice2] = useState("");

  const handleSave = () => {
    const diceValue1 = parseInt(dice1) || 1;
    const diceValue2 = parseInt(dice2) || 1;

    if (diceValue1 < 1 || diceValue1 > 6 || diceValue2 < 1 || diceValue2 > 6) {
      alert("Please enter valid dice values (1-6)");
      return;
    }

    setDemoDices([diceValue1, diceValue2]);
  };

  return (
    <div className="border rounded-lg p-4 w-full">
      <h3 className="text-sm font-medium mb-3">Dice Test Form</h3>
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label htmlFor="dice1" className="text-xs text-gray-600 block mb-1">
            Dice 1 (1-6)
          </label>
          <input
            id="dice1"
            type="number"
            min="1"
            max="6"
            value={dice1}
            onChange={(e) => setDice1(e.target.value)}
            placeholder="Dice 1"
            className={cn(
              "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
            )}
          />
        </div>
        <div className="flex-1">
          <label htmlFor="dice2" className="text-xs text-gray-600 block mb-1">
            Dice 2 (1-6)
          </label>
          <input
            id="dice2"
            type="number"
            min="1"
            max="6"
            value={dice2}
            onChange={(e) => setDice2(e.target.value)}
            placeholder="Dice 2"
            className={cn(
              "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
            )}
          />
        </div>
        <Button onClick={handleSave} size="sm" className="h-8">
          Save
        </Button>
      </div>
    </div>
  );
}

function GameInfo() {
  const { gameState, players, properties, currentPlayerState } =
    useGameContext();
  const [isLoading, setIsLoading] = useState(false);
  const { resetGame, closeGame } = useGameContext();

  const handleResetGame = async () => {
    try {
      setIsLoading(true);
      await resetGame();
    } catch (error) {
      console.error("Failed to reset game:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseGame = async () => {
    try {
      setIsLoading(true);
      await closeGame();
    } catch (error) {
      console.error("Failed to close game:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>DEBUG</Button>
      </SheetTrigger>
      <SheetContent className="max-w-3xl w-full">
        <SheetHeader>
          <SheetTitle>Debug</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-auto">
          <p className="mb-3">Current player</p>
          <div className="w-full overflow-hidden p-4 mb-3">
            <pre className="w-full h-[200px] text-black bg-gray-100 overflow-y-auto">
              {JSON.stringify(currentPlayerState, null, 2)}
            </pre>
          </div>

          <p className="mb-3">Game account</p>
          <div className="w-full overflow-hidden p-4 mb-3">
            <pre className="w-full h-[200px] text-black bg-gray-100 overflow-y-auto">
              {JSON.stringify(gameState, null, 2)}
            </pre>
          </div>

          <p className="mb-3">Player accounts</p>
          <div className="w-full overflow-hidden p-4 mb-3">
            <pre className="w-full h-[300px] text-black bg-gray-100 overflow-y-auto">
              {JSON.stringify(players, null, 2)}
            </pre>
          </div>

          <p className="mb-3">Properties</p>
          <div className="w-full overflow-hidden p-4">
            <pre className="w-full h-[300px] text-black bg-gray-100 overflow-y-auto">
              {JSON.stringify(properties, null, 2)}
            </pre>
          </div>
        </div>
        <SheetFooter>
          <Button onClick={handleResetGame} loading={isLoading}>
            {isLoading ? "Resetting..." : "Reset Game"}
          </Button>
          <Button onClick={handleCloseGame} loading={isLoading}>
            {isLoading ? "Closing..." : "Close Game"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
