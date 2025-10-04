import React from "react";
import { cn } from "@/lib/utils";
import {
  getBorderClasses,
  getBoardSide,
  getColorBarClasses,
  getOwnerIndicatorClasses,
  getTextContainerClasses,
  getTextRotationClass,
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
  const textRotationClass = getTextRotationClass(side);

  // Check for houses and hotels
  const houses = onChainProperty?.houses || 0;
  const hasHotel = onChainProperty?.hasHotel || false;
  
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
      {ownerMeta && (
        <div className={ownerIndicatorClasses}>
          <div 
            className="w-full h-full relative overflow-hidden flex items-center justify-center"
            style={{ 
              background: `linear-gradient(45deg, ${ownerMeta.color}, ${ownerMeta.color})`,
              boxShadow: `inset 0 0 8px rgba(255,255,255,0.5), 0 2px 4px rgba(0,0,0,0.5)`,
              borderTop: '1px solid rgba(255,255,255,0.9)',
              borderLeft: '1px solid rgba(255,255,255,0.7)',
              borderRight: '1px solid rgba(0,0,0,0.2)',
              borderBottom: '1px solid rgba(0,0,0,0.3)',
              filter: 'saturate(1.3) brightness(1.1)'
            }}
          >
            {/* Ownership pattern - subtle diagonal lines */}
            <div className="absolute inset-0 opacity-10" 
              style={{ 
                backgroundImage: `repeating-linear-gradient(45deg, #fff, #fff 1px, transparent 1px, transparent 8px)`,
                backgroundSize: '10px 10px'
              }}
            />

            {/* Wallet address (first 3 characters) */}
            <div 
              className={`text-white text-[10px] font-extrabold z-10 select-none flex items-center justify-center ${textRotationClass}`}
              style={{ 
                textShadow: '0px 1px 3px rgba(0,0,0,0.7)',
                letterSpacing: '-0.5px',
                height: side === 'left' || side === 'right' ? '100%' : 'auto',
                width: side === 'left' || side === 'right' ? 'auto' : '100%'
              }}
            >
              {ownerAddress ? ownerAddress.substring(0, 3) : (ownerMeta.name?.charAt(0) || '')}
            </div>

            {/* Buildings - Houses */}
            {houses > 0 && !hasHotel && (
              <div className={`absolute bottom-0 w-full flex justify-center items-center gap-0.5 py-0.5`}>
                {Array.from({ length: houses }).map((_, i) => (
                  <div
                    key={i}
                    className="relative w-1.5 h-3.5"
                    title={`${houses} house${houses > 1 ? 's' : ''}`}
                  >
                    {/* House body */}
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-2.5 bg-gradient-to-b from-green-500 to-green-700 border border-white"
                      style={{ 
                        boxShadow: '0 1px 2px rgba(0,0,0,0.4)'
                      }}
                    />
                    {/* House roof */}
                    <div 
                      className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-b from-red-600 to-red-800 border border-white"
                      style={{
                        clipPath: 'polygon(0% 100%, 50% 0%, 100% 100%)'
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
            
            {/* Buildings - Hotel */}
            {hasHotel && (
              <div className="absolute bottom-0 w-full flex justify-center items-center py-0.5">
                <div
                  className="relative w-5 h-5"
                  title="Hotel"
                >
                  {/* Hotel base */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-3.5 bg-gradient-to-b from-red-600 to-red-800 border border-white"
                    style={{ 
                      boxShadow: '0 1px 2px rgba(0,0,0,0.5)'
                    }}
                  />
                  {/* Hotel roof */}
                  <div 
                    className="absolute top-0 left-0.5 right-0.5 h-2 bg-gradient-to-br from-slate-300 to-slate-500 border border-white"
                    style={{
                      boxShadow: '0 1px 1px rgba(0,0,0,0.3)'
                    }}
                  />
                  {/* Hotel door */}
                  <div 
                    className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-2 bg-yellow-100 border border-yellow-700"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content container with proper text positioning */}
      <div className={cn(textContainerClasses, contentContainerclassName)}>
        {children}
      </div>
    </div>
  );
};
