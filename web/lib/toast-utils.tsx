import React from "react";
import { toast } from "sonner";
import { formatAddress } from "./utils";

interface RentPaymentToastProps {
  rentAmount: number;
  ownerAddress: string;
  propertyName: string;
}

interface RentPaymentFallbackToastProps {
  ownerAddress: string;
  propertyName: string;
}

interface TaxPaidToastProps {
  taxType: number;
  amount: bigint;
  position: number;
}

interface PlayerPassedGoToastProps {
  salaryCollected: bigint;
}

export const showRentPaymentToast = ({
  rentAmount,
  ownerAddress,
  propertyName,
}: RentPaymentToastProps) => {
  toast.info(
    <div className="flex flex-col gap-1.5">
      <div className="text-sm">
        You paid{" "}
        <span
          className="font-bold px-2 py-0.5 rounded-md text-white"
          style={{ backgroundColor: "var(--chart-1)" }}
        >
          ${rentAmount}
        </span>{" "}
        rent to{" "}
        <span
          className="font-bold px-2 py-0.5 rounded-md text-white"
          style={{ backgroundColor: "var(--chart-2)" }}
        >
          {formatAddress(ownerAddress)}
        </span>
      </div>
      <div className="text-xs">
        for{" "}
        <span
          className="font-bold px-2 py-0.5 rounded-md text-white"
          style={{ backgroundColor: "var(--chart-3)" }}
        >
          {propertyName}
        </span>
      </div>
    </div>
  );
};

export const showRentPaymentFallbackToast = ({
  ownerAddress,
  propertyName,
}: RentPaymentFallbackToastProps) => {
  toast.info(
    <div className="flex flex-col gap-1.5">
      <div className="text-sm">
        You paid rent to{" "}
        <span
          className="font-bold px-2 py-0.5 rounded-md text-white"
          style={{ backgroundColor: "var(--chart-2)" }}
        >
          {formatAddress(ownerAddress)}
        </span>
      </div>
      <div className="text-xs">
        for{" "}
        <span
          className="font-bold px-2 py-0.5 rounded-md text-white"
          style={{ backgroundColor: "var(--chart-3)" }}
        >
          {propertyName}
        </span>
      </div>
    </div>
  );
};

export const showRentPaymentErrorToast = () => {
  toast.error(
    <div className="flex items-center gap-2">
      {/* <span>❌</span> */}
      <span className="font-semibold">
        Failed to pay rent. Please try again.
      </span>
    </div>
  );
};

export const showTaxPaidToast = ({
  taxType,
  amount,
  position,
}: TaxPaidToastProps) => {
  const taxTypeName =
    taxType === 1 ? "MEV Tax" : taxType === 2 ? "Priority Fee Tax" : "Tax";

  toast.warning(
    <div className="flex flex-col">
      <div className="text-sm">
        You paid{" "}
        <span
          className="font-bold px-2 py-0.5 rounded-md text-white"
          style={{ backgroundColor: "var(--chart-1)" }}
        >
          ${amount.toString()}
        </span>{" "}
        in{" "}
        <span
          className="font-bold px-2 py-0.5 rounded-md text-white"
          style={{ backgroundColor: "var(--chart-4)" }}
        >
          {taxTypeName}
        </span>
      </div>
    </div>
  );
};

export const showPlayerPassedGoToast = ({
  salaryCollected,
}: PlayerPassedGoToastProps) => {
  toast.success(
    <div className="flex flex-col gap-1.5">
      <div className="text-sm">
        🎉 You passed GO and collected{" "}
        <span
          className="font-bold px-2 py-0.5 rounded-md text-white"
          style={{ backgroundColor: "var(--chart-1)" }}
        >
          ${salaryCollected.toString()}
        </span>
      </div>
      <div className="text-xs text-muted-foreground">Keep going! 💰</div>
    </div>
  );
};
