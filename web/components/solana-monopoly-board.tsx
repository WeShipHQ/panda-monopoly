// "use client";

// import React from "react";
// import { Address } from "@solana/kit";
// import { useGame, useGamePlayers } from "@/hooks/useGame";
// import { usePlayer } from "@/hooks/usePlayer";
// import {
//   unifiedPropertyData,
//   getPropertyData,
// } from "@/data/unified-monopoly-data";
// import {
//   PropertySpace,
//   ChanceSpace,
//   CommunityChestSpace,
//   RailroadSpace,
//   BeachSpace,
//   UtilitySpace,
//   TaxSpace,
// } from "@/components/board-spaces";
// import { useGameContext } from "./game-sample-context";

// interface SolanaMonopolyBoardProps {
//   // gameAddress: Address;
//   // playerAddresses: Address[];
//   // currentPlayerAddress?: Address;
// }

// const SolanaMonopolyBoard: React.FC<SolanaMonopolyBoardProps> = () => {
//   const { gameAddress, currentPlayerAddress } =
//     useGameContext();
//   // Fetch game state from Solana
//   const {
//     data: playerStates = [],
//     gameData: gameState,
//     isLoading: gameLoading,
//     error: gameError,
//   } = useGamePlayers(gameAddress);

//   console.log("playerStates", playerStates);

//   // Fetch all player states
//   // const playerStates = (gameState?.players || []).map((playerAddress) => {
//   //   const {
//   //     data: playerState,
//   //     isLoading,
//   //     error,
//   //   } = usePlayer(gameAddress, playerAddress);
//   //   return { playerState, isLoading, error, address: playerAddress };
//   // });

//   // Loading state
//   if (gameLoading || !playerStates || playerStates?.length === 0) {
//     return (
//       <div className="h-screen w-full flex items-center justify-center bg-[#c7e9b5]">
//         <div className="text-2xl font-bold">Loading game...</div>
//       </div>
//     );
//   }

//   // Error state
//   if (gameError) {
//     return (
//       <div className="h-screen w-full flex items-center justify-center bg-[#c7e9b5]">
//         <div className="text-2xl font-bold text-red-600">
//           Error loading game data
//         </div>
//       </div>
//     );
//   }

//   // No game state
//   if (!gameState) {
//     return (
//       <div className="h-screen w-full flex items-center justify-center bg-[#c7e9b5]">
//         <div className="text-2xl font-bold">Game not found</div>
//       </div>
//     );
//   }

//   // Helper function to get property ownership from player states
//   const getPropertyOwner = (position: number): Address | null => {
//     for (const playerState of playerStates) {
//       if (
//         playerState?.propertiesOwned &&
//         playerState.propertiesOwned.includes(position)
//       ) {
//         return playerState.wallet;
//       }
//     }
//     return null;
//   };

//   // Helper function to render individual spaces
//   const renderSpace = (
//     property: (typeof unifiedPropertyData)[0],
//     index: number
//   ) => {
//     const key = `${property.name}-${index}`;
//     const position = property.position;
//     const owner = getPropertyOwner(position);

//     const baseProps = {
//       // key,
//       name: property.name,
//       price: property.price?.toString() || "",
//       rotate: property.rotate,
//       longName: property.longName,
//       threeLines: property.threeLines,
//       position,
//       onRightClick: (pos: number) => {
//         console.log(`Right clicked on position ${pos}: ${property.name}`);
//         // Add your property interaction logic here
//       },
//     };

//     switch (property.type) {
//       case "property":
//         return (
//           <PropertySpace
//             key={key}
//             {...baseProps}
//             colorClass={property.colorClass}
//           />
//         );
//       case "railroad":
//         return <RailroadSpace key={key} {...baseProps} />;
//       case "beach":
//         return <BeachSpace key={key} {...baseProps} />;
//       case "utility":
//         return (
//           <UtilitySpace
//             key={key}
//             {...baseProps}
//             type={property.name.includes("Electric") ? "electric" : "water"}
//           />
//         );
//       case "tax":
//         return (
//           <TaxSpace
//             key={key}
//             {...baseProps}
//             instructions={property.instructions}
//             type={property.name.includes("Income") ? "income" : "luxury"}
//           />
//         );
//       case "chance":
//         return (
//           <ChanceSpace key={key} {...baseProps} blueIcon={property.blueIcon} />
//         );
//       case "community-chest":
//         return <CommunityChestSpace key={key} {...baseProps} />;
//       default:
//         return null;
//     }
//   };

