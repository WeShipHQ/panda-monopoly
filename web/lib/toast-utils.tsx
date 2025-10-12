import React from "react";
import { toast } from "sonner";
import { formatAddress } from "./utils";
import { surpriseCards, treasureCards } from "@/configs/board-data";
import { Address } from "@solana/kit";
import { GameEndReason } from "./sdk/generated";

interface RentPaymentToastProps {
  rentAmount: number;
  ownerAddress: string;
  propertyName: string;
}

interface RentPaymentFallbackToastProps {
  ownerAddress: string;
  propertyName: string;
}

interface TaxPaidToastProps {
  isCurrentPlayer: boolean;
  playerAddress: string;
  taxType: number;
  amount: bigint;
  position: number;
}

interface PlayerPassedGoToastProps {
  salaryCollected: bigint;
}

interface PlayerJoinedToastProps {
  playerAddress: string;
  playerIndex: number;
  totalPlayers: number;
}

interface GameStartedToastProps {
  totalPlayers: number;
  firstPlayer: string;
}

interface ChanceCardDrawnToastProps {
  playerAddress: string;
  cardIndex: number;
  isCurrentPlayer: boolean;
}

interface CommunityChestCardDrawnToastProps {
  playerAddress: string;
  cardIndex: number;
  isCurrentPlayer: boolean;
}

interface GoToJailToastProps {
  playerAddress: string;
  isCurrentPlayer: boolean;
}

export const showRentPaymentToast = ({
  rentAmount,
  ownerAddress,
  propertyName,
}: RentPaymentToastProps) => {
  toast.info(
    <div className="flex flex-col gap-1.5">
      <div className="text-sm">
        You paid{" "}
        <span
          className="font-bold px-2 py-0.5 rounded-md text-white"
          style={{ backgroundColor: "var(--chart-1)" }}
        >
          ${rentAmount}
        </span>{" "}
        rent to{" "}
        <span
          className="font-bold px-2 py-0.5 rounded-md text-white"
          style={{ backgroundColor: "var(--chart-2)" }}
        >
          {formatAddress(ownerAddress)}
        </span>
      </div>
      <div className="text-xs">
        for{" "}
        <span
          className="font-bold px-2 py-0.5 rounded-md text-white"
          style={{ backgroundColor: "var(--chart-3)" }}
        >
          {propertyName}
        </span>
      </div>
    </div>
  );
};

export const showRentPaymentFallbackToast = ({
  ownerAddress,
  propertyName,
}: RentPaymentFallbackToastProps) => {
  toast.info(
    <div className="flex flex-col gap-1.5">
      <div className="text-sm">
        You paid rent to{" "}
        <span
          className="font-bold px-2 py-0.5 rounded-md text-white"
          style={{ backgroundColor: "var(--chart-2)" }}
        >
          {formatAddress(ownerAddress)}
        </span>
      </div>
      <div className="text-xs">
        for{" "}
        <span
          className="font-bold px-2 py-0.5 rounded-md text-white"
          style={{ backgroundColor: "var(--chart-3)" }}
        >
          {propertyName}
        </span>
      </div>
    </div>
  );
};

export const showRentPaymentErrorToast = () => {
  toast.error(
    <div className="flex items-center gap-2">
      {/* <span>❌</span> */}
      <span className="font-semibold">
        Failed to pay rent. Please try again.
      </span>
    </div>
  );
};

export const showTaxPaidToast = ({
  isCurrentPlayer,
  playerAddress,
  taxType,
  amount,
}: TaxPaidToastProps) => {
  const taxTypeName =
    taxType === 1 ? "MEV Tax" : taxType === 2 ? "Priority Fee Tax" : "Tax";

  toast.warning(
    <div className="flex flex-col">
      <div className="text-sm">
        {isCurrentPlayer ? "You" : formatAddress(playerAddress)} paid{" "}
        <span
          className="font-bold px-2 py-0.5 rounded-md text-white"
          style={{ backgroundColor: "var(--chart-2)" }}
        >
          ${amount.toString()}
        </span>{" "}
        in{" "}
        <span
          className="font-bold px-2 py-0.5 rounded-md text-white"
          style={{ backgroundColor: "var(--chart-4)" }}
        >
          {taxTypeName}
        </span>
      </div>
    </div>
  );
};

