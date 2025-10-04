import { GameStatus } from "@/lib/sdk/generated";
import { useGameContext } from "@/components/providers/game-provider";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { formatAddress, formatPrice } from "@/lib/utils";
import { getBoardSpaceData } from "@/lib/board-utils";
import { PlayerAccount } from "@/types/schema";
import { Badge } from "@/components/ui/badge";
import {
  JAIL_FINE,
  MEV_TAX_POSITION,
  PRIORITY_FEE_TAX_POSITION,
} from "@/configs/constants";
import { WalletWithMetadata } from "@privy-io/react-auth";
import { DicesOnly, useDiceContext } from "./dice";

interface PlayerTokenProps {
  player: PlayerAccount;
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
  player: PlayerAccount;
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
  player: PlayerAccount;
  position: number;
  isLoading: string | null;
  handleBuyProperty: (position: number) => void;
  handleSkipProperty: (position: number) => void;
}

const PropertyActions: React.FC<PropertyActionsProps> = ({
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
      isOwned: !!propertyAccount?.owner,
      isOwnedByCurrentPlayer:
        !!propertyAccount?.owner && propertyAccount.owner === player.wallet,
    } as any;
  }, [player, getPropertyByPosition, position]);

  if (position === MEV_TAX_POSITION || position === PRIORITY_FEE_TAX_POSITION) {
    return <Button>Pay tax</Button>;
  }

  return (
    <div>
      {/* Unowned Property */}
      {!pendingPropertyInfo.isOwned &&
        pendingPropertyInfo.propertyData?.price && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleBuyProperty(position)}
                disabled={
                  Number(player.cashBalance) <
                  pendingPropertyInfo.propertyData.price
                }
                loading={isLoading === "buyProperty"}
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
                loading={isLoading === "endTurn"}
                className="flex-1"
                variant="neutral"
              >
                Skip
              </Button>
            </div>
            {/* // FIXME need check */}
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
  wallet,
  handleStartGame,
  handleJoinGame,
  handleBuyProperty,
  handleSkipProperty,
  handleEndTurn,
  handlePayMevTax,
  handlePayPriorityFeeTax,
  handlePayJailFine,
  isLoading,
}: {
  wallet: WalletWithMetadata;
  handleStartGame: (gameAddress: string) => void;
  handleJoinGame: (gameAddress: string) => void;
  handleBuyProperty: (position: number) => void;
  handleSkipProperty: (position: number) => void;
  handlePayMevTax: () => void;
  handlePayPriorityFeeTax: () => void;
  handleEndTurn: () => void;
  handlePayJailFine: () => void;
  isLoading: string | null;
}) => {
  const {
    demoDices,
    gameState: game,
    currentPlayerState,
    showRollDice,
    isCurrentTurn,
    showEndTurn,
    showPayJailFine,
    setCardDrawType,
    setIsCardDrawModalOpen,
  } = useGameContext();

  const { canRoll, isRolling, handleRollDice } = useDiceContext();

  if (!currentPlayerState || !game) {
    return null;
  }

  const isStarted = game.gameStatus === GameStatus.InProgress;
  // const isEnded = game?.gameStatus  === GameStatus.Finished;
  const isCreator = game.authority === wallet.address;
  const isInGame = wallet.address && game.players.includes(wallet.address);

  return (
    <div className="flex flex-col items-center">
      <DicesOnly />

      {!isStarted && (
        <div className="flex items-center gap-2 mt-8 mb-4">
          {isCreator && (
            <div className="flex flex-col gap-4 items-center">
              <Button
                onClick={() => handleStartGame(game.address)}
                loading={isLoading === "startGame"}
                disabled={game.players.length < 2}
              >
                Start game
              </Button>
              {game.players.length < 2 && (
                <Badge variant="neutral">
                  At least 2 players are required to start the game
                </Badge>
              )}
            </div>
          )}

          {!isCreator && !isInGame && (
            <Button
              onClick={() => handleJoinGame(game.address)}
              loading={isLoading === "joinGame"}
            >
              Join game
            </Button>
          )}

          {!isCreator && isInGame && (
            <Badge variant="neutral">Waiting for host to start game</Badge>
          )}
        </div>
      )}

      {isStarted && isCurrentTurn && (
        <>
          <div className="flex items-center gap-2 mt-8 mb-4">
            {/* {!hasPendingActions &&
              (!currentPlayerState.hasRolledDice || isDouble) &&
              !currentPlayerState.inJail && (
                <Button
                  disabled={!canRoll || isRolling}
                  onClick={handleRollDice}
                  size="sm"
                  loading={isRolling}
                >
                  Roll dice
                </Button>
              )} */}

            {/* {((!hasPendingActions && !currentPlayerState.hasRolledDice) ||
              (!hasPendingActions &&
                currentPlayerState.hasRolledDice &&
                isDouble &&
                !currentPlayerState.inJail)) && (
              <Button
                disabled={!canRoll || isRolling}
                onClick={handleRollDice}
                size="sm"
                loading={isRolling}
              >
                Roll dice
              </Button>
            )} */}

            {showRollDice && (
              <Button
                disabled={!canRoll || isRolling}
                onClick={handleRollDice}
                size="sm"
                loading={isRolling}
              >
                {demoDices ? "Demo Roll" : "Roll dice"}
              </Button>
            )}

            {showPayJailFine && (
              <Button
                disabled={Number(currentPlayerState.cashBalance) < JAIL_FINE}
                onClick={handlePayJailFine}
                size="sm"
                loading={isLoading === "payJailFine"}
              >
                Pay jail fine
              </Button>
            )}

            {/* {currentPlayerState?.inJail && (
              <PlayerInJailAlert
                player={currentPlayerState}
                handleEndTurn={handleEndTurn}
              />
            )} */}

            {currentPlayerState?.needsBankruptcyCheck && (
              <BankruptcyAction player={currentPlayerState} />
            )}

            {/* Property Actions */}
            {currentPlayerState.needsPropertyAction &&
              currentPlayerState.pendingPropertyPosition && (
                <PropertyActions
                  player={currentPlayerState}
                  position={currentPlayerState.pendingPropertyPosition}
                  isLoading={isLoading}
                  handleBuyProperty={handleBuyProperty}
                  handleSkipProperty={handleSkipProperty}
                />
              )}

            {/* Special Space Actions */}
            {currentPlayerState.needsSpecialSpaceAction &&
              currentPlayerState.pendingSpecialSpacePosition ===
                MEV_TAX_POSITION && (
                <Button
                  onClick={() => handlePayMevTax()}
                  loading={isLoading === "tax"}
                >
                  Pay MEV Tax
                </Button>
              )}

            {currentPlayerState.needsSpecialSpaceAction &&
              currentPlayerState.pendingSpecialSpacePosition ===
                PRIORITY_FEE_TAX_POSITION && (
                <Button
                  onClick={() => handlePayPriorityFeeTax()}
                  loading={isLoading === "tax"}
                >
                  Pay Priority Fee Tax
                </Button>
              )}

            {isCurrentTurn && currentPlayerState.needsChanceCard && (
              <Button
                size="sm"
                onClick={() => {
                  setCardDrawType("chance");
                  setIsCardDrawModalOpen(true);
                }}
                loading={isLoading === "chanceCard"}
              >
                {isLoading === "chanceCard" ? "Drawing..." : "Draw Chance Card"}
              </Button>
            )}

            {isCurrentTurn && currentPlayerState.needsCommunityChestCard && (
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

            {/* {((!hasPendingActions &&
              currentPlayerState.hasRolledDice &&
              !isDouble) ||
              (currentPlayerState.hasRolledDice &&
                currentPlayerState.inJail)) && (
              <Button onClick={handleEndTurn} loading={isLoading === "endTurn"}>
                {isLoading === "endTurn" ? "Ending Turn..." : "End Turn"}
              </Button>
            )} */}

            {showEndTurn && (
              <Button onClick={handleEndTurn} loading={isLoading === "endTurn"}>
                {isLoading === "endTurn" ? "Ending Turn..." : "End Turn"}
              </Button>
            )}
          </div>
        </>
      )}
      {isStarted && (
        <Badge className={isCurrentTurn ? "" : "mt-8"} variant="neutral">
          {formatAddress(currentPlayerState.wallet)} is playing
        </Badge>
      )}
    </div>
  );
};
