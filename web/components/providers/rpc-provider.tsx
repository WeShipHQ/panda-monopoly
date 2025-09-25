"use client";

import {
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  Rpc,
  RpcSubscriptions,
  SolanaRpcApi,
  SolanaRpcSubscriptionsApi,
} from "@solana/kit";
import { createContext, ReactNode, useContext } from "react";

const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL!;
const SOLANA_RPC_SUBSCRIPTIONS_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_SUBSCRIPTIONS_URL!;

type Props = Readonly<{
  children: ReactNode;
}>;

interface RpcContextType {
  rpc: Rpc<SolanaRpcApi>;
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
}

export const RpcContext = createContext<RpcContextType | undefined>(undefined);

export const useRpcContext = () => {
  const context = useContext(RpcContext);
  if (context === undefined) {
    throw new Error("useRpcContext must be used within a RpcProvider");
  }
  return context;
};

export function RpcProvider({ children }: Props) {
  return (
    <RpcContext.Provider
      value={{
        rpc: createSolanaRpc(SOLANA_RPC_URL),
        rpcSubscriptions: createSolanaRpcSubscriptions(
          SOLANA_RPC_SUBSCRIPTIONS_URL
        ),
      }}
    >
      {children}
    </RpcContext.Provider>
  );
}
