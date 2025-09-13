import {
  getProgramDerivedAddress,
  getAddressEncoder,
  type Address,
  type ProgramDerivedAddress,
  getU64Encoder,
  getU8Encoder,
} from "@solana/kit";
import { PANDA_MONOPOLY_PROGRAM_ADDRESS } from "./generated";

/**
 * Get the PDA for a game account
 * Seeds: ["game", authority]
 */
export async function getGamePDA(
  gameId: number,
  authority: Address
): Promise<ProgramDerivedAddress> {
  return await getProgramDerivedAddress({
    programAddress: PANDA_MONOPOLY_PROGRAM_ADDRESS,
    seeds: [
      "game",
      getAddressEncoder().encode(authority),
      getU64Encoder().encode(gameId),
    ],
  });
}

/**
 * Get the PDA for a player state account
 * Seeds: ["player", game, player]
 */
export async function getPlayerStatePDA(
  game: Address,
  player: Address
): Promise<ProgramDerivedAddress> {
  return await getProgramDerivedAddress({
    programAddress: PANDA_MONOPOLY_PROGRAM_ADDRESS,
    seeds: [
      "player",
      getAddressEncoder().encode(game),
      getAddressEncoder().encode(player),
    ],
  });
}

export async function getPropertyStatePDA(
  game: Address,
  position: number
): Promise<ProgramDerivedAddress> {
  return await getProgramDerivedAddress({
    programAddress: PANDA_MONOPOLY_PROGRAM_ADDRESS,
    seeds: [
      "property",
      getAddressEncoder().encode(game),
      getU8Encoder().encode(position),
    ],
  });
}
