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
import { useGameLogs } from "@/hooks/useGameLogs";

export function DebugUI() {
  const { leaveGame } = useGameContext();
  const { addGameLog, clearLogs } = useGameLogs();

  // // Sample event functions for testing
  // const addPlayerJoinedLog = () => {
  //   addGameLog({
  //     type: "PlayerJoined",
  //     playerId: "9WzD...xY2k",
  //     message: "9WzD...xY2k joined the game",
  //     details: {
  //       playerIndex: 1,
  //       totalPlayers: 2,
  //     },
  //   });
  // };

  // const addPlayerLeftLog = () => {
  //   addGameLog({
  //     type: "PlayerLeft",
  //     playerId: "5Abc...Def3",
  //     message: "5Abc...Def3 left the game",
  //     details: {
  //       refundAmount: 100,
  //       remainingPlayers: 1,
  //     },
  //   });
  // };

  // const addGameStartedLog = () => {
  //   addGameLog({
  //     type: "GameStarted",
  //     playerId: "9WzD...xY2k",
  //     message: "Game started!",
  //     // details: {
  //     //   totalPlayers: 4,
  //     //   firstPlayer: "9WzD...xY2k",
  //     // },
  //   });
  // };

  // const addPropertyPurchasedLog = () => {
  //   addGameLog({
  //     type: "PropertyPurchased",
  //     playerId: "9WzD...xY2k",
  //     message: "9WzD...xY2k bought Boardwalk for $400",
  //     details: {
  //       propertyName: "Boardwalk",
  //       position: 39,
  //       price: 400,
  //     },
  //   });
  // };

  // const addPropertyDeclinedLog = () => {
  //   addGameLog({
  //     type: "PropertyDeclined",
  //     playerId: "5Abc...Def3",
  //     message: "5Abc...Def3 declined to buy Park Place",
  //     details: {
  //       propertyName: "Park Place",
  //       position: 37,
  //       price: 350,
  //     },
  //   });
  // };

  // const addRentPaidLog = () => {
  //   addGameLog({
  //     type: "RentPaid",
  //     playerId: "7Xyz...Abc9",
  //     // message:
  //     //   "7Xyz...Abc9 paid $50 rent to 9WzD...xY2k for Mediterranean Avenue",
  //     details: {
  //       propertyName: "Mediterranean Avenue",
  //       position: 1,
  //       amount: 50,
  //       owner: "9WzD...xY2k",
  //     },
  //   });
  // };

  // const addChanceCardLog = () => {
  //   addGameLog({
  //     type: "ChanceCardDrawn",
  //     playerId: "9WzD...xY2k",
  //     message: "9WzD...xY2k drew Advance to Go: Collect $200",
  //     details: {
  //       cardType: "chance" as const,
  //       cardIndex: 0,
  //       cardTitle: "Advance to Go",
  //       cardDescription: "Collect $200",
  //       effectType: 1,
  //       amount: 200,
  //     },
  //   });
  // };

  // const addCommunityChestLog = () => {
  //   addGameLog({
  //     type: "CommunityChestCardDrawn",
  //     playerId: "5Abc...Def3",
  //     message: "5Abc...Def3 drew Bank Error in Your Favor: Collect $200",
  //     details: {
  //       cardType: "community-chest" as const,
  //       cardIndex: 1,
  //       cardTitle: "Bank Error in Your Favor",
  //       cardDescription: "Collect $200",
  //       effectType: 1,
  //       amount: 200,
  //     },
  //   });
  // };

  // const addHouseBuiltLog = () => {
  //   addGameLog({
  //     type: "HouseBuilt",
  //     playerId: "9WzD...xY2k",
  //     message: "9WzD...xY2k built a house on Baltic Avenue",
  //     details: {
  //       buildingType: "house" as const,
  //       propertyName: "Baltic Avenue",
  //       position: 3,
  //       price: 50,
  //       houseCount: 1,
  //     },
  //   });
  // };

  // const addHotelBuiltLog = () => {
  //   addGameLog({
  //     type: "HotelBuilt",
  //     playerId: "7Xyz...Abc9",
  //     message: "7Xyz...Abc9 built a hotel on Boardwalk",
  //     details: {
  //       buildingType: "hotel" as const,
  //       propertyName: "Boardwalk",
  //       position: 39,
  //       price: 200,
  //     },
  //   });
  // };

  // const addBuildingSoldLog = () => {
  //   addGameLog({
  //     type: "BuildingSold",
  //     playerId: "5Abc...Def3",
  //     message: "5Abc...Def3 sold a house on Park Place for $100",
  //     details: {
  //       buildingType: "house" as const,
  //       propertyName: "Park Place",
  //       position: 37,
  //       price: 100,
  //     },
  //   });
  // };

  // const addPropertyMortgagedLog = () => {
  //   addGameLog({
  //     type: "PropertyMortgaged",
  //     playerId: "9WzD...xY2k",
  //     message: "9WzD...xY2k mortgaged Reading Railroad for $100",
  //     details: {
  //       propertyName: "Reading Railroad",
  //       position: 5,
  //       price: 100,
  //     },
  //   });
  // };

  // const addPropertyUnmortgagedLog = () => {
  //   addGameLog({
  //     type: "PropertyUnmortgaged",
  //     playerId: "7Xyz...Abc9",
  //     message: "7Xyz...Abc9 unmortgaged Pennsylvania Railroad for $110",
  //     details: {
  //       propertyName: "Pennsylvania Railroad",
  //       position: 15,
  //       price: 110,
  //     },
  //   });
  // };

  // const addTaxPaidLog = () => {
  //   addGameLog({
  //     type: "TaxPaid",
  //     playerId: "5Abc...Def3",
  //     message: "5Abc...Def3 paid $200 MEV tax",
  //     details: {
  //       taxType: "MEV",
  //       amount: 200,
  //       position: 4,
  //     },
  //   });
  // };

  // const addJailLog = () => {
  //   addGameLog({
  //     type: "PlayerSentToJail",
  //     playerId: "9WzD...xY2k",
  //     message: "9WzD...xY2k was sent to Validator Jail",
  //     details: {
  //       position: 30,
  //       spaceType: 2,
  //     },
  //   });
  // };

  // const addPassedGoLog = () => {
  //   addGameLog({
  //     type: "PlayerPassedGo",
  //     playerId: "5Abc...Def3",
  //     message: "5Abc...Def3 passed Solana Genesis and collected $200",
  //     details: {
  //       toPosition: 5,
  //       passedGo: true,
  //       amount: 200,
  //     },
  //   });
  // };

  // const addTradeCreatedLog = () => {
  //   addGameLog({
  //     type: "TradeCreated",
  //     playerId: "9WzD...xY2k",
  //     message: "9WzD...xY2k created a trade with 5Abc...Def3",
  //     details: {
  //       action: "created",
  //       tradeId: "1",
  //       targetPlayer: "5Abc...Def3",
  //       offeredMoney: 500,
  //       requestedMoney: 200,
  //       offeredProperties: [1],
  //       requestedProperties: [3],
  //     },
  //   });
  // };

  // const addTradeAcceptedLog = () => {
  //   addGameLog({
  //     type: "TradeAccepted",
  //     playerId: "5Abc...Def3",
  //     message: "5Abc...Def3 accepted a trade from 9WzD...xY2k",
  //     details: {
  //       action: "accepted",
  //       tradeId: "1",
  //       targetPlayer: "9WzD...xY2k",
  //     },
  //   });
  // };

  // const addTradeRejectedLog = () => {
  //   addGameLog({
  //     type: "TradeRejected",
  //     playerId: "7Xyz...Abc9",
  //     message: "7Xyz...Abc9 rejected a trade from 9WzD...xY2k",
  //     details: {
  //       action: "rejected",
  //       tradeId: "2",
  //       targetPlayer: "9WzD...xY2k",
  //     },
  //   });
  // };

  // const addTradeCancelledLog = () => {
  //   addGameLog({
  //     type: "TradeCancelled",
  //     playerId: "9WzD...xY2k",
  //     message: "9WzD...xY2k cancelled their trade",
  //     details: {
  //       action: "cancelled",
  //       tradeId: "3",
  //     },
  //   });
  // };

  // const addBankruptcyLog = () => {
  //   addGameLog({
  //     type: "PlayerDeclaredBankruptcy",
  //     playerId: "5Abc...Def3",
  //     message: "5Abc...Def3 declared bankruptcy",
  //     details: {
  //       liquidationValue: 1200,
  //       cashTransferred: 800,
  //     },
  //   });
  // };

  // const addGameEndedLog = () => {
  //   addGameLog({
  //     type: "GameEnded",
  //     playerId: "9WzD...xY2k",
  //     message: "9WzD...xY2k won the game!",
  //     details: {
  //       winner: "9WzD...xY2k",
  //       reason: "LAST_PLAYER_STANDING",
  //       winnerNetWorth: 5000,
  //     },
  //   });
  // };

  // const addGameCancelledLog = () => {
  //   addGameLog({
  //     type: "GameCancelled",
  //     playerId: "9WzD...xY2k",
  //     message: "Game was cancelled by 9WzD...xY2k",
  //     details: {
  //       playersCount: 2,
  //       refundAmount: 100,
  //     },
  //   });
  // };

  // const addPrizeClaimedLog = () => {
  //   addGameLog({
  //     type: "PrizeClaimed",
  //     playerId: "9WzD...xY2k",
  //     message: "9WzD...xY2k claimed their prize of $1000",
  //     details: {
  //       prizeAmount: 1000,
  //     },
  //   });
  // };

  // const addTradesCleanedUpLog = () => {
  //   addGameLog({
  //     type: "TradesCleanedUp",
  //     playerId: "System",
  //     message: "3 expired trades were cleaned up",
  //     details: {
  //       tradesRemoved: 3,
  //       remainingTrades: 1,
  //     },
  //   });
  // };

  const handleAddLogs = async () => {
    // Add multiple sample logs for comprehensive testing
    // addPlayerJoinedLog();
    // setTimeout(() => addGameStartedLog(), 100);
    // setTimeout(() => addPropertyPurchasedLog(), 200);
    // setTimeout(() => addRentPaidLog(), 300);
    // setTimeout(() => addChanceCardLog(), 400);
    // setTimeout(() => addHouseBuiltLog(), 500);
    // setTimeout(() => addTradeCreatedLog(), 600);
    // setTimeout(() => addTradeAcceptedLog(), 700);
    // toast.success("Sample logs added!");
  };

  return (
    <div className="flex items-start w-full flex-col gap-2">
      {/* <div className="grid grid-cols-2 gap-2 w-full">
        <Button size="sm" onClick={addPlayerJoinedLog}>
          Player Joined
        </Button>
        <Button size="sm" onClick={addPlayerLeftLog}>
          Player Left
        </Button>

        <Button size="sm" onClick={addGameStartedLog}>
          Game Started
        </Button>
        <Button size="sm" onClick={addGameCancelledLog}>
          Game Cancelled
        </Button>

        <Button size="sm" onClick={addPropertyPurchasedLog}>
          Property Bought
        </Button>
        <Button size="sm" onClick={addPropertyDeclinedLog}>
          Property Declined
        </Button>

        <Button size="sm" onClick={addRentPaidLog}>
          Rent Paid
        </Button>
        <Button size="sm" onClick={addTaxPaidLog}>
          Tax Paid
        </Button>

        <Button size="sm" onClick={addChanceCardLog}>
          Chance Card
        </Button>
        <Button size="sm" onClick={addCommunityChestLog}>
          Community Chest
        </Button>

        <Button size="sm" onClick={addHouseBuiltLog}>
          House Built
        </Button>
        <Button size="sm" onClick={addHotelBuiltLog}>
          Hotel Built
        </Button>

        <Button size="sm" onClick={addPassedGoLog}>
          Passed Go
        </Button>
        <Button size="sm" onClick={addJailLog}>
          Sent to Jail
        </Button>

        <Button size="sm" onClick={addTradeCreatedLog}>
          Trade Created
        </Button>
        <Button size="sm" onClick={addTradeAcceptedLog}>
          Trade Accepted
        </Button>

        <Button size="sm" onClick={addBankruptcyLog}>
          Bankruptcy
        </Button>
        <Button size="sm" onClick={addGameEndedLog}>
          Game Won
        </Button>
      </div> */}

      <div className="flex flex-wrap gap-2 w-full">
        <Button onClick={handleAddLogs} className="flex-1">
          Add Sample Logs
        </Button>
        <Button onClick={clearLogs}>Clear Logs</Button>
        <Button onClick={leaveGame}>LEAVE</Button>
      </div>

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