export const showPlayerPassedGoToast = ({
  salaryCollected,
}: PlayerPassedGoToastProps) => {
  toast.success(
    <div className="flex flex-col gap-1.5">
      <div className="text-sm">
        🎉 You passed GO and collected{" "}
        <span
          className="font-bold px-2 py-0.5 rounded-md text-white"
          style={{ backgroundColor: "var(--chart-1)" }}
        >
          ${salaryCollected.toString()}
        </span>
      </div>
      <div className="text-xs text-muted-foreground">Keep going! 💰</div>
    </div>
  );
};

export const showPlayerJoinedToast = ({
  playerAddress,
}: // playerIndex,
// totalPlayers,
PlayerJoinedToastProps) => {
  toast.info(
    <div className="flex flex-col">
      <div className="text-sm">
        <span
          className="font-bold px-2 py-0.5 rounded-md text-white"
          style={{ backgroundColor: "var(--chart-2)" }}
        >
          {formatAddress(playerAddress)}
        </span>{" "}
        joined the game!
      </div>
    </div>
  );
};

export const showGameStartedToast = ({
  firstPlayer,
}: GameStartedToastProps) => {
  toast.success(
    <div className="flex flex-col gap-1.5">
      <div className="text-sm font-semibold">🎮 Game Started!</div>
      <div className="text-xs text-muted-foreground">
        First player: {formatAddress(firstPlayer)}
      </div>
    </div>
  );
};

export const showChanceCardDrawnToast = ({
  playerAddress,
  cardIndex,
  isCurrentPlayer,
}: ChanceCardDrawnToastProps) => {
  const card = surpriseCards[cardIndex];
  const playerName = isCurrentPlayer ? "You" : formatAddress(playerAddress);

  if (!card) {
    toast.info(`${playerName} drew a Pump.fun Surprise card`);
    return;
  }

  toast.info(
    <div className="flex flex-col gap-1.5">
      <div className="text-sm font-semibold">
        🎲 {playerName} drew: {card.title}
      </div>
      <div className="text-xs text-muted-foreground">{card.description}</div>
    </div>,
    {
      duration: 5000,
    }
  );
};

export const showCommunityChestCardDrawnToast = ({
  playerAddress,
  cardIndex,
  isCurrentPlayer,
}: CommunityChestCardDrawnToastProps) => {
  const card = treasureCards[cardIndex];
  const playerName = isCurrentPlayer ? "You" : formatAddress(playerAddress);

  if (!card) {
    toast.info(`${playerName} drew an Airdrop Chest card`);
    return;
  }

  toast.info(
    <div className="flex flex-col gap-1.5">
      <div className="text-sm font-semibold">
        📦 {playerName} drew: {card.title}
      </div>
      <div className="text-xs text-muted-foreground">{card.description}</div>
    </div>,
    {
      duration: 5000,
    }
  );
};

export const showGoToJailToast = ({
  playerAddress,
  isCurrentPlayer,
}: GoToJailToastProps) => {
  const playerName = isCurrentPlayer ? "You" : formatAddress(playerAddress);

  toast.error(
    <div className="flex flex-col gap-1.5">
      <div className="text-sm">
        🚔 {playerName} {isCurrentPlayer ? "went" : "went"} to jail!
      </div>
      <div className="text-xs text-muted-foreground">
        {isCurrentPlayer
          ? "Better luck next time!"
          : "Ouch! That's gotta hurt."}
      </div>
    </div>
  );
};

interface PropertyPurchasedToastProps {
  propertyName: string;
  price: bigint;
  isCurrentPlayer: boolean;
  playerAddress?: string;
}

