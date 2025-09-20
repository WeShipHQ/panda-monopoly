import React from "react";
import { playSound, SOUND_CONFIG } from "@/lib/soundUtil";
import {
  PropertyPopover,
  RailroadPopover,
  UtilityPopover,
  TaxPopover,
  SpecialPopover,
} from "./space-popovers";
import { getPropertyData } from "@/data/unified-monopoly-data";
import {
  PropertySpaceProps,
  RailroadSpaceProps,
  BeachSpaceProps,
  UtilitySpaceProps,
  ChanceSpaceProps,
  CommunityChestSpaceProps,
  TaxSpaceProps,
  CornerSpaceProps,
} from "@/types/space-types";
import { isSome } from "@solana/kit";
import { generatePlayerIcon } from "@/lib/utils";

const getRotationClass = (rotate?: string) => {
  switch (rotate) {
    case "left":
      return "rotate(90deg)";
    case "top":
      return "rotate(180deg)";
    case "right":
      return "rotate(270deg)";
    default:
      return "";
  }
};

export const PropertySpace: React.FC<PropertySpaceProps> = ({
  name,
  price,
  colorClass,
  rotate,
  longName = false,
  threeLines = false,
  position,
  property,
  playerName,
  onChainProperty,
}) => {
  const ownerAddress =
    onChainProperty && isSome(onChainProperty.owner)
      ? onChainProperty.owner.value
      : null;
  const ownerMeta = ownerAddress ? generatePlayerIcon(ownerAddress) : null;

  const containerStyle = {
    transform: getRotationClass(rotate),
  };

  const nameClass = longName
    ? "px-0"
    : threeLines
    ? "px-[15px] relative top-[5px]"
    : "px-[15px]";

  const isVertical = rotate === "left" || rotate === "right";

  // For different orientations, we need different positioning
  const getColorBarClass = () => {
    if (rotate === "left") {
      return "absolute right-0 top-0 h-full w-4 border-l border-black";
    } else if (rotate === "right") {
      return "absolute left-0 top-0 h-full w-4 border-r border-black";
    } else if (rotate === "top") {
      return "absolute bottom-0 left-0 w-full h-4 border-t border-black";
    } else {
      return "color-bar border-b border-black h-4";
    }
  };

  const getColorOwnedClass = () => {
    if (rotate === "left") {
      return "left-0 top-0 h-full w-3";
    } else if (rotate === "right") {
      return "right-0 top-0 h-full w-3";
    } else if (rotate === "top") {
      return "top-0 left-0 w-full h-3";
    } else {
      return "bottom-0 w-full h-3";
    }
  };

  // const handleClick = (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   playSound("button-click", SOUND_CONFIG.volumes.buttonClick);
  //   if (onClick && position !== undefined) {
  //     onClick(position);
  //   }
  // };

  const children = (
    <div
      className={`bg-[#fafaf8] text-center border border-black ${
        isVertical ? "vertical-space" : ""
      } relative cursor-pointer`}
      // onClick={handleClick}
    >
      {/* Color bar - positioned differently for vertical vs horizontal spaces */}
      <div className={`${getColorBarClass()} ${colorClass}`} />

      {ownerMeta && (
        <div
          className={`absolute ${getColorOwnedClass()}`}
          style={{
            backgroundColor: ownerMeta.color,
          }}
        />
      )}

      <div className="space-container h-full" style={containerStyle}>
        <div
          className={`${nameClass} flex items-center justify-center text-center px-1 ${
            rotate === "top" ? "pt-6" : "pt-1"
          } text-[0.35rem] sm:text-[0.4rem] lg:text-[0.5rem] font-bold leading-tight`}
        >
          {threeLines && name?.includes("-")
            ? name.split("-").map((part: string, i: number) => (
                <React.Fragment key={i}>
                  {part}
                  {i < name.split("-").length - 1 && <br />}
                </React.Fragment>
              ))
            : name}
        </div>
        <div
          className={`text-center ${
            rotate === "top" ? "pb-6 pt-1" : "pb-1"
          } font-normal text-[0.35rem] sm:text-[0.4rem] lg:text-[0.5rem]`}
        >
          ${price} - {rotate}
        </div>
      </div>
    </div>
  );

  if (!position) return <>{children}</>;

  const propertyData = getPropertyData(position);

  if (!propertyData) {
    return <>{children}</>;
  }

  return (
    <PropertyPopover
      propertyData={propertyData}
      property={property}
      playerName={playerName}
    >
      {children}
    </PropertyPopover>
  );
};

