"use client";

import React, { useState, useMemo } from "react";
import { useGameContext } from "@/components/game-provider";
import { Dice } from "@/components/dice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getPropertyData } from "@/data/unified-monopoly-data";
import { isSome } from "@solana/kit";

interface ActionPanelProps {
  className?: string;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({ className = "" }) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const {
    gameState,
    currentPlayerState,
    currentPlayerAddress,
    properties,
    // Actions
    rollDice,
    endTurn,
    payJailFine,
    buyProperty,
    skipProperty,
    drawChanceCard,
    drawCommunityChestCard,
    // UI state
    setIsPropertyDialogOpen,
    setIsCardDrawModalOpen,
    setCardDrawType,
    // Utilities
    isCurrentPlayerTurn,
    canPlayerAct,
    getPlayerName,
    getPropertyByPosition,
  } = useGameContext();

  // Get pending property information
  const pendingPropertyInfo = useMemo(() => {
    if (
      !currentPlayerState?.needsPropertyAction ||
      !isSome(currentPlayerState.pendingPropertyPosition)
    ) {
      return null;
    }

    const position = currentPlayerState.pendingPropertyPosition.value;
    const propertyData = getPropertyData(position);
    const propertyAccount = getPropertyByPosition(position);

    return {
      position,
      propertyData,
      propertyAccount,
      isOwned: propertyAccount?.owner && isSome(propertyAccount.owner),
      isOwnedByCurrentPlayer:
        propertyAccount?.owner &&
        isSome(propertyAccount.owner) &&
        propertyAccount.owner.value === currentPlayerState.wallet,
    };
  }, [currentPlayerState, getPropertyByPosition]);

