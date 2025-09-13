import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PandaMonopoly } from "../../target/types/panda_monopoly";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { expect } from "chai";

export interface TestContext {
  program: Program<PandaMonopoly>;
  provider: anchor.AnchorProvider;
  authority: Keypair;
  players: Keypair[];
  gameAccount: PublicKey;
  gameBump: number;
}

export async function setupTest(numPlayers: number = 2): Promise<TestContext> {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  
  const program = anchor.workspace.pandaMonopoly as Program<PandaMonopoly>;
  
  // Create authority and players
  const authority = Keypair.generate();
  const players: Keypair[] = [];
  
  for (let i = 0; i < numPlayers; i++) {
    players.push(Keypair.generate());
  }
  
  // Airdrop SOL to authority and players
  await provider.connection.confirmTransaction(
    await provider.connection.requestAirdrop(authority.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL)
  );
  
  for (const player of players) {
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(player.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL)
    );
  }
  
  // Derive game account PDA
  const [gameAccount, gameBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("game"), authority.publicKey.toBuffer()],
    program.programId
  );
  
  return {
    program,
    provider,
    authority,
    players,
    gameAccount,
    gameBump
  };
}

export function getPlayerStatePDA(
  program: Program<PandaMonopoly>,
  gameAccount: PublicKey,
  playerWallet: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("player"), gameAccount.toBuffer(), playerWallet.toBuffer()],
    program.programId
  );
}

export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}