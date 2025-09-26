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
        <GameProvider>{children}</GameProvider>
      </RpcProvider>
    </>
  );
}