//   // Group properties by board position
//   const bottomRow = unifiedPropertyData
//     .filter((p) => [9, 8, 7, 6, 5, 4, 3, 2, 1].includes(p.position))
//     .sort((a, b) => b.position - a.position); // Reverse order for bottom row

//   const leftRow = unifiedPropertyData
//     .filter((p) => [11, 12, 13, 14, 15, 16, 17, 18, 19].includes(p.position))
//     .sort((a, b) => a.position - b.position);

//   const topRow = unifiedPropertyData
//     .filter((p) => [21, 22, 23, 24, 25, 26, 27, 28, 29].includes(p.position))
//     .sort((a, b) => a.position - b.position);

//   const rightRow = unifiedPropertyData
//     .filter((p) => [31, 32, 33, 34, 35, 36, 37, 38, 39].includes(p.position))
//     .sort((a, b) => a.position - b.position);

//   // Helper function to get correct player token position
//   const getTokenPosition = (pos: number) => {
//     // 14x14 grid with 2x2 corner spaces and 2x2 side spaces
//     // Each grid cell is approximately 7.14% wide (100% / 14)
//     const cellSize = 7.14;
//     const cornerCenter = 10.71; // Center of 2x2 corner (1.5 cells from edge)
//     const sideSpaceCenter = 17.86; // Center position for 2x2 side spaces

//     if (pos === 0) {
//       // GO corner (bottom-right) - center of 2x2 corner
//       return { left: `${100 - cornerCenter}%`, top: `${100 - cornerCenter}%` };
//     } else if (pos >= 1 && pos <= 9) {
//       // Bottom row (right to left from GO) - center of 2x2 side spaces
//       const spaceIndex = pos - 1;
//       const left = 100 - sideSpaceCenter - (spaceIndex * (cellSize * 10 / 9)); // Adjust spacing for 9 spaces in 10 cells
//       return { left: `${left}%`, top: `${100 - cornerCenter}%` };
//     } else if (pos === 10) {
//       // JAIL corner (bottom-left) - center of 2x2 corner
//       return { left: `${cornerCenter}%`, top: `${100 - cornerCenter}%` };
//     } else if (pos >= 11 && pos <= 19) {
//       // Left column (bottom to top) - center of 2x2 side spaces
//       const spaceIndex = pos - 11;
//       const top = 100 - sideSpaceCenter - (spaceIndex * (cellSize * 10 / 9)); // Adjust spacing for 9 spaces in 10 cells
//       return { left: `${cornerCenter}%`, top: `${top}%` };
//     } else if (pos === 20) {
//       // Free Parking corner (top-left) - center of 2x2 corner
//       return { left: `${cornerCenter}%`, top: `${cornerCenter}%` };
//     } else if (pos >= 21 && pos <= 29) {
//       // Top row (left to right) - center of 2x2 side spaces
//       const spaceIndex = pos - 21;
//       const left = sideSpaceCenter + (spaceIndex * (cellSize * 10 / 9)); // Adjust spacing for 9 spaces in 10 cells
//       return { left: `${left}%`, top: `${cornerCenter}%` };
//     } else if (pos === 30) {
//       // Go To Jail corner (top-right) - center of 2x2 corner
//       return { left: `${100 - cornerCenter}%`, top: `${cornerCenter}%` };
//     } else if (pos >= 31 && pos <= 39) {
//       // Right column (top to bottom) - center of 2x2 side spaces
//       const spaceIndex = pos - 31;
//       const top = sideSpaceCenter + (spaceIndex * (cellSize * 10 / 9)); // Adjust spacing for 9 spaces in 10 cells
//       return { left: `${100 - cornerCenter}%`, top: `${top}%` };
//     }

//     // Default to GO position if position is invalid
//     return { left: `${100 - cornerCenter}%`, top: `${100 - cornerCenter}%` };
//   };

//   // Render player tokens on board
//   const renderPlayerTokens = () => {
//     return playerStates.map((playerState, index) => {
//       if (!playerState) return null;

