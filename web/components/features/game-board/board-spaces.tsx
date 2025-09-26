import React from "react";
import {
  PropertyPopover,
  RailroadPopover,
  UtilityPopover,
  TaxPopover,
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
import { getTypedSpaceData, getBoardSide } from "@/lib/board-utils";
import { BaseSpaceProps } from "@/types/space-types";
import Image from "next/image";
import { CircleQuestionMarkIcon } from "lucide-react";
import { TaxIcon } from "@/components/ui/icons";

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

  const content = (
    <BaseSpace
      position={position}
      onChainProperty={onChainProperty}
      colorBarColor={color}
      showColorBar={true}
      {...props}
    >
      <div className="flex flex-col items-center justify-center size-full text-center">
        <div className="text-[0.35rem] sm:text-[0.4rem] lg:text-[0.5rem] font-bold leading-tight mb-1">
          {name}
        </div>
        <div className="text-[0.35rem] sm:text-[0.4rem] lg:text-[0.5rem] font-normal">
          {formatPrice(Number(price))}
        </div>
      </div>
    </BaseSpace>
  );

  const propertyData = getTypedSpaceData(position, "property");
  if (position === 1) {
    console.log("propertyData", propertyData);
  }
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
        <div className="text-[0.35rem] sm:text-[0.4rem] lg:text-[0.5rem] font-bold leading-tight">
          {name}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg sm:text-xl lg:text-2xl">🚂</div>
        </div>
        <div className="text-[0.35rem] sm:text-[0.4rem] lg:text-[0.5rem] font-normal">
          {formatPrice(Number(price))}
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
        <div className="text-[0.35rem] sm:text-[0.4rem] lg:text-[0.5rem] font-bold leading-tight">
          {name}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg sm:text-xl lg:text-2xl">{icon}</div>
        </div>
        <div className="text-[0.35rem] sm:text-[0.4rem] lg:text-[0.5rem] font-normal">
          {formatPrice(Number(price))}
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
        <div className="text-[0.35rem] sm:text-[0.4rem] lg:text-[0.5rem] font-bold leading-tight">
          {props.name}
        </div>
        <CircleQuestionMarkIcon className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-main!" />
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
        <div className="text-[0.35rem] sm:text-[0.4rem] lg:text-[0.5rem] font-bold leading-tight">
          {props.name}
        </div>
        <img
          src={props.logo || ""}
          alt="Community Chest"
          className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 object-contain rounded-full"
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
        <div className="text-[0.35rem] sm:text-[0.4rem] lg:text-[0.5rem] font-bold leading-tight">
          {name}
        </div>
        <div className="flex items-center justify-center">
          <TaxIcon className="w-6 h-6 text-main" />
        </div>
        {propertyData && (
          <div className="text-[0.35rem] sm:text-[0.4rem] lg:text-[0.5rem] font-normal">
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
