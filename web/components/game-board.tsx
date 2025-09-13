"use client";

import React, { useState } from "react";
import {
  PropertySpace,
  ChanceSpace,
  CommunityChestSpace,
  RailroadSpace,
  BeachSpace,
  UtilitySpace,
  TaxSpace,
} from "@/components/board-spaces";
import { monopolyData } from "@/data/monopoly-data";
import { getPropertyData } from "@/data/unified-monopoly-data";
import { PlayerTokensContainer } from "@/components/player-tokens";
import { PropertyIndicatorsContainer } from "@/components/property-indicators";
import { PropertyDialog } from "@/components/property-dialog";
import { PropertyDetailsDialog } from "@/components/property-details-dialog";
import { PropertyBuildingDialog } from "@/components/property-building-dialog";
import { CardDrawModal } from "@/components/card-draw-modal";
import { useGameContext } from "@/components/game-provider";
import { generatePlayerConfig } from "@/lib/player-config";
import { isSome } from "@solana/kit";
import GameLog from "./game-log";

interface GameBoardProps {
  boardRotation?: number;
  className?: string;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  boardRotation = 0,
  className = "",
}) => {
  // Local UI state
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [buildingDialogOpen, setBuildingDialogOpen] = useState(false);
  const [buildingProperty, setBuildingProperty] = useState<number | null>(null);

  // Game context
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
    buyProperty,
    buildHouse,
    buildHotel,
    // Utilities
    getPropertyByPosition,
    getPlayerName,
  } = useGameContext();

  // Handle space interactions
  const handleSpaceClick = (position: number) => {
    const propertyData = getPropertyData(position);
    if (propertyData) {
      setSelectedProperty(position);
      setDetailsDialogOpen(true);
    }
  };

  const handleSpaceRightClick = (position: number) => {
    const propertyData = getPropertyData(position);
    const propertyAccount = getPropertyByPosition(position);

    // Check if it's a property owned by current player
    if (
      propertyData?.type === "property" &&
      propertyAccount?.owner &&
      isSome(propertyAccount.owner) &&
      propertyAccount.owner.value === currentPlayerState?.wallet
    ) {
      setBuildingProperty(position);
      setBuildingDialogOpen(true);
    } else {
      setSelectedProperty(position);
      setDetailsDialogOpen(true);
    }
  };

  // Render individual space
  const renderSpace = (space: any, index: number) => {
    const key = `${space.name}-${index}`;
    const position = space.position || index;

    const baseProps = {
      position,
      onRightClick: handleSpaceRightClick,
      onClick: handleSpaceClick,
    };

    switch (space.type) {
      case "property":
        return (
          <PropertySpace
            key={key}
            {...baseProps}
            name={space.name}
            price={space.price}
            colorClass={space.colorClass}
            rotate={space.rotate}
            longName={space.longName}
            threeLines={space.threeLines}
          />
        );

      case "railroad":
        return (
          <RailroadSpace
            key={key}
            {...baseProps}
            name={space.name}
            price={space.price}
            rotate={space.rotate}
            longName={space.longName}
          />
        );

      case "beach":
        return (
          <BeachSpace
            key={key}
            {...baseProps}
            name={space.name}
            price={space.price}
            rotate={space.rotate}
            longName={space.longName}
          />
        );

      case "utility":
        return (
          <UtilitySpace
            key={key}
            {...baseProps}
            name={space.name}
            price={space.price}
            type={space.name.includes("Electric") ? "electric" : "water"}
            rotate={space.rotate}
          />
        );

      case "tax":
        return (
          <TaxSpace
            key={key}
            {...baseProps}
            name={space.name}
            price={space.price}
            instructions={
              space.name.includes("Income") ? "Pay 10% or $200" : undefined
            }
            type={space.name.includes("Income") ? "income" : "luxury"}
            rotate={space.rotate}
          />
        );

      case "chance":
        return (
          <ChanceSpace
            key={key}
            {...baseProps}
            rotate={space.rotate}
            blueIcon={space.blueIcon}
          />
        );

      case "community-chest":
        return (
          <CommunityChestSpace key={key} {...baseProps} rotate={space.rotate} />
        );

      default:
        return null;
    }
  };

  // Handle property purchase
  const handleBuyProperty = async (position: number) => {
    try {
      await buyProperty(position);
      setIsPropertyDialogOpen(false);
    } catch (error) {
      console.error("Failed to buy property:", error);
    }
  };

  // Handle property skip
  const handleSkipProperty = () => {
    setIsPropertyDialogOpen(false);
  };

  // Handle building actions
  const handleBuildHouses = async () => {
    if (buildingProperty !== null) {
      try {
        await buildHouse(buildingProperty);
        setBuildingDialogOpen(false);
        setBuildingProperty(null);
      } catch (error) {
        console.error("Failed to build house:", error);
      }
    }
  };

  const handleBuildHotel = async () => {
    if (buildingProperty !== null) {
      try {
        await buildHotel(buildingProperty);
        setBuildingDialogOpen(false);
        setBuildingProperty(null);
      } catch (error) {
        console.error("Failed to build hotel:", error);
      }
    }
  };

  // Loading state
  if (gameLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#c7e9b5]">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">Loading Game...</div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (gameError || !gameState) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#c7e9b5]">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4 text-red-600">
            Error Loading Game
          </div>
          <div className="text-gray-600">
            {gameError?.message || "Failed to load game data"}
          </div>
        </div>
      </div>
    );
  }

  // Get pending property position for dialog
  const pendingPropertyPosition =
    currentPlayerState?.pendingPropertyPosition &&
    isSome(currentPlayerState.pendingPropertyPosition)
      ? currentPlayerState.pendingPropertyPosition.value
      : null;

  const pendingPropertyData =
    pendingPropertyPosition !== null
      ? getPropertyData(pendingPropertyPosition)
      : null;

  return (
    <div
      className={`h-screen w-full monopoly-board overflow-hidden ${className}`}
    >
      {/* Board Container */}
      <div className="h-full flex items-center justify-center p-4">
        <div
          className="relative aspect-square h-full max-h-screen w-auto bg-[#c7e9b5] border-2 border-black transition-transform duration-500 ease-in-out"
          style={{ transform: `rotate(${boardRotation}deg)` }}
        >
          <div className="absolute inset-0 grid grid-cols-14 grid-rows-14 gap-[0.1%] p-[0.1%]">
            {/* Player Tokens */}
            <PlayerTokensContainer boardRotation={boardRotation} />

            {/* Property Indicators */}
            {/* <PropertyIndicatorsContainer
              propertyOwnership={properties.reduce((acc, prop) => {
                if (prop.owner && isSome(prop.owner)) {
                  const playerIndex = players.findIndex(
                    (p) => p.wallet === prop.owner!.value
                  );
                  if (playerIndex !== -1) {
                    acc[prop.position] = playerIndex;
                  }
                }
                return acc;
              }, {} as Record<number, number>)}
              properties={properties}
              players={players.map((player, index) => ({
                id: player.wallet.toString(),
                name: getPlayerName(player.wallet),
                color: generatePlayerConfig(player.wallet, index).color,
              }))}
              propertyBuildings={properties.reduce((acc, prop) => {
                acc[prop.position] = {
                  houses: prop.houses || 0,
                  hasHotel: prop.hasHotel || false,
                  hasFlag: false, // Add this field as required by the interface
                };
                return acc;
              }, {} as Record<number, { houses: number; hasHotel: boolean; hasFlag: boolean }>)}
              mortgagedProperties={properties
                .filter((prop) => prop.isMortgaged)
                .map((prop) => prop.position)}
            /> */}

            {/* Center Logo */}
            <div className="col-start-3 col-end-13 row-start-3 row-end-13 bg-[#c7e9b5] flex items-center justify-center relative">
              <h1 className="center-title text-black font-bold text-4xl">
                MONOPOLY
              </h1>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 border-2 border-black transform rotate-45 bg-white opacity-20"></div>
              </div>
            </div>

            <GameLog
              className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2"
              maxHeight="300px"
            />

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

            {/* Board Rows */}
            {/* Bottom Row */}
            <div className="col-start-3 col-end-13 row-start-13 row-end-15 grid grid-cols-9 grid-rows-1 gap-[0.1%]">
              {monopolyData.bottomRow.map((space, index) =>
                renderSpace(space, index)
              )}
            </div>

            {/* Left Row */}
            <div className="col-start-1 col-end-3 row-start-3 row-end-13 grid grid-cols-1 grid-rows-9 gap-[0.1%]">
              {monopolyData.leftRow.map((space, index) =>
                renderSpace(space, index)
              )}
            </div>

            {/* Top Row */}
            <div className="col-start-3 col-end-13 row-start-1 row-end-3 grid grid-cols-9 grid-rows-1 gap-[0.1%]">
              {monopolyData.topRow.map((space, index) =>
                renderSpace(space, index)
              )}
            </div>

            {/* Right Row */}
            <div className="col-start-13 col-end-15 row-start-3 row-end-13 grid grid-cols-1 grid-rows-9 gap-[0.1%]">
              {monopolyData.rightRow.map((space, index) =>
                renderSpace(space, index)
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs and Modals */}

      {/* Property Purchase Dialog */}
      {pendingPropertyPosition !== null && (
        <PropertyDialog
          isOpen={isPropertyDialogOpen}
          onClose={() => setIsPropertyDialogOpen(false)}
          propertyName={pendingPropertyData?.name || "Unknown Property"}
          propertyPrice={pendingPropertyData?.price || 0}
          playerMoney={Number(currentPlayerState?.cashBalance) || 0}
          position={pendingPropertyPosition}
          onSkip={handleSkipProperty}
          onBuyWithBuilding={handleBuyProperty}
          isLoading={false}
        />
      )}

      {/* Card Draw Modal */}
      <CardDrawModal
        isOpen={isCardDrawModalOpen}
        cardType={cardDrawType || "chance"}
        onClose={() => {
          setIsCardDrawModalOpen(false);
          setCardDrawType(null);
        }}
      />

      {/* Property Details Dialog */}
      {/* <PropertyDetailsDialog
        isOpen={detailsDialogOpen}
        position={selectedProperty || 0}
        onClose={() => {
          setDetailsDialogOpen(false);
          setSelectedProperty(null);
        }}
      /> */}

      {/* Property Building Dialog */}
      {/* <PropertyBuildingDialog
        isOpen={buildingDialogOpen}
        position={buildingProperty || 0}
        playerMoney={Number(currentPlayerState?.cashBalance) || 0}
        currentHouses={
          buildingProperty !== null
            ? getPropertyByPosition(buildingProperty)?.houses || 0
            : 0
        }
        hasHotel={
          buildingProperty !== null
            ? getPropertyByPosition(buildingProperty)?.hasHotel || false
            : false
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
