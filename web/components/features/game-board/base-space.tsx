import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  getBorderClasses,
  getBoardSide,
  getColorBarClasses,
  getOwnerIndicatorClasses,
  getTextContainerClasses,
} from "@/lib/board-utils";
import { useSpaceOwner } from "@/hooks/useSpaceOwner";
import { BaseSpaceProps } from "@/types/space-types";

interface BaseSpaceComponentProps extends BaseSpaceProps {
  children: React.ReactNode;
  colorBarColor?: string;
  showColorBar?: boolean;
  className?: string;
  contentContainerclassName?: string;
}

export const BaseSpace: React.FC<BaseSpaceComponentProps> = ({
  position,
  onChainProperty,
  children,
  colorBarColor,
  showColorBar = false,
  className = "",
  contentContainerclassName = "",
  ...rest
}) => {
  const { ownerMeta, ownerAddress } = useSpaceOwner(onChainProperty);
  const side = getBoardSide(position);

  const borderClasses = getBorderClasses(position);
  const colorBarClasses = getColorBarClasses(side);
  const ownerIndicatorClasses = getOwnerIndicatorClasses(side);
  const textContainerClasses = getTextContainerClasses(side);

  return (
    // @ts-expect-error
    <div
      className={cn(
        "bg-board-space relative cursor-pointer",
        borderClasses,
        className
      )}
      {...rest}
    >
      {/* Color bar for properties */}
      {showColorBar && colorBarColor && (
        <div
          style={{ backgroundColor: colorBarColor }}
          className={colorBarClasses}
        />
      )}

      {/* Owner indicator */}
      {ownerMeta && ownerAddress && (
        <div
          className={cn(
            "flex items-center justify-center",
            ownerIndicatorClasses
          )}
          // style={{ backgroundColor: ownerMeta.color || "red" }}
        >
          <Avatar className="size-6">
            <AvatarImage
              walletAddress={ownerMeta.name}
              alt={`Player ${ownerMeta.name}`}
            />
            <AvatarFallback
              walletAddress={ownerAddress}
              className="text-white font-semibold"
            >
              {ownerAddress}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Content container with proper text positioning */}
      <div className={cn(textContainerClasses, contentContainerclassName)}>
        {children}
      </div>
    </div>
  );
};
