import React from "react";
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
import { playSound, SOUND_CONFIG } from "@/lib/soundUtil";

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
  onClick,
  ...rest
}) => {
  const { ownerMeta } = useSpaceOwner(onChainProperty);
  const side = getBoardSide(position);

  const borderClasses = getBorderClasses(position);
  const colorBarClasses = getColorBarClasses(side);
  const ownerIndicatorClasses = getOwnerIndicatorClasses(side);
  const textContainerClasses = getTextContainerClasses(side);

  // Handle click with sound
  const handleClick = () => {
    playSound("button-click", SOUND_CONFIG.volumes.buttonClick);
    onClick?.(position);
  };

  return (
    <div
      className={cn(
        "bg-board-space relative cursor-pointer",
        borderClasses,
        className
      )}
      {...rest}
      onClick={handleClick}
    >
      {/* Color bar for properties */}
      {showColorBar && colorBarColor && (
        <div
          style={{ backgroundColor: colorBarColor }}
          className={colorBarClasses}
        />
      )}

      {/* Owner indicator */}
      {ownerMeta && (
        <div
          className={ownerIndicatorClasses}
          style={{ backgroundColor: ownerMeta.color }}
        />
      )}

      {/* Content container with proper text positioning */}
      <div className={cn(textContainerClasses, contentContainerclassName)}>
        {children}
      </div>
    </div>
  );
};
