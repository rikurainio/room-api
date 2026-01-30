import { v4 as uuidv4 } from 'uuid';
import { isValidRoomId } from '../rooms/index.js';
import { reservationRepository } from './reservation.repository.js';
import {
  type CreateReservationInput,
  MAX_FUTURE_DAYS,
  MIN_RESERVATION_MINUTES,
  type Reservation,
  type ReservationResponse,
} from './reservation.types.js';
import { toReservationResponse } from './reservation.utils.js';

export interface ServiceSuccess<T> {
  success: true;
  data: T;
}

export interface ServiceError {
  success: false;
  error: string;
  statusCode: number;
}

export type ServiceResult<T> = ServiceSuccess<T> | ServiceError;

function doTimesOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
  return start1 < end2 && end1 > start2;
}

export const reservationService = {
  // Create a new reservation with full validation
  createReservation(input: CreateReservationInput): ServiceResult<ReservationResponse> {
    const { roomId, title, startTime, endTime } = input;
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    // Validate dates are valid
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return {
        success: false,
        error: 'Invalid date format. Please provide valid ISO 8601 date-time strings',
        statusCode: 400,
      };
    }

    // Validate room ID
    if (!isValidRoomId(roomId)) {
      return {
        success: false,
        error: `Invalid room ID "${roomId}". Valid room IDs are 1-10`,
        statusCode: 400,
      };
    }

    // Validate time order
    if (startDate >= endDate) {
      return {
        success: false,
        error: 'Start time must be before end time',
        statusCode: 400,
      };
    }

    // Validate minimum duration
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationMinutes = durationMs / (1000 * 60);
    if (durationMinutes < MIN_RESERVATION_MINUTES) {
      return {
        success: false,
        error: `Reservation must be at least ${MIN_RESERVATION_MINUTES} minutes long`,
        statusCode: 400,
      };
    }

    // Validate not in past
    const now = new Date();
    if (startDate < now) {
      return {
        success: false,
        error: 'Reservation start time cannot be in the past',
        statusCode: 400,
      };
    }

    // Validate not too far in future (max 1 year)
    const maxFutureDate = new Date(now);
    maxFutureDate.setDate(maxFutureDate.getDate() + MAX_FUTURE_DAYS);
    if (startDate > maxFutureDate) {
      return {
        success: false,
        error: `Reservations can only be made up to ${MAX_FUTURE_DAYS} days (1 year) in advance`,
        statusCode: 400,
      };
    }

    // Validate no overlap with existing reservations
    const existingReservations = reservationRepository.findByRoom(roomId);
    for (const reservation of existingReservations) {
      if (doTimesOverlap(startDate, endDate, reservation.startTime, reservation.endTime)) {
        return {
          success: false,
          error: `Reservation overlaps with existing reservation "${reservation.title}" (${reservation.startTime.toISOString()} - ${reservation.endTime.toISOString()})`,
          statusCode: 400,
        };
      }
    }

    // Create and save the reservation
    const reservation: Reservation = {
      id: uuidv4(),
      roomId,
      title,
      startTime: startDate,
      endTime: endDate,
      createdAt: new Date(),
    };

    reservationRepository.add(reservation);

    return {
      success: true,
      data: toReservationResponse(reservation),
    };
  },

  // Cancel a reservation by ID
  cancelReservation(id: string): ServiceResult<void> {
    const existing = reservationRepository.findById(id);
    if (!existing) {
      return {
        success: false,
        error: `Reservation with id "${id}" not found`,
        statusCode: 404,
      };
    }

    reservationRepository.remove(id);

    return {
      success: true,
      data: undefined,
    };
  },

  // Get all reservations for a room
  getReservationsByRoom(roomId: string): ServiceResult<ReservationResponse[]> {
    // Validate room ID
    if (!isValidRoomId(roomId)) {
      return {
        success: false,
        error: `Invalid room ID "${roomId}". Valid room IDs are 1-10`,
        statusCode: 400,
      };
    }

    const reservations = reservationRepository.findByRoom(roomId);

    return {
      success: true,
      data: reservations.map(toReservationResponse),
    };
  },

  // Clear all reservations (for testing)
  clearAll(): void {
    reservationRepository.clear();
  },
};
