"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { createSolanaRpc, isSome } from "@solana/kit";
import { sdk } from "@/lib/sdk/sdk";
import { buildAndSendTransaction } from "@/lib/tx";
import { GameStatus } from "@/lib/sdk/generated";

interface MonopolyBoardProps {
  boardRotation: number;
  onRotateClockwise: () => void;
  onRotateCounterClockwise: () => void;
  gameManager: ReturnType<typeof import("@/hooks").useGameManager>;
}

const MonopolyBoard: React.FC<MonopolyBoardProps> = ({
  boardRotation,
  onRotateClockwise,
  onRotateCounterClockwise,
  gameManager,
}) => {
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<number | null>(null);
  const [buildingDialogOpen, setBuildingDialogOpen] = useState(false);
  const [buildingProperty, setBuildingProperty] = useState<number | null>(null);
  const [_buyingProperty, setBuyingProperty] = useState(false);
  const [_skipProperty, setSkipProperty] = useState(false);

  const [isTransactionLoading, setIsTransactionLoading] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);

  const {
    gameAddress,
    currentPlayerState,
    currentPlayerSigner,
    gameState,
    gameLoading,
    gameError,
    players,
    properties,
    // ui
    isPropertyOpen,
    setIsPropertyOpen,
  } = useGameContext();

  const pendingPropertyPosition =
    currentPlayerState?.pendingPropertyPosition &&
    isSome(currentPlayerState.pendingPropertyPosition)
      ? currentPlayerState.pendingPropertyPosition.value
      : -1;

  // const { handleCardDrawn } = gameManager;

  const handleSpaceClick = (position: number) => {
    const property = getPropertyData(position);
    // const isOwned = gameState.propertyOwnership[position] === currentPlayer.id;
    // const canBuild = canBuildOnProperty(currentPlayer.id, position);

    // If it's a property owned by current player and they can build, show building dialog
    if (property?.type === "property") {
      setBuildingProperty(position);
      setBuildingDialogOpen(true);
    } else {
      // Otherwise show property details
      setSelectedSpace(position);
      setDetailsDialogOpen(true);
    }
    // const property = getPropertyData(position);
    // // Use blockchain data instead of gameState from gameManager
    // const isOwned =
    //   gameState.propertyOwnership?.[position] === currentPlayer.id;
    // // Placeholder for building check - will be implemented later
    // const canBuild = false; // canBuildOnProperty(currentPlayer.id, position);

    // if (property?.type === "property" && isOwned && canBuild) {
    //   setBuildingProperty(position);
    //   setBuildingDialogOpen(true);
    // } else {
    //   setSelectedSpace(position);
    //   setDetailsDialogOpen(true);
    // }
  };

  const renderSpace = (space: PropertyData, index: number) => {
    const key = `${space.name}-${index}`;
    const position = boardSpaces.findIndex((s) => s.name === space.name);

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
          onClick={handleSpaceClick}
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
          onClick={handleSpaceClick}
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
          onClick={handleSpaceClick}
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
          onClick={handleSpaceClick}
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
          onClick={handleSpaceClick}
        />
      );
    } else if (space.type === "chance") {
      return (
        <ChanceSpace
          key={key}
          rotate={space.rotate}
          blueIcon={space.blueIcon}
          position={position}
          onClick={handleSpaceClick}
        />
      );
    } else if (space.type === "community-chest") {
      return (
        <CommunityChestSpace
          key={key}
          rotate={space.rotate}
          position={position}
          onClick={handleSpaceClick}
        />
      );
    }

    return null;
  };

  const handleBuyProperty = async (
    position: number,
    buildingLevel: "flag" | "house" | "hotel"
  ) => {
    console.log("Buy property with building level", position, buildingLevel);
    if (buildingLevel === "flag") {
      try {
        if (!gameAddress || !currentPlayerSigner) {
          return;
        }

        setBuyingProperty(true);
        const rpc = createSolanaRpc("http://127.0.0.1:8899");

        console.log("end turn", gameAddress.toString());

        const instruction = await sdk.buyPropertyIx({
          rpc,
          gameAddress: gameAddress,
          player: currentPlayerSigner,
          position,
        });

        const signature = await buildAndSendTransaction(
          rpc,
          [instruction],
          currentPlayerSigner
        );

        console.log("Buy property with building", signature);
      } catch (error) {
        console.error(error);
      } finally {
        setBuyingProperty(false);
      }
    } else if (buildingLevel === "house") {
      try {
        if (!gameAddress || !currentPlayerSigner) {
          return;
        }

        setBuyingProperty(true);
        const rpc = createSolanaRpc("http://127.0.0.1:8899");

        const instruction = await sdk.buildHouseIx({
          rpc,
          gameAddress: gameAddress,
          player: currentPlayerSigner,
          position,
        });

        const signature = await buildAndSendTransaction(
          rpc,
          [instruction],
          currentPlayerSigner
        );

        console.log("Buy house", signature);
      } catch (error) {
        console.error(error);
      } finally {
        setBuyingProperty(false);
      }
    } else if (buildingLevel === "hotel") {
      try {
        if (!gameAddress || !currentPlayerSigner) {
          return;
        }

        setBuyingProperty(true);
        const rpc = createSolanaRpc("http://127.0.0.1:8899");

        const instruction = await sdk.buildHotelIx({
          rpc,
          gameAddress: gameAddress,
          player: currentPlayerSigner,
          position,
        });

        const signature = await buildAndSendTransaction(
          rpc,
          [instruction],
          currentPlayerSigner
        );

        console.log("Buy hotel", signature);
      } catch (error) {
        console.error(error);
      } finally {
        setBuyingProperty(false);
      }
    }
  };

  const handleSkipProperty = async (position: number) => {
    console.log("Skip property");
    try {
      if (!gameAddress || !currentPlayerSigner) {
        return;
      }

      setSkipProperty(true);
      const rpc = createSolanaRpc("http://127.0.0.1:8899");

      const instruction = await sdk.declinePropertyIx({
        rpc,
        gameAddress: gameAddress,
        player: currentPlayerSigner,
        position,
      });

      const signature = await buildAndSendTransaction(
        rpc,
        [instruction],
        currentPlayerSigner
      );

      console.log("Skip property", signature);
    } catch (error) {
      console.error(error);
    } finally {
      setSkipProperty(false);
    }
  };

  // Handle loading and error states
  if (gameLoading || gameLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        Loading game...
      </div>
    );
  }

  if (gameError || !gameState || !players) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        Error loading game data
      </div>
    );
  }

  if (!currentPlayerState) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        Player not found
      </div>
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
              players={players.map((player, index) => ({
                id: player.wallet.toString(),
                name: player.wallet.toString(),
                color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                avatar: `/images/player-${index + 1}.png`,
                position: player.position || 0,
                money: Number(player.cashBalance) || 0,
                properties: [], // Will be derived from blockchain data
                inJail: player.inJail || false,
                jailTurns: player.jailTurns || 0,
              }))}
              boardRotation={boardRotation}
            />

            {/* Property Indicators */}
            <PropertyIndicatorsContainer
              propertyOwnership={{}}
              properties={properties}
              players={players.map((player, index) => ({
                id: player.wallet.toString(),
                name: `Player ${index + 1}`,
                color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
              }))}
              propertyBuildings={{}}
              mortgagedProperties={[]}
            />

            {/* Center - Responsive */}
            <div className="col-start-3 col-end-13 row-start-3 row-end-13 bg-[#c7e9b5] flex flex-col items-center justify-center 
                           p-1 sm:p-3 md:p-4 gap-1 sm:gap-3 md:gap-4">
              {/* Dice Section - Responsive */}
              <div className="flex-shrink-0 transform scale-[0.7] sm:scale-75 md:scale-90 lg:scale-100">
                <Dice 
                  onRoll={handleDiceRoll} 
                  disabled={gameState.gamePhase !== "waiting" || currentPlayer.inJail}
                />
              </div>
              
              {/* Game Log Section - Responsive */}
              <div className="flex-1 w-full max-w-xs sm:max-w-sm md:max-w-md flex items-center justify-center">
                <div className="h-12 sm:h-16 md:h-20 lg:h-24 overflow-y-auto w-full">
                  <div className="space-y-2 text-center">
                    {gameState.gameLog && gameState.gameLog.length > 0 ? (
                      gameState.gameLog.slice(-8).reverse().map((log, index) => {
                        // Find all player names mentioned in the log
                        const mentionedPlayers = gameState.players.filter(player => 
                          log.includes(player.name)
                        );
                        
                        // Find property mentioned in the log and get its color
                        const propertyMatch = boardSpaces.find(space => 
                          log.includes(space.name)
                        );
                        
                        // Create formatted log with bold player names and colored property names
                        let formattedLog = log;
                        
                        // Replace all mentioned player names with bold markers
                        mentionedPlayers.forEach(player => {
                          const regex = new RegExp(`\\b${player.name}\\b`, 'g');
                          formattedLog = formattedLog.replace(regex, `**${player.name}**`);
                        });
                        
                        // Replace property name with colored version if found
                        if (propertyMatch && propertyMatch.name) {
                          const regex = new RegExp(`\\b${propertyMatch.name}\\b`, 'g');
                          formattedLog = formattedLog.replace(regex, `##${propertyMatch.name}##`);
                        }
                        
                        // Split the log by markers to separate bold, colored, and normal text
                        const parts = formattedLog.split(/(\*\*[^*]+\*\*|##[^#]+##)/);
                        
                        // Get property color class based on the actual data
                        const getPropertyColor = (propertyName: string) => {
                          const unifiedProperty = unifiedPropertyData.find(p => p.name === propertyName);
                          if (unifiedProperty && unifiedProperty.colorClass) {
                            // Map actual colorClass to text color
                            switch (unifiedProperty.colorClass) {
                              case 'bg-[#8b4513]': return 'text-amber-800'; // Brown
                              case 'bg-[#aae0fa]': return 'text-sky-400'; // Light Blue
                              case 'bg-[#d93a96]': return 'text-pink-600'; // Pink/Magenta
                              case 'bg-[#ffa500]': return 'text-orange-500'; // Orange
                              case 'bg-[#ff0000]': return 'text-red-600'; // Red
                              case 'bg-[#ffff00]': return 'text-yellow-500'; // Yellow
                              case 'bg-[#00ff00]': return 'text-green-500'; // Green
                              case 'bg-[#0000ff]': return 'text-blue-600'; // Dark Blue
                              case 'bg-blue-200': return 'text-blue-400'; // Railroad/Utility
                              case 'bg-white': return 'text-gray-600'; // Utility/Special
                              default: return 'text-gray-800';
                            }
                          }
                          return 'text-gray-800';
                        };
                        
                        return (
                          <div key={index} className="text-xs text-black flex items-center justify-center gap-1">
                            {/* Show avatars of all mentioned players */}
                            {mentionedPlayers.slice(0, 2).map((player, pIndex) => (
                              <img
                                key={pIndex}
                                src={player.avatar}
                                alt={`${player.name} avatar`}
                                className="w-4 h-4 object-contain flex-shrink-0"
                              />
                            ))}
                            <span>
                              {parts.map((part, partIndex) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                  // Bold player name
                                  return (
                                    <span key={partIndex} className="font-bold">
                                      {part.slice(2, -2)}
                                    </span>
                                  );
                                } else if (part.startsWith('##') && part.endsWith('##')) {
                                  // Colored property name
                                  const propertyName = part.slice(2, -2);
                                  return (
                                    <span key={partIndex} className={`font-semibold ${getPropertyColor(propertyName)}`}>
                                      {propertyName}
                                    </span>
                                  );
                                } else {
                                  // Normal text
                                  return <span key={partIndex}>{part}</span>;
                                }
                              })}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-xs text-black/70 italic">no game events yet...</div>
                    )}
                  </div>
                </div>
              </div>
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

      <PropertyDialog
        isOpen={isPropertyOpen}
        onClose={() => setIsPropertyOpen(false)}
        propertyName={
          currentPlayerState.pendingPropertyPosition
            ? boardSpaces[pendingPropertyPosition]?.name || "Unknown Property"
            : "Unknown Property"
        }
        propertyPrice={
          pendingPropertyPosition >= 0
            ? getPropertyData(pendingPropertyPosition)?.price || 0
            : 0
        }
        playerMoney={Number(currentPlayerState.cashBalance) || 0}
        position={pendingPropertyPosition}
        onSkip={handleSkipProperty}
        onBuyWithBuilding={handleBuyProperty}
        isLoading={isTransactionLoading}
        transactionError={transactionError || undefined}
      />

      {/* Card Draw Modal */}
      {/* <CardDrawModal
        isOpen={gameState.cardDrawModal?.isOpen || false}
        cardType={gameState.cardDrawModal?.cardType || "chance"}
        onCardDrawn={handleCardDrawn}
      /> */}

      {/* Jail Dialog */}
      {/* <JailDialog
        isOpen={
          currentPlayerState.inJail &&
          gameState.gameStatus === GameStatus.InProgress
        }
        playerName={currentPlayerState.cashBalance.name}
        playerMoney={currentPlayerState.cashBalance.money}
        jailTurns={currentPlayerState.cashBalance.jailTurns}
        hasJailFreeCard={
          (drawnCards.playerJailCards[currentPlayerState.cashBalance.id] || 0) > 0
        }
        onPayFine={payJailFine}
        onUseCard={useJailFreeCard}
        onRollDice={() => {
          // The dice component will handle the roll and call handleDiceRoll
          setCurrentDialogVisible(false);
        }}
      /> */}

      {/* Property Details Dialog */}
      <PropertyDetailsDialog
        isOpen={detailsDialogOpen}
        position={selectedSpace || 0}
        onClose={() => setDetailsDialogOpen(false)}
      />

      {/* Property Building Dialog */}
      {/* <PropertyBuildingDialog
        isOpen={buildingDialogOpen}
        position={buildingProperty || 0}
        playerMoney={Number(currentPlayerState.cashBalance)}
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

export default MonopolyBoard;
