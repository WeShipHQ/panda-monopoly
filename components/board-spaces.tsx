import React from "react";

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

  return (
    <div
      className={`bg-[#fafaf8] text-center ${isVertical ? "vertical-space" : ""
        }`}
    >
      <div
        className="space-container"
        style={containerStyle}
      >
        <div className={`color-bar border-b-2 border-black ${colorClass}`}></div>
        <div className={`${nameClass} flex-1 flex items-center justify-center text-center px-2`}>
          {threeLines && name?.includes("-")
            ? name.split("-").map((part, i) => (
              <React.Fragment key={i}>
                {part}
                {i < name.split("-").length - 1 && <br />}
              </React.Fragment>
            ))
            : name}
        </div>
        <div className="text-center pb-1 font-normal">Price ${price}</div>
      </div>
    </div>
  );
};

export const RailroadSpace: React.FC<SpaceProps> = ({
  name,
  price,
  rotate,
  longName = false,
}) => {
  const containerStyle = {
    transform: getRotationClass(rotate),
  };

  const isVertical = rotate === "left" || rotate === "right";

  return (
    <div
      className={`bg-[#fafaf8] text-center ${isVertical ? "vertical-space" : ""
        }`}
    >
      <div
        className="space-container"
        style={containerStyle}
      >
        <div className={`pt-2 ${longName ? "px-0" : "px-2"} text-center`}>
          {name}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <i className="fa fa-subway icon-large text-black"></i>
        </div>
        <div className="text-center pb-1 font-normal">Price ${price}</div>
      </div>
    </div>
  );
};

export const UtilitySpace: React.FC<SpaceProps> = ({
  name,
  price,
  type,
  rotate,
}) => {
  const containerStyle = {
    transform: getRotationClass(rotate),
  };

  const icon =
    type === "electric" ? (
      <i className="fa fa-lightbulb-o text-[#ffed20] icon-medium"></i>
    ) : (
      <i className="fa fa-tint text-[#5a6dba] icon-medium"></i>
    );

  const isVertical = rotate === "left" || rotate === "right";

  return (
    <div
      className={`bg-[#fafaf8] text-center ${isVertical ? "vertical-space" : ""
        }`}
    >
      <div
        className="space-container"
        style={containerStyle}
      >
        <div className="px-2 pt-2 text-center">{name}</div>
        <div className="flex-1 flex items-center justify-center">{icon}</div>
        <div className="text-center pb-1 font-normal">Price ${price}</div>
      </div>
    </div>
  );
};

export const ChanceSpace: React.FC<SpaceProps> = ({
  rotate,
  blueIcon = false,
}) => {
  const containerStyle = {
    transform: getRotationClass(rotate),
  };

  const isVertical = rotate === "left" || rotate === "right";

  return (
    <div
      className={`bg-[#fafaf8] text-center ${isVertical ? "vertical-space" : ""
        }`}
    >
      <div
        className="space-container justify-center"
        style={containerStyle}
      >
        <div className="flex-1 flex items-center justify-center">
          <img
            src="/images/CHANCE.png"
            alt="Chance"
            className="w-30 h-30 object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export const CommunityChestSpace: React.FC<SpaceProps> = ({ rotate }) => {
  const containerStyle = {
    transform: getRotationClass(rotate),
  };

  const isVertical = rotate === "left" || rotate === "right";

  return (
    <div
      className={`bg-[#fafaf8] text-center ${isVertical ? "vertical-space" : ""
        }`}
    >
      <div
        className="space-container justify-center"
        style={containerStyle}
      >
        <div className="flex-1 flex items-center justify-center">
          <img
            src="/images/CHEST.png"
            alt="Community Chest"
            className="w-30 h-30 object-contain"
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
}) => {
  const containerStyle = {
    transform: getRotationClass(rotate),
  };

  const isVertical = rotate === "left" || rotate === "right";

  return (
    <div
      className={`bg-[#fafaf8] text-center ${isVertical ? "vertical-space" : ""
        }`}
    >
      <div
        className={`space-container ${type === "income" ? "justify-center items-center" : ""
          }`}
        style={containerStyle}
      >
        <div
          className={`px-2 text-sm ${type === "income" ? "pb-1" : "pt-2"
            } text-center`}
        >
          {name}
        </div>

        {type === "income" ? (
          <>
            <div className="inline-block w-1 h-1 bg-black transform rotate-45"></div>
            <div
              className="px-2 py-1 text-center text-xs"
              dangerouslySetInnerHTML={{
                __html: instructions?.replace("or", "<br>or<br>") || "",
              }}
            ></div>
          </>
        ) : (
          <>
            <div className="flex-1 flex items-center justify-center">
              <i className="fa fa-diamond icon-medium"></i>
            </div>
            <div className="px-2 pb-1 text-center">Pay ${price}</div>
          </>
        )}
      </div>
    </div>
  );
};
