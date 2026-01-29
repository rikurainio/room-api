// Fastify app builder - separated from server for testability

import Fastify, { type FastifyInstance, type FastifyServerOptions } from 'fastify';
import { reservationRoutes } from './domains/reservations/reservation.routes.js';

export interface AppOptions extends FastifyServerOptions {}

// Builds and configures the Fastify application
export function buildApp(opts: AppOptions = {}): FastifyInstance {
  const app = Fastify(opts);

  // Register routes
  app.register(reservationRoutes);

  // Health check endpoint
  app.get('/health', async () => {
    return { status: 'ok' };
  });

  return app;
}
