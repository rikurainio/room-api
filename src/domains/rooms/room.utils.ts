import { type RoomId, VALID_ROOM_IDS } from './room.types.js';

export function isValidRoomId(roomId: string): roomId is RoomId {
  return VALID_ROOM_IDS.includes(roomId as RoomId);
}
