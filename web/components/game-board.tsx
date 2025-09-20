"use client";

import React, { useMemo, useState } from "react";
import {
  PropertySpace,
  ChanceSpace,
  CommunityChestSpace,
  RailroadSpace,
  BeachSpace,
  UtilitySpace,
  TaxSpace,
} from "@/components/board-spaces";
import { monopolyData, PropertyData, boardSpaces } from "@/data/monopoly-data";
import {
  getLegacyPropertyData,
  getPropertyData,
  unifiedPropertyData,
} from "@/data/unified-monopoly-data";
import { PlayerTokensContainer } from "@/components/player-tokens";
import { Dice } from "@/components/dice";
import {
  PropertyDialog,
  SpecialCardDialog,
  JailDialog,
} from "@/components/property-dialog";
import { CardDrawModal } from "@/components/card-draw-modal";
import { PropertyIndicatorsContainer } from "@/components/property-indicators";
import { MessageDisplay } from "@/components/message-display";
import { PropertyDetailsDialog } from "@/components/property-details-dialog";
import { PropertyBuildingDialog } from "@/components/property-building-dialog";
import { useGameContext } from "./game-provider";
import { Card, CardContent } from "./ui/card";
import {
  BankruptcyAction,
  PlayerInJailAlert,
  PropertyActions,
} from "./player-actions";
import { isSome } from "@solana/kit";
import { Button } from "./ui/button";
import { PropertyAccount } from "@/types/schema";

interface MonopolyBoardProps {
  boardRotation: number;
  onRotateClockwise: () => void;
  onRotateCounterClockwise: () => void;
}

