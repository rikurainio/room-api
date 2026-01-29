// Validation utilities for reservation business rules

import { getReservationsByRoom } from './db.js';
import { MIN_RESERVATION_MINUTES, VALID_ROOM_IDS } from './types.js';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Validates that the room ID is one of the valid rooms (1-10)
export function validateRoomId(roomId: string): ValidationResult {
  if (!VALID_ROOM_IDS.includes(roomId as (typeof VALID_ROOM_IDS)[number])) {
    return {
      isValid: false,
      error: `Invalid room ID "${roomId}". Valid room IDs are 1-10`,
    };
  }
  return { isValid: true };
}

// Validates that the start time is not in the past
export function validateNotInPast(startTime: Date): ValidationResult {
  const now = new Date();
  if (startTime < now) {
    return {
      isValid: false,
      error: 'Reservation start time cannot be in the past',
    };
  }
  return { isValid: true };
}

// Validates that start time is before end time
export function validateTimeOrder(startTime: Date, endTime: Date): ValidationResult {
  if (startTime >= endTime) {
    return {
      isValid: false,
      error: 'Start time must be before end time',
    };
  }
  return { isValid: true };
}

// Validates minimum reservation duration (5 minutes)
export function validateMinDuration(startTime: Date, endTime: Date): ValidationResult {
  const durationMs = endTime.getTime() - startTime.getTime();
  const durationMinutes = durationMs / (1000 * 60);

  if (durationMinutes < MIN_RESERVATION_MINUTES) {
    return {
      isValid: false,
      error: `Reservation must be at least ${MIN_RESERVATION_MINUTES} minutes long`,
    };
  }
  return { isValid: true };
}

// Checks if two time ranges overlap (start inclusive, end exclusive)
function doTimesOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
  // With exclusive end times, ranges [A, B) and [B, C) do NOT overlap
  return start1 < end2 && end1 > start2;
}

// Validates that the new reservation does not overlap with existing ones
export function validateNoOverlap(
  roomId: string,
  startTime: Date,
  endTime: Date,
  excludeReservationId?: string
): ValidationResult {
  const existingReservations = getReservationsByRoom(roomId);

  for (const reservation of existingReservations) {
    if (excludeReservationId && reservation.id === excludeReservationId) {
      continue;
    }

    if (doTimesOverlap(startTime, endTime, reservation.startTime, reservation.endTime)) {
      return {
        isValid: false,
        error: `Reservation overlaps with existing reservation "${reservation.title}" (${reservation.startTime.toISOString()} - ${reservation.endTime.toISOString()})`,
      };
    }
  }

  return { isValid: true };
}

// Runs all validations and returns the first error if any
export function validateReservation(
  roomId: string,
  startTime: Date,
  endTime: Date,
  excludeReservationId?: string
): ValidationResult {
  const roomIdResult = validateRoomId(roomId);
  if (!roomIdResult.isValid) {
    return roomIdResult;
  }

  const timeOrderResult = validateTimeOrder(startTime, endTime);
  if (!timeOrderResult.isValid) {
    return timeOrderResult;
  }

  const minDurationResult = validateMinDuration(startTime, endTime);
  if (!minDurationResult.isValid) {
    return minDurationResult;
  }

  const notInPastResult = validateNotInPast(startTime);
  if (!notInPastResult.isValid) {
    return notInPastResult;
  }

  const noOverlapResult = validateNoOverlap(roomId, startTime, endTime, excludeReservationId);
  if (!noOverlapResult.isValid) {
    return noOverlapResult;
  }

  return { isValid: true };
}
