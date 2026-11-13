import { serve } from '@hono/node-server';
import { createApp } from './app';

const app = createApp();
const port = process.env['PORT'];

const server = serve(
  {
    fetch: app.fetch,
    port: port ? Number(port) : 3000,
  },
  (info) => {
    // eslint-disable-next-line no-console -- startup message
    console.log(`API listening on http://localhost:${info.port.toString()}`);
  },
);

const shutdown = () => {
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);

process.on('SIGINT', shutdown);