const GameBoard: React.FC<MonopolyBoardProps> = ({
  boardRotation,
  onRotateClockwise,
  onRotateCounterClockwise,
  //   gameManager,
}) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const {
    gameState,
    players,
    properties,
    currentPlayerState,
    gameLoading,
    gameError,
    // UI state from provider
    selectedProperty,
    setSelectedProperty,
    isPropertyDialogOpen,
    setIsPropertyDialogOpen,
    isCardDrawModalOpen,
    setIsCardDrawModalOpen,
    cardDrawType,
    setCardDrawType,
    // Actions
    endTurn,
    buyProperty,
    skipProperty,
    drawChanceCard,
    drawCommunityChestCard,
    buildHouse,
    buildHotel,
    // Utilities
    getPropertyByPosition,
    getPlayerName,
    isCurrentPlayerTurn,
  } = useGameContext();

  console.log("current xxx", currentPlayerState);

  const isMyTurn = isCurrentPlayerTurn();

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

  const handleDrawChanceCard = async () => {
    setIsLoading("chanceCard");
    try {
      await drawChanceCard();
    } catch (error) {
      console.error("Failed to draw chance card:", error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleEndTurn = async () => {
    // if (!currentPlayerState?.canEndTurn) return;

    setIsLoading("endTurn");
    try {
      await endTurn();
    } catch (error) {
      console.error("Failed to end turn:", error);
    } finally {
      setIsLoading(null);
    }
  };

  const renderSpace = (
    space: PropertyData,
    properties: PropertyAccount[],
    index: number
  ) => {
    const key = `${space.name}-${index}`;
    const position = boardSpaces.findIndex((s) => s.name === space.name);
    const property = getPropertyByPosition(position);
    const onChainProperty = properties?.find(
      (property) => property.position === position
    );
    const playerName =
      property?.owner && property.owner.__option === "Some"
        ? getPlayerName(property.owner.value)
        : undefined;

    if (space.type === "property") {
      return (
        <PropertySpace
          key={key}
          name={space.name}
          price={space.price}
          colorClass={space.colorClass}
          rotate={space.rotate}
          longName={space.longName}
          threeLines={space.threeLines}
          position={position}
          property={property}
          onChainProperty={onChainProperty}
          playerName={playerName}
        />
      );
    } else if (space.type === "railroad") {
      return (
        <RailroadSpace
          key={key}
          name={space.name}
          price={space.price}
          rotate={space.rotate}
          longName={space.longName}
          position={position}
          property={property}
          onChainProperty={onChainProperty}
          playerName={playerName}
        />
      );
    } else if (space.type === "beach") {
      return (
        <BeachSpace
          key={key}
          name={space.name}
          price={space.price}
          rotate={space.rotate}
          longName={space.longName}
          position={position}
          // onClick={handleSpaceClick}
          property={property}
          playerName={playerName}
        />
      );
    } else if (space.type === "utility") {
      return (
        <UtilitySpace
          key={key}
          name={space.name}
          price={space.price}
          type={space.name.includes("Electric") ? "electric" : "water"}
          rotate={space.rotate}
          position={position}
          // onClick={handleSpaceClick}
          property={property}
          playerName={playerName}
        />
      );
    } else if (space.type === "tax") {
      return (
        <TaxSpace
          key={key}
          name={space.name}
          price={space.price}
          instructions={
            space.name.includes("Income") ? "Pay 10% or $200" : undefined
          }
          type={space.name.includes("Income") ? "income" : "luxury"}
          rotate={space.rotate}
          position={position}
          // onClick={handleSpaceClick}
          property={property}
          playerName={playerName}
        />
      );
    } else if (space.type === "chance") {
      return (
        <ChanceSpace
          key={key}
          rotate={space.rotate}
          blueIcon={space.blueIcon}
          position={position}
          // onClick={handleSpaceClick}
          property={property}
          playerName={playerName}
        />
      );
    } else if (space.type === "community-chest") {
      return (
        <CommunityChestSpace
          key={key}
          rotate={space.rotate}
          position={position}
          // onClick={handleSpaceClick}
          property={property}
          playerName={playerName}
        />
      );
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

  const hasPendingActions =
    currentPlayerState.needsPropertyAction ||
    currentPlayerState.needsChanceCard ||
    currentPlayerState.needsCommunityChestCard ||
    currentPlayerState.needsBankruptcyCheck ||
    currentPlayerState.needsSpecialSpaceAction;

  return (
    <div
      className="h-full w-full monopoly-board overflow-hidden relative"
      style={{
        backgroundImage: 'url("/images/monopoly-bg.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Message Display */}
      {/* <MessageDisplay message={gameState.currentMessage} /> */}

      {/* Board Container */}
      <div className="h-full w-full flex items-center justify-center p-2 sm:p-4">
        <div
          className="relative aspect-square bg-[#c7e9b5] border-2 border-black transition-transform duration-500 ease-in-out
                     w-full h-full max-w-[min(100vh,100vw)] max-h-[min(100vh,100vw)]
                     lg:max-w-none lg:max-h-none lg:h-full lg:w-auto"
          style={{ transform: `rotate(${boardRotation}deg)` }}
        >
          <div className="absolute inset-0 grid grid-cols-14 grid-rows-14 gap-[0.1%] p-[0.1%]">
            {/* Player Tokens */}
            <PlayerTokensContainer
              players={players}
              boardRotation={boardRotation}
            />

            {/* Property Indicators */}
            {/* <PropertyIndicatorsContainer
              propertyOwnership={gameState.propertyOwnership}
              players={gameState.players}
              propertyBuildings={gameState.propertyBuildings}
              mortgagedProperties={gameState.mortgagedProperties}
            /> */}

            {/* Center - Responsive */}
            <div
              className="col-start-3 col-end-13 row-start-3 row-end-13 bg-[#c7e9b5] flex flex-col items-center justify-center 
                           p-1 sm:p-3 md:p-4 gap-1 sm:gap-3 md:gap-4"
            >
              {/* Dice Section - Responsive */}
              <div className="flex-shrink-0 transform scale-[0.7] sm:scale-75 md:scale-90 lg:scale-100">
                <Dice />
                {currentPlayerState.inJail && (
                  <PlayerInJailAlert
                    player={currentPlayerState}
                    handleEndTurn={handleEndTurn}
                  />
                )}
                {currentPlayerState.needsBankruptcyCheck && (
                  <BankruptcyAction player={currentPlayerState} />
                )}
              </div>

              {/* Property Actions */}
              {isMyTurn &&
                currentPlayerState.needsPropertyAction &&
                isSome(currentPlayerState.pendingPropertyPosition) && (
                  <PropertyActions
                    player={currentPlayerState}
                    position={currentPlayerState.pendingPropertyPosition.value}
                    isLoading={isLoading}
                    handleBuyProperty={handleBuyProperty}
                    handleSkipProperty={handleSkipProperty}
                  />
                )}

              {isMyTurn && currentPlayerState.needsChanceCard && (
                <Button
                  size="sm"
                  onClick={handleDrawChanceCard}
                  disabled={isLoading === "chanceCard"}
                >
                  {isLoading === "chanceCard"
                    ? "Drawing..."
                    : "Draw Chance Card"}
                </Button>
              )}

              {isMyTurn && currentPlayerState.needsCommunityChestCard && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg space-y-2">
                  <div className="text-sm font-medium text-purple-800">
                    Draw Community Chest Card
                  </div>
                  <div className="text-xs text-purple-600">
                    You landed on a Community Chest space
                  </div>
                  <Button
                    size="sm"
                    // onClick={() => handleOpenCardModal("community-chest")}
                    disabled={isLoading === "communityChestCard"}
                    className="w-full"
                    variant="outline"
                  >
                    {isLoading === "communityChestCard"
                      ? "Drawing..."
                      : "Draw Community Chest Card"}
                  </Button>
                </div>
              )}

              {!hasPendingActions && currentPlayerState.hasRolledDice && (
                <Button
                  onClick={handleEndTurn}
                  disabled={isLoading === "endTurn"}
                >
                  {isLoading === "endTurn" ? "Ending Turn..." : "End Turn"}
                </Button>
              )}

              {/* game-logs */}
            </div>

            {/* Corner Spaces */}
            {/* GO Corner (bottom-right) */}
            <div className="col-start-13 col-end-15 row-start-13 row-end-15 bg-[#fafaf8] text-center border border-black">
              <div className="corner-space transform h-full flex flex-col justify-center items-center">
                <div className="px-1 text-xs font-bold">
                  COLLECT $200.00 SALARY AS YOU PASS
                </div>
                <div className="icon-large text-[#f50c2b] font-bold text-4xl">
                  GO
                </div>
                <div className="absolute top-1 left-1 text-xs">→</div>
              </div>
            </div>

            {/* JAIL Corner (bottom-left) */}
            <div className="col-start-1 col-end-3 row-start-13 row-end-15 bg-[#fafaf8] text-center flex items-center justify-center border border-black">
              <div className="corner-space flex items-center justify-center h-full">
                <img
                  src="/images/JAIL.png"
                  alt="Jail"
                  className="w-full h-full object-contain p-1"
                />
              </div>
            </div>

            {/* FREE PARKING Corner (top-left) */}
            <div className="col-start-1 col-end-3 row-start-1 row-end-3 bg-[#fafaf8] text-center flex items-center justify-center border border-black">
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
            <div className="col-start-13 col-end-15 row-start-1 row-end-3 bg-[#fafaf8] text-center flex items-center justify-center border border-black">
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
            <div className="col-start-3 col-end-13 row-start-13 row-end-15 grid grid-cols-9 grid-rows-1 gap-[0.1%]">
              {monopolyData.bottomRow.map((space, index) =>
                renderSpace(space, properties, index)
              )}
            </div>

            {/* Left Row */}
            <div className="col-start-1 col-end-3 row-start-3 row-end-13 grid grid-cols-1 grid-rows-9 gap-[0.1%]">
              {monopolyData.leftRow.map((space, index) =>
                renderSpace(space, properties, index)
              )}
            </div>

            {/* Top Row */}
            <div className="col-start-3 col-end-13 row-start-1 row-end-3 grid grid-cols-9 grid-rows-1 gap-[0.1%]">
              {monopolyData.topRow.map((space, index) =>
                renderSpace(space, properties, index)
              )}
            </div>

            {/* Right Row */}
            <div className="col-start-13 col-end-15 row-start-3 row-end-13 grid grid-cols-1 grid-rows-9 gap-[0.1%]">
              {monopolyData.rightRow.map((space, index) =>
                renderSpace(space, properties, index)
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

      {/* Property Dialog */}
      {/* <PropertyDialog
        isOpen={
          currentDialogVisible &&
          gameState.gamePhase === "property-action" &&
          gameState.currentAction?.type === "buy-property"
        }
        propertyName={
          gameState.currentAction?.data?.position
            ? boardSpaces[gameState.currentAction.data.position]?.name ||
              "Unknown Property"
            : "Unknown Property"
        }
        propertyPrice={gameState.currentAction?.data?.price || 0}
        playerMoney={currentPlayer.money}
        position={gameState.currentAction?.data?.position || 0}
        onBuy={() => {
          if (gameState.currentAction?.data?.position) {
            buyProperty(gameState.currentAction.data.position);
          }
        }}
        onSkip={skipProperty}
        onBuyWithBuilding={(buildingLevel) => {
          if (gameState.currentAction?.data?.position) {
            const position = gameState.currentAction.data.position;
            if (buildingLevel === "house1") {
              // Buy property with flag cost and immediately build 1 house
              buyPropertyWithFlag(position, "house1");
              setTimeout(() => {
                buildHouses(currentPlayer.id, position, 1);
              }, 100);
            } else {
              // Buy property with flag cost only
              buyPropertyWithFlag(position, "flag");
            }
          }
        }}
      /> */}

      {/* Card Draw Modal */}
      {/* <CardDrawModal
        isOpen={gameState.cardDrawModal?.isOpen || false}
        cardType={gameState.cardDrawModal?.cardType || "chance"}
        onCardDrawn={handleCardDrawn}
      /> */}

      {/* Jail Dialog */}
      {/* <JailDialog
        isOpen={currentPlayer.inJail && gameState.gamePhase === "waiting"}
        playerName={currentPlayer.name}
        playerMoney={currentPlayer.money}
        jailTurns={currentPlayer.jailTurns}
        hasJailFreeCard={
          (drawnCards.playerJailCards[currentPlayer.id] || 0) > 0
        }
        onPayFine={payJailFine}
        onUseCard={useJailFreeCard}
        onRollDice={() => {
          // The dice component will handle the roll and call handleDiceRoll
          setCurrentDialogVisible(false);
        }}
      /> */}

      {/* Property Details Dialog */}
      {/* <PropertyDetailsDialog
        isOpen={detailsDialogOpen}
        position={selectedSpace || 0}
        onClose={() => setDetailsDialogOpen(false)}
      /> */}

      {/* Property Building Dialog */}
      {/* <PropertyBuildingDialog
        isOpen={buildingDialogOpen}
        position={buildingProperty || 0}
        playerMoney={currentPlayer.money}
        currentHouses={
          gameState.propertyBuildings?.[buildingProperty || 0]?.houses || 0
        }
        hasHotel={
          gameState.propertyBuildings?.[buildingProperty || 0]?.hasHotel ||
          false
        }
        onBuildHouses={handleBuildHouses}
        onBuildHotel={handleBuildHotel}
        onClose={() => {
          setBuildingDialogOpen(false);
          setBuildingProperty(null);
        }}
      /> */}
    </div>
  );
};

export default GameBoard;
