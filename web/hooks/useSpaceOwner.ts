import { useMemo } from "react";
import { isSome } from "@solana/kit";
import { generatePlayerIcon } from "@/lib/utils";
import { PropertyAccount } from "@/types/schema";

export const useSpaceOwner = (onChainProperty?: PropertyAccount | null) => {
  return useMemo(() => {
    const ownerAddress =
      onChainProperty && isSome(onChainProperty.owner)
        ? onChainProperty.owner.value
        : null;

    const ownerMeta = ownerAddress ? generatePlayerIcon(ownerAddress) : null;

    return {
      ownerAddress,
      ownerMeta,
      isOwned: !!ownerAddress,
    };
  }, [onChainProperty]);
};