  // Action handlers with loading states
  const handleRollDice = async () => {
    if (!canPlayerAct() || !isCurrentPlayerTurn()) return;

    setIsLoading("dice");
    try {
      await rollDice();
    } catch (error) {
      console.error("Failed to roll dice:", error);
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

  const handlePayJailFine = async () => {
    if (!currentPlayerState?.inJail) return;

    setIsLoading("jailFine");
    try {
      await payJailFine();
    } catch (error) {
      console.error("Failed to pay jail fine:", error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleBuyProperty = async () => {
    if (!pendingPropertyInfo?.position) return;

    setIsLoading("buyProperty");
    try {
      await buyProperty(pendingPropertyInfo.position);
    } catch (error) {
      console.error("Failed to buy property:", error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleSkipProperty = async () => {
    // This will be handled by the GameProvider's auto-action logic
    // For now, we can show the property dialog to let user decide
    if (pendingPropertyInfo?.position) {
      // setIsPropertyDialogOpen(true);
      setIsLoading("skipProperty");
      try {
        await skipProperty(pendingPropertyInfo.position);
      } catch (error) {
        console.error("Failed to skip property:", error);
      } finally {
        setIsLoading(null);
      }
    }
  };

  // const handleDrawChanceCard = async () => {
  //   setIsLoading("chanceCard");
  //   try {
  //     await drawChanceCard();
  //   } catch (error) {
  //     console.error("Failed to draw chance card:", error);
  //   } finally {
  //     setIsLoading(null);
  //   }
  // };

  // const handleDrawCommunityChestCard = async () => {
  //   setIsLoading("communityChestCard");
  //   try {
  //     await drawCommunityChestCard();
  //   } catch (error) {
  //     console.error("Failed to draw community chest card:", error);
  //   } finally {
  //     setIsLoading(null);
  //   }
  // };

  const handleOpenCardModal = (cardType: "chance" | "community-chest") => {
    setCardDrawType(cardType);
    setIsCardDrawModalOpen(true);
  };

  if (!gameState || !currentPlayerState) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            No game data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const isMyTurn = isCurrentPlayerTurn();
  const currentPlayerName = currentPlayerAddress
    ? getPlayerName(currentPlayerAddress)
    : "Unknown";

  // Determine available actions
  const canRoll =
    isMyTurn && !currentPlayerState.hasRolledDice && !currentPlayerState.inJail;
  const canEndTurn = isMyTurn && currentPlayerState.canEndTurn;
  const canPayJailFine = isMyTurn && currentPlayerState.inJail;

  console.log("currentPlayerState", currentPlayerState);

  // Check for pending actions
  const hasPendingActions =
    currentPlayerState.needsPropertyAction ||
    currentPlayerState.needsChanceCard ||
    currentPlayerState.needsCommunityChestCard ||
    currentPlayerState.needsBankruptcyCheck ||
    currentPlayerState.needsSpecialSpaceAction;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Game Actions</span>
          <Badge variant={isMyTurn ? "default" : "secondary"}>
            {isMyTurn ? "Your Turn" : "Waiting"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Player Status Alerts */}
        {currentPlayerState.inJail && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm font-medium text-red-800">In Jail</div>
            <div className="text-xs text-red-600">
              Turn {currentPlayerState.jailTurns}/3
            </div>
            <div className="text-xs text-red-600 mt-1">
              Roll doubles to escape or pay $50 fine
            </div>
          </div>
        )}

        {currentPlayerState.needsBankruptcyCheck && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm font-medium text-red-800">
              Bankruptcy Check
            </div>
            <div className="text-xs text-red-600">
              Insufficient funds detected. Sell properties or declare
              bankruptcy.
            </div>
          </div>
        )}

        {/* Dice Section */}
        {/* {!currentPlayerState.inJail && !hasPendingActions && ( */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Dice</div>
          <Dice
            disabled={
              !canRoll ||
              isLoading === "dice" ||
              currentPlayerState.inJail ||
              hasPendingActions
            }
            isMyTurn={isMyTurn}
          />
          {/* {currentPlayerState.hasRolledDice && (
            <div className="text-xs text-gray-500">
              Last roll: {currentPlayerState.lastDiceRoll[0]} +{" "}
              {currentPlayerState.lastDiceRoll[1]} ={" "}
              {currentPlayerState.lastDiceRoll[0] +
                currentPlayerState.lastDiceRoll[1]}
              {currentPlayerState.lastDiceRoll[0] ===
                currentPlayerState.lastDiceRoll[1] && (
                <span className="text-blue-600 font-medium"> (Doubles!)</span>
              )}
            </div>
          )} */}
        </div>
        {/* // )} */}

        {/* Priority Actions */}
        {isMyTurn && (
          <>
            {/* Property Actions */}
            {currentPlayerState.needsPropertyAction && pendingPropertyInfo && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                <div className="text-sm font-medium text-blue-800">
                  Property Action Required
                </div>
                <div className="text-xs text-blue-600">
                  You landed on:{" "}
                  <span className="font-medium">
                    {pendingPropertyInfo.propertyData?.name}
                  </span>
                </div>

                {/* Unowned Property */}
                {!pendingPropertyInfo.isOwned &&
                  pendingPropertyInfo.propertyData?.price && (
                    <div className="space-y-2">
                      <div className="text-xs text-blue-600">
                        Price:{" "}
                        <span className="font-medium">
                          ${pendingPropertyInfo.propertyData.price}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleBuyProperty}
                          disabled={
                            isLoading === "buyProperty" ||
                            Number(currentPlayerState.cashBalance) <
                              pendingPropertyInfo.propertyData.price
                          }
                          className="flex-1"
                        >
                          {isLoading === "buyProperty"
                            ? "Buying..."
                            : `Buy $${pendingPropertyInfo.propertyData.price}`}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleSkipProperty}
                          disabled={isLoading === "buyProperty"}
                          className="flex-1"
                        >
                          Skip
                        </Button>
                      </div>
                      {Number(currentPlayerState.cashBalance) <
                        pendingPropertyInfo.propertyData.price && (
                        <div className="text-xs text-red-600">
                          Insufficient funds (Need $
                          {pendingPropertyInfo.propertyData.price -
                            Number(currentPlayerState.cashBalance)}{" "}
                          more)
                        </div>
                      )}
                    </div>
                  )}

                {/* Owned by Another Player */}
                {pendingPropertyInfo.isOwned &&
                  !pendingPropertyInfo.isOwnedByCurrentPlayer && (
                    <div className="text-xs text-blue-600">
                      Owned by another player. Rent will be automatically paid.
                    </div>
                  )}

                {/* Owned by Current Player */}
                {pendingPropertyInfo.isOwnedByCurrentPlayer && (
                  <div className="text-xs text-green-600">
                    You own this property. Check for building opportunities.
                  </div>
                )}
              </div>
            )}

            {/* Card Drawing Actions */}
            {currentPlayerState.needsChanceCard && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg space-y-2">
                <div className="text-sm font-medium text-orange-800">
                  Draw Chance Card
                </div>
                <div className="text-xs text-orange-600">
                  You landed on a Chance space
                </div>
                <Button
                  size="sm"
                  onClick={() => handleOpenCardModal("chance")}
                  disabled={isLoading === "chanceCard"}
                  className="w-full"
                  variant="outline"
                >
                  {isLoading === "chanceCard"
                    ? "Drawing..."
                    : "Draw Chance Card"}
                </Button>
              </div>
            )}

            {currentPlayerState.needsCommunityChestCard && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg space-y-2">
                <div className="text-sm font-medium text-purple-800">
                  Draw Community Chest Card
                </div>
                <div className="text-xs text-purple-600">
                  You landed on a Community Chest space
                </div>
                <Button
                  size="sm"
                  onClick={() => handleOpenCardModal("community-chest")}
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

            {/* Special Space Actions */}
            {currentPlayerState.needsSpecialSpaceAction &&
              isSome(currentPlayerState.pendingSpecialSpacePosition) && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-sm font-medium text-yellow-800">
                    Special Space Action
                  </div>
                  <div className="text-xs text-yellow-600">
                    Position:{" "}
                    {currentPlayerState.pendingSpecialSpacePosition.value}
                  </div>
                  <div className="text-xs text-yellow-600">
                    Handle special space requirements
                  </div>
                </div>
              )}

            {/* Jail Dice Section */}
            {currentPlayerState.inJail && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Jail Actions</div>
                <div className="space-y-2">
                  <Dice
                    disabled={!canRoll || isLoading === "dice"}
                    isMyTurn={isMyTurn}
                  />
                  <div className="text-xs text-gray-500">
                    Roll doubles to escape jail
                  </div>
                  <Button
                    onClick={handlePayJailFine}
                    disabled={
                      isLoading === "jailFine" ||
                      Number(currentPlayerState.cashBalance) < 50
                    }
                    className="w-full"
                    variant="outline"
                    size="sm"
                  >
                    {isLoading === "jailFine"
                      ? "Paying..."
                      : "Pay Jail Fine ($50)"}
                  </Button>
                  {Number(currentPlayerState.cashBalance) < 50 && (
                    <div className="text-xs text-red-600">
                      Insufficient funds for jail fine
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* End Turn Button */}
            {!hasPendingActions && (
              <Button
                onClick={handleEndTurn}
                disabled={isLoading === "endTurn"}
                className="w-full"
              >
                {isLoading === "endTurn" ? "Ending Turn..." : "End Turn"}
              </Button>
            )}

            {/* Doubles Continuation */}
            {currentPlayerState.doublesCount > 0 &&
              currentPlayerState.doublesCount < 3 &&
              currentPlayerState.hasRolledDice &&
              !hasPendingActions && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm font-medium text-green-800">
                    Doubles Rolled!
                  </div>
                  <div className="text-xs text-green-600">
                    You get another turn. Roll again or end turn.
                  </div>
                </div>
              )}
          </>
        )}

        {/* Status Messages for Non-Current Player */}
        {!isMyTurn && (
          <div className="text-center text-sm text-gray-500 py-4">
            <div>
              Waiting for{" "}
              {getPlayerName(gameState.players[gameState.currentTurn])}
            </div>
            <div className="text-xs mt-1">It's their turn to play</div>
          </div>
        )}

        {/* Action Required but Can't Act */}
        {isMyTurn && hasPendingActions && !canPlayerAct() && (
          <div className="text-center text-sm text-yellow-600 py-2">
            <div>Actions pending...</div>
            <div className="text-xs">Complete required actions to continue</div>
          </div>
        )}

        <Separator />

        {/* Game Status */}
        {/* <div className="text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Game Status:</span>
            <span className="font-medium">{gameState.gameStatus}</span>
          </div>
          <div className="flex justify-between">
            <span>Players:</span>
            <span>
              {gameState.currentPlayers}/{gameState.maxPlayers}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Current Turn:</span>
            <span>{gameState.currentTurn + 1}</span>
          </div>
          <div className="flex justify-between">
            <span>Bank Balance:</span>
            <span>${Number(gameState.bankBalance).toLocaleString()}</span>
          </div>
          {Number(gameState.freeParkingPool) > 0 && (
            <div className="flex justify-between">
              <span>Free Parking Pool:</span>
              <span>${Number(gameState.freeParkingPool).toLocaleString()}</span>
            </div>
          )}
        </div> */}
      </CardContent>
    </Card>
  );
};

export default ActionPanel;
