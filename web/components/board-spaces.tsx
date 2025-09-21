import React from "react";
import {
  PropertyPopover,
  RailroadPopover,
  UtilityPopover,
  TaxPopover,
  SpecialPopover,
} from "./space-popovers";
import { isSome } from "@solana/kit";
import { cn, formatPrice, generatePlayerIcon } from "@/lib/utils";
import {
  colorMap,
  PropertySpace as PropertySpaceType,
  RailroadSpace as RailroadSpaceType,
  UtilitySpace as UtilitySpaceType,
  ChanceSpace as ChanceSpaceType,
  CommunityChestSpace as CommunityChestSpaceType,
  TaxSpace as TaxSpaceType,
} from "@/configs/board-data";
import { getTypedSpaceData } from "@/lib/board-utils";
import { PropertyAccount } from "@/types/schema";

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

export interface BaseSpaceProps {
  position: number;
  rotate?: "left" | "top" | "right";
  onClick?: (position: number) => void;
  property?: PropertyAccount | null;
  onChainProperty?: PropertyAccount | null;
}

export type PropertySpaceProps = BaseSpaceProps & PropertySpaceType;

export const PropertySpace: React.FC<PropertySpaceProps> = ({
  name,
  price,
  colorGroup,
  rotate,
  position,
  property,
  onChainProperty,
}) => {
  const ownerAddress =
    onChainProperty && isSome(onChainProperty.owner)
      ? onChainProperty.owner.value
      : null;
  const ownerMeta = ownerAddress ? generatePlayerIcon(ownerAddress) : null;

  const color = colorMap[colorGroup];

  const containerStyle = {
    transform: getRotationClass(rotate),
  };

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
      className={cn(
        "bg-board-space text-center border border-black relative cursor-pointer",
        { "vertical-space": isVertical }
      )}
    >
      <div
        style={{
          backgroundColor: color,
        }}
        className={getColorBarClass()}
      />

      {ownerMeta && (
        <div
          className={cn("absolute", getColorOwnedClass())}
          style={{
            backgroundColor: ownerMeta.color,
          }}
        />
      )}

      <div className="space-container h-full" style={containerStyle}>
        <div
          className={cn(
            "flex items-center justify-center text-center px-1",
            { "pt-6": rotate === "top", "pt-1": rotate !== "top" },
            "text-[0.35rem] sm:text-[0.4rem] lg:text-[0.5rem] font-bold leading-tight"
          )}
        >
          {/* {threeLines && name?.includes("-")
            ? name.split("-").map((part: string, i: number) => (
                <React.Fragment key={i}>
                  {part}
                  {i < name.split("-").length - 1 && <br />}
                </React.Fragment>
              ))
            : name} */}
          {name}
        </div>
        <div
          className={cn(
            "text-center",
            { "pb-6 pt-1": rotate === "top", "pb-1": rotate !== "top" },
            "font-normal text-[0.35rem] sm:text-[0.4rem] lg:text-[0.5rem]"
          )}
        >
          {formatPrice(Number(price))}
        </div>
      </div>
    </div>
  );

  if (!position) return <>{children}</>;

  const propertyData = getTypedSpaceData(position, "property");

  if (!propertyData) {
    return <>{children}</>;
  }

  return (
    <PropertyPopover
      propertyData={propertyData}
      property={property}
      // playerName={playerName}
    >
      {children}
    </PropertyPopover>
  );
};

export type RailroadSpaceProps = BaseSpaceProps & RailroadSpaceType;

