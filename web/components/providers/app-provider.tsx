import { GameProvider } from "@/components/providers/game-provider";
import { RpcProvider } from "@/components/providers/rpc-provider";
import { PrivyWalletProvider } from "./privy-provider";
import { CreateGameWalletDialog } from "../create-game-wallet-dialog";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <RpcProvider>
      <PrivyWalletProvider>
        <GameProvider>
          {children}
          <CreateGameWalletDialog />
        </GameProvider>
      </PrivyWalletProvider>
    </RpcProvider>
  );
}
