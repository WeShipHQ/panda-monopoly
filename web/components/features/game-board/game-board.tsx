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
import {
  FreeParkingCorner,
  GoCorner,
  GoToJailCorner,
  JailCorner,
} from "./corner-spaces";
import { useWallet } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";
import { RotateCw, RotateCcw } from "lucide-react";
import { GameLogs } from "./game-logs";

interface MonopolyBoardProps {}

const GameBoard: React.FC<MonopolyBoardProps> = () => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [boardRotation, setBoardRotation] = useState<number>(0);

  const { wallet } = useWallet();

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
    startGame,
    joinGame,
    endTurn,
    buyProperty,
    skipProperty,
    payMevTax,
    payPriorityFeeTax,
    payJailFine,
    useGetOutOfJailCard,
    endGame,
  } = useGameContext();

  // console.log("currentPlayerState", currentPlayerState);
  // console.log("properties", properties);

  const handleStartGame = async (_gameAddress: string) => {
    try {
      setIsLoading("startGame");
      await startGame();
    } catch (error) {
      console.error("Failed to start game:", error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleJoinGame = async (_gameAddress: string) => {
    try {
      setIsLoading("joinGame");
      await joinGame();
    } catch (error) {
      console.error("Failed to join game:", error);
    } finally {
      setIsLoading(null);
    }
  };

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

  const handlePayMevTax = async () => {
    setIsLoading("tax");
    try {
      await payMevTax();
    } catch (error) {
      console.error("Failed to pay MEV tax:", error);
    } finally {
      setIsLoading(null);
    }
  };

  const handlePayPriorityFeeTax = async () => {
    setIsLoading("tax");
    try {
      await payPriorityFeeTax();
    } catch (error) {
      console.error("Failed to pay priority fee tax:", error);
    } finally {
      setIsLoading(null);
    }
  };

  const handlePayJailFine = async () => {
    setIsLoading("payJailFine");
    try {
      await payJailFine();
    } catch (error) {
      console.error("Failed to pay jail fine:", error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleGetOutOfJailCard = async () => {
    setIsLoading("getOutOfJailCard");
    try {
      await useGetOutOfJailCard();
    } catch (error) {
      console.error("Failed to get out of jail card:", error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleRotateClockwise = () => {
    setBoardRotation((prev) => (prev + 90) % 360);
  };

  const handleRotateCounterClockwise = () => {
    setBoardRotation((prev) => (prev - 90 + 360) % 360);
  };

  const handleEndGame = async () => {
    setIsLoading("endGame");
    try {
      await endGame();
    } catch (error) {
      console.error("Failed to end game:", error);
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
    <div className="h-full w-full monopoly-board overflow-hidden relative">
      {/* Rotation Controls */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <Button
          variant="neutral"
          size="icon"
          onClick={handleRotateCounterClockwise}
          className="bg-white/90 hover:bg-white shadow-lg"
          title="Xoay trái"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          variant="neutral"
          size="icon"
          onClick={handleRotateClockwise}
          className="bg-white/90 hover:bg-white shadow-lg"
          title="Xoay phải"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>

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
              currentPlayer={currentPlayerState.wallet}
            />

            {/* Center - Responsive */}
            <div
              className="col-start-3 col-end-13 row-start-3 row-end-13 bg-[#c7e9b5] flex flex-col items-center justify-center 
                           p-1 sm:p-3 md:p-4 gap-1 sm:gap-3 md:gap-4"
              style={{
                transform: `rotate(${-boardRotation}deg)`,
              }}
            >
              <div className="flex-1 flex flex-col justify-end items-center">
                {wallet && wallet?.delegated ? (
                  <DiceProvider>
                    <PlayerActions
                      handleStartGame={handleStartGame}
                      handleJoinGame={handleJoinGame}
                      handleEndTurn={handleEndTurn}
                      handleBuyProperty={handleBuyProperty}
                      handleSkipProperty={handleSkipProperty}
                      handlePayMevTax={handlePayMevTax}
                      handlePayPriorityFeeTax={handlePayPriorityFeeTax}
                      handlePayJailFine={handlePayJailFine}
                      handleGetOutOfJailCard={handleGetOutOfJailCard}
                      handleEndGame={handleEndGame}
                      isLoading={isLoading}
                      wallet={wallet}
                    />
                  </DiceProvider>
                ) : (
                  <>
                    <Button>Connect Wallet</Button>
                  </>
                )}
              </div>

              {/* game-logs */}
              <div className="flex-1">
                <GameLogs />
              </div>
            </div>

            <GoCorner boardRotation={boardRotation} />

            <JailCorner boardRotation={boardRotation} />

            <FreeParkingCorner boardRotation={boardRotation} />

            <GoToJailCorner boardRotation={boardRotation} />

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
