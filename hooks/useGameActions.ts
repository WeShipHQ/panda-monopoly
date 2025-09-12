import { useCallback } from "react";
import { boardSpaces, CardData, chanceCards, communityChestCards } from "@/data/monopoly-data";
import { useGameState } from "./useGameState";
import { useGameUtils } from "./useGameUtils";

export const useGameActions = () => {
  const {
    gameState,
    drawnCards,
    setDrawnCards,
    updateGameState,
    setGamePhase,
    nextTurn,
    showMessage,
  } = useGameState();

  const { getPropertyPrice, getPropertyRent, ownsFullColorGroup } = useGameUtils();

  // Add money and log
  const addMoney = useCallback(
    (playerId: number, amount: number, reason: string) => {
      updateGameState((prevState) => {
        const newPlayers = prevState.players.map((player) =>
          player.id === playerId
            ? { ...player, money: player.money + amount }
            : player
        );
        const player = newPlayers.find((p) => p.id === playerId);
        const newLog = [
          ...prevState.gameLog,
          `${player?.name} ${reason} $${amount}`,
        ];

        return {
          ...prevState,
          players: newPlayers,
          gameLog: newLog,
        };
      });
    },
    [updateGameState]
  );

  // Handle landing on a space
  const handleSpaceLanding = useCallback(
    (playerId: number, position: number) => {
      const space = boardSpaces[position];
      const player = gameState.players.find((p) => p.id === playerId);

      console.log(
        `handleSpaceLanding called: playerId=${playerId}, position=${position}, space=${space?.name}, player=${player?.name}`
      );

      if (!space || !player) {
        console.log("handleSpaceLanding: space or player not found, returning");
        return;
      }

      updateGameState((prevState) => {
        let newState = { ...prevState };
        let action = undefined;

        switch (space.type) {
          case "corner":
            if (space.name === "GO") {
              // Already handled in movement - just advance turn
              setTimeout(() => {
                nextTurn();
              }, 1000);
            } else if (space.name === "Go To Jail") {
              // Send to jail
              const newPlayers = prevState.players.map((p) =>
                p.id === playerId
                  ? { ...p, position: 6, inJail: true, jailTurns: 0 } // Position 6 is JAIL
                  : p
              );
              newState.players = newPlayers;
              newState.gameLog = [
                ...prevState.gameLog,
                `${player.name} went to Jail!`,
              ];

              // Show jail message
              showMessage(`${player.name} went to Jail!`, "warning", 2000);

              // Auto advance turn after going to jail
              setTimeout(() => {
                nextTurn();
              }, 2000);
            } else if (space.name === "Free Parking") {
              newState.gameLog = [
                ...prevState.gameLog,
                `${player.name} rests at Free Parking`,
              ];

              // Auto advance turn after landing on Free Parking
              setTimeout(() => {
                nextTurn();
              }, 1500);
            }
            break;

          case "property":
            const owner = prevState.propertyOwnership[position];

            if (!owner) {
              // Property available for purchase
              action = {
                type: "buy-property" as const,
                data: { position, price: getPropertyPrice(position) },
              };
              newState.gamePhase = "property-action";
            } else if (owner !== playerId) {
              // Pay rent to owner
              const rent = getPropertyRent(position, prevState);
              const ownerPlayer = prevState.players.find((p) => p.id === owner);
              const newPlayers = prevState.players.map((p) => {
                if (p.id === playerId) {
                  return { ...p, money: p.money - rent };
                } else if (p.id === owner) {
                  return { ...p, money: p.money + rent };
                }
                return p;
              });
              newState.players = newPlayers;
              newState.gameLog = [
                ...prevState.gameLog,
                `${player.name} paid $${rent} rent to ${ownerPlayer?.name}`,
              ];

              // Show rent payment message
              showMessage(
                `${player.name} paid $${rent} rent to ${ownerPlayer?.name}`,
                "info",
                2000
              );

              // Auto advance turn after paying rent
              setTimeout(() => {
                nextTurn();
              }, 2000);
            } else {
              // Player owns this property - just advance turn
              setTimeout(() => {
                nextTurn();
              }, 1000);
            }
            break;

          case "chance":
            newState.cardDrawModal = { isOpen: true, cardType: "chance" };
            newState.gamePhase = "special-action";
            break;

          case "community-chest":
            newState.cardDrawModal = {
              isOpen: true,
              cardType: "community-chest",
            };
            newState.gamePhase = "special-action";
            break;

          default:
            console.log(
              `handleSpaceLanding default case: space=${space.name}, type=${space.type}`
            );
            // Handle other spaces like taxes, utilities, railroads that are not owned
            if (
              space.name?.includes("Tax") ||
              space.name?.includes("Income Tax")
            ) {
              const taxAmount = space.name?.includes("Luxury") ? 100 : 200;
              newState.players = prevState.players.map((p) =>
                p.id === playerId ? { ...p, money: p.money - taxAmount } : p
              );
              newState.gameLog = [
                ...prevState.gameLog,
                `${player.name} paid $${taxAmount} in taxes`,
              ];

              // Show tax message
              showMessage(
                `${player.name} paid $${taxAmount} in taxes`,
                "warning",
                2000
              );

              // Auto advance turn after paying tax
              setTimeout(() => {
                console.log("Advancing turn after tax payment");
                nextTurn();
              }, 2000);
            } else {
              // For any other space, just advance turn
              console.log("Advancing turn for non-property space");
              setTimeout(() => {
                console.log("Calling nextTurn()");
                nextTurn();
              }, 1000);
            }
            break;
        }

        newState.currentAction = action;
        return newState;
      });
    },
    [gameState.players, nextTurn, showMessage, updateGameState, getPropertyPrice, getPropertyRent]
  );

  // Move player
  const movePlayer = useCallback(
    (playerId: number, steps: number) => {
      // Animate movement step by step through each board space
      let currentStep = 0;
      let finalPosition = 0;
      let totalMoneyBonus = 0;

      const moveInterval = setInterval(() => {
        if (currentStep >= steps) {
          clearInterval(moveInterval);
          // Handle space landing after movement is complete
          setTimeout(() => {
            handleSpaceLanding(playerId, finalPosition);
          }, 500);
          return;
        }

        updateGameState((prevState) => {
          const newPlayers = prevState.players.map((player) => {
            if (player.id === playerId) {
              const currentPosition = player.position;
              const nextPosition = (currentPosition + 1) % 24;
              finalPosition = nextPosition;

              // Debug: Log the movement
              console.log(
                `Player ${player.id} moving from ${boardSpaces[currentPosition]?.name} (${currentPosition}) to ${boardSpaces[nextPosition]?.name} (${nextPosition})`
              );

              // Check if passing through GO (but not landing on it)
              const passedGo =
                currentPosition > nextPosition && nextPosition !== 0;
              // Check if landing on GO
              const landedOnGo = nextPosition === 0;

              let moneyBonus = 0;

              if (passedGo || landedOnGo) {
                moneyBonus = 200;
                totalMoneyBonus += moneyBonus;
              }

              return {
                ...player,
                position: nextPosition,
                money: player.money + moneyBonus,
              };
            }
            return player;
          });

          const player = newPlayers.find((p) => p.id === playerId);
          const passedOrLandedOnGo =
            player?.position === 0 ||
            (prevState.players.find((p) => p.id === playerId)?.position || 0) >
              (player?.position || 0);

          return {
            ...prevState,
            players: newPlayers,
            gameLog: passedOrLandedOnGo
              ? [
                  ...prevState.gameLog,
                  `${player?.name} ${
                    player?.position === 0 ? "landed on" : "passed"
                  } GO and collected $200`,
                ]
              : prevState.gameLog,
          };
        });

        currentStep++;
      }, 400); // Move one space every 400ms for better visibility
    },
    [handleSpaceLanding, updateGameState]
  );

  // Buy property
  const buyProperty = useCallback(
    (position: number) => {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      const price = getPropertyPrice(position);

      if (currentPlayer.money >= price) {
        updateGameState((prevState) => {
          const newPlayers = prevState.players.map((player) =>
            player.id === currentPlayer.id
              ? {
                  ...player,
                  money: player.money - price,
                  properties: [...player.properties, position],
                }
              : player
          );

          return {
            ...prevState,
            players: newPlayers,
            propertyOwnership: {
              ...prevState.propertyOwnership,
              [position]: currentPlayer.id,
            },
            gameLog: [
              ...prevState.gameLog,
              `${currentPlayer.name} bought ${boardSpaces[position]?.name} for $${price}`,
            ],
            gamePhase: "waiting",
            currentAction: undefined,
          };
        });

        // Call nextTurn after buying property
        setTimeout(() => {
          nextTurn();
        }, 500);
      }
    },
    [gameState.players, gameState.currentPlayerIndex, nextTurn, updateGameState, getPropertyPrice]
  );

  // Skip buying property
  const skipProperty = useCallback(() => {
    updateGameState((prevState) => ({
      ...prevState,
      gamePhase: "waiting",
      currentAction: undefined,
      gameLog: [
        ...prevState.gameLog,
        `${
          gameState.players[gameState.currentPlayerIndex].name
        } skipped buying property`,
      ],
    }));

    // Call nextTurn after skipping property
    setTimeout(() => {
      nextTurn();
    }, 500);
  }, [gameState.players, gameState.currentPlayerIndex, nextTurn, updateGameState]);

  // Handle dice roll
  const handleDiceRoll = useCallback(
    (total: number, dice1: number, dice2: number) => {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];

      // Check if player is in jail
      if (currentPlayer.inJail) {
        // Handle jail dice roll
        tryJailDoubles(dice1, dice2);
        return;
      }

      setGamePhase("moving");

      // Animation delay before moving
      setTimeout(() => {
        movePlayer(currentPlayer.id, total);

        // Don't automatically call nextTurn here
        // The turn should only advance after the player completes any property actions
        // nextTurn will be called after buyProperty or skipProperty
      }, 500);
    },
    [
      gameState.players,
      gameState.currentPlayerIndex,
      movePlayer,
      setGamePhase,
    ]
  );

  // Try to roll doubles to get out of jail
  const tryJailDoubles = useCallback(
    (dice1: number, dice2: number) => {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      const isDoubles = dice1 === dice2;
      const total = dice1 + dice2;
      
      console.log(`Jail roll: ${currentPlayer.name} rolled ${dice1}, ${dice2} (doubles: ${isDoubles})`);

      updateGameState((prevState) => {
        let newState = { ...prevState };

        if (isDoubles) {
          // Got doubles - get out of jail and move
          newState.players = prevState.players.map((player) =>
            player.id === currentPlayer.id
              ? { ...player, inJail: false, jailTurns: 0 }
              : player
          );
          newState.gameLog = [
            ...prevState.gameLog,
            `${currentPlayer.name} rolled doubles (${dice1}, ${dice2}) and got out of jail!`,
          ];
          newState.gamePhase = "moving";

          // Move the player after getting out
          setTimeout(() => {
            movePlayer(currentPlayer.id, total);
          }, 500);
        } else {
          // Didn't get doubles - increment jail turns
          const newJailTurns = currentPlayer.jailTurns + 1;
          newState.players = prevState.players.map((player) =>
            player.id === currentPlayer.id
              ? { ...player, jailTurns: newJailTurns }
              : player
          );

          if (newJailTurns >= 3) {
            // Must pay fine after 3 turns
            newState.players = newState.players.map((player) =>
              player.id === currentPlayer.id
                ? {
                    ...player,
                    money: player.money - 50,
                    inJail: false,
                    jailTurns: 0,
                  }
                : player
            );
            newState.gameLog = [
              ...prevState.gameLog,
              `${currentPlayer.name} rolled (${dice1}, ${dice2}) - no doubles. Forced to pay $50 after 3 turns in jail.`,
            ];
            newState.gamePhase = "moving";

            // Move the player after paying
            setTimeout(() => {
              movePlayer(currentPlayer.id, total);
            }, 500);
          } else {
            newState.gameLog = [
              ...prevState.gameLog,
              `${currentPlayer.name} rolled (${dice1}, ${dice2}) - no doubles. Turn ${newJailTurns}/3 in jail.`,
            ];
            newState.gamePhase = "waiting";

            // End turn immediately for jail turns
            setTimeout(() => {
              console.log("Jail turn ended - advancing to next player");
              nextTurn();
            }, 1000);
          }
        }

        return newState;
      });
    },
    [gameState.players, gameState.currentPlayerIndex, nextTurn, movePlayer, updateGameState]
  );

  // Pay jail fine
  const payJailFine = useCallback(() => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    if (currentPlayer.money >= 50) {
      updateGameState((prevState) => ({
        ...prevState,
        players: prevState.players.map((player) =>
          player.id === currentPlayer.id
            ? {
                ...player,
                money: player.money - 50,
                inJail: false,
                jailTurns: 0,
              }
            : player
        ),
        gameLog: [
          ...prevState.gameLog,
          `${currentPlayer.name} paid $50 to get out of jail`,
        ],
        gamePhase: "waiting",
        currentAction: undefined,
      }));

      // Call nextTurn after paying jail fine
      setTimeout(() => {
        nextTurn();
      }, 500);
    }
  }, [gameState.players, gameState.currentPlayerIndex, nextTurn, updateGameState]);

  // Use Get Out of Jail Free card
  const useJailFreeCard = useCallback(() => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const playerJailCards = drawnCards.playerJailCards[currentPlayer.id] || 0;

    if (playerJailCards > 0) {
      updateGameState((prevState) => ({
        ...prevState,
        players: prevState.players.map((player) =>
          player.id === currentPlayer.id
            ? { ...player, inJail: false, jailTurns: 0 }
            : player
        ),
        gameLog: [
          ...prevState.gameLog,
          `${currentPlayer.name} used Get Out of Jail Free card`,
        ],
        gamePhase: "waiting",
        currentAction: undefined,
      }));

      // Remove the used card
      setDrawnCards((prev) => ({
        ...prev,
        playerJailCards: {
          ...prev.playerJailCards,
          [currentPlayer.id]: playerJailCards - 1,
        },
      }));

      // Call nextTurn after using card
      setTimeout(() => {
        nextTurn();
      }, 500);
    }
  }, [gameState.players, gameState.currentPlayerIndex, drawnCards, nextTurn, updateGameState, setDrawnCards]);

  // Handle card drawn from CardDrawModal
  const handleCardDrawn = useCallback(
    (card: CardData) => {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];

      updateGameState((prevState) => {
        let newState = { ...prevState };
        let logMessage = `${currentPlayer.name}: ${card.title} - ${card.description}`;

        switch (card.action) {
          case "collect-money":
            newState.players = prevState.players.map((player) =>
              player.id === currentPlayer.id
                ? { ...player, money: player.money + card.value }
                : player
            );
            break;

          case "pay-money":
            newState.players = prevState.players.map((player) =>
              player.id === currentPlayer.id
                ? { ...player, money: Math.max(0, player.money - card.value) }
                : player
            );
            break;

          case "advance-to-go":
            newState.players = prevState.players.map((player) =>
              player.id === currentPlayer.id
                ? { ...player, position: 0, money: player.money + card.value }
                : player
            );
            break;

          case "advance-to-boardwalk":
            const boardwalkPosition = 23; // Boardwalk position
            const passedGo = boardwalkPosition < currentPlayer.position;
            newState.players = prevState.players.map((player) =>
              player.id === currentPlayer.id
                ? {
                    ...player,
                    position: boardwalkPosition,
                    money: player.money + (passedGo ? 200 : 0),
                  }
                : player
            );
            if (passedGo) {
              logMessage += " (Collected $200 for passing GO)";
            }
            break;

          case "go-to-jail":
            newState.players = prevState.players.map((player) =>
              player.id === currentPlayer.id
                ? { ...player, position: 6, inJail: true, jailTurns: 0 } // Position 6 is JAIL
                : player
            );
            break;

          case "get-out-of-jail":
            // Add "Get Out of Jail Free" card to player's inventory
            setDrawnCards((prev) => ({
              ...prev,
              playerJailCards: {
                ...prev.playerJailCards,
                [currentPlayer.id]:
                  (prev.playerJailCards[currentPlayer.id] || 0) + 1,
              },
            }));
            break;

          case "collect-from-players":
            const totalCollected = (gameState.players.length - 1) * card.value;
            newState.players = prevState.players.map((player) => {
              if (player.id === currentPlayer.id) {
                return { ...player, money: player.money + totalCollected };
              } else {
                return {
                  ...player,
                  money: Math.max(0, player.money - card.value),
                };
              }
            });
            break;

          case "pay-each-player":
            const totalPaid = (gameState.players.length - 1) * card.value;
            newState.players = prevState.players.map((player) => {
              if (player.id === currentPlayer.id) {
                return {
                  ...player,
                  money: Math.max(0, player.money - totalPaid),
                };
              } else {
                return { ...player, money: player.money + card.value };
              }
            });
            break;

          case "street-repairs":
            let repairCost = 0;
            currentPlayer.properties.forEach((propIndex) => {
              const buildings = gameState.propertyBuildings[propIndex];
              if (buildings) {
                repairCost += buildings.houses * 40;
                if (buildings.hasHotel) {
                  repairCost += 115;
                }
              }
            });

            newState.players = prevState.players.map((player) =>
              player.id === currentPlayer.id
                ? { ...player, money: Math.max(0, player.money - repairCost) }
                : player
            );
            logMessage += ` (Paid $${repairCost} for repairs)`;
            break;

          default:
            break;
        }

        // Add to game log
        newState.gameLog = [...prevState.gameLog, logMessage];

        // Set current message
        newState.currentMessage = {
          text: card.description,
          type:
            card.action.includes("collect") ||
            card.action.includes("advance-to-go")
              ? "success"
              : "info",
          duration: 3000,
        };

        // Keep the card modal open to show the drawn card
        // Modal will be closed when user clicks "Apply Card Effect"

        return newState;
      });

      // Call nextTurn after handling the card
      setTimeout(() => {
        nextTurn();
      }, 1000);
    },
    [
      gameState.players,
      gameState.currentPlayerIndex,
      gameState.propertyBuildings,
      nextTurn,
      setDrawnCards,
      updateGameState,
    ]
  );

  // Close card modal and advance turn
  const closeCardModal = useCallback(() => {
    updateGameState((prevState) => ({
      ...prevState,
      cardDrawModal: { isOpen: false, cardType: "chance" },
      gamePhase: "waiting",
    }));
    nextTurn();
  }, [nextTurn, updateGameState]);

  // Handle Chance/Community Chest cards
  const handleSpecialCard = useCallback(
    (cardType: "chance" | "community-chest") => {
      const cards = cardType === "chance" ? chanceCards : communityChestCards;
      const currentIndex =
        cardType === "chance"
          ? drawnCards.chanceIndex
          : drawnCards.communityChestIndex;
      const card = cards[currentIndex];
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];

      // Update card index for next draw
      setDrawnCards((prev) => ({
        ...prev,
        [cardType === "chance" ? "chanceIndex" : "communityChestIndex"]:
          (currentIndex + 1) % cards.length,
      }));

      updateGameState((prevState) => {
        let newState = { ...prevState };
        let logMessage = `${currentPlayer.name}: ${card.description}`;

        switch (card.action) {
          case "collect-money":
            newState.players = prevState.players.map((player) =>
              player.id === currentPlayer.id
                ? { ...player, money: player.money + card.value }
                : player
            );
            break;

          case "pay-money":
            newState.players = prevState.players.map((player) =>
              player.id === currentPlayer.id
                ? { ...player, money: Math.max(0, player.money - card.value) }
                : player
            );
            break;

          case "advance-to-go":
            newState.players = prevState.players.map((player) =>
              player.id === currentPlayer.id
                ? { ...player, position: 0, money: player.money + card.value }
                : player
            );
            break;

          case "advance-to-boardwalk":
            const boardwalkPosition = 23; // Boardwalk position
            const passedGo = boardwalkPosition < currentPlayer.position;
            newState.players = prevState.players.map((player) =>
              player.id === currentPlayer.id
                ? {
                    ...player,
                    position: boardwalkPosition,
                    money: player.money + (passedGo ? 200 : 0),
                  }
                : player
            );
            if (passedGo) {
              logMessage += " (Collected $200 for passing GO)";
            }
            break;

          case "go-to-jail":
            newState.players = prevState.players.map((player) =>
              player.id === currentPlayer.id
                ? { ...player, position: 6, inJail: true, jailTurns: 0 } // Position 6 is JAIL
                : player
            );
            break;

          case "get-out-of-jail":
            // Add "Get Out of Jail Free" card to player's inventory
            setDrawnCards((prev) => ({
              ...prev,
              playerJailCards: {
                ...prev.playerJailCards,
                [currentPlayer.id]:
                  (prev.playerJailCards[currentPlayer.id] || 0) + 1,
              },
            }));
            break;

          case "collect-from-players":
            const totalCollected = (gameState.players.length - 1) * card.value;
            newState.players = prevState.players.map((player) => {
              if (player.id === currentPlayer.id) {
                return { ...player, money: player.money + totalCollected };
              } else {
                return {
                  ...player,
                  money: Math.max(0, player.money - card.value),
                };
              }
            });
            break;

          case "pay-each-player":
            const totalPaid = (gameState.players.length - 1) * card.value;
            newState.players = prevState.players.map((player) => {
              if (player.id === currentPlayer.id) {
                return {
                  ...player,
                  money: Math.max(0, player.money - totalPaid),
                };
              } else {
                return { ...player, money: player.money + card.value };
              }
            });
            break;

          case "street-repairs":
            let repairCost = 0;
            currentPlayer.properties.forEach((propIndex) => {
              const buildings = gameState.propertyBuildings[propIndex];
              if (buildings) {
                repairCost += buildings.houses * 40;
                if (buildings.hasHotel) {
                  repairCost += 115;
                }
              }
            });

            newState.players = prevState.players.map((player) =>
              player.id === currentPlayer.id
                ? { ...player, money: Math.max(0, player.money - repairCost) }
                : player
            );
            logMessage += ` (Paid $${repairCost} for repairs)`;
            break;

          default:
            break;
        }

        return {
          ...newState,
          gameLog: [...prevState.gameLog, logMessage],
          gamePhase: "waiting",
          currentAction: undefined,
        };
      });

      // Call nextTurn after handling the special card
      setTimeout(() => {
        nextTurn();
      }, 500);
    },
    [
      gameState.players,
      gameState.currentPlayerIndex,
      nextTurn,
      drawnCards,
      updateGameState,
      setDrawnCards,
    ]
  );

  return {
    gameState,
    drawnCards,
    currentPlayer: gameState.players[gameState.currentPlayerIndex],
    handleDiceRoll,
    movePlayer,
    nextTurn,
    setGamePhase,
    buyProperty,
    skipProperty,
    handleSpaceLanding,
    payJailFine,
    useJailFreeCard,
    tryJailDoubles,
    handleCardDrawn,
    closeCardModal,
    handleSpecialCard,
    addMoney,
    getPropertyPrice,
    getPropertyRent,
    ownsFullColorGroup: (playerId: number, position: number) => ownsFullColorGroup(playerId, position, gameState),
  };
};