//       const position = playerState.position;
//       const isCurrentPlayer = playerState.wallet === currentPlayerAddress;
//       const tokenPos = getTokenPosition(position);

//       // Find all players on the same space for proper spacing
//       const playersOnSameSpace = playerStates.filter(
//         (ps) => ps && ps.position === position
//       );
//       const playerIndex = playersOnSameSpace.findIndex(
//         (ps) => ps?.wallet === playerState.wallet
//       );

//       // Adjust position if multiple players on same space
//       let adjustedLeft = parseFloat(tokenPos.left);
//       let adjustedTop = parseFloat(tokenPos.top);

//       if (playersOnSameSpace.length > 1) {
//         const offsetDistance = 1.5; // Distance between tokens in percentage

//         if (playersOnSameSpace.length === 2) {
//           // Arrange horizontally
//           const offset = playerIndex === 0 ? -offsetDistance : offsetDistance;
//           adjustedLeft += offset;
//         } else if (playersOnSameSpace.length === 3) {
//           // Arrange in triangle
//           const offsets = [
//             { x: -offsetDistance, y: -offsetDistance },
//             { x: offsetDistance, y: -offsetDistance },
//             { x: 0, y: offsetDistance },
//           ];
//           adjustedLeft += offsets[playerIndex].x;
//           adjustedTop += offsets[playerIndex].y;
//         } else if (playersOnSameSpace.length === 4) {
//           // Arrange in 2x2 grid
//           const offsets = [
//             { x: -offsetDistance, y: -offsetDistance },
//             { x: offsetDistance, y: -offsetDistance },
//             { x: -offsetDistance, y: offsetDistance },
//             { x: offsetDistance, y: offsetDistance },
//           ];
//           adjustedLeft += offsets[playerIndex].x;
//           adjustedTop += offsets[playerIndex].y;
//         }
//       }

//       return (
//         <div
//           key={playerState.wallet.toString()}
//           className={`absolute w-4 h-4 rounded-full border-2 transition-all duration-300 ${
//             isCurrentPlayer
//               ? "bg-yellow-400 border-yellow-600 ring-2 ring-yellow-300"
//               : "bg-blue-400 border-blue-600"
//           }`}
//           style={{
//             left: `${adjustedLeft}%`,
//             top: `${adjustedTop}%`,
//             zIndex: 10 + index,
//             transform: 'translate(-50%, -50%)', // Center the token on the position
//           }}
//           title={`Player ${index + 1} - Position ${position} - ${playerState.wallet.toString().slice(0, 8)}...`}
//         />
//       );
//     });
//   };

//   return (
//     <div className="h-screen w-full monopoly-board overflow-hidden bg-[#c7e9b5]">
//       {/* Game Info Panel */}
//       <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg z-20">
//         <h3 className="font-bold text-lg mb-2">Game Status</h3>
//         <div className="text-sm space-y-1">
//           <div>Game ID: {gameState.gameId.toString()}</div>
//           <div>Current Turn: {gameState.currentTurn}</div>
//           <div>
//             Players: {gameState.currentPlayers}/{gameState.maxPlayers}
//           </div>
//           <div>Status: {gameState.gameStatus}</div>
//           <div>Bank Balance: ${gameState.bankBalance.toString()}</div>
//         </div>
//       </div>

//       {/* Player Info Panel */}
//       <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-20 max-w-sm">
//         <h3 className="font-bold text-lg mb-2">Players</h3>
//         <div className="space-y-2">
//           {playerStates.map((playerState, index) => {
//             if (!playerState) return null;

//             const isCurrentPlayer = playerState.wallet === currentPlayerAddress;
//             const isCurrentTurn = index === gameState.currentTurn;

