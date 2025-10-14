import React from "react";
import {
  PropertyPopover,
  RailroadPopover,
  UtilityPopover,
} from "./space-popovers";
import { BaseSpace } from "./base-space";
import { cn, formatPrice } from "@/lib/utils";
import {
  colorMap,
  PropertySpace as PropertySpaceType,
  RailroadSpace as RailroadSpaceType,
  UtilitySpace as UtilitySpaceType,
  ChanceSpace as ChanceSpaceType,
  CommunityChestSpace as CommunityChestSpaceType,
  TaxSpace as TaxSpaceType,
} from "@/configs/board-data";
import { getBoardSide, getTypedSpaceData } from "@/lib/board-utils";
import { BaseSpaceProps } from "@/types/space-types";
import { CircleQuestionMarkIcon } from "lucide-react";
import { TaxIcon } from "@/components/ui/icons";
import Image from "next/image";

export type PropertySpaceProps = BaseSpaceProps & PropertySpaceType;

export const PropertySpace: React.FC<PropertySpaceProps> = ({
  name,
  price,
  colorGroup,
  position,
  onChainProperty,
  ...props
}) => {
  const color = colorMap[colorGroup];
  const side = getBoardSide(position);

  const content = (
    <BaseSpace
      position={position}
      onChainProperty={onChainProperty}
      colorBarColor={color}
      showColorBar={true}
      {...props}
    >
      <div className="flex flex-col items-center justify-center size-full text-center relative">
        <div
          className={cn("relative aspect-square", {
            "w-3/4": side === "top" || side === "bottom",
            "h-3/4": side === "left" || side === "right",
          })}
        >
          <div className="size-full relative rounded-full overflow-hidden">
            <Image src={props.logo || ""} fill alt={name} />
          </div>
        </div>
        <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-sm bg-black/5">
          <span className="text-[0.35vh] sm:text-[0.55vh] md:text-[0.7vh] lg:text-[0.9vh] xl:text-[1.1vh]">
            💰
          </span>
          <span className="text-[0.4vh] sm:text-[0.6vh] md:text-[0.8vh] lg:text-[1vh] xl:text-[1.2vh] font-semibold">
            {formatPrice(Number(price))}
          </span>
        </div>
      </div>
    </BaseSpace>
  );

  const propertyData = getTypedSpaceData(position, "property");
  if (!propertyData) return content;

  return (
    <PropertyPopover propertyData={propertyData} property={onChainProperty}>
      {content}
    </PropertyPopover>
  );
};

export type RailroadSpaceProps = BaseSpaceProps & RailroadSpaceType;

export const RailroadSpace: React.FC<RailroadSpaceProps> = ({
  name,
  price,
  position,
  onChainProperty,
  ...props
}) => {
  const content = (
    <BaseSpace position={position} onChainProperty={onChainProperty} {...props}>
      <div className="text-center flex flex-col justify-between h-full">
        <div className="text-[0.5vh] sm:text-[0.7vh] md:text-[0.9vh] lg:text-[1.1vh] xl:text-[1.3vh] font-bold leading-tight">
          {name}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-[1.5vh] sm:text-[2vh] md:text-[2.5vh] lg:text-[3vh] xl:text-[3.5vh]">
            🚂
          </div>
        </div>
        <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-sm bg-black/5 mx-auto">
          <span className="text-[0.35vh] sm:text-[0.55vh] md:text-[0.7vh] lg:text-[0.9vh] xl:text-[1.1vh]">
            💰
          </span>
          <span className="text-[0.4vh] sm:text-[0.6vh] md:text-[0.8vh] lg:text-[1vh] xl:text-[1.2vh] font-semibold">
            {formatPrice(Number(price))}
          </span>
        </div>
      </div>
    </BaseSpace>
  );

  const propertyData = getTypedSpaceData(position, "railroad");
  if (!propertyData) return content;

  return (
    <RailroadPopover propertyData={propertyData} property={onChainProperty}>
      {content}
    </RailroadPopover>
  );
};

export type UtilitySpaceProps = BaseSpaceProps & UtilitySpaceType;

