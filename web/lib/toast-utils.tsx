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
