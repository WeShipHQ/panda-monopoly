import { PlayerState } from "@/lib/sdk/generated";
import { useGameContext } from "@/components/providers/game-provider";
import { useMemo } from "react";
import { isSome } from "@solana/kit";
import { Button } from "@/components/ui/button";
import { formatAddress, formatPrice } from "@/lib/utils";
import { getBoardSpaceData } from "@/lib/board-utils";
import { DicesOnly, useDiceContext } from "./dice";

interface PlayerTokenProps {
  player: PlayerState;
  handleEndTurn: () => void;
}

export const PlayerInJailAlert: React.FC<PlayerTokenProps> = ({
  player,
  handleEndTurn,
}) => {
  return (
    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
      <div className="text-sm font-medium text-red-800">In Jail</div>
      <div className="text-xs text-red-600">Turn {player.jailTurns}/3</div>
      <div className="text-xs text-red-600 mt-1 mb-4">
        Roll doubles to escape or pay $50 fine
      </div>
      <Button onClick={handleEndTurn}>End turn</Button>
    </div>
  );
};

interface BankruptcyActionProps {
  player: PlayerState;
}

export const BankruptcyAction: React.FC<BankruptcyActionProps> = ({
  player,
}) => {
  return (
    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
      <div className="text-sm font-medium text-red-800">Bankruptcy Check</div>
      <div className="text-xs text-red-600">
        Insufficient funds detected. Sell properties or declare bankruptcy.
      </div>
    </div>
  );
};

interface PropertyActionsProps {
  player: PlayerState;
  position: number;
  isLoading: string | null;
  handleBuyProperty: (position: number) => void;
  handleSkipProperty: (position: number) => void;
}

export const PropertyActions: React.FC<PropertyActionsProps> = ({
  player,
  position,
  isLoading,
  handleBuyProperty,
  handleSkipProperty,
}) => {
  const { getPropertyByPosition } = useGameContext();

  const pendingPropertyInfo = useMemo(() => {
    const propertyData = getBoardSpaceData(position);
    const propertyAccount = getPropertyByPosition(position);

    return {
      propertyData,
      propertyAccount,
      isOwned: propertyAccount?.owner && isSome(propertyAccount.owner),
      isOwnedByCurrentPlayer:
        propertyAccount?.owner &&
        isSome(propertyAccount.owner) &&
        propertyAccount.owner.value === player.wallet,
    } as any;
  }, [player, getPropertyByPosition, position]);

  return (
    <div
    // className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-3"
    >
      {/* <div className="text-sm font-medium text-blue-800">
        Property Action Required
      </div>
      <div className="text-xs text-blue-600">
        You landed on:{" "}
        <span className="font-medium">
          {pendingPropertyInfo.propertyData?.name}
        </span>
      </div> */}

      {/* Unowned Property */}
      {!pendingPropertyInfo.isOwned &&
        pendingPropertyInfo.propertyData?.price && (
          <div className="space-y-2">
            {/* <div className="text-xs text-blue-600">
              Price:{" "}
              <span className="font-medium">
                ${pendingPropertyInfo.propertyData.price}
              </span>
            </div> */}
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleBuyProperty(position)}
                disabled={
                  isLoading === "buyProperty" ||
                  Number(player.cashBalance) <
                    pendingPropertyInfo.propertyData.price
                }
                className="flex-1"
              >
                {isLoading === "buyProperty"
                  ? "Buying..."
                  : `Buy for ${formatPrice(
                      pendingPropertyInfo.propertyData.price
                    )}`}
              </Button>
              <Button
                size="sm"
                onClick={() => handleSkipProperty(position)}
                disabled={isLoading === "endTurn"}
                className="flex-1"
              >
                Skip
              </Button>
            </div>
            {Number(player.cashBalance) <
              pendingPropertyInfo.propertyData.price && (
              <div className="text-xs text-red-600">
                Insufficient funds (Need
                {formatPrice(
                  pendingPropertyInfo.propertyData.price -
                    Number(player.cashBalance)
                )}{" "}
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
  );
};

export const PlayerActions = ({
  handleBuyProperty,
  handleSkipProperty,
  handleEndTurn,
  isLoading,
}: {
  handleBuyProperty: (position: number) => void;
  handleSkipProperty: (position: number) => void;
  handleEndTurn: () => void;
  isLoading: string | null;
}) => {
  const { canRoll, isRolling, handleRollDice } = useDiceContext();
  const {
    currentPlayerState,
    isCurrentPlayerTurn,
    setCardDrawType,
    setIsCardDrawModalOpen,
  } = useGameContext();

  if (!currentPlayerState) {
    return null;
  }

  const isMyTurn = isCurrentPlayerTurn();

  const hasPendingActions =
    currentPlayerState.needsPropertyAction ||
    currentPlayerState.needsChanceCard ||
    currentPlayerState.needsCommunityChestCard ||
    currentPlayerState.needsBankruptcyCheck ||
    currentPlayerState.needsSpecialSpaceAction;

  return (
    <div className="flex flex-col items-center">
      <DicesOnly />
      <div className="flex items-center gap-2 mt-8 mb-4">
        {!hasPendingActions && !currentPlayerState.hasRolledDice && (
          <Button
            disabled={!canRoll || isRolling}
            onClick={handleRollDice}
            size="sm"
            // @ts-expect-error
            loading={isRolling}
          >
            Roll dice
          </Button>
        )}

        {currentPlayerState?.inJail && (
          <PlayerInJailAlert
            player={currentPlayerState}
            handleEndTurn={handleEndTurn}
          />
        )}
        {currentPlayerState?.needsBankruptcyCheck && (
          <BankruptcyAction player={currentPlayerState} />
        )}

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
            onClick={() => {
              setCardDrawType("chance");
              setIsCardDrawModalOpen(true);
            }}
            disabled={isLoading === "chanceCard"}
          >
            {isLoading === "chanceCard" ? "Drawing..." : "Draw Chance Card"}
          </Button>
        )}

        {isMyTurn && currentPlayerState.needsCommunityChestCard && (
          <>
            <Button
              size="sm"
              onClick={() => {
                setCardDrawType("community-chest");
                setIsCardDrawModalOpen(true);
              }}
            >
              Draw card
            </Button>
          </>
        )}

        {!hasPendingActions && currentPlayerState.hasRolledDice && (
          <Button onClick={handleEndTurn} disabled={isLoading === "endTurn"}>
            {isLoading === "endTurn" ? "Ending Turn..." : "End Turn"}
          </Button>
        )}
      </div>
      <h4 className="text-sm font-medium text-purple-800">
        {formatAddress(currentPlayerState.wallet)} is playing
      </h4>
    </div>
  );
};
