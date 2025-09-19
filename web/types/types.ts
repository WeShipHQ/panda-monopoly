import type {
  GameState,
  PlayerState,
  PropertyState,
} from "@/lib/sdk/generated";
import type { Address } from "@solana/kit";

export type GameAccount = GameState & {
  address: Address;
};

export type PlayerAccount = PlayerState & {
  address: Address;
};

export type PropertyAccount = PropertyState & {
  address: Address;
};
