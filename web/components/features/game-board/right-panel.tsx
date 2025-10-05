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
import { TradeView } from "./trade-view";
import { BankruptcyButton } from "./bankruptcy-button";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import envConfig from "@/configs/env";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function RightPanel() {
  return (
    <div className="p-4 space-y-6 h-full overflow-auto">
      <TradeView />
      <BankruptcyButton />

      {envConfig.IS_DEVELOPMENT && (
        <div className="flex items-start w-full flex-col gap-2">
          <Button
            onClick={() =>
              toast("Event has been created", {
                description: "Sunday, December 03, 2023 at 9:00 AM",
                action: {
                  label: "Undo",
                  onClick: () => console.log("Undo"),
                },
              })
            }
          >
            Toast
          </Button>
          <DebugUI />
          <DiceTestForm />
        </div>
      )}
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

function DebugUI() {
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
