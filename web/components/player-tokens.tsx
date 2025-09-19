"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useGameContext } from "./game-provider";
import { Address } from "@solana/kit";
import {
  generatePlayerConfig,
  getPlayerDisplayName,
} from "@/lib/player-config";

export interface PlayerTokenData {
  address: Address;
  position: number;
  inJail: boolean;
  jailTurns: number;
}

interface PlayerTokenProps {
  player: PlayerTokenData;
  playerIndex: number;
  boardRotation: number;
  playersOnSameSpace: PlayerTokenData[];
}

export const PlayerToken: React.FC<PlayerTokenProps> = ({
  player,
  playerIndex,
  boardRotation,
  playersOnSameSpace,
}) => {
  const { currentPlayerAddress } = useGameContext();

  // Generate consistent player config
  const playerConfig = generatePlayerConfig(player.address, playerIndex);
  const isCurrentPlayer = player.address === currentPlayerAddress;

  // Position token based on board position (40 spaces total)
  const getTokenPosition = (pos: number) => {
    // 14x14 grid with 2x2 corner spaces and 2x2 side spaces
    const cellSize = 7.14;
    const cornerCenter = 10.71;
    const sideSpaceCenter = 17.86;

    if (pos === 0) {
      // GO corner (bottom-right)
      return { left: `${100 - cornerCenter}%`, top: `${100 - cornerCenter}%` };
    } else if (pos >= 1 && pos <= 9) {
      // Bottom row (right to left from GO)
      const spaceIndex = pos - 1;
      const left = 100 - sideSpaceCenter - spaceIndex * ((cellSize * 10) / 9);
      return { left: `${left}%`, top: `${100 - cornerCenter}%` };
    } else if (pos === 10) {
      // JAIL corner (bottom-left)
      return { left: `${cornerCenter}%`, top: `${100 - cornerCenter}%` };
    } else if (pos >= 11 && pos <= 19) {
      // Left column (bottom to top)
      const spaceIndex = pos - 11;
      const top = 100 - sideSpaceCenter - spaceIndex * ((cellSize * 10) / 9);
      return { left: `${cornerCenter}%`, top: `${top}%` };
    } else if (pos === 20) {
      // Free Parking corner (top-left)
      return { left: `${cornerCenter}%`, top: `${cornerCenter}%` };
    } else if (pos >= 21 && pos <= 29) {
      // Top row (left to right)
      const spaceIndex = pos - 21;
      const left = sideSpaceCenter + spaceIndex * ((cellSize * 10) / 9);
      return { left: `${left}%`, top: `${cornerCenter}%` };
    } else if (pos === 30) {
      // Go To Jail corner (top-right)
      return { left: `${100 - cornerCenter}%`, top: `${cornerCenter}%` };
    } else if (pos >= 31 && pos <= 39) {
      // Right column (top to bottom)
      const spaceIndex = pos - 31;
      const top = sideSpaceCenter + spaceIndex * ((cellSize * 10) / 9);
      return { left: `${100 - cornerCenter}%`, top: `${top}%` };
    } else {
      return { left: "50%", top: "50%" };
    }
  };

  const baseTokenPos = getTokenPosition(player.position);

  // Handle multiple players on same space
  const getAdjustedPosition = () => {
    if (playersOnSameSpace.length <= 1) {
      return baseTokenPos;
    }

    const tokenIndex = playersOnSameSpace.findIndex(
      (p) => p.address === player.address
    );
    const offsetDistance = 1.5;

    let adjustedLeft = parseFloat(baseTokenPos.left);
    let adjustedTop = parseFloat(baseTokenPos.top);

    if (playersOnSameSpace.length === 2) {
      const offset = tokenIndex === 0 ? -offsetDistance : offsetDistance;
      adjustedLeft += offset;
    } else if (playersOnSameSpace.length === 3) {
      const offsets = [
        { x: -offsetDistance, y: -offsetDistance },
        { x: offsetDistance, y: -offsetDistance },
        { x: 0, y: offsetDistance },
      ];
      adjustedLeft += offsets[tokenIndex].x;
      adjustedTop += offsets[tokenIndex].y;
    } else if (playersOnSameSpace.length === 4) {
      const offsets = [
        { x: -offsetDistance, y: -offsetDistance },
        { x: offsetDistance, y: -offsetDistance },
        { x: -offsetDistance, y: offsetDistance },
        { x: offsetDistance, y: offsetDistance },
      ];
      adjustedLeft += offsets[tokenIndex].x;
      adjustedTop += offsets[tokenIndex].y;
    }

    return { left: `${adjustedLeft}%`, top: `${adjustedTop}%` };
  };

  const tokenPos = getAdjustedPosition();

  return (
    <div
      className={cn(
        "absolute w-8 h-8 border-4 transition-all duration-300 ease-in-out flex items-center justify-center rounded-full shadow-lg",
        {
          "border-red-500 ring-2 ring-yellow-300 ring-opacity-50":
            isCurrentPlayer,
          "border-none": !isCurrentPlayer,
          "opacity-60": player.inJail,
        }
      )}
      style={{
        left: tokenPos.left,
        top: tokenPos.top,
        transform: `translate(-50%, -50%) rotate(${-boardRotation}deg)`,
        zIndex: 1000 + playerIndex,
        backgroundColor: playerConfig.color,
      }}
      title={`${getPlayerDisplayName(player.address)}${
        player.inJail ? " (In Jail)" : ""
      }`}
    >
      <div
        className="text-lg font-bold text-white drop-shadow-md"
        style={{
          textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
        }}
      >
        {playerConfig.avatar}
      </div>

      {/* Jail indicator */}
      {player.inJail && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white text-xs flex items-center justify-center">
          <span className="text-white text-[8px] font-bold">J</span>
        </div>
      )}

      {/* Current player indicator */}
      {isCurrentPlayer && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

interface PlayerTokensContainerProps {
  boardRotation: number;
}

export const PlayerTokensContainer: React.FC<PlayerTokensContainerProps> = ({
  boardRotation,
}) => {
  const { players, gameState } = useGameContext();

  if (!gameState || !players.length) {
    return null;
  }

  // Convert PlayerAccount to PlayerTokenData
  const playerTokens: PlayerTokenData[] = players.map((player) => ({
    address: player.wallet,
    position: player.position || 0,
    inJail: player.inJail || false,
    jailTurns: player.jailTurns || 0,
  }));

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1000 }}
    >
      {playerTokens.map((player, index) => {
        const playersOnSameSpace = playerTokens.filter(
          (p) => p.position === player.position
        );

        return (
          <PlayerToken
            key={player.address}
            player={player}
            playerIndex={index}
            boardRotation={boardRotation}
            playersOnSameSpace={playersOnSameSpace}
          />
        );
      })}
    </div>
  );
};

// Export the player config functions for use in other components
export { generatePlayerConfig, getPlayerDisplayName };