export const RailroadSpace: React.FC<RailroadSpaceProps> = ({
  name,
  price,
  rotate,
  longName = false,
  position,
  onClick,
  property,
  playerName,
  onChainProperty,
}) => {
  const ownerAddress =
    onChainProperty && isSome(onChainProperty.owner)
      ? onChainProperty.owner.value
      : null;
  const ownerMeta = ownerAddress ? generatePlayerIcon(ownerAddress) : null;

  const containerStyle = {
    transform: getRotationClass(rotate),
  };

  const isVertical = rotate === "left" || rotate === "right";

  const getColorOwnedClass = () => {
    if (rotate === "left") {
      return "left-0 top-0 h-full w-3";
    } else if (rotate === "right") {
      return "right-0 top-0 h-full w-3";
    } else if (rotate === "top") {
      return "top-0 left-0 w-full h-3";
    } else {
      return "bottom-0 w-full h-3";
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    playSound("button-click", SOUND_CONFIG.volumes.buttonClick);
    if (onClick && position !== undefined) {
      onClick(position);
    }
  };

  const children = (
    <div
      className={`relative bg-[#fafaf8] text-center border border-black ${
        isVertical ? "vertical-space" : ""
      } cursor-pointer`}
    >
      <div className="space-container h-full" style={containerStyle}>
        <div
          className={`${rotate === "top" ? "pt-1" : "pt-1"} ${
            longName ? "px-0" : "px-1"
          } text-center text-[0.35rem] sm:text-[0.4rem] lg:text-[0.5rem] font-bold leading-tight`}
        >
          {name}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg sm:text-xl lg:text-2xl">🚂</div>
        </div>
        <div
          className={`text-center ${
            rotate === "top" ? "pb-6 pt-1" : "pb-1"
          } font-normal text-[0.35rem] sm:text-[0.4rem] lg:text-[0.5rem]`}
        >
          ${price}
        </div>
      </div>

      {ownerMeta && (
        <div
          className={`absolute ${getColorOwnedClass()}`}
          style={{
            backgroundColor: ownerMeta.color,
          }}
        />
      )}
    </div>
  );

  if (!position) {
    return children;
  }

  const propertyData = getPropertyData(position);

  if (!propertyData) {
    return children;
  }

  return (
    <RailroadPopover
      propertyData={propertyData}
      property={property}
      playerName={playerName}
    >
      {children}
    </RailroadPopover>
  );
};

export const BeachSpace: React.FC<BeachSpaceProps> = ({
  name,
  price,
  rotate,
  longName = false,
  position,
  onClick,
  property,
  playerName,
}) => {
  const containerStyle = {
    transform: getRotationClass(rotate),
  };

  const isVertical = rotate === "left" || rotate === "right";

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    playSound("button-click", SOUND_CONFIG.volumes.buttonClick);
    if (onClick && position !== undefined) {
      onClick(position);
    }
  };

  if (!position) {
    return (
      <div className="bg-[#e6f3ff] text-center border border-black">
        <div className="text-xs">{name}</div>
        <div className="text-lg">🏖️</div>
        <div className="text-xs">${price}</div>
      </div>
    );
  }

  const propertyData = getPropertyData(position);
  if (!propertyData) {
    return (
      <div className="bg-[#e6f3ff] text-center border border-black">
        <div className="text-xs">{name}</div>
        <div className="text-lg">🏖️</div>
        <div className="text-xs">${price}</div>
      </div>
    );
  }

  return (
    <SpecialPopover
      propertyData={propertyData}
      property={property}
      playerName={playerName}
    >
      <div
        className={`bg-[#e6f3ff] text-center border border-black ${
          isVertical ? "vertical-space" : ""
        } cursor-pointer`}
        onClick={handleClick}
      >
        <div className="space-container h-full" style={containerStyle}>
          <div
            className={`${rotate === "top" ? "pt-1" : "pt-1"} ${
              longName ? "px-0" : "px-1"
            } text-center text-[0.35rem] sm:text-[0.4rem] lg:text-[0.5rem] font-bold leading-tight`}
          >
            {name}
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-lg sm:text-xl lg:text-2xl">🏖️</div>
          </div>
          <div
            className={`text-center ${
              rotate === "top" ? "pb-6 pt-1" : "pb-1"
            } font-normal text-[0.35rem] sm:text-[0.4rem] lg:text-[0.5rem]`}
          >
            ${price}
          </div>
        </div>
      </div>
    </SpecialPopover>
  );
};