export const showPropertyPurchasedToast = ({
  propertyName,
  price,
  isCurrentPlayer,
  playerAddress,
}: PropertyPurchasedToastProps) => {
  if (isCurrentPlayer) {
    // Show "You bought XXX" for current player
    toast.success(
      <div className="flex flex-col gap-1.5">
        <div className="text-sm">
          🏠 You bought{" "}
          <span
            className="font-bold px-2 py-0.5 rounded-md text-white"
            style={{ backgroundColor: "var(--chart-3)" }}
          >
            {propertyName}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          for{" "}
          <span
            className="font-bold px-1 py-0.5 rounded text-white"
            style={{ backgroundColor: "var(--chart-1)" }}
          >
            ${price.toString()}
          </span>
        </div>
      </div>
    );
  } else {
    // Show "0x00 just bought YYY" for other players
    toast.info(
      <div className="flex flex-col gap-1.5">
        <div className="text-sm">
          <span
            className="font-bold px-2 py-0.5 rounded-md text-white"
            style={{ backgroundColor: "var(--chart-2)" }}
          >
            {formatAddress(playerAddress || "")}
          </span>{" "}
          just bought{" "}
          <span
            className="font-bold px-2 py-0.5 rounded-md text-white"
            style={{ backgroundColor: "var(--chart-3)" }}
          >
            {propertyName}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          for{" "}
          <span
            className="font-bold px-1 py-0.5 rounded text-white"
            style={{ backgroundColor: "var(--chart-1)" }}
          >
            ${price.toString()}
          </span>
        </div>
      </div>
    );
  }
};

interface GameEndedToastProps {
  winner: Address | string | null;
  reason: GameEndReason;
  winnerNetWorth: number | null;
  currentPlayerAddress: string | null;
}

export const showGameEndedToast = ({
  winner,
  reason,
  winnerNetWorth,
  currentPlayerAddress,
}: GameEndedToastProps) => {
  const getReasonText = (reason: GameEndReason): string => {
    switch (reason) {
      case GameEndReason.BankruptcyVictory:
        return "Bankruptcy Victory";
      case GameEndReason.TimeLimit:
        return "Time Limit Reached";
      case GameEndReason.Manual:
        return "Manual End";
      default:
        return "Game Ended";
    }
  };

  const isWinner =
    winner && currentPlayerAddress && winner === currentPlayerAddress;
  const hasWinner = winner !== null;

  toast(
    <div className="flex flex-col gap-3 p-2 max-w-[600px] w-full">
      {/* Header with game end styling */}
      <div className="flex items-center gap-2">
        <div
          className="px-3 py-1 border-2 border-black font-black text-sm uppercase"
          style={{
            backgroundColor: hasWinner
              ? isWinner
                ? "#14f195"
                : "#ff0080"
              : "#ffed00",
            color: "black",
            transform: "rotate(-1deg)",
          }}
        >
          {hasWinner
            ? isWinner
              ? "🎉 VICTORY!"
              : "💔 GAME OVER"
            : "🏁 GAME ENDED"}
        </div>
      </div>

      {/* Winner info */}
      {hasWinner && (
        <div className="flex flex-col gap-2">
          <div className="text-sm font-bold">
            {isWinner ? (
              <span className="text-green-600">🏆 You are the champion!</span>
            ) : (
              <span>
                🏆 Winner:{" "}
                <span
                  className="font-bold px-2 py-0.5 rounded-md text-white text-xs"
                  style={{ backgroundColor: "var(--chart-1)" }}
                >
                  {formatAddress(winner)}
                </span>
              </span>
            )}
          </div>

          {winnerNetWorth && (
            <div className="text-xs text-muted-foreground">
              Final Net Worth:{" "}
              <span
                className="font-bold px-1.5 py-0.5 rounded text-white"
                style={{ backgroundColor: "var(--chart-2)" }}
              >
                ${winnerNetWorth.toString()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Game end reason */}
      <div className="text-xs text-muted-foreground">
        Reason:{" "}
        <span
          className="font-bold px-1.5 py-0.5 rounded text-white"
          style={{ backgroundColor: "var(--chart-3)" }}
        >
          {getReasonText(reason)}
        </span>
      </div>

      {/* Call to action */}
      <div className="text-xs font-medium text-center pt-1 border-t border-gray-200">
        {isWinner ? "🎊 Congratulations! 🎊" : "Thanks for playing! 🎮"}
      </div>
    </div>,
    {
      duration: Infinity, // Don't auto dismiss
      closeButton: true,
    }
  );
};
