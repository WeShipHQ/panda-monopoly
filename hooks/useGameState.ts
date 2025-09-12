import { useState, useCallback } from "react";
import { GameState, DrawnCards } from "./types";

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    players: [
      {
        id: 1,
        name: "Blue Baron",
        color: "#4444ff",
        avatar: "/images/blue-figure.png",
        position: 0,
        money: 1500,
        properties: [],
        inJail: false,
        jailTurns: 0,
      },
      {
        id: 2,
        name: "Green Giant",
        color: "#44ff44",
        avatar: "/images/green-figure.png",
        position: 0,
        money: 1500,
        properties: [],
        inJail: false,
        jailTurns: 0,
      },
      {
        id: 3,
        name: "Red Tycoon",
        color: "#ff4444",
        avatar: "/images/red-figure.png",
        position: 0,
        money: 1500,
        properties: [],
        inJail: false,
        jailTurns: 0,
      },
      {
        id: 4,
        name: "Yellow Mogul",
        color: "#ffdd44",
        avatar: "/images/yellow-figure.png",
        position: 0,
        money: 1500,
        properties: [],
        inJail: false,
        jailTurns: 0,
      },
    ],
    currentPlayerIndex: 0,
    gamePhase: "waiting",
    propertyOwnership: {},
    propertyBuildings: {},
    mortgagedProperties: [],
    gameLog: ["Game started!"],
  });

  const [drawnCards, setDrawnCards] = useState<DrawnCards>({
    chanceIndex: 0,
    communityChestIndex: 0,
    playerJailCards: {},
  });

  const updateGameState = useCallback((updater: (prevState: GameState) => GameState) => {
    setGameState(updater);
  }, []);

  const setGamePhase = useCallback((phase: GameState["gamePhase"]) => {
    setGameState((prevState) => ({
      ...prevState,
      gamePhase: phase,
    }));
  }, []);

  const nextTurn = useCallback(() => {
    console.log("nextTurn called - advancing to next player");
    setGameState((prevState) => {
      const newPlayerIndex =
        (prevState.currentPlayerIndex + 1) % prevState.players.length;
      const newPlayer = prevState.players[newPlayerIndex];
      console.log(
        `Turn advanced from player ${prevState.currentPlayerIndex} to player ${newPlayerIndex} (${newPlayer.name})`
      );

      return {
        ...prevState,
        currentPlayerIndex: newPlayerIndex,
        gamePhase: "waiting",
        currentAction: undefined,
        currentMessage: undefined,
      };
    });
  }, []);

  const showMessage = useCallback(
    (
      text: string,
      type: "info" | "warning" | "success" | "error" = "info",
      duration: number = 3000
    ) => {
      setGameState((prevState) => ({
        ...prevState,
        currentMessage: { text, type, duration },
      }));

      // Clear message after duration
      setTimeout(() => {
        setGameState((prevState) => ({
          ...prevState,
          currentMessage: undefined,
        }));
      }, duration);
    },
    []
  );

  return {
    gameState,
    drawnCards,
    setDrawnCards,
    updateGameState,
    setGamePhase,
    nextTurn,
    showMessage,
  };
};