export const RailroadSpace: React.FC<RailroadSpaceProps> = ({
  name,
  price,
  rotate,
  position,
  property,
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

  // const handleClick = (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   playSound("button-click", SOUND_CONFIG.volumes.buttonClick);
  //   if (onClick && position !== undefined) {
  //     onClick(position);
  //   }
  // };

  const children = (
    <div
      className={`relative bg-[#fafaf8] text-center border border-black ${
        isVertical ? "vertical-space" : ""
      } cursor-pointer`}
    >
      <div className="space-container h-full" style={containerStyle}>
        <div
          className={`${rotate === "top" ? "pt-1" : "pt-1"} ${
            false ? "px-0" : "px-1"
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

  const propertyData = getTypedSpaceData(position, "railroad");

  if (!propertyData) {
    return children;
  }

  return (
    <RailroadPopover propertyData={propertyData} property={property}>
      {children}
    </RailroadPopover>
  );
};

// export const BeachSpace: React.FC<BeachSpaceProps> = ({
//   name,
//   price,
//   rotate,
//   longName = false,
//   position,
//   onClick,
//   property,
//   playerName,
// }) => {
//   const containerStyle = {
//     transform: getRotationClass(rotate),
//   };

//   const isVertical = rotate === "left" || rotate === "right";

//   const handleClick = (e: React.MouseEvent) => {
//     e.preventDefault();
//     playSound("button-click", SOUND_CONFIG.volumes.buttonClick);
//     if (onClick && position !== undefined) {
//       onClick(position);
//     }
//   };

//   if (!position) {
//     return (
//       <div className="bg-[#e6f3ff] text-center border border-black">
//         <div className="text-xs">{name}</div>
//         <div className="text-lg">🏖️</div>
//         <div className="text-xs">${price}</div>
//       </div>
//     );
//   }

//   const propertyData = getBoardSpaceData(position);
//   if (!propertyData) {
//     return (
//       <div className="bg-[#e6f3ff] text-center border border-black">
//         <div className="text-xs">{name}</div>
//         <div className="text-lg">🏖️</div>
//         <div className="text-xs">${price}</div>
//       </div>
//     );
//   }

//   return (
//     <SpecialPopover
//       propertyData={propertyData}
//       property={property}
//       playerName={playerName}
//     >
//       <div
//         className={`bg-[#e6f3ff] text-center border border-black ${
//           isVertical ? "vertical-space" : ""
//         } cursor-pointer`}
//         onClick={handleClick}
//       >
//         <div className="space-container h-full" style={containerStyle}>
//           <div
//             className={`${rotate === "top" ? "pt-1" : "pt-1"} ${
//               longName ? "px-0" : "px-1"
//             } text-center text-[0.35rem] sm:text-[0.4rem] lg:text-[0.5rem] font-bold leading-tight`}
//           >
//             {name}
//           </div>
//           <div className="flex-1 flex items-center justify-center">
//             <div className="text-lg sm:text-xl lg:text-2xl">🏖️</div>
//           </div>
//           <div
//             className={`text-center ${
//               rotate === "top" ? "pb-6 pt-1" : "pb-1"
//             } font-normal text-[0.35rem] sm:text-[0.4rem] lg:text-[0.5rem]`}
//           >
//             ${price}
//           </div>
//         </div>
//       </div>
//     </SpecialPopover>
//   );
// };

type UtilitySpaceProps = BaseSpaceProps & UtilitySpaceType;

export const UtilitySpace: React.FC<UtilitySpaceProps> = ({
  name,
  price,
  rotate,
  position,
  property,
}) => {
  const containerStyle = {
    transform: getRotationClass(rotate),
  };

  // const icon =
  //   type === "electric" ? (
  //     <div className="text-lg sm:text-xl lg:text-2xl">💡</div>
  //   ) : (
  //     <div className="text-lg sm:text-xl lg:text-2xl">💧</div>
  //   );

  const icon = <div className="text-lg sm:text-xl lg:text-2xl">💧</div>;

  const isVertical = rotate === "left" || rotate === "right";

  // const handleClick = (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   playSound("button-click", SOUND_CONFIG.volumes.buttonClick);
  //   if (onClick && position !== undefined) {
  //     onClick(position);
  //   }
  // };

  const propertyData = getTypedSpaceData(position, "utility");

  if (!propertyData) {
    return (
      <div className="bg-board-space text-center border border-black">
        <div className="text-xs">{name}</div>
        <div className="text-lg">{icon}</div>
        <div className="text-xs">${price}</div>
      </div>
    );
  }

  return (
    <UtilityPopover propertyData={propertyData} property={property}>
      <div
        className={`bg-board-space text-center border border-black ${
          isVertical ? "vertical-space" : ""
        } cursor-pointer`}
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

type ChanceSpaceProps = BaseSpaceProps & ChanceSpaceType;

export const ChanceSpace: React.FC<ChanceSpaceProps> = ({ rotate }) => {
  const containerStyle = {
    transform: getRotationClass(rotate),
  };

  const isVertical = rotate === "left" || rotate === "right";

  // const handleClick = (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   playSound("button-click", SOUND_CONFIG.volumes.buttonClick);
  //   if (onClick && position !== undefined) {
  //     onClick(position);
  //   }
  // };

  // if (!position) {
  //   return (
  //     <div className="bg-[#fafaf8] text-center border border-black">
  //       <div className="flex items-center justify-center h-full">
  //         <img
  //           src="/images/CHANCE.png"
  //           alt="Chance"
  //           className="w-6 h-6 object-contain"
  //         />
  //       </div>
  //     </div>
  //   );
  // }

  // const propertyData = getPropertyData(position);

  // if (!propertyData) {
  //   return (
  //     <div className="bg-[#fafaf8] text-center border border-black">
  //       <div className="flex items-center justify-center h-full">
  //         <img
  //           src="/images/CHANCE.png"
  //           alt="Chance"
  //           className="w-6 h-6 object-contain"
  //         />
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div
      className={`bg-board-space text-center border border-black ${
        isVertical ? "vertical-space" : ""
      }`}
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

type CommunityChestSpaceProps = BaseSpaceProps & CommunityChestSpaceType;

export const CommunityChestSpace: React.FC<CommunityChestSpaceProps> = ({
  rotate,
  position,
}) => {
  const containerStyle = {
    transform: getRotationClass(rotate),
  };

  const isVertical = rotate === "left" || rotate === "right";

  // const handleClick = (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   playSound("button-click", SOUND_CONFIG.volumes.buttonClick);
  //   if (onClick && position !== undefined) {
  //     onClick(position);
  //   }
  // };

  const propertyData = getTypedSpaceData(position, "community-chest");
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
    <div
      className={`bg-board-space text-center border border-black ${
        isVertical ? "vertical-space" : ""
      }`}
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

type TaxSpaceProps = BaseSpaceProps & TaxSpaceType;

export const TaxSpace: React.FC<TaxSpaceProps> = ({
  name,
  rotate,
  position,
}) => {
  const containerStyle = {
    transform: getRotationClass(rotate),
  };

  const isVertical = rotate === "left" || rotate === "right";

  // const handleClick = (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   playSound("button-click", SOUND_CONFIG.volumes.buttonClick);
  //   if (onClick && position !== undefined) {
  //     onClick(position);
  //   }
  // };

  // if (!position) {
  //   return (
  //     <div className="bg-[#fafaf8] text-center border border-black">
  //       <div className="text-xs">{name}</div>
  //       <div className="text-lg">💎</div>
  //       <div className="text-xs">Pay ${price}</div>
  //     </div>
  //   );
  // }

  const propertyData = getTypedSpaceData(position, "tax");
  if (!propertyData) {
    return null;
  }

  return (
    <div
      // className={`bg-board-space flex flex-col items-center justify-center text-center border border-black ${
      //   isVertical ? "vertical-space" : ""
      // } cursor-pointer`}
      className={cn(
        "bg-board-space flex items-center justify-center text-center border border-black",
        { "vertical-space": isVertical },
        { "flex-col": !isVertical }
        // isVertical ? "vertical-space" : ""
      )}
      // onClick={handleClick}
    >
      <h3 style={containerStyle}>{name}</h3>
      <div style={containerStyle} className="text-lg sm:text-xl lg:text-2xl">
        💎
      </div>
      <p style={containerStyle}>Pay {formatPrice(propertyData.taxAmount)}</p>
      {/* <div
          className={`space-container hidden h-full ${
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
                Pay ${propertyData.taxAmount}
              </div>
            </>
          )}
        </div> */}
    </div>
  );
};

export type SpaceProps =
  | PropertySpaceProps
  | RailroadSpaceProps
  | UtilitySpaceProps
  | ChanceSpaceProps
  | CommunityChestSpaceProps
  | TaxSpaceProps;
