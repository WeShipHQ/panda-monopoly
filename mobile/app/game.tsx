import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { MonopolyBoard } from '@/components/MonopolyBoard';
import { boardData, colorMap } from '@/config/board-data';
import { mockGameRooms, mockPlayers } from '@/data/mock-data';
import { Player } from '@/types/game';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Plus, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { View, ScrollView } from 'react-native';

const SCREEN_OPTIONS = {
  title: 'Monopoly Game',
  headerShown: false,
};

// Extended game state interface
interface GameState {
  currentPlayerIndex: number;
  players: (Player & { 
    balance: number; 
    position: number; 
    properties: number[]; 
  })[];
  turn: number;
  gamePhase: 'waiting' | 'playing' | 'ended';
  lastRoll?: [number, number];
}

// Mock game state with some sample data for demonstration
const createInitialGameState = (roomPlayers: Player[]): GameState => {
  return {
    currentPlayerIndex: 0,
    turn: 1,
    gamePhase: 'playing',
    players: roomPlayers.map((player, index) => ({
      ...player,
      balance: 1500, // Starting money in Monopoly
      position: index * 10, // Spread players around for demo
      properties: index === 0 ? [1, 3] : index === 1 ? [6, 8] : [], // Give some properties for demo
    })),
  };
};

interface PlayerListProps {
  gameState: GameState;
}

function PlayerList({ gameState }: PlayerListProps) {
  return (
    <View className="bg-card border border-border rounded-lg p-4 mb-4">
      <Text variant="h4" className="mb-3">Players</Text>
      {gameState.players.map((player, index) => (
        <View 
          key={player.id} 
          className={`flex-row items-center justify-between p-3 rounded-lg mb-2 ${
            index === gameState.currentPlayerIndex 
              ? 'bg-primary/10 border border-primary/20' 
              : 'bg-muted/50'
          }`}
        >
          <View className="flex-row items-center gap-3">
            <View 
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: player.color }}
            >
              <Text className="text-lg">{player.avatar}</Text>
            </View>
            <View>
              <Text variant="large" className="font-semibold">
                {player.name}
                {index === gameState.currentPlayerIndex && (
                  <Text className="text-primary"> (Current)</Text>
                )}
              </Text>
              <Text variant="small" className="text-muted-foreground">
                Position: {player.position}
              </Text>
            </View>
          </View>
          <Text variant="large" className="font-bold text-green-600">
            ${player.balance}
          </Text>
        </View>
      ))}
    </View>
  );
}

interface PropertiesListProps {
  currentPlayer: GameState['players'][0];
}

