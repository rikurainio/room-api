export const VALID_ROOM_IDS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] as const;

export type RoomId = (typeof VALID_ROOM_IDS)[number];
