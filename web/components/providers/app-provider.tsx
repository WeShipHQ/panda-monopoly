import { GameProvider } from "@/components/providers/game-provider";
import { RpcProvider } from "@/components/providers/rpc-provider";
import { PrivyWalletProvider } from "./privy-provider";
import { CreateGameWalletDialog } from "../create-game-wallet-dialog";
import { GameEventsProvider } from "./game-events-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <RpcProvider>
      <PrivyWalletProvider>
        <GameProvider>
          <GameEventsProvider>
            {children}
            <CreateGameWalletDialog />
          </GameEventsProvider>
        </GameProvider>
      </PrivyWalletProvider>
    </RpcProvider>
  );
}