export const UtilitySpace: React.FC<UtilitySpaceProps> = ({
  name,
  price,
  type,
  rotate,
  position,
  onClick,
  property,
  playerName,
}) => {
  const containerStyle = {
    transform: getRotationClass(rotate),
  };

  const icon =
    type === "electric" ? (
      <div className="text-lg sm:text-xl lg:text-2xl">💡</div>
    ) : (
      <div className="text-lg sm:text-xl lg:text-2xl">💧</div>
    );

  const isVertical = rotate === "left" || rotate === "right";

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    playSound("button-click", SOUND_CONFIG.volumes.buttonClick);
    if (onClick && position !== undefined) {
      onClick(position);
    }
  };

  if (!position) {
    return (
      <div className="bg-[#fafaf8] text-center border border-black">
        <div className="text-xs">{name}</div>
        <div className="text-lg">{icon}</div>
        <div className="text-xs">${price}</div>
      </div>
    );
  }

  const propertyData = getPropertyData(position);
  if (!propertyData) {
    return (
      <div className="bg-[#fafaf8] text-center border border-black">
        <div className="text-xs">{name}</div>
        <div className="text-lg">{icon}</div>
        <div className="text-xs">${price}</div>
      </div>
    );
  }

  return (
    <UtilityPopover
      propertyData={propertyData}
      property={property}
      playerName={playerName}
    >
      <div
        className={`bg-[#fafaf8] text-center border border-black ${
          isVertical ? "vertical-space" : ""
        } cursor-pointer`}
        // onClick={handleClick}
      >
        <div className="space-container h-full" style={containerStyle}>
          <div
            className={`px-1 ${
              rotate === "top" ? "pt-1" : "pt-1"
            } text-center text-[0.35rem] sm:text-[0.4rem] lg:text-[0.5rem] font-bold leading-tight`}
          >
            {name}
          </div>
          <div className="flex-1 flex items-center justify-center">{icon}</div>
          <div
            className={`text-center ${
              rotate === "top" ? "pb-6 pt-1" : "pb-1"
            } font-normal text-[0.35rem] sm:text-[0.4rem] lg:text-[0.5rem]`}
          >
            ${price}
          </div>
        </div>
      </div>
    </UtilityPopover>
  );
};

export const ChanceSpace: React.FC<ChanceSpaceProps> = ({
  rotate,
  blueIcon = false,
  position,
  onClick,
  property,
  playerName,
}) => {
  const containerStyle = {
    transform: getRotationClass(rotate),
  };

  const isVertical = rotate === "left" || rotate === "right";

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    playSound("button-click", SOUND_CONFIG.volumes.buttonClick);
    if (onClick && position !== undefined) {
      onClick(position);
    }
  };

  if (!position) {
    return (
      <div className="bg-[#fafaf8] text-center border border-black">
        <div className="flex items-center justify-center h-full">
          <img
            src="/images/CHANCE.png"
            alt="Chance"
            className="w-6 h-6 object-contain"
          />
        </div>
      </div>
    );
  }

  const propertyData = getPropertyData(position);
  if (!propertyData) {
    return (
      <div className="bg-[#fafaf8] text-center border border-black">
        <div className="flex items-center justify-center h-full">
          <img
            src="/images/CHANCE.png"
            alt="Chance"
            className="w-6 h-6 object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <SpecialPopover
      propertyData={propertyData}
      property={property}
      playerName={playerName}
    >
      <div
        className={`bg-[#fafaf8] text-center border border-black ${
          isVertical ? "vertical-space" : ""
        } cursor-pointer`}
        // onClick={handleClick}
      >
        <div
          className="space-container justify-center h-full"
          style={containerStyle}
        >
          <div className="flex-1 flex items-center justify-center">
            <img
              src="/images/CHANCE.png"
              alt="Chance"
              className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 object-contain"
            />
          </div>
        </div>
      </div>
    </SpecialPopover>
  );
};

