import Fastify, { type FastifyInstance, type FastifyServerOptions } from 'fastify';
import { reservationRoutes } from './domains/reservations/reservation.routes.js';

export interface AppOptions extends FastifyServerOptions {}

export function buildApp(opts: AppOptions = {}): FastifyInstance {
  const app = Fastify(opts);
  app.register(reservationRoutes);
  app.get('/health', async () => {
    return { status: 'ok' };
  });

  return app;
}
