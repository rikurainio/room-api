// In-memory database for reservations

import type { Reservation } from './types.js';

const reservations = new Map<string, Reservation>();

// Add a new reservation to the database
export function addReservation(reservation: Reservation): Reservation {
  reservations.set(reservation.id, reservation);
  return reservation;
}

// Remove a reservation by ID, returns true if found and removed
export function removeReservation(id: string): boolean {
  return reservations.delete(id);
}

// Get a reservation by ID
export function getReservationById(id: string): Reservation | undefined {
  return reservations.get(id);
}

// Get all reservations for a specific room
export function getReservationsByRoom(roomId: string): Reservation[] {
  const result: Reservation[] = [];
  for (const reservation of reservations.values()) {
    if (reservation.roomId === roomId) {
      result.push(reservation);
    }
  }
  return result.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}

// Get all reservations (for internal use)
export function getAllReservations(): Reservation[] {
  return Array.from(reservations.values());
}

// Clear all reservations (useful for testing)
export function clearReservations(): void {
  reservations.clear();
}
