import {
  BoardSpace,
  PropertySpace,
  RailroadSpace,
  UtilitySpace,
  TaxSpace,
  CornerSpace,
  ChanceSpace,
  CommunityChestSpace,
  colorGroups,
  boardData,
  ColorGroup,
} from "@/configs/board-data";

export const isPropertySpace = (space: BoardSpace): space is PropertySpace => {
  return space.type === "property";
};

export const isRailroadSpace = (space: BoardSpace): space is RailroadSpace => {
  return space.type === "railroad";
};

export const isUtilitySpace = (space: BoardSpace): space is UtilitySpace => {
  return space.type === "utility";
};

export const isCornerSpace = (space: BoardSpace): space is CornerSpace => {
  return space.type === "corner";
};

export const isChanceSpace = (space: BoardSpace): space is ChanceSpace => {
  return space.type === "chance";
};

export const isCommunityChestSpace = (
  space: BoardSpace
): space is CommunityChestSpace => {
  return space.type === "community-chest";
};

export const isTaxSpace = (space: BoardSpace): space is TaxSpace => {
  return space.type === "tax";
};

export const getBoardSpaceData = (position: number): BoardSpace | null => {
  return boardData.find((p) => p.position === position) || null;
};

export const getPropertiesByColorGroup = (
  colorGroup: ColorGroup
): PropertySpace[] => {
  return boardData.filter(
    (space): space is PropertySpace =>
      isPropertySpace(space) && space.colorGroup === colorGroup
  );
};

export const getBoardRowData = () => {
  const bottomRow = boardData.filter((p) =>
    [9, 8, 7, 6, 5, 4, 3, 2, 1].includes(p.position)
  );
  const leftRow = boardData.filter((p) =>
    [11, 12, 13, 14, 15, 16, 17, 18, 19].includes(p.position)
  );
  const topRow = boardData.filter((p) =>
    [21, 22, 23, 24, 25, 26, 27, 28, 29].includes(p.position)
  );
  const rightRow = boardData.filter((p) =>
    [31, 32, 33, 34, 35, 36, 37, 38, 39].includes(p.position)
  );

  return {
    bottomRow: bottomRow.reverse(),
    leftRow: leftRow.reverse(),
    topRow: topRow,
    rightRow: rightRow,
  };
};

export const getTypedSpaceData = <T extends BoardSpace["type"]>(
  position: number,
  expectedType: T
): Extract<BoardSpace, { type: T }> | null => {
  const space = getBoardSpaceData(position);
  if (!space || space.type !== expectedType) return null;

  return space as Extract<BoardSpace, { type: T }>;
};