function PropertiesList({ currentPlayer }: PropertiesListProps) {
  const getPropertyDetails = (propertyId: number) => {
    return boardData.find(space => space.position === propertyId);
  };

  return (
    <View className="bg-card border border-border rounded-lg p-4 mb-4">
      <Text variant="h4" className="mb-3">My Properties</Text>
      {currentPlayer.properties.length === 0 ? (
        <Text className="text-muted-foreground text-center py-4">
          No properties owned yet
        </Text>
      ) : (
        currentPlayer.properties.map((propertyId) => {
          const property = getPropertyDetails(propertyId);
          if (!property) return null;

          const getPropertyColor = () => {
            if (property.type === 'property') {
              return colorMap[property.colorGroup];
            }
            return '#6b7280'; // gray for non-property spaces
          };

          const getPropertyPrice = () => {
            if ('price' in property) {
              return `$${property.price}`;
            }
            return '';
          };

          return (
            <View key={propertyId} className="flex-row items-center p-3 bg-muted/50 rounded-lg mb-2">
              <View 
                className="w-4 h-4 rounded mr-3"
                style={{ backgroundColor: getPropertyColor() }}
              />
              <View className="flex-1">
                <Text className="font-semibold">{property.name}</Text>
                <Text className="text-sm text-muted-foreground">
                  {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                  {getPropertyPrice() && ` • ${getPropertyPrice()}`}
                </Text>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}

interface TradeManagementProps {
  onCreateTrade: () => void;
  onRollDice: () => void;
  gameState: GameState;
}

function TradeManagement({ onCreateTrade, onRollDice, gameState }: TradeManagementProps) {
  const getDiceIcon = (value: number) => {
    switch (value) {
      case 1: return Dice1;
      case 2: return Dice2;
      case 3: return Dice3;
      case 4: return Dice4;
      case 5: return Dice5;
      case 6: return Dice6;
      default: return Dice1;
    }
  };

  return (
    <View className="bg-card border border-border rounded-lg p-4">
      <Text variant="h4" className="mb-3">Game Actions</Text>
      
      {/* Dice Roll Section */}
      <View className="mb-4">
        <Text className="font-semibold mb-2">Roll Dice</Text>
        {gameState.lastRoll && (
          <View className="flex-row items-center gap-2 mb-2">
            <Text className="text-sm text-muted-foreground">Last roll:</Text>
            <Icon as={getDiceIcon(gameState.lastRoll[0])} className="w-6 h-6" />
            <Icon as={getDiceIcon(gameState.lastRoll[1])} className="w-6 h-6" />
            <Text className="font-semibold">= {gameState.lastRoll[0] + gameState.lastRoll[1]}</Text>
          </View>
        )}
        <Button onPress={onRollDice} className="w-full mb-4">
          <Text>Roll Dice</Text>
        </Button>
      </View>

      {/* Trade Section */}
      <View>
        <Text className="font-semibold mb-2">Trading</Text>
        <Text className="text-muted-foreground mb-3 text-sm">
          Create and manage trades with other players
        </Text>
        <Button onPress={onCreateTrade} variant="outline" className="w-full">
          <Icon as={Plus} className="w-4 h-4 mr-2" />
          <Text>Create Trade</Text>
        </Button>
      </View>
    </View>
  );
}

export default function GameScreen() {
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  
  // Find the room and initialize game state
  const room = React.useMemo(() => {
    return mockGameRooms.find(r => r.id === roomId);
  }, [roomId]);

  const [gameState, setGameState] = React.useState<GameState>(() => {
    if (room) {
      return createInitialGameState(room.players);
    }
    // Fallback to mock players if room not found
    return createInitialGameState(mockPlayers.slice(0, 4));
  });

  const handleCreateTrade = () => {
    console.log('Creating trade...');
    // TODO: Implement trade creation logic
  };

  const handleRollDice = () => {
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const total = dice1 + dice2;
    
    setGameState(prevState => {
      const newState = { ...prevState };
      newState.lastRoll = [dice1, dice2];
      
      // Move current player
      const currentPlayer = newState.players[newState.currentPlayerIndex];
      const newPosition = (currentPlayer.position + total) % 40;
      newState.players[newState.currentPlayerIndex] = {
        ...currentPlayer,
        position: newPosition
      };
      
      // Check if passed GO (position 0)
      if (currentPlayer.position + total >= 40) {
        newState.players[newState.currentPlayerIndex].balance += 200; // Collect $200 for passing GO
      }
      
      // Move to next player
      newState.currentPlayerIndex = (newState.currentPlayerIndex + 1) % newState.players.length;
      if (newState.currentPlayerIndex === 0) {
        newState.turn += 1;
      }
      
      return newState;
    });
    
    console.log(`Rolled ${dice1} + ${dice2} = ${total}`);
  };

  const handleGoBack = () => {
    router.back();
  };

  if (!room) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text>Room not found</Text>
        <Button onPress={handleGoBack} className="mt-4">
          <Text>Go Back</Text>
        </Button>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="bg-card border-b border-border px-4 py-3 pt-12">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Button size="icon" variant="ghost" onPress={handleGoBack}>
                <Icon as={ArrowLeft} className="w-5 h-5" />
              </Button>
              <View>
                <Text variant="h3">Room {room.id.split('-')[1]}</Text>
                <Text variant="small" className="text-muted-foreground">
                  Turn {gameState.turn} • {gameState.players[gameState.currentPlayerIndex].name}'s turn
                </Text>
              </View>
            </View>
          </View>
        </View>

        <ScrollView className="flex-1">
          {/* Game Board */}
          <View className="p-4">
            <MonopolyBoard 
              players={gameState.players}
              currentPlayerIndex={gameState.currentPlayerIndex}
            />

            {/* Two Column Layout */}
            <View className="flex-row gap-4">
              {/* Left Column */}
              <View className="flex-1">
                <PlayerList gameState={gameState} />
                <PropertiesList currentPlayer={gameState.players[gameState.currentPlayerIndex]} />
              </View>

              {/* Right Column */}
              <View className="flex-1">
                <TradeManagement 
                  onCreateTrade={handleCreateTrade} 
                  onRollDice={handleRollDice}
                  gameState={gameState}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}