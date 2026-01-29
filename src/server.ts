import { buildApp } from './app.js';

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const server = buildApp({
  logger:
    process.env.NODE_ENV === 'production'
      ? {
          level: 'info',
        }
      : {
          level: 'info',
          transport: {
            target: 'pino-pretty',
          },
        },
});

async function start(): Promise<void> {
  try {
    await server.listen({ port: PORT, host: HOST });
    console.log(`Server is running on http://${HOST}:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