//             return (
//               <div
//                 key={playerState.wallet}
//                 className={`p-2 rounded ${
//                   isCurrentTurn
//                     ? "bg-yellow-100 border-2 border-yellow-400"
//                     : "bg-gray-50"
//                 } ${isCurrentPlayer ? "ring-2 ring-blue-400" : ""}`}
//               >
//                 <div className="font-semibold">Player {index + 1}</div>
//                 <div className="text-sm text-gray-600">
//                   Cash: ${playerState.cashBalance.toString()}
//                 </div>
//                 <div className="text-sm text-gray-600">
//                   Position: {playerState.position}
//                 </div>
//                 <div className="text-sm text-gray-600">
//                   Properties: {playerState.propertiesOwned.length}
//                 </div>
//                 {playerState.inJail && (
//                   <div className="text-sm text-red-600 font-semibold">
//                     In Jail ({playerState.jailTurns} turns)
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* Board Container */}
//       <div className="h-full flex items-center justify-center p-4">
//         <div className="relative aspect-square h-full max-h-screen w-auto bg-[#c7e9b5] border-2 border-black">
//           <div className="absolute inset-0 grid grid-cols-14 grid-rows-14 gap-[0.1%] p-[0.1%]">
//             {/* Player Tokens */}
//             {renderPlayerTokens()}

//             {/* Center */}
//             <div className="col-start-3 col-end-13 row-start-3 row-end-13 bg-[#c7e9b5] grid grid-cols-3 grid-rows-3 justify-items-center items-center relative">
//               <h1 className="col-start-1 col-end-4 row-start-2 center-title text-black font-bold">
//                 MONOPOLY
//               </h1>
//               <div className="absolute inset-0 flex items-center justify-center">
//                 <div className="w-32 h-32 border-2 border-black transform rotate-45 bg-white opacity-20"></div>
//               </div>
//             </div>

//             {/* Corner Spaces */}
//             {/* GO Corner (bottom-right) */}
//             <div className="col-start-13 col-end-15 row-start-13 row-end-15 bg-[#fafaf8] text-center border border-black">
//               <div className="corner-space transform h-full flex flex-col justify-center items-center">
//                 <div className="px-1 text-xs font-bold">
//                   COLLECT $200.00 SALARY AS YOU PASS
//                 </div>
//                 <div className="icon-large text-[#f50c2b] font-bold text-4xl">
//                   GO
//                 </div>
//                 <div className="absolute top-1 left-1 text-xs">→</div>
//               </div>
//             </div>

//             {/* JAIL Corner (bottom-left) */}
//             <div className="col-start-1 col-end-3 row-start-13 row-end-15 bg-[#fafaf8] text-center flex items-center justify-center border border-black">
//               <div className="corner-space flex items-center justify-center h-full">
//                 <div className="text-2xl font-bold">JAIL</div>
//               </div>
//             </div>

//             {/* Free Parking Corner (top-left) */}
//             <div className="col-start-1 col-end-3 row-start-1 row-end-3 bg-[#fafaf8] text-center flex items-center justify-center border border-black">
//               <div className="corner-space flex items-center justify-center h-full">
//                 <div className="text-xl font-bold">FREE PARKING</div>
//               </div>
//             </div>

//             {/* Go To Jail Corner (top-right) */}
//             <div className="col-start-13 col-end-15 row-start-1 row-end-3 bg-[#fafaf8] text-center flex items-center justify-center border border-black">
//               <div className="corner-space flex items-center justify-center h-full">
//                 <div className="text-xl font-bold">GO TO JAIL</div>
//               </div>
//             </div>

//             {/* Bottom Row */}
//             <div className="col-start-3 col-end-13 row-start-13 row-end-15 grid grid-cols-9 grid-rows-1 gap-[0.1%]">
//               {bottomRow.map((space, index) => renderSpace(space, index))}
//             </div>

//             {/* Left Row */}
//             <div className="col-start-1 col-end-3 row-start-3 row-end-13 grid grid-cols-1 grid-rows-9 gap-[0.1%]">
//               {leftRow.map((space, index) => renderSpace(space, index))}
//             </div>

//             {/* Top Row */}
//             <div className="col-start-3 col-end-13 row-start-1 row-end-3 grid grid-cols-9 grid-rows-1 gap-[0.1%]">
//               {topRow.map((space, index) => renderSpace(space, index))}
//             </div>

//             {/* Right Row */}
//             <div className="col-start-13 col-end-15 row-start-3 row-end-13 grid grid-cols-1 grid-rows-9 gap-[0.1%]">
//               {rightRow.map((space, index) => renderSpace(space, index))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SolanaMonopolyBoard;
