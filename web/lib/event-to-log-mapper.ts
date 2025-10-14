import { GameEvent } from "@/lib/sdk/types";
import { GameLogEntry } from "@/types/space-types";
import { getPlayerDisplayName, getPropertyName, getCardData } from "@/lib/log-utils";
import { formatAddress } from "@/lib/utils";

/**
 * Maps a GameEvent from the Solana program to a GameLogEntry for display
 */
export function mapEventToLogEntry(event: GameEvent): GameLogEntry {
  const baseEntry = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    playerId: "",
    message: "",
  };

  switch (event.type) {
    case "PlayerJoined":
      return {
        ...baseEntry,
        type: "join",
        playerId: formatAddress(event.data.player.toString()),
        message: `${formatAddress(event.data.player.toString())} joined the game`,
        details: {
          playerIndex: event.data.playerIndex,
          totalPlayers: event.data.totalPlayers,
        },
      };

    case "PlayerLeft":
      return {
        ...baseEntry,
        type: "game",
        playerId: formatAddress(event.data.player.toString()),
        message: `${formatAddress(event.data.player.toString())} left the game`,
        details: {
          refundAmount: Number(event.data.refundAmount),
          remainingPlayers: event.data.remainingPlayers,
        },
      };

    case "GameStarted":
      return {
        ...baseEntry,
        type: "game",
        playerId: formatAddress(event.data.firstPlayer.toString()),
        message: "Game started!",
        details: {
          totalPlayers: event.data.totalPlayers,
          firstPlayer: event.data.firstPlayer.toString(),
        },
      };

    case "GameCancelled":
      return {
        ...baseEntry,
        type: "game",
        playerId: formatAddress(event.data.creator.toString()),
        message: `Game was cancelled by ${formatAddress(event.data.creator.toString())}`,
        details: {
          playersCount: event.data.playersCount,
          refundAmount: Number(event.data.refundAmount),
        },
      };

    case "PlayerPassedGo":
      return {
        ...baseEntry,
        type: "move",
        playerId: formatAddress(event.data.player.toString()),
        message: `${formatAddress(event.data.player.toString())} passed Solana Genesis and collected $${Number(event.data.salaryCollected)}`,
        details: {
          toPosition: event.data.newPosition,
          passedGo: true,
          amount: Number(event.data.salaryCollected),
        },
      };

    case "PropertyPurchased":
      const propertyName = getPropertyName(event.data.propertyPosition);
      return {
        ...baseEntry,
        type: "purchase",
        playerId: formatAddress(event.data.player.toString()),
        message: `${formatAddress(event.data.player.toString())} bought ${propertyName} for $${Number(event.data.price)}`,
        details: {
          propertyName,
          position: event.data.propertyPosition,
          price: Number(event.data.price),
        },
      };

    case "PropertyDeclined":
      const declinedPropertyName = getPropertyName(event.data.propertyPosition);
      return {
        ...baseEntry,
        type: "skip",
        playerId: formatAddress(event.data.player.toString()),
        message: `${formatAddress(event.data.player.toString())} declined to buy ${declinedPropertyName}`,
        details: {
          propertyName: declinedPropertyName,
          position: event.data.propertyPosition,
          price: Number(event.data.price),
        },
      };

    case "RentPaid":
      const rentPropertyName = getPropertyName(event.data.propertyPosition);
      return {
        ...baseEntry,
        type: "rent",
        playerId: formatAddress(event.data.payer.toString()),
        message: `${formatAddress(event.data.payer.toString())} paid $${Number(event.data.amount)} rent to ${formatAddress(event.data.owner.toString())} for ${rentPropertyName}`,
        details: {
          propertyName: rentPropertyName,
          position: event.data.propertyPosition,
          amount: Number(event.data.amount),
          owner: event.data.owner.toString(),
        },
      };

    case "ChanceCardDrawn":
      const chanceCard = getCardData("chance", event.data.cardIndex);
      return {
        ...baseEntry,
        type: "card",
        playerId: formatAddress(event.data.player.toString()),
        message: chanceCard 
          ? `${formatAddress(event.data.player.toString())} drew ${chanceCard.title}: ${chanceCard.description}`
          : `${formatAddress(event.data.player.toString())} drew a Pump.fun Surprise card`,
        details: {
          cardType: "chance" as const,
          cardIndex: event.data.cardIndex,
          cardTitle: chanceCard?.title,
          cardDescription: chanceCard?.description,
          effectType: event.data.effectType,
          amount: event.data.amount,
        },
      };

    case "CommunityChestCardDrawn":
      const treasureCard = getCardData("community-chest", event.data.cardIndex);
      return {
        ...baseEntry,
        type: "card",
        playerId: formatAddress(event.data.player.toString()),
        message: treasureCard 
          ? `${formatAddress(event.data.player.toString())} drew ${treasureCard.title}: ${treasureCard.description}`
          : `${formatAddress(event.data.player.toString())} drew an Airdrop Chest card`,
        details: {
          cardType: "community-chest" as const,
          cardIndex: event.data.cardIndex,
          cardTitle: treasureCard?.title,
          cardDescription: treasureCard?.description,
          effectType: event.data.effectType,
          amount: event.data.amount,
        },
      };

    case "HouseBuilt":
      const housePropertyName = getPropertyName(event.data.propertyPosition);
      return {
        ...baseEntry,
        type: "building",
        playerId: formatAddress(event.data.player.toString()),
        message: `${formatAddress(event.data.player.toString())} built a house on ${housePropertyName}`,
        details: {
          buildingType: "house" as const,
          propertyName: housePropertyName,
          position: event.data.propertyPosition,
          price: Number(event.data.cost),
          houseCount: event.data.houseCount,
        },
      };

    case "HotelBuilt":
      const hotelPropertyName = getPropertyName(event.data.propertyPosition);
      return {
        ...baseEntry,
        type: "building",
        playerId: formatAddress(event.data.player.toString()),
        message: `${formatAddress(event.data.player.toString())} built a hotel on ${hotelPropertyName}`,
        details: {
          buildingType: "hotel" as const,
          propertyName: hotelPropertyName,
          position: event.data.propertyPosition,
          price: Number(event.data.cost),
        },
      };

    case "BuildingSold":
      const soldPropertyName = getPropertyName(event.data.propertyPosition);
      return {
        ...baseEntry,
        type: "building",
        playerId: formatAddress(event.data.player.toString()),
        message: `${formatAddress(event.data.player.toString())} sold a ${event.data.buildingType} on ${soldPropertyName} for $${Number(event.data.salePrice)}`,
        details: {
          buildingType: event.data.buildingType as "house" | "hotel",
          propertyName: soldPropertyName,
          position: event.data.propertyPosition,
          price: Number(event.data.salePrice),
        },
      };

    case "PropertyMortgaged":
      const mortgagedPropertyName = getPropertyName(event.data.propertyPosition);
      return {
        ...baseEntry,
        type: "purchase",
        playerId: formatAddress(event.data.player.toString()),
        message: `${formatAddress(event.data.player.toString())} mortgaged ${mortgagedPropertyName} for $${Number(event.data.mortgageValue)}`,
        details: {
          propertyName: mortgagedPropertyName,
          position: event.data.propertyPosition,
          price: Number(event.data.mortgageValue),
        },
      };

    case "PropertyUnmortgaged":
      const unmortgagedPropertyName = getPropertyName(event.data.propertyPosition);
      return {
        ...baseEntry,
        type: "purchase",
        playerId: formatAddress(event.data.player.toString()),
        message: `${formatAddress(event.data.player.toString())} unmortgaged ${unmortgagedPropertyName} for $${Number(event.data.unmortgageCost)}`,
        details: {
          propertyName: unmortgagedPropertyName,
          position: event.data.propertyPosition,
          price: Number(event.data.unmortgageCost),
        },
      };

    case "TaxPaid":
      const taxTypeMap: Record<number, string> = {
        0: "MEV",
        1: "Priority Fee",
      };
      const taxTypeName = taxTypeMap[event.data.taxType] || "Unknown";
      return {
        ...baseEntry,
        type: "rent", // Using rent type for tax payments
        playerId: formatAddress(event.data.player.toString()),
        message: `${formatAddress(event.data.player.toString())} paid $${Number(event.data.amount)} ${taxTypeName} tax`,
        details: {
          taxType: taxTypeName,
          amount: Number(event.data.amount),
          position: event.data.position,
        },
      };

    case "SpecialSpaceAction":
      let specialMessage = "";
      switch (event.data.spaceType) {
        case 0: // Go to jail
          specialMessage = `${formatAddress(event.data.player.toString())} went to Validator Jail`;
          break;
        case 1: // Free parking
          specialMessage = `${formatAddress(event.data.player.toString())} landed on Free Airdrop Parking`;
          break;
        case 2: // Go to jail space
          specialMessage = `${formatAddress(event.data.player.toString())} was sent to Validator Jail`;
          break;
        default:
          specialMessage = `${formatAddress(event.data.player.toString())} landed on a special space`;
      }
      
      return {
        ...baseEntry,
        type: event.data.spaceType === 0 || event.data.spaceType === 2 ? "jail" : "move",
        playerId: formatAddress(event.data.player.toString()),
        message: specialMessage,
        details: {
          position: event.data.position,
          spaceType: event.data.spaceType,
        },
      };

    case "TradeCreated":
      return {
        ...baseEntry,
        type: "trade",
        playerId: formatAddress(event.data.proposer.toString()),
        message: `${formatAddress(event.data.proposer.toString())} created a trade with ${formatAddress(event.data.receiver.toString())}`,
        details: {
          action: "created",
          tradeId: event.data.tradeId.toString(),
          targetPlayer: event.data.receiver.toString(),
          offeredMoney: Number(event.data.proposerMoney),
          requestedMoney: Number(event.data.receiverMoney),
          offeredProperties: event.data.proposerProperty ? [event.data.proposerProperty] : [],
          requestedProperties: event.data.receiverProperty ? [event.data.receiverProperty] : [],
        },
      };

    case "TradeAccepted":
      return {
        ...baseEntry,
        type: "trade",
        playerId: formatAddress(event.data.accepter.toString()),
        message: `${formatAddress(event.data.accepter.toString())} accepted a trade from ${formatAddress(event.data.proposer.toString())}`,
        details: {
          action: "accepted",
          tradeId: event.data.tradeId.toString(),
          targetPlayer: event.data.proposer.toString(),
        },
      };

    case "TradeRejected":
      return {
        ...baseEntry,
        type: "trade",
        playerId: formatAddress(event.data.rejecter.toString()),
        message: `${formatAddress(event.data.rejecter.toString())} rejected a trade from ${formatAddress(event.data.proposer.toString())}`,
        details: {
          action: "rejected",
          tradeId: event.data.tradeId.toString(),
          targetPlayer: event.data.proposer.toString(),
        },
      };

    case "TradeCancelled":
      return {
        ...baseEntry,
        type: "trade",
        playerId: formatAddress(event.data.canceller.toString()),
        message: `${formatAddress(event.data.canceller.toString())} cancelled their trade`,
        details: {
          action: "cancelled",
          tradeId: event.data.tradeId.toString(),
        },
      };

    case "TradesCleanedUp":
      return {
        ...baseEntry,
        type: "game",
        playerId: "System",
        message: `${event.data.tradesRemoved} expired trades were cleaned up`,
        details: {
          tradesRemoved: event.data.tradesRemoved,
          remainingTrades: event.data.remainingTrades,
        },
      };

    case "PlayerBankrupt":
      return {
        ...baseEntry,
        type: "bankruptcy",
        playerId: formatAddress(event.data.player.toString()),
        message: `${formatAddress(event.data.player.toString())} declared bankruptcy`,
        details: {
          liquidationValue: Number(event.data.liquidationValue),
          cashTransferred: Number(event.data.cashTransferred),
        },
      };

    case "GameEnded":
      const winner = event.data.winner;
      const winnerName = winner ? formatAddress(winner.toString()) : "No one";
      return {
        ...baseEntry,
        type: "game",
        playerId: winner ? formatAddress(winner.toString()) : "System",
        message: winner ? `${winnerName} won the game!` : "Game ended with no winner",
        details: {
          winner: winner?.toString(),
          reason: event.data.reason,
          winnerNetWorth: event.data.winnerNetWorth ? Number(event.data.winnerNetWorth) : undefined,
        },
      };

    case "GameEndConditionMet":
      return {
        ...baseEntry,
        type: "game",
        playerId: "System",
        message: "Game end condition has been met",
        details: {
          reason: event.data.reason,
        },
      };

    case "PrizeClaimed":
      return {
        ...baseEntry,
        type: "game",
        playerId: formatAddress(event.data.winner.toString()),
        message: `${formatAddress(event.data.winner.toString())} claimed their prize of $${Number(event.data.prizeAmount)}`,
        details: {
          prizeAmount: Number(event.data.prizeAmount),
        },
      };

    default:
      // Fallback for unknown event types
      return {
        ...baseEntry,
        type: "game",
        playerId: "System",
        message: `Unknown event: ${(event as any).type}`,
      };
  }
}