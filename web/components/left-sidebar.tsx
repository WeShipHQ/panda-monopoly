// "use client";

// import React from "react";
// import { useGameContext } from "./game-provider";
// import { truncateAddress, generatePlayerIcon } from "@/lib/utils";

// export const LeftSidebar: React.FC = () => {
//   const { gameState, players, gameLoading, gameError, currentPlayerAddress } =
//     useGameContext();

//   if (gameLoading) {
//     return (
//       <div
//         className="w-[20rem] bg-background p-4 flex flex-col h-screen overflow-y-auto"
//         style={{ height: "100vh" }}
//       >
//         <div className="p-4 bg-white rounded-lg shadow">
//           <h3 className="text-lg font-bold mb-4">Players List</h3>
//           <div className="text-center text-gray-500">Loading players...</div>
//         </div>
//       </div>
//     );
//   }

//   // Show error state
//   if (gameError) {
//     return (
//       <div
//         className="w-[20rem] bg-background p-4 flex flex-col h-screen overflow-y-auto"
//         style={{ height: "100vh" }}
//       >
//         <div className="p-4 bg-white rounded-lg shadow">
//           <h3 className="text-lg font-bold mb-4">Players List</h3>
//           <div className="text-center text-red-500">Error loading players</div>
//         </div>
//       </div>
//     );
//   }

//   // Show empty state if no players
//   if (!players || players.length === 0) {
//     return (
//       <div
//         className="w-[20rem] bg-background p-4 flex flex-col h-screen overflow-y-auto"
//         style={{ height: "100vh" }}
//       >
//         <div className="p-4 bg-white rounded-lg shadow">
//           <h3 className="text-lg font-bold mb-4">Players List</h3>
//           <div className="text-center text-gray-500">No players joined yet</div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div
//       className="w-full lg:w-[34rem] bg-background p-2 sm:p-4 flex flex-col h-full lg:h-screen overflow-y-auto"
//       style={{ height: "100%" }}
//     >
//       {/* Players List */}
//       <div className="p-4 bg-white rounded-lg shadow">
//         <h3 className="text-lg font-bold mb-4">Players List</h3>
//         <div className="space-y-3">
//           {players.map((playerState, index) => {
//             const isCurrentPlayer =
//               currentPlayerAddress &&
//               playerState.wallet === currentPlayerAddress;
//             const isCurrentTurn = gameState && gameState.currentTurn === index;

//             return (
//               <div
//                 key={playerState.wallet}
//                 className={`flex items-center gap-3 p-2 rounded ${
//                   isCurrentTurn
//                     ? "bg-blue-100 border-2 border-blue-300"
//                     : isCurrentPlayer
//                     ? "bg-green-100 border-2 border-green-300"
//                     : "bg-gray-50"
//                 }`}
//               >
//                 <div className="w-8 h-8 flex items-center justify-center text-2xl">
//                   {generatePlayerIcon(playerState.wallet)}
//                 </div>
//                 <div className="flex-1">
//                   <div className="font-medium text-sm">
//                     {truncateAddress(playerState.wallet)}
//                     {isCurrentPlayer && (
//                       <span className="ml-1 text-xs text-green-600">(You)</span>
//                     )}
//                     {isCurrentTurn && (
//                       <span className="ml-1 text-xs text-blue-600">(Turn)</span>
//                     )}
//                   </div>
//                   <div className="text-xs text-gray-600">
//                     ${Number(playerState.cashBalance).toFixed(2)}
//                   </div>
//                   <div className="text-xs text-gray-500">
//                     Position: {playerState.position}
//                     {playerState.inJail && " (In Jail)"}
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* Game Info */}
//         {gameState && (
//           <div className="mt-4 pt-4 border-t border-gray-200">
//             <div className="text-sm text-gray-600">
//               <div>Game ID: {gameState.gameId?.toString()}</div>
//               <div>
//                 Players: {gameState.currentPlayers}/{gameState.maxPlayers}
//               </div>
//               <div>Status: {gameState.isActive ? "Active" : "Inactive"}</div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

"use client";

import React, { useState } from "react";

interface LeftSidebarProps {}

export const LeftSidebar: React.FC<LeftSidebarProps> = () => {
  const [referralLink] = useState("https://pandamonopoly.io/room/mzuv3");
  const [copied, setCopied] = useState(false);

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <div
      className="hidden left-container w-full bg-background p-2 sm:p-4 flex flex-col h-full lg:h-screen overflow-y-auto"
      style={{ height: "100%" }}
    >
      {/* Game Logo */}
      <div className="mb-4 sm:mb-8 p-3 sm:p-6 bg-white rounded-lg shadow text-center">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
          PANDA
        </h1>
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 mb-4">
          MONOPOLY
        </h2>
        <div className="text-2xl sm:text-3xl lg:text-4xl mb-2">🐼</div>
        <p className="text-xs sm:text-sm text-gray-700 font-semibold">
          Play Monopoly with your friends online!
        </p>
      </div>

      {/* Referral Link Section */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-white rounded-lg shadow">
        <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 text-center">
          Share this game
        </h3>
        <div className="mb-3 sm:mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 px-2 sm:px-3 py-2 bg-gray-100 border border-gray-300 rounded text-xs sm:text-sm font-mono font-medium"
            />
            <button
              onClick={copyReferralLink}
              className={`px-3 sm:px-4 py-2 rounded font-bold text-xs sm:text-sm transition-colors min-h-[44px] ${
                copied
                  ? "bg-green-500 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-gray-700 text-center font-medium">
          Send this link to your friends to invite them to play
        </p>
      </div>

      {/* Game Instructions */}
      <div className="p-3 sm:p-4 bg-white rounded-lg shadow flex-1">
        <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4">
          How to Play
        </h3>
        <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm lg:text-base text-gray-800 font-medium">
          <div className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">•</span>
            <span>Roll dice to move around the board</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">•</span>
            <span>Buy properties when you land on them</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">•</span>
            <span>Click properties to see details</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">•</span>
            <span>Collect $200 when you pass GO</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">•</span>
            <span>Build houses and hotels to earn more rent</span>
          </div>
        </div>
      </div>
    </div>
  );
};
