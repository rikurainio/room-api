// Type definitions for the Meeting Room Reservation API

// Hard-coded room IDs (1-10)
export const VALID_ROOM_IDS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] as const;

// Minimum reservation duration in minutes
export const MIN_RESERVATION_MINUTES = 5;

export interface Reservation {
  id: string;
  roomId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
}

export interface CreateReservationInput {
  roomId: string;
  title: string;
  startTime: string;
  endTime: string;
}

export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
}

export interface ReservationResponse {
  id: string;
  roomId: string;
  title: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}
