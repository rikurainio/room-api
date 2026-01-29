import type { Reservation } from './reservation.types.js';

// In-memory storage for reservations
const reservations = new Map<string, Reservation>();

export const reservationRepository = {
  // Add a new reservation to the database
  add(reservation: Reservation): Reservation {
    reservations.set(reservation.id, reservation);
    return reservation;
  },

  // Remove a reservation by ID, returns true if found and removed
  remove(id: string): boolean {
    return reservations.delete(id);
  },

  // Get a reservation by ID
  findById(id: string): Reservation | undefined {
    return reservations.get(id);
  },

  // Get all reservations for a specific room, sorted by start time
  findByRoom(roomId: string): Reservation[] {
    const result: Reservation[] = [];
    for (const reservation of reservations.values()) {
      if (reservation.roomId === roomId) {
        result.push(reservation);
      }
    }
    return result.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  },

  // Get all reservations
  findAll(): Reservation[] {
    return Array.from(reservations.values());
  },

  // Clear all reservations (useful for testing)
  clear(): void {
    reservations.clear();
  },
};
