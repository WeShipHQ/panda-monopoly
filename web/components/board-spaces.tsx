import React from "react";
import { PropertyAccount } from "@/types/types";
import { SpaceTooltip } from "./space-tooltip";

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
  onRightClick?: (position: number) => void;
  onClick?: (position: number) => void;
  property?: PropertyAccount | null;
  playerName?: string;
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
  property,
  playerName,
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

  const children = (
    <button
      className={`bg-[#fafaf8] text-center border border-black ${
        isVertical ? "vertical-space" : ""
      } relative cursor-help`}
    >
      {/* Color bar - positioned differently for vertical vs horizontal spaces */}
      <div className={`${getColorBarClass()} ${colorClass}`}></div>

      <div className="space-container h-full" style={containerStyle}>
        <div
          className={`${nameClass} flex items-center justify-center text-center px-1 ${
            rotate === "top" ? "pt-8" : "pt-1"
          } text-[0.6rem] font-bold`}
        >
          {threeLines && name?.includes("-")
            ? name.split("-").map((part, i) => (
                <React.Fragment key={i}>
                  {part}
                  {i < name.split("-").length - 1 && <br />}
                </React.Fragment>
              ))
            : name}
        </div>
        <div
          className={`text-center ${
            rotate === "top" ? "pb-8 pt-1" : "pb-1"
          } font-normal text-[0.6rem]`}
        >
          ${price}
        </div>
      </div>
    </button>
  );

  if (!position) return <>{children}</>;

  return (
    <SpaceTooltip
      position={position}
      property={property}
      playerName={playerName}
    >
      {children}
    </SpaceTooltip>
  );
};

export const RailroadSpace: React.FC<SpaceProps> = ({
  name,
  price,
  rotate,
  longName = false,
  position,
  playerName,
}) => {
  const containerStyle = {
    transform: getRotationClass(rotate),
  };

  const isVertical = rotate === "left" || rotate === "right";

  const children = (
    <div
      className={`bg-[#fafaf8] text-center border border-black ${
        isVertical ? "vertical-space" : ""
      } cursor-help`}
    >
      <div className="space-container h-full" style={containerStyle}>
        <div
          className={`${rotate === "top" ? "pt-2" : "pt-1"} ${
            longName ? "px-0" : "px-1"
          } text-center text-[0.6rem] font-bold`}
        >
          {name}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg sm:text-xl lg:text-2xl">🚂</div>
        </div>
        <div
          className={`text-center ${
            rotate === "top" ? "pb-8 pt-1" : "pb-1"
          } font-normal text-[0.6rem]`}
        >
          ${price}
        </div>
      </div>
    </div>
  );

  if (!position) return <>{children}</>;

  return (
    <SpaceTooltip position={position} playerName={playerName}>
      {children}
    </SpaceTooltip>
  );
};

export const BeachSpace: React.FC<SpaceProps> = ({
  name,
  price,
  rotate,
  longName = false,
  position,
  playerName,
}) => {
  const containerStyle = {
    transform: getRotationClass(rotate),
  };

  const isVertical = rotate === "left" || rotate === "right";

  const children = (
    <div
      className={`bg-[#e6f3ff] text-center border border-black ${
        isVertical ? "vertical-space" : ""
      } cursor-help`}
    >
      <div className="space-container h-full" style={containerStyle}>
        <div
          className={`${rotate === "top" ? "pt-2" : "pt-1"} ${
            longName ? "px-0" : "px-1"
          } text-center text-[0.6rem] font-bold`}
        >
          {name}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg sm:text-xl lg:text-2xl">🏖️</div>
        </div>
        <div
          className={`text-center ${
            rotate === "top" ? "pb-8 pt-1" : "pb-1"
          } font-normal text-[0.6rem]`}
        >
          ${price}
        </div>
      </div>
    </div>
  );

  if (!position) return <>{children}</>;

  return (
    <SpaceTooltip position={position} playerName={playerName}>
      {children}
    </SpaceTooltip>
  );
};

export const UtilitySpace: React.FC<SpaceProps> = ({
  name,
  price,
  type,
  rotate,
  position,
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

  const children = (
    <div
      className={`bg-[#fafaf8] text-center border border-black ${
        isVertical ? "vertical-space" : ""
      } cursor-help`}
    >
      <div className="space-container h-full" style={containerStyle}>
        <div
          className={`px-1 ${
            rotate === "top" ? "pt-2" : "pt-1"
          } text-center text-[0.6rem] font-bold`}
        >
          {name}
        </div>
        <div className="flex-1 flex items-center justify-center">{icon}</div>
        <div
          className={`text-center ${
            rotate === "top" ? "pb-8 pt-1" : "pb-1"
          } font-normal text-[0.6rem]`}
        >
          ${price}
        </div>
      </div>
    </div>
  );

  if (!position) return <>{children}</>;

  return <SpaceTooltip position={position}>{children}</SpaceTooltip>;
};

export const ChanceSpace: React.FC<SpaceProps> = ({
  rotate,
  position,
  playerName,
}) => {
  const containerStyle = {
    transform: getRotationClass(rotate),
  };

  const isVertical = rotate === "left" || rotate === "right";

  const children = (
    <div
      className={`bg-[#fafaf8] text-center border border-black ${
        isVertical ? "vertical-space" : ""
      } cursor-help`}
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

  if (!position) {
    return children;
  }

  return (
    <SpaceTooltip position={position} playerName={playerName}>
      {children}
    </SpaceTooltip>
  );
};

export const CommunityChestSpace: React.FC<SpaceProps> = ({
  rotate,
  position,
}) => {
  const containerStyle = {
    transform: getRotationClass(rotate),
  };

  const isVertical = rotate === "left" || rotate === "right";

  const children = (
    <div
      className={`bg-[#fafaf8] text-center border border-black ${
        isVertical ? "vertical-space" : ""
      } cursor-help`}
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

  if (!position) return <>{children}</>;

  return <SpaceTooltip position={position}>{children}</SpaceTooltip>;
};

export const TaxSpace: React.FC<SpaceProps> = ({
  name,
  price,
  instructions,
  type,
  rotate,
  position,
}) => {
  const containerStyle = {
    transform: getRotationClass(rotate),
  };

  const isVertical = rotate === "left" || rotate === "right";

  const children = (
    <div
      className={`bg-[#fafaf8] text-center border border-black ${
        isVertical ? "vertical-space" : ""
      } cursor-help`}
    >
      <div
        className={`space-container h-full ${
          type === "income" ? "justify-center items-center" : ""
        }`}
        style={containerStyle}
      >
        <div
          className={`px-1 text-[0.6rem] font-bold ${
            type === "income" ? "pb-1" : rotate === "top" ? "pt-2" : "pt-1"
          } text-center`}
        >
          {name}
        </div>

        {type === "income" ? (
          <>
            <div className="inline-block w-1 h-1 bg-black transform rotate-45"></div>
            <div
              className={`px-1 py-1 text-center text-[0.6rem] ${
                rotate === "top" ? "pb-7" : ""
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
                rotate === "top" ? "pb-8 pt-1" : "pb-1"
              } text-center text-[0.6rem]`}
            >
              Pay ${price}
            </div>
          </>
        )}
      </div>
    </div>
  );

  if (!position) return <>{children}</>;

  return <SpaceTooltip position={position}>{children}</SpaceTooltip>;
};
