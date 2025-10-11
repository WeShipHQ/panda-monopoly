import React from "react";
import { toast } from "sonner";
import { formatAddress } from "./utils";
import { surpriseCards, treasureCards } from "@/configs/board-data";

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
  taxType,
  amount,
  position,
}: TaxPaidToastProps) => {
  const taxTypeName =
    taxType === 1 ? "MEV Tax" : taxType === 2 ? "Priority Fee Tax" : "Tax";

  toast.warning(
    <div className="flex flex-col">
      <div className="text-sm">
        You paid{" "}
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
  playerIndex,
  totalPlayers,
}: PlayerJoinedToastProps) => {
  toast.info(
    <div className="flex flex-col">
      <div className="text-sm">
        🎮 New player joined the game!{" "}
        <span
          className="font-bold px-2 py-0.5 rounded-md text-white"
          style={{ backgroundColor: "var(--chart-2)" }}
        >
          {formatAddress(playerAddress)}
        </span>
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
        {isCurrentPlayer ? "Better luck next time!" : "Ouch! That's gotta hurt."}
      </div>
    </div>
  );
};
