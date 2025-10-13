import { Text } from '@/components/ui/text';
import { boardData, colorMap, type BoardSpace } from '@/config/board-data';
import { Player } from '@/types/game';
import * as React from 'react';
import { View, Dimensions } from 'react-native';

interface MonopolyBoardProps {
  players: (Player & { position: number })[];
  currentPlayerIndex: number;
}

interface BoardSpaceProps {
  space: BoardSpace;
  players: (Player & { position: number })[];
  isCorner?: boolean;
  rotation?: 'normal' | 'left' | 'top' | 'right';
  spaceWidth: number;
  spaceHeight: number;
  cornerSize: number;
}

function BoardSpace({ 
  space, 
  players, 
  isCorner = false, 
  rotation = 'normal',
  spaceWidth,
  spaceHeight,
  cornerSize
}: BoardSpaceProps) {
  const playersOnSpace = players.filter(player => player.position === space.position);
  
  const getRotationStyle = () => {
    switch (rotation) {
      case 'left':
        return 'rotate-90';
      case 'top':
        return 'rotate-180';
      case 'right':
        return '-rotate-90';
      default:
        return '';
    }
  };

  const getColorBar = () => {
    if (space.type === 'property') {
      const color = colorMap[space.colorGroup];
      return (
        <View 
          className="w-full rounded-t-sm"
          style={{ 
            backgroundColor: color,
            height: isCorner ? cornerSize * 0.15 : spaceHeight * 0.2
          }}
        />
      );
    }
    return null;
  };

  const getSpaceIcon = () => {
    switch (space.type) {
      case 'corner':
        if (space.position === 0) return '🏁'; // GO
        if (space.position === 10) return '🏛️'; // Jail
        if (space.position === 20) return '🅿️'; // Free Parking
        if (space.position === 30) return '👮'; // Go to Jail
        break;
      case 'chance':
        return '❓';
      case 'community-chest':
        return '📦';
      case 'tax':
        return '💰';
      case 'railroad':
        return '🚂';
      case 'utility':
        return '⚡';
    }
    return null;
  };

  const getPrice = () => {
    if ('price' in space) {
      return `$${space.price}`;
    }
    if (space.type === 'tax' && 'taxAmount' in space) {
      return `$${space.taxAmount}`;
    }
    return null;
  };

  if (isCorner) {
    return (
      <View 
        className="bg-white border border-gray-300 rounded-sm items-center justify-center relative"
        style={{ 
          width: cornerSize, 
          height: cornerSize,
          minWidth: cornerSize,
          minHeight: cornerSize
        }}
      >
        <Text className="text-lg">{getSpaceIcon()}</Text>
        <Text 
          className="text-xs text-center font-semibold mt-1 text-black" 
          numberOfLines={2}
          style={{ fontSize: Math.max(8, cornerSize * 0.08) }}
        >
          {space.name}
        </Text>
        
        {/* Players on this space */}
        {playersOnSpace.length > 0 && (
          <View className="absolute -top-1 -right-1 flex-row">
            {playersOnSpace.slice(0, 2).map((player, index) => (
              <View
                key={player.id}
                className="rounded-full border border-white items-center justify-center"
                style={{ 
                  backgroundColor: player.color,
                  marginLeft: index > 0 ? -2 : 0,
                  zIndex: playersOnSpace.length - index,
                  width: cornerSize * 0.15,
                  height: cornerSize * 0.15
                }}
              >
                <Text style={{ fontSize: cornerSize * 0.08 }}>{player.avatar}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }

  return (
    <View 
      className={`bg-white border border-gray-300 rounded-sm overflow-hidden relative ${getRotationStyle()}`}
      style={{ 
        width: spaceWidth, 
        height: spaceHeight,
        minWidth: spaceWidth,
        minHeight: spaceHeight
      }}
    >
      {getColorBar()}
      
      <View className="flex-1 p-1 items-center justify-center">
        {getSpaceIcon() && (
          <Text 
            className="mb-1" 
            style={{ fontSize: Math.max(10, spaceWidth * 0.15) }}
          >
            {getSpaceIcon()}
          </Text>
        )}
        
        <Text 
          className="text-center font-semibold text-black" 
          numberOfLines={2}
          style={{ fontSize: Math.max(6, spaceWidth * 0.08) }}
        >
          {space.name}
        </Text>
        
        {getPrice() && (
          <Text 
            className="text-green-600 font-bold mt-1"
            style={{ fontSize: Math.max(6, spaceWidth * 0.08) }}
          >
            {getPrice()}
          </Text>
        )}
      </View>

      {/* Players on this space */}
      {playersOnSpace.length > 0 && (
        <View className="absolute -top-1 -right-1 flex-row">
          {playersOnSpace.slice(0, 2).map((player, index) => (
            <View
              key={player.id}
              className="rounded-full border border-white items-center justify-center"
              style={{ 
                backgroundColor: player.color,
                marginLeft: index > 0 ? -1 : 0,
                zIndex: playersOnSpace.length - index,
                width: spaceWidth * 0.12,
                height: spaceWidth * 0.12
              }}
            >
              <Text style={{ fontSize: spaceWidth * 0.08 }}>{player.avatar}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export function MonopolyBoard({ players, currentPlayerIndex }: MonopolyBoardProps) {
  const screenWidth = Dimensions.get('window').width;
  const boardSize = Math.min(screenWidth - 32, 400); // Max 400px, with 16px padding on each side
  
  // Calculate space dimensions based on board size
  const cornerSize = boardSize * 0.12; // 12% of board size for corners
  const spaceWidth = (boardSize - 2 * cornerSize) / 9; // 9 regular spaces between corners
  const spaceHeight = cornerSize; // Same height as corner for proper alignment

  // Organize spaces by board sides
  const bottomSpaces = boardData.slice(0, 11); // 0-10 (GO to Jail)
  const leftSpaces = boardData.slice(11, 20); // 11-19 (left side)
  const topSpaces = boardData.slice(20, 31).reverse(); // 20-30 (top side, reversed)
  const rightSpaces = boardData.slice(31, 40).reverse(); // 31-39 (right side, reversed)

  return (
    <View className="items-center justify-center p-4">
      {/* Board Container */}
      <View 
        className="bg-green-100 rounded-lg p-1"
        style={{ 
          width: boardSize + 8, 
          height: boardSize + 8 
        }}
      >
        <View 
          className="bg-green-200 rounded-md"
          style={{ 
            width: boardSize, 
            height: boardSize 
          }}
        >
          
          {/* Top Row */}
          <View className="flex-row justify-between items-start">
            {/* Top-left corner (Free Parking) */}
            <BoardSpace 
              space={topSpaces[0]} 
              players={players} 
              isCorner={true}
              spaceWidth={spaceWidth}
              spaceHeight={spaceHeight}
              cornerSize={cornerSize}
            />
            
            {/* Top edge spaces */}
            <View className="flex-row">
              {topSpaces.slice(1, -1).map((space) => (
                <BoardSpace 
                  key={space.position} 
                  space={space} 
                  players={players}
                  rotation="top"
                  spaceWidth={spaceWidth}
                  spaceHeight={spaceHeight}
                  cornerSize={cornerSize}
                />
              ))}
            </View>
            
            {/* Top-right corner (Go to Jail) */}
            <BoardSpace 
              space={topSpaces[topSpaces.length - 1]} 
              players={players} 
              isCorner={true}
              spaceWidth={spaceWidth}
              spaceHeight={spaceHeight}
              cornerSize={cornerSize}
            />
          </View>

          {/* Middle Section */}
          <View 
            className="flex-row justify-between"
            style={{ height: boardSize - 2 * cornerSize }}
          >
            {/* Left edge */}
            <View className="justify-between">
              {leftSpaces.map((space) => (
                <BoardSpace 
                  key={space.position} 
                  space={space} 
                  players={players}
                  rotation="left"
                  spaceWidth={spaceHeight}
                  spaceHeight={spaceWidth}
                  cornerSize={cornerSize}
                />
              ))}
            </View>

            {/* Center area - Game info */}
            <View 
              className="items-center justify-center"
              style={{ 
                width: boardSize - 2 * cornerSize - 2 * spaceHeight,
                height: boardSize - 2 * cornerSize
              }}
            >
              <View className="bg-white border border-gray-300 rounded-lg p-3 items-center">
                <Text className="text-lg font-bold text-black mb-1">MONOPOLY</Text>
                <Text className="text-sm font-semibold text-black">Solana Edition</Text>
                <View className="mt-3 items-center">
                  <Text className="text-xs text-gray-600">Current Player:</Text>
                  <View className="flex-row items-center gap-2 mt-1">
                    <View 
                      className="w-4 h-4 rounded-full items-center justify-center"
                      style={{ backgroundColor: players[currentPlayerIndex]?.color }}
                    >
                      <Text className="text-xs">{players[currentPlayerIndex]?.avatar}</Text>
                    </View>
                    <Text className="font-semibold text-xs text-black">{players[currentPlayerIndex]?.name}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Right edge */}
            <View className="justify-between">
              {rightSpaces.map((space) => (
                <BoardSpace 
                  key={space.position} 
                  space={space} 
                  players={players}
                  rotation="right"
                  spaceWidth={spaceHeight}
                  spaceHeight={spaceWidth}
                  cornerSize={cornerSize}
                />
              ))}
            </View>
          </View>

          {/* Bottom Row */}
          <View className="flex-row justify-between items-end">
            {/* Bottom-left corner (Jail) */}
            <BoardSpace 
              space={bottomSpaces[10]} 
              players={players} 
              isCorner={true}
              spaceWidth={spaceWidth}
              spaceHeight={spaceHeight}
              cornerSize={cornerSize}
            />
            
            {/* Bottom edge spaces */}
            <View className="flex-row">
              {bottomSpaces.slice(1, 10).reverse().map((space) => (
                <BoardSpace 
                  key={space.position} 
                  space={space} 
                  players={players}
                  rotation="normal"
                  spaceWidth={spaceWidth}
                  spaceHeight={spaceHeight}
                  cornerSize={cornerSize}
                />
              ))}
            </View>
            
            {/* Bottom-right corner (GO) */}
            <BoardSpace 
              space={bottomSpaces[0]} 
              players={players} 
              isCorner={true}
              spaceWidth={spaceWidth}
              spaceHeight={spaceHeight}
              cornerSize={cornerSize}
            />
          </View>
        </View>
      </View>
    </View>
  );
}