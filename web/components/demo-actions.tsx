// "use client";

// import { sdk } from "@/lib/sdk/sdk";
// import { fakePlayerA, fakePlayerB } from "@/lib/sdk/utils";
// import { buildAndSendTransaction } from "@/lib/tx";
// import {
//   createSolanaRpc,
//   createSignerFromKeyPair,
//   address,
//   KeyPairSigner,
// } from "@solana/kit";
// import React, { useEffect, useState } from "react";
// import { useGameContext } from "./game-provider";
// import { useRouter, useSearchParams } from "next/navigation";
// import { useGamePlayers } from "@/hooks/useGame";

// const gameId = Date.now();

// export const DemoActions: React.FC<any> = () => {
//   const { gameAddress, setGameAddress } = useGameContext();
//   const [isCreatingGame, setIsCreatingGame] = useState(false);
//   const [isJoiningGame, setIsJoiningGame] = useState(false);
//   const [isStartingGame, setIsStartingGame] = useState(false);
//   const [isRollingDice, setIsRollingDice] = useState(false);
//   const [isEndingTurn, setIsEndingTurn] = useState(false);

//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const gameAddressParam = searchParams.get("game");
//   const { refetch } = useGamePlayers(
//     gameAddressParam ? address(gameAddressParam) : undefined
//   );

//   // const [gameAccountPDA, setGameAccountPDA] = useState<Address>();

//   const handleCreateGame = async () => {
//     try {
//       const playerA = await createSignerFromKeyPair(await fakePlayerA());
//       setIsCreatingGame(true);
//       // const rpc = createSolanaRpc(devnet(process.env.NEXT_PUBLIC_HELIUS_RPC_URL!));
//       const rpc = createSolanaRpc("http://127.0.0.1:8899");

//       const { instruction, gameAccountAddress } = await sdk.createGameIx({
//         rpc,
//         creator: playerA,
//         gameId,
//       });

//       const signature = await buildAndSendTransaction(
//         rpc,
//         [instruction],
//         playerA
//       );
//       console.log("handleCreateGame", signature);

//       await new Promise((resolve) => setTimeout(resolve, 1000));

//       const currentParams = new URLSearchParams(searchParams.toString());
//       currentParams.set("game", gameAccountAddress.toString());
//       router.replace(`?${currentParams.toString()}`, { scroll: false });
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setIsCreatingGame(false);
//     }
//   };

//   const handleJoinGame = async () => {
//     try {
//       if (!gameAddress) {
//         return;
//       }

//       const playerb = await createSignerFromKeyPair(await fakePlayerB());
//       setIsJoiningGame(true);
//       // const rpc = createSolanaRpc(devnet(process.env.NEXT_PUBLIC_HELIUS_RPC_URL!));
//       const rpc = createSolanaRpc("http://127.0.0.1:8899");

//       console.log("join gameAccountPDA", gameAddress.toString());

//       const { instruction } = await sdk.joinGameIx({
//         rpc,
//         gameAddress: gameAddress,
//         player: playerb,
//       });

//       const signature = await buildAndSendTransaction(
//         rpc,
//         [instruction],
//         playerb
//       );
//       console.log("handleJoinGame", signature);
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setIsJoiningGame(false);
//       refetch();
//     }
//   };

//   const handleStartGame = async () => {
//     try {
//       if (!gameAddress) {
//         return;
//       }

//       const playerA = await createSignerFromKeyPair(await fakePlayerA());
//       setIsStartingGame(true);
//       // const rpc = createSolanaRpc(devnet(process.env.NEXT_PUBLIC_HELIUS_RPC_URL!));
//       const rpc = createSolanaRpc("http://127.0.0.1:8899");

//       console.log("start gameAccountPDA", gameAddress.toString());

//       const instruction = await sdk.startGameIx({
//         rpc,
//         gameAddress: gameAddress,
//         authority: playerA,
//       });

//       const signature = await buildAndSendTransaction(
//         rpc,
//         [instruction],
//         playerA
//       );
//       console.log("handleStartGame", signature);
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setIsStartingGame(false);
//       refetch();
//     }
//   };


//   useEffect(() => {
//     if (gameAddressParam) {
//       setGameAddress(address(gameAddressParam));
//     }
//   }, [gameAddressParam]);

//   return (
//     <div className="flex flex-col items-center gap-4">
//       <button
//         className="bg-blue-500 text-white px-4 py-2 rounded-md"
//         onClick={handleCreateGame}
//         disabled={isCreatingGame}
//       >
//         {isCreatingGame ? "Creating..." : "Create"}
//       </button>
//       <button
//         className="bg-blue-500 text-white px-4 py-2 rounded-md"
//         onClick={handleJoinGame}
//         disabled={isJoiningGame}
//       >
//         {isJoiningGame ? "Joining..." : "Join"}
//       </button>
//       <button
//         className="bg-blue-500 text-white px-4 py-2 rounded-md"
//         onClick={handleStartGame}
//         disabled={isStartingGame}
//       >
//         {isStartingGame ? "Starting..." : "Start"}
//       </button>
//     </div>
//   );
// };
