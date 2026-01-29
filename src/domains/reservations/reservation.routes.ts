// Reservation routes - HTTP controller layer

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { reservationService } from './reservation.service.js';
import type { CreateReservationInput } from './reservation.types.js';

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
            title: { type: 'string', minLength: 1, maxLength: 150 },
            startTime: { type: 'string', format: 'date-time' },
            endTime: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: CreateReservationInput }>, reply: FastifyReply) => {
      const result = reservationService.createReservation(request.body);

      if (!result.success) {
        return reply.status(result.statusCode).send({
          statusCode: result.statusCode,
          error: result.statusCode === 400 ? 'Bad Request' : 'Error',
          message: result.error,
        });
      }

      return reply.status(201).send(result.data);
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
      const result = reservationService.cancelReservation(request.params.id);

      if (!result.success) {
        return reply.status(result.statusCode).send({
          statusCode: result.statusCode,
          error: result.statusCode === 404 ? 'Not Found' : 'Error',
          message: result.error,
        });
      }

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
      const result = reservationService.getReservationsByRoom(request.params.roomId);

      if (!result.success) {
        return reply.status(result.statusCode).send({
          statusCode: result.statusCode,
          error: 'Bad Request',
          message: result.error,
        });
      }

      return reply.status(200).send(result.data);
    }
  );
}