export const CommunityChestSpace: React.FC<CommunityChestSpaceProps> = ({
  rotate,
  position,
  onClick,
  property,
  playerName,
}) => {
  const containerStyle = {
    transform: getRotationClass(rotate),
  };

  const isVertical = rotate === "left" || rotate === "right";

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    playSound("button-click", SOUND_CONFIG.volumes.buttonClick);
    if (onClick && position !== undefined) {
      onClick(position);
    }
  };

  if (!position) {
    return (
      <div className="bg-[#fafaf8] text-center border border-black">
        <div className="flex items-center justify-center h-full">
          <img
            src="/images/CHEST.png"
            alt="Community Chest"
            className="w-6 h-6 object-contain"
          />
        </div>
      </div>
    );
  }

  const propertyData = getPropertyData(position);
  if (!propertyData) {
    return (
      <div className="bg-[#fafaf8] text-center border border-black">
        <div className="flex items-center justify-center h-full">
          <img
            src="/images/CHEST.png"
            alt="Community Chest"
            className="w-6 h-6 object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <SpecialPopover
      propertyData={propertyData}
      property={property}
      playerName={playerName}
    >
      <div
        className={`bg-[#fafaf8] text-center border border-black ${
          isVertical ? "vertical-space" : ""
        } cursor-pointer`}
        // onClick={handleClick}
      >
        <div
          className="space-container justify-center h-full"
          style={containerStyle}
        >
          <div className="flex-1 flex items-center justify-center">
            <img
              src="/images/CHEST.png"
              alt="Community Chest"
              className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 object-contain"
            />
          </div>
        </div>
      </div>
    </SpecialPopover>
  );
};

export const TaxSpace: React.FC<TaxSpaceProps> = ({
  name,
  price,
  instructions,
  type,
  rotate,
  position,
  onClick,
  property,
  playerName,
}) => {
  const containerStyle = {
    transform: getRotationClass(rotate),
  };

  const isVertical = rotate === "left" || rotate === "right";

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    playSound("button-click", SOUND_CONFIG.volumes.buttonClick);
    if (onClick && position !== undefined) {
      onClick(position);
    }
  };

  if (!position) {
    return (
      <div className="bg-[#fafaf8] text-center border border-black">
        <div className="text-xs">{name}</div>
        <div className="text-lg">💎</div>
        <div className="text-xs">Pay ${price}</div>
      </div>
    );
  }

  const propertyData = getPropertyData(position);
  if (!propertyData) {
    return (
      <div className="bg-[#fafaf8] text-center border border-black">
        <div className="text-xs">{name}</div>
        <div className="text-lg">💎</div>
        <div className="text-xs">Pay ${price}</div>
      </div>
    );
  }

  return (
    <TaxPopover
      propertyData={propertyData}
      property={property}
      playerName={playerName}
    >
      <div
        className={`bg-[#fafaf8] text-center border border-black ${
          isVertical ? "vertical-space" : ""
        } cursor-pointer`}
        // onClick={handleClick}
      >
        <div
          className={`space-container h-full ${
            type === "income" ? "justify-center items-center" : ""
          }`}
          style={containerStyle}
        >
          <div
            className={`px-1 text-[0.35rem] sm:text-[0.4rem] lg:text-[0.5rem] font-bold leading-tight ${
              type === "income" ? "pb-1" : rotate === "top" ? "pt-1" : "pt-1"
            } text-center`}
          >
            {name}
          </div>

          {type === "income" ? (
            <>
              <div className="inline-block w-1 h-1 bg-black transform rotate-45"></div>
              <div
                className={`px-1 py-1 text-center text-[0.35rem] sm:text-[0.4rem] lg:text-[0.5rem] leading-tight ${
                  rotate === "top" ? "pb-5" : ""
                }`}
                dangerouslySetInnerHTML={{
                  __html: instructions?.replace("or", "<br>or<br>") || "",
                }}
              ></div>
            </>
          ) : (
            <>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-lg sm:text-xl lg:text-2xl">💎</div>
              </div>
              <div
                className={`px-1 ${
                  rotate === "top" ? "pb-6 pt-1" : "pb-1"
                } text-center text-[0.35rem] sm:text-[0.4rem] lg:text-[0.5rem]`}
              >
                Pay ${price}
              </div>
            </>
          )}
        </div>
      </div>
    </TaxPopover>
  );
};
