// Reservation domain utilities

import type { Reservation, ReservationResponse } from './reservation.types.js';

// Converts a Reservation to API response format
export function toReservationResponse(reservation: Reservation): ReservationResponse {
  return {
    id: reservation.id,
    roomId: reservation.roomId,
    title: reservation.title,
    startTime: reservation.startTime.toISOString(),
    endTime: reservation.endTime.toISOString(),
    createdAt: reservation.createdAt.toISOString(),
  };
}