export const UtilitySpace: React.FC<UtilitySpaceProps> = ({
  name,
  price,
  position,
  onChainProperty,
  ...props
}) => {
  const icon = name.includes("Electric") ? "💡" : "💧";

  const content = (
    <BaseSpace position={position} onChainProperty={onChainProperty} {...props}>
      <div className="text-center flex flex-col justify-between h-full">
        <div className="text-[0.5vh] sm:text-[0.7vh] md:text-[0.9vh] lg:text-[1.1vh] xl:text-[1.3vh] font-bold leading-tight">
          {name}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-[1.5vh] sm:text-[2vh] md:text-[2.5vh] lg:text-[3vh] xl:text-[3.5vh]">
            {icon}
          </div>
        </div>
        <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-sm bg-black/5 mx-auto">
          <span className="text-[0.35vh] sm:text-[0.55vh] md:text-[0.7vh] lg:text-[0.9vh] xl:text-[1.1vh]">
            💰
          </span>
          <span className="text-[0.4vh] sm:text-[0.6vh] md:text-[0.8vh] lg:text-[1vh] xl:text-[1.2vh] font-semibold">
            {formatPrice(Number(price))}
          </span>
        </div>
      </div>
    </BaseSpace>
  );

  const propertyData = getTypedSpaceData(position, "utility");
  if (!propertyData) return content;

  return (
    <UtilityPopover propertyData={propertyData} property={onChainProperty}>
      {content}
    </UtilityPopover>
  );
};

export type ChanceSpaceProps = BaseSpaceProps & ChanceSpaceType;

export const ChanceSpace: React.FC<ChanceSpaceProps> = ({
  position,
  onChainProperty,
  ...props
}) => {
  return (
    <BaseSpace
      position={position}
      onChainProperty={onChainProperty}
      contentContainerclassName="pt-1! pb-1!"
      {...props}
    >
      <div className="flex flex-col items-center justify-center text-center gap-2 h-full">
        <div className="text-[0.5vh] sm:text-[0.7vh] md:text-[0.9vh] lg:text-[1.1vh] xl:text-[1.3vh] font-bold leading-tight">
          {props.name}
        </div>
        <CircleQuestionMarkIcon className="w-[1.5vh] h-[1.5vh] sm:w-[2vh] sm:h-[2vh] md:w-[2.5vh] md:h-[2.5vh] lg:w-[3vh] lg:h-[3vh] xl:w-[3.5vh] xl:h-[3.5vh] text-main!" />
      </div>
    </BaseSpace>
  );
};

export type CommunityChestSpaceProps = BaseSpaceProps & CommunityChestSpaceType;

export const CommunityChestSpace: React.FC<CommunityChestSpaceProps> = ({
  position,
  onChainProperty,
  ...props
}) => {
  return (
    <BaseSpace
      position={position}
      onChainProperty={onChainProperty}
      contentContainerclassName="pt-1!"
      {...props}
    >
      <div className="flex flex-col text-center gap-2 items-center justify-center h-full">
        <div className="text-[0.5vh] sm:text-[0.7vh] md:text-[0.9vh] lg:text-[1.1vh] xl:text-[1.3vh] font-bold leading-tight">
          {props.name}
        </div>
        <img
          src={props.logo || ""}
          alt="Community Chest"
          className="w-[1.5vh] h-[1.5vh] sm:w-[2vh] sm:h-[2vh] md:w-[2.5vh] md:h-[2.5vh] lg:w-[3vh] lg:h-[3vh] xl:w-[3.5vh] xl:h-[3.5vh] object-contain rounded-full"
        />
      </div>
    </BaseSpace>
  );
};

export type TaxSpaceProps = BaseSpaceProps & TaxSpaceType;

export const TaxSpace: React.FC<TaxSpaceProps> = ({
  name,
  position,
  onChainProperty,
  ...props
}) => {
  const propertyData = getTypedSpaceData(position, "tax");

  return (
    <BaseSpace position={position} onChainProperty={onChainProperty} {...props}>
      <div className="text-center flex flex-col justify-between h-full">
        <div className="text-[0.5vh] sm:text-[0.7vh] md:text-[0.9vh] lg:text-[1.1vh] xl:text-[1.3vh] font-bold leading-tight">
          {name}
        </div>
        <div className="flex items-center justify-center">
          <TaxIcon className="w-[1.5vh] h-[1.5vh] sm:w-[2vh] sm:h-[2vh] md:w-[2.5vh] md:h-[2.5vh] lg:w-[3vh] lg:h-[3vh] xl:w-[3.5vh] xl:h-[3.5vh] text-main" />
        </div>
        {propertyData && (
          <div className="text-[0.4vh] sm:text-[0.6vh] md:text-[0.8vh] lg:text-[1vh] xl:text-[1.2vh] font-normal">
            Pay {formatPrice(propertyData.taxAmount)}
          </div>
        )}
      </div>
    </BaseSpace>
  );
};

export type SpaceProps =
  | PropertySpaceProps
  | RailroadSpaceProps
  | UtilitySpaceProps
  | ChanceSpaceProps
  | CommunityChestSpaceProps
  | TaxSpaceProps;
