import { Text } from '@/components/ui/text';
import { boardData, colorMap, type BoardSpace } from '@/config/board-data';
import { Player } from '@/types/game';
import * as React from 'react';
import { View, Dimensions, ScrollView, useWindowDimensions } from 'react-native';

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

  const getColorBar = () => {
    if (space.type === 'property') {
      const color = colorMap[space.colorGroup];
      
      // Different color bar placement based on rotation
      // Color bar should be at the start of reading direction
      if (rotation === 'left') {
        // Reading from bottom to top, so color bar at bottom
        return (
          <View 
            className="h-full rounded-r-sm"
            style={{ 
              backgroundColor: color,
              width: spaceWidth * 0.25
            }}
          />
        );
      } else if (rotation === 'right') {
        // Reading from top to bottom, so color bar at top
        return (
          <View 
            className="h-full rounded-l-sm"
            style={{ 
              backgroundColor: color,
              width: spaceWidth * 0.25
            }}
          />
        );
      } else if (rotation === 'top') {
        // Reading from right to left (upside down), so color bar at right side (which appears at top when rotated)
        return (
          <View 
            className="w-full rounded-b-sm"
            style={{ 
              backgroundColor: color,
              height: spaceHeight * 0.25
            }}
          />
        );
      } else {
        // Bottom row: normal reading, color bar at top
        return (
          <View 
            className="w-full rounded-t-sm"
            style={{ 
              backgroundColor: color,
              height: spaceHeight * 0.25
            }}
          />
        );
      }
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
        className="bg-white border border-gray-400 rounded-sm items-center justify-center relative overflow-hidden"
        style={{ 
          width: cornerSize, 
          height: cornerSize,
          minWidth: cornerSize,
          minHeight: cornerSize
        }}
      >
        <Text className="text-lg" style={{ fontSize: cornerSize * 0.2 }}>
          {getSpaceIcon()}
        </Text>
        <Text 
          className="text-center font-bold px-1 text-black" 
          numberOfLines={2}
          adjustsFontSizeToFit
          style={{ 
            fontSize: Math.max(7, cornerSize * 0.09),
            lineHeight: Math.max(9, cornerSize * 0.11)
          }}
        >
          {space.name}
        </Text>
        
        {/* Players on this space */}
        {playersOnSpace.length > 0 && (
          <View className="absolute -top-0.5 -right-0.5 flex-row">
            {playersOnSpace.slice(0, 2).map((player, index) => (
              <View
                key={player.id}
                className="rounded-full border border-white items-center justify-center"
                style={{ 
                  backgroundColor: player.color,
                  marginLeft: index > 0 ? -3 : 0,
                  zIndex: playersOnSpace.length - index,
                  width: Math.max(14, cornerSize * 0.18),
                  height: Math.max(14, cornerSize * 0.18)
                }}
              >
                <Text style={{ fontSize: Math.max(8, cornerSize * 0.1) }}>
                  {player.avatar}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }

  // Layout for left and right edges (vertical orientation)
  if (rotation === 'left' || rotation === 'right') {
    const rotationDegree = rotation === 'left' ? '90deg' : '-90deg';
    
    return (
      <View 
        className="bg-white border border-gray-400 rounded-sm overflow-hidden relative"
        style={{ 
          width: spaceWidth,
          height: spaceHeight,
          minWidth: spaceWidth,
          minHeight: spaceHeight,
          // Left edge: color bar should be on RIGHT side (near center)
          // Right edge: color bar should be on LEFT side (near center)
          flexDirection: rotation === 'left' ? 'row-reverse' : 'row'
        }}
      >
        {getColorBar()}
        
        <View 
          className="flex-1 items-center justify-center"
          style={{
            transform: [{ rotate: rotationDegree }],
            paddingVertical: 2
          }}
        >
          {getSpaceIcon() && (
            <Text 
              style={{ 
                fontSize: Math.max(8, spaceWidth * 0.16),
                marginBottom: 0.5
              }}
            >
              {getSpaceIcon()}
            </Text>
          )}
          
          <Text 
            className="text-center font-bold text-black" 
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.5}
            style={{ 
              fontSize: Math.max(5, spaceWidth * 0.09),
              lineHeight: Math.max(6, spaceWidth * 0.105),
              maxWidth: spaceHeight * 0.85,
              paddingHorizontal: 1
            }}
          >
            {space.name}
          </Text>
          
          {getPrice() && (
            <Text 
              className="text-green-600 font-bold"
              numberOfLines={1}
              style={{ 
                fontSize: Math.max(5, spaceWidth * 0.085),
                marginTop: 0.5
              }}
            >
              {getPrice()}
            </Text>
          )}
        </View>

        {/* Players on this space */}
        {playersOnSpace.length > 0 && (
          <View className="absolute -top-0.5 -right-0.5 flex-row">
            {playersOnSpace.slice(0, 2).map((player, index) => (
              <View
                key={player.id}
                className="rounded-full border border-white items-center justify-center"
                style={{ 
                  backgroundColor: player.color,
                  marginLeft: index > 0 ? -2 : 0,
                  zIndex: playersOnSpace.length - index,
                  width: Math.max(10, spaceWidth * 0.15),
                  height: Math.max(10, spaceWidth * 0.15)
                }}
              >
                <Text style={{ fontSize: Math.max(6, spaceWidth * 0.1) }}>
                  {player.avatar}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }

  // Layout for top and bottom edges (horizontal orientation)
  return (
    <View 
      className="bg-white border border-gray-400 rounded-sm overflow-hidden relative"
      style={{ 
        width: spaceWidth, 
        height: spaceHeight,
        minWidth: spaceWidth,
        minHeight: spaceHeight,
        flexDirection: 'column'
      }}
    >
      {/* Color bar: top for bottom row, bottom for top row (so it's near center) */}
      {rotation !== 'top' && getColorBar()}
      
      <View 
        className="flex-1 items-center justify-center"
        style={rotation === 'top' ? { transform: [{ rotate: '180deg' }], paddingHorizontal: 2 } : { paddingHorizontal: 2 }}
      >
        {getSpaceIcon() && (
          <Text 
            style={{ 
              fontSize: Math.max(8, spaceWidth * 0.16),
              marginBottom: 0.5
            }}
          >
            {getSpaceIcon()}
          </Text>
        )}
        
        <Text 
          className="text-center font-bold text-black" 
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
          style={{ 
            fontSize: Math.max(5, spaceWidth * 0.09),
            lineHeight: Math.max(6, spaceWidth * 0.105),
            paddingHorizontal: 1
          }}
        >
          {space.name}
        </Text>
        
        {getPrice() && (
          <Text 
            className="text-green-600 font-bold"
            numberOfLines={1}
            style={{ 
              fontSize: Math.max(5, spaceWidth * 0.085),
              marginTop: 0.5
            }}
          >
            {getPrice()}
          </Text>
        )}
      </View>
      
      {/* Color bar at bottom for top row (near center when rotated) */}
      {rotation === 'top' && getColorBar()}

      {/* Players on this space */}
      {playersOnSpace.length > 0 && (
        <View className="absolute -top-0.5 -right-0.5 flex-row">
          {playersOnSpace.slice(0, 2).map((player, index) => (
            <View
              key={player.id}
              className="rounded-full border border-white items-center justify-center"
              style={{ 
                backgroundColor: player.color,
                marginLeft: index > 0 ? -2 : 0,
                zIndex: playersOnSpace.length - index,
                width: Math.max(10, spaceWidth * 0.15),
                height: Math.max(10, spaceWidth * 0.15)
              }}
            >
              <Text style={{ fontSize: Math.max(6, spaceWidth * 0.1) }}>
                {player.avatar}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export function MonopolyBoard({ players, currentPlayerIndex }: MonopolyBoardProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  
  // Calculate board size to fit the screen properly
  const maxBoardSize = Math.min(screenWidth, screenHeight) - 16; // 8px padding on each side
  const boardSize = Math.min(maxBoardSize, 500); // Max 500px for tablets
  
  // Calculate space dimensions based on board size - optimized for mobile
  const cornerSize = Math.max(boardSize * 0.13, 50); // 13% of board size, minimum 50px
  const spaceWidth = (boardSize - 2 * cornerSize) / 9; // 9 regular spaces between corners
  const spaceHeight = cornerSize; // Same height as corner for proper alignment

  // Organize spaces by board sides
  const bottomSpaces = boardData.slice(0, 11); // 0-10 (GO to Jail)
  const leftSpaces = boardData.slice(11, 20); // 11-19 (left side)
  const topSpaces = boardData.slice(20, 31).reverse(); // 20-30 (top side, reversed)
  const rightSpaces = boardData.slice(31, 40).reverse(); // 31-39 (right side, reversed)

  return (
    <ScrollView 
      contentContainerStyle={{ 
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8
      }}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      bounces={false}
    >
      {/* Board Container */}
      <View 
        className="bg-green-100 rounded-lg shadow-lg"
        style={{ 
          width: boardSize + 4, 
          height: boardSize + 4,
          padding: 2
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
            <View className="flex-col" style={{ width: spaceHeight, justifyContent: 'space-between' }}>
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
              className="items-center justify-center p-1 flex-1"
              style={{ 
                height: boardSize - 2 * cornerSize
              }}
            >
              <View className="bg-white/90 border border-gray-400 rounded-lg p-2 items-center shadow-md">
                <Text 
                  className="font-extrabold text-black mb-0.5"
                  style={{ fontSize: Math.max(12, boardSize * 0.035) }}
                >
                  MONOPOLY
                </Text>
                <Text 
                  className="font-semibold text-black mb-2"
                  style={{ fontSize: Math.max(9, boardSize * 0.022) }}
                >
                  Solana Edition
                </Text>
                <View className="items-center">
                  <Text 
                    className="text-gray-600"
                    style={{ fontSize: Math.max(8, boardSize * 0.018) }}
                  >
                    Current Player:
                  </Text>
                  <View className="flex-row items-center gap-1.5 mt-1">
                    <View 
                      className="rounded-full items-center justify-center"
                      style={{ 
                        backgroundColor: players[currentPlayerIndex]?.color,
                        width: Math.max(16, boardSize * 0.035),
                        height: Math.max(16, boardSize * 0.035)
                      }}
                    >
                      <Text style={{ fontSize: Math.max(10, boardSize * 0.022) }}>
                        {players[currentPlayerIndex]?.avatar}
                      </Text>
                    </View>
                    <Text 
                      className="font-bold text-black"
                      numberOfLines={1}
                      style={{ fontSize: Math.max(9, boardSize * 0.022) }}
                    >
                      {players[currentPlayerIndex]?.name}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Right edge */}
            <View className="flex-col" style={{ width: spaceHeight, justifyContent: 'space-between' }}>
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
    </ScrollView>
  );
}