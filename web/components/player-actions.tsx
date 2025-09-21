import { PlayerState } from "@/lib/sdk/generated";
import { useGameContext } from "./game-provider";
import { useMemo } from "react";
import { isSome } from "@solana/kit";
import { Button } from "./ui/button";
import { formatPrice } from "@/lib/utils";
import { getTypedSpaceData } from "@/lib/board-utils";

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
    const propertyData = getTypedSpaceData(position, "property");
    const propertyAccount = getPropertyByPosition(position);

    return {
      propertyData,
      propertyAccount,
      isOwned: propertyAccount?.owner && isSome(propertyAccount.owner),
      isOwnedByCurrentPlayer:
        propertyAccount?.owner &&
        isSome(propertyAccount.owner) &&
        propertyAccount.owner.value === player.wallet,
    };
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
                variant="outline"
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


export const PlayerActions = () => {
  return (
    <>
    </>
  )
}