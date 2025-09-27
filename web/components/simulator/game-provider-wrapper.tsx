// "use client";

// import React from "react";
// import { GameProvider } from "../game-provider";
// import { GameProviderSimulation } from "./game-provider-simulation";

// interface GameProviderWrapperProps {
//   children: React.ReactNode;
//   useSimulation?: boolean;
// }

// export const GameProviderWrapper: React.FC<GameProviderWrapperProps> = ({ 
//   children, 
//   useSimulation = false 
// }) => {
//   // You can also check environment variables here
//   const shouldUseSimulation = useSimulation || process.env.NEXT_PUBLIC_USE_SIMULATION === "true";

//   if (shouldUseSimulation) {
//     return <GameProviderSimulation>{children}</GameProviderSimulation>;
//   }

//   return <GameProvider>{children}</GameProvider>;
// };