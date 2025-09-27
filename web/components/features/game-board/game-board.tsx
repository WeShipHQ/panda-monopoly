"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  PropertySpace,
  ChanceSpace,
  CommunityChestSpace,
  RailroadSpace,
  UtilitySpace,
  TaxSpace,
} from "./board-spaces";
import {
  getBoardRowData,
  isChanceSpace,
  isCommunityChestSpace,
  isPropertySpace,
  isRailroadSpace,
  isTaxSpace,
  isUtilitySpace,
} from "@/lib/board-utils";

import { PlayerTokensContainer } from "./player-tokens";
import { DiceProvider } from "./dice";
import { CardDrawModal } from "./card-draw-modal";
import { useGameContext } from "@/components/providers/game-provider";
import { PlayerActions } from "./player-actions";
import { PropertyAccount } from "@/types/schema";
import { BoardSpace } from "@/configs/board-data";
import { EnhancedGameLogs } from "./game-logs";

interface MonopolyBoardProps {
  boardRotation: number;
  onRotateClockwise: () => void;
  onRotateCounterClockwise: () => void;
}

const GameBoard: React.FC<MonopolyBoardProps> = ({ boardRotation }) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const {
    gameState,
    players,
    properties,
    currentPlayerState,
    isCardDrawModalOpen,
    setIsCardDrawModalOpen,
    cardDrawType,
    setCardDrawType,
    // Actions
    endTurn,
    buyProperty,
    skipProperty,
    drawChanceCard,
    // Utilities
    getPropertyByPosition,
    isCurrentPlayerTurn,
  } = useGameContext();

  const handleBuyProperty = async (position: number) => {
    setIsLoading("buyProperty");
    try {
      await buyProperty(position);
    } catch (error) {
      console.error("Failed to buy property:", error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleSkipProperty = async (position: number) => {
    setIsLoading("skipProperty");
    try {
      await skipProperty(position);
    } catch (error) {
      console.error("Failed to skip property:", error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleEndTurn = async () => {
    setIsLoading("endTurn");
    try {
      await endTurn();
    } catch (error) {
      console.error("Failed to end turn:", error);
    } finally {
      setIsLoading(null);
    }
  };

  const renderSpace = (space: BoardSpace, properties: PropertyAccount[]) => {
    const position = space.position;
    const key = `${space.name}-${position}`;
    const onChainProperty = properties?.find(
      (property) => property.position === position
    );

    const baseProps = {
      // key,
      position,
      onChainProperty,
    };

    if (isPropertySpace(space)) {
      return <PropertySpace {...baseProps} {...space} key={key} />;
    } else if (isRailroadSpace(space)) {
      return <RailroadSpace {...baseProps} {...space} key={key} />;
    } else if (isUtilitySpace(space)) {
      return <UtilitySpace {...baseProps} {...space} key={key} />;
    } else if (isTaxSpace(space)) {
      return <TaxSpace {...baseProps} {...space} key={key} />;
    } else if (isChanceSpace(space)) {
      return <ChanceSpace {...baseProps} {...space} key={key} />;
    } else if (isCommunityChestSpace(space)) {
      return <CommunityChestSpace {...baseProps} {...space} key={key} />;
    }

    return null;
  };

  if (!gameState || !currentPlayerState) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            No game data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      className="h-full w-full monopoly-board overflow-hidden relative"
      style={{
        backgroundImage: 'url("/images/monopoly-bg.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="h-full w-full flex items-center justify-center p-2 sm:p-4">
        <div
          className="relative aspect-square bg-board-bg transition-transform duration-500 ease-in-out border-2
                     w-full h-full max-w-[min(100vh,100vw)] max-h-[min(100vh,100vw)]
                     lg:max-w-none lg:max-h-none lg:h-full lg:w-auto"
          style={{ transform: `rotate(${boardRotation}deg)` }}
        >
          <div className="absolute inset-0 grid grid-cols-14 grid-rows-14">
            {/* Player Tokens */}
            <PlayerTokensContainer
              players={players}
              boardRotation={boardRotation}
            />

            {/* Center - Responsive */}
            <div
              className="col-start-3 col-end-13 row-start-3 row-end-13 bg-[#c7e9b5] flex flex-col items-center justify-center 
                           p-1 sm:p-3 md:p-4 gap-1 sm:gap-3 md:gap-4"
            >
              <div className="flex-shrink-0 transform scale-[0.7] sm:scale-75 md:scale-90 lg:scale-100 mb-6">
                <DiceProvider>
                  <PlayerActions
                    handleEndTurn={handleEndTurn}
                    handleBuyProperty={handleBuyProperty}
                    handleSkipProperty={handleSkipProperty}
                    isLoading={isLoading}
                  />
                </DiceProvider>
              </div>

              {/* game-logs */}
              <EnhancedGameLogs
                filterTypes={[
                  "move",
                  "skip",
                  "purchase",
                  "rent",
                  "card",
                  "jail",
                  "building",
                  "trade",
                  "bankruptcy",
                  "game",
                ]}
              />
            </div>

            {/* Corner Spaces */}
            {/* GO Corner (bottom-right) */}
            <div className="col-start-13 col-end-15 row-start-13 row-end-15 text-center flex items-center justify-center border-t-2 border-l-2 border-black">
              <div className="corner-space -rotate-45 transform h-full flex flex-col justify-center items-center">
                <div className="px-1 text-[10px] font-bold">
                  COLLECT <br />
                  $200 SALARY
                  <br /> AS YOU PASS
                </div>
                <div className="icon-large text-[#f50c2b] font-bold text-4xl">
                  GO
                </div>
                <div className="absolute top-1 left-1 text-xs">→</div>
              </div>
            </div>

            {/* JAIL Corner (bottom-left) */}
            <div className="col-start-1 col-end-3 row-start-13 row-end-15 text-center flex items-center justify-center border-t-2 border-r-2 border-black">
              <div className="corner-space flex items-center justify-center h-full">
                <img
                  src="/images/JAIL.png"
                  alt="Jail"
                  className="w-full h-full object-contain p-1"
                />
              </div>
            </div>

            {/* FREE PARKING Corner (top-left) */}
            <div className="col-start-1 col-end-3 row-start-1 row-end-3 text-center flex items-center justify-center border-b-2 border-r-2 border-black">
              <div className="corner-space flex flex-col items-center justify-center h-full">
                <img
                  src="/images/FREEPARKING.png"
                  alt="Free Parking"
                  className="w-12 h-12 object-contain"
                />
                <div className="text-xs font-bold mt-1">FREE PARKING</div>
              </div>
            </div>

            {/* GO TO JAIL Corner (top-right) */}
            <div className="col-start-13 col-end-15 row-start-1 row-end-3 text-center flex items-center justify-center border-b-2 border-l-2 border-black">
              <div className="corner-space flex flex-col items-center justify-center h-full">
                <img
                  src="/images/GOTOJAIL.png"
                  alt="Go To Jail"
                  className="w-12 h-12 object-contain"
                />
                <div className="text-xs font-bold mt-1">GO TO JAIL</div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="col-start-3 col-end-13 row-start-13 row-end-15 grid grid-cols-9 grid-rows-1 ">
              {getBoardRowData().bottomRow.map((space) =>
                renderSpace(space, properties)
              )}
            </div>

            {/* Left Row */}
            <div className="col-start-1 col-end-3 row-start-3 row-end-13 grid grid-cols-1 grid-rows-9 ">
              {getBoardRowData().leftRow.map((space) =>
                renderSpace(space, properties)
              )}
            </div>

            {/* Top Row */}
            <div className="col-start-3 col-end-13 row-start-1 row-end-3 grid grid-cols-9 grid-rows-1 ">
              {getBoardRowData().topRow.map((space) =>
                renderSpace(space, properties)
              )}
            </div>

            {/* Right Row */}
            <div className="col-start-13 col-end-15 row-start-3 row-end-13 grid grid-cols-1 grid-rows-9 ">
              {getBoardRowData().rightRow.map((space) =>
                renderSpace(space, properties)
              )}
            </div>
          </div>
        </div>
      </div>

      {cardDrawType && (
        <CardDrawModal
          isOpen={isCardDrawModalOpen}
          cardType={cardDrawType}
          onClose={() => {
            setIsCardDrawModalOpen(false);
            setCardDrawType(null);
          }}
        />
      )}
    </div>
  );
};

export default GameBoard;
