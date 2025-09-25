import { Toaster } from "@/components/ui/sonner";
import WalletProvider from "./wallet-provider";
import { GameProvider } from "@/components/game-provider";
import { RpcProvider } from "@/components/providers/rpc-provider";

export default function RootProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <RpcProvider>
        <GameProvider>
          <Toaster position="top-center" />
          {children}
        </GameProvider>
      </RpcProvider>
    </>
  );
}
