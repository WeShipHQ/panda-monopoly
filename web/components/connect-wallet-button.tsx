"use client";

import {
  pipe,
  createTransactionMessage,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  appendTransactionMessageInstructions,
  compileTransaction,
  createNoopSigner,
  getTransactionEncoder,
  address,
  getBase58Codec,
} from "@solana/kit";
import { getTransferSolInstruction } from "@solana-program/system";
import {
  useConnectedStandardWallets,
  useStandardSignAndSendTransaction,
} from "@privy-io/react-auth/solana";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutIcon, WalletIcon } from "@/components/ui/icons";
import { useWallet } from "@/hooks/use-wallet";
import { formatAddress } from "@/lib/utils";
import { useLogin, useLogout } from "@privy-io/react-auth";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { useRpcContext } from "./providers/rpc-provider";

export function ConnectWalletButton() {
  const { ready, authenticated, user, wallet } = useWallet();
  const { wallets } = useConnectedStandardWallets();
  const { signAndSendTransaction } = useStandardSignAndSendTransaction();

  const { rpc } = useRpcContext();
  const { login } = useLogin();
  const { logout } = useLogout();

  const disableLogin = !ready || (ready && authenticated);

  return (
    <div className="flex items-center gap-4">
      {authenticated ? (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-40">
                {wallet
                  ? formatAddress(wallet.address)
                  : user?.wallet?.address
                  ? formatAddress(user?.wallet?.address)
                  : "--"}
                {/* <Avatar className="rounded-lg">
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="@shadcn"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar> */}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              sideOffset={12}
              className="w-40"
              align="end"
              side="bottom"
            >
              <DropdownMenuItem onClick={() => logout()}>
                <LogoutIcon />
                <DropdownMenuShortcut>Disconnect</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={async () => {
              try {
                const wallet = wallets[0]; // Replace this with your desired wallet
                if (!wallet) {
                  toast.error("Please connect your wallet first");
                  return;
                }

                const transferInstruction = getTransferSolInstruction({
                  amount: 1_000_000_000 / 1000,
                  destination: address(
                    "63EEC9FfGyksm7PkVC6z8uAmqozbQcTzbkWJNsgqjkFs"
                  ),
                  source: createNoopSigner(address(wallet.address)),
                });

                const { value: latestBlockhash } = await rpc
                  .getLatestBlockhash()
                  .send();

                const transaction = pipe(
                  createTransactionMessage({ version: 0 }),
                  (tx) =>
                    setTransactionMessageFeePayer(address(wallet.address), tx),
                  (tx) =>
                    setTransactionMessageLifetimeUsingBlockhash(
                      latestBlockhash,
                      tx
                    ),
                  (tx) =>
                    appendTransactionMessageInstructions(
                      [transferInstruction],
                      tx
                    ),
                  (tx) => compileTransaction(tx)
                );

                const encodedTransaction =
                  getTransactionEncoder().encode(transaction);

                const { signature } = await signAndSendTransaction({
                  transaction: new Uint8Array(encodedTransaction),
                  wallet: wallet,
                });

                console.log("Signature:", getBase58Codec().decode(signature));
              } catch (error) {
                console.log(error);
              }
            }}
          >
            Send test tx
          </Button>
        </>
      ) : (
        <Button size="lg" disabled={disableLogin} onClick={() => login()}>
          <WalletIcon />
          Connect Wallet
        </Button>
      )}
    </div>
  );
}

function UserMenu({ onDisconnect }: { onDisconnect: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button>
          <Avatar className="rounded-lg">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" side="bottom">
        <DropdownMenuItem onClick={onDisconnect}>
          <LogoutIcon />
          <DropdownMenuShortcut>Disconnect</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
