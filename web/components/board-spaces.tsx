import React from "react";
import { playSound, SOUND_CONFIG } from "@/lib/soundUtil";

type SpaceProps = {
  name?: string;
  price?: string;
  colorClass?: string;
  rotate?: "left" | "top" | "right";
  longName?: boolean;
  threeLines?: boolean;
  instructions?: string;
  type?: string;
  blueIcon?: boolean;
  position?: number;
  onClick?: (position: number) => void;
};

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

export const PropertySpace: React.FC<SpaceProps> = ({
  name,
  price,
  colorClass,
  rotate,
  longName = false,
  threeLines = false,
  position,
  onClick,
}) => {
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

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    playSound("button-click", SOUND_CONFIG.volumes.buttonClick);
    if (onClick && position !== undefined) {
      onClick(position);
    }
  };

  return (
    <div
      className={`bg-[#fafaf8] text-center border border-black ${isVertical ? "vertical-space" : ""} relative cursor-pointer`}
      onClick={handleClick}
    >
      {/* Color bar - positioned differently for vertical vs horizontal spaces */}
      <div className={`${getColorBarClass()} ${colorClass}`}></div>

      <div
        className="space-container h-full"
        style={containerStyle}
      >
        <div className={`${nameClass} flex items-center justify-center text-center px-1 ${rotate === "top" ? "pt-6" : "pt-1"} text-[0.35rem] sm:text-[0.4rem] lg:text-[0.5rem] font-bold leading-tight`}>
          {threeLines && name?.includes("-")
            ? name.split("-").map((part, i) => (
              <React.Fragment key={i}>
                {part}
                {i < name.split("-").length - 1 && <br />}
              </React.Fragment>
            ))
            : name}
        </div>
        <div className={`text-center ${rotate === "top" ? "pb-6 pt-1" : "pb-1"} font-normal text-[0.35rem] sm:text-[0.4rem] lg:text-[0.5rem]`}>${price}</div>
      </div>
    </div>
  );
};

export const RailroadSpace: React.FC<SpaceProps> = ({
  name,
  price,
  rotate,
  longName = false,
  position,
  onClick,
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

  return (
    <div
      className={`bg-[#fafaf8] text-center border border-black ${isVertical ? "vertical-space" : ""} cursor-pointer`}
      onClick={handleClick}
    >
      <div
        className="space-container h-full"
        style={containerStyle}
      >
        <div className={`${rotate === "top" ? "pt-1" : "pt-1"} ${longName ? "px-0" : "px-1"} text-center text-[0.35rem] sm:text-[0.4rem] lg:text-[0.5rem] font-bold leading-tight`}>
          {name}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg sm:text-xl lg:text-2xl">🚂</div>
        </div>
        <div className={`text-center ${rotate === "top" ? "pb-6 pt-1" : "pb-1"} font-normal text-[0.35rem] sm:text-[0.4rem] lg:text-[0.5rem]`}>${price}</div>
      </div>
    </div>
  );
};

export const BeachSpace: React.FC<SpaceProps> = ({
  name,
  price,
  rotate,
  longName = false,
  position,
  onClick,
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

  return (
    <div
      className={`bg-[#e6f3ff] text-center border border-black ${isVertical ? "vertical-space" : ""} cursor-pointer`}
      onClick={handleClick}
    >
      <div
        className="space-container h-full"
        style={containerStyle}
      >
        <div className={`${rotate === "top" ? "pt-1" : "pt-1"} ${longName ? "px-0" : "px-1"} text-center text-[0.35rem] sm:text-[0.4rem] lg:text-[0.5rem] font-bold leading-tight`}>
          {name}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg sm:text-xl lg:text-2xl">🏖️</div>
        </div>
        <div className={`text-center ${rotate === "top" ? "pb-6 pt-1" : "pb-1"} font-normal text-[0.35rem] sm:text-[0.4rem] lg:text-[0.5rem]`}>${price}</div>
      </div>
    </div>
  );
};

export const UtilitySpace: React.FC<SpaceProps> = ({
  name,
  price,
  type,
  rotate,
  position,
  onClick,
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

  return (
    <div
      className={`bg-[#fafaf8] text-center border border-black ${isVertical ? "vertical-space" : ""} cursor-pointer`}
      onClick={handleClick}
    >
      <div
        className="space-container h-full"
        style={containerStyle}
      >
        <div className={`px-1 ${rotate === "top" ? "pt-1" : "pt-1"} text-center text-[0.35rem] sm:text-[0.4rem] lg:text-[0.5rem] font-bold leading-tight`}>{name}</div>
        <div className="flex-1 flex items-center justify-center">{icon}</div>
        <div className={`text-center ${rotate === "top" ? "pb-6 pt-1" : "pb-1"} font-normal text-[0.35rem] sm:text-[0.4rem] lg:text-[0.5rem]`}>${price}</div>
      </div>
    </div>
  );
};

export const ChanceSpace: React.FC<SpaceProps> = ({
  rotate,
  blueIcon = false,
  position,
  onClick,
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

  return (
    <div
      className={`bg-[#fafaf8] text-center border border-black ${isVertical ? "vertical-space" : ""} cursor-pointer`}
      onClick={handleClick}
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
  );
};

export const CommunityChestSpace: React.FC<SpaceProps> = ({
  rotate,
  position,
  onClick,
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

  return (
    <div
      className={`bg-[#fafaf8] text-center border border-black ${isVertical ? "vertical-space" : ""} cursor-pointer`}
      onClick={handleClick}
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
  );
};

export const TaxSpace: React.FC<SpaceProps> = ({
  name,
  price,
  instructions,
  type,
  rotate,
  position,
  onClick,
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

  return (
    <div
      className={`bg-[#fafaf8] text-center border border-black ${isVertical ? "vertical-space" : ""} cursor-pointer`}
      onClick={handleClick}
    >
      <div
        className={`space-container h-full ${type === "income" ? "justify-center items-center" : ""}`}
        style={containerStyle}
      >
        <div
          className={`px-1 text-[0.35rem] sm:text-[0.4rem] lg:text-[0.5rem] font-bold leading-tight ${type === "income" ? "pb-1" : rotate === "top" ? "pt-1" : "pt-1"} text-center`}
        >
          {name}
        </div>

        {type === "income" ? (
          <>
            <div className="inline-block w-1 h-1 bg-black transform rotate-45"></div>
            <div
              className={`px-1 py-1 text-center text-[0.35rem] sm:text-[0.4rem] lg:text-[0.5rem] leading-tight ${rotate === "top" ? "pb-5" : ""}`}
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
            <div className={`px-1 ${rotate === "top" ? "pb-6 pt-1" : "pb-1"} text-center text-[0.35rem] sm:text-[0.4rem] lg:text-[0.5rem]`}>Pay ${price}</div>
          </>
        )}
      </div>
    </div>
  );
};