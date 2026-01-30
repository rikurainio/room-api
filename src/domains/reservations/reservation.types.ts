export const MIN_RESERVATION_MINUTES = 5;
export const MAX_FUTURE_DAYS = 365;

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

export interface ReservationResponse {
  id: string;
  roomId: string;
  title: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}
