// {/* Game Log Section - Responsive */}
//               <div className="flex-1 w-full max-w-xs sm:max-w-sm md:max-w-md flex items-center justify-center">
//                 <div className="h-12 sm:h-16 md:h-20 lg:h-24 overflow-y-auto w-full">
//                   <div className="space-y-2 text-center">
//                     {gameState.gameLog && gameState.gameLog.length > 0 ? (
//                       gameState.gameLog
//                         .slice(-8)
//                         .reverse()
//                         .map((log, index) => {
//                           // Find all player names mentioned in the log
//                           const mentionedPlayers = gameState.players.filter(
//                             (player) => log.includes(player.name)
//                           );

//                           // Find property mentioned in the log and get its color
//                           const propertyMatch = boardSpaces.find((space) =>
//                             log.includes(space.name)
//                           );

//                           // Create formatted log with bold player names and colored property names
//                           let formattedLog = log;

//                           // Replace all mentioned player names with bold markers
//                           mentionedPlayers.forEach((player) => {
//                             const regex = new RegExp(
//                               `\\b${player.name}\\b`,
//                               "g"
//                             );
//                             formattedLog = formattedLog.replace(
//                               regex,
//                               `**${player.name}**`
//                             );
//                           });

//                           // Replace property name with colored version if found
//                           if (propertyMatch && propertyMatch.name) {
//                             const regex = new RegExp(
//                               `\\b${propertyMatch.name}\\b`,
//                               "g"
//                             );
//                             formattedLog = formattedLog.replace(
//                               regex,
//                               `##${propertyMatch.name}##`
//                             );
//                           }

//                           // Split the log by markers to separate bold, colored, and normal text
//                           const parts = formattedLog.split(
//                             /(\*\*[^*]+\*\*|##[^#]+##)/
//                           );

//                           // Get property color class based on the actual data
//                           const getPropertyColor = (propertyName: string) => {
//                             const unifiedProperty = unifiedPropertyData.find(
//                               (p) => p.name === propertyName
//                             );
//                             if (unifiedProperty && unifiedProperty.colorClass) {
//                               // Map actual colorClass to text color
//                               switch (unifiedProperty.colorClass) {
//                                 case "bg-[#8b4513]":
//                                   return "text-amber-800"; // Brown
//                                 case "bg-[#aae0fa]":
//                                   return "text-sky-400"; // Light Blue
//                                 case "bg-[#d93a96]":
//                                   return "text-pink-600"; // Pink/Magenta
//                                 case "bg-[#ffa500]":
//                                   return "text-orange-500"; // Orange
//                                 case "bg-[#ff0000]":
//                                   return "text-red-600"; // Red
//                                 case "bg-[#ffff00]":
//                                   return "text-yellow-500"; // Yellow
//                                 case "bg-[#00ff00]":
//                                   return "text-green-500"; // Green
//                                 case "bg-[#0000ff]":
//                                   return "text-blue-600"; // Dark Blue
//                                 case "bg-blue-200":
//                                   return "text-blue-400"; // Railroad/Utility
//                                 case "bg-white":
//                                   return "text-gray-600"; // Utility/Special
//                                 default:
//                                   return "text-gray-800";
//                               }
//                             }
//                             return "text-gray-800";
//                           };

//                           return (
//                             <div
//                               key={index}
//                               className="text-xs text-black flex items-center justify-center gap-1"
//                             >
//                               {/* Show avatars of all mentioned players */}
//                               {mentionedPlayers
//                                 .slice(0, 2)
//                                 .map((player, pIndex) => (
//                                   <img
//                                     key={pIndex}
//                                     src={player.avatar}
//                                     alt={`${player.name} avatar`}
//                                     className="w-4 h-4 object-contain flex-shrink-0"
//                                   />
//                                 ))}
//                               <span>
//                                 {parts.map((part, partIndex) => {
//                                   if (
//                                     part.startsWith("**") &&
//                                     part.endsWith("**")
//                                   ) {
//                                     // Bold player name
//                                     return (
//                                       <span
//                                         key={partIndex}
//                                         className="font-bold"
//                                       >
//                                         {part.slice(2, -2)}
//                                       </span>
//                                     );
//                                   } else if (
//                                     part.startsWith("##") &&
//                                     part.endsWith("##")
//                                   ) {
//                                     // Colored property name
//                                     const propertyName = part.slice(2, -2);
//                                     return (
//                                       <span
//                                         key={partIndex}
//                                         className={`font-semibold ${getPropertyColor(
//                                           propertyName
//                                         )}`}
//                                       >
//                                         {propertyName}
//                                       </span>
//                                     );
//                                   } else {
//                                     // Normal text
//                                     return <span key={partIndex}>{part}</span>;
//                                   }
//                                 })}
//                               </span>
//                             </div>
//                           );
//                         })
//                     ) : (
//                       <div className="text-xs text-black/70 italic">
//                         no game events yet...
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>