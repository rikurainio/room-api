// Reservation API routes

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import {
  addReservation,
  getReservationById,
  getReservationsByRoom,
  removeReservation,
} from '../db.js';
import type { CreateReservationInput, Reservation, ReservationResponse } from '../types.js';
import { validateReservation } from '../validators.js';

// Converts a Reservation to API response format
function toReservationResponse(reservation: Reservation): ReservationResponse {
  return {
    id: reservation.id,
    roomId: reservation.roomId,
    title: reservation.title,
    startTime: reservation.startTime.toISOString(),
    endTime: reservation.endTime.toISOString(),
    createdAt: reservation.createdAt.toISOString(),
  };
}

// Registers all reservation routes
export async function reservationRoutes(fastify: FastifyInstance): Promise<void> {
  // Create a new reservation
  fastify.post<{ Body: CreateReservationInput }>(
    '/reservations',
    {
      schema: {
        body: {
          type: 'object',
          required: ['roomId', 'title', 'startTime', 'endTime'],
          properties: {
            roomId: { type: 'string', minLength: 1 },
            title: { type: 'string', minLength: 1 },
            startTime: { type: 'string', format: 'date-time' },
            endTime: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: CreateReservationInput }>, reply: FastifyReply) => {
      const { roomId, title, startTime, endTime } = request.body;

      const startDate = new Date(startTime);
      const endDate = new Date(endTime);

      // Validate the reservation against business rules
      const validationResult = validateReservation(roomId, startDate, endDate);
      if (!validationResult.isValid) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: validationResult.error,
        });
      }

      const reservation: Reservation = {
        id: uuidv4(),
        roomId,
        title,
        startTime: startDate,
        endTime: endDate,
        createdAt: new Date(),
      };

      addReservation(reservation);

      return reply.status(201).send(toReservationResponse(reservation));
    }
  );

  // Cancel a reservation
  fastify.delete<{ Params: { id: string } }>(
    '/reservations/:id',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params;

      const existing = getReservationById(id);
      if (!existing) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: `Reservation with id "${id}" not found`,
        });
      }

      removeReservation(id);

      return reply.status(204).send();
    }
  );

  // View all reservations for a room
  fastify.get<{ Params: { roomId: string } }>(
    '/rooms/:roomId/reservations',
    {
      schema: {
        params: {
          type: 'object',
          required: ['roomId'],
          properties: {
            roomId: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { roomId: string } }>, reply: FastifyReply) => {
      const { roomId } = request.params;

      const reservations = getReservationsByRoom(roomId);

      return reply.status(200).send(reservations.map(toReservationResponse));
    }
  );
}
