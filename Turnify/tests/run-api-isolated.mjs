import { createServer } from 'node:http';
import { once } from 'node:events';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

export function readIsolatedConfig(environment) {
  if (environment.NODE_ENV !== 'test') throw new Error('La integracion requiere NODE_ENV=test.');
  const database = new URL(environment.DATABASE_URL || '');
  if (!['postgres:', 'postgresql:'].includes(database.protocol)
      || database.hostname !== '127.0.0.1' || database.pathname !== '/pp2_review'
      || database.username !== 'pp2_demo') {
    throw new Error('La integracion requiere el PostgreSQL temporal pp2_review del arnes.');
  }
  const port = Number(environment.PORT);
  if (!/^\d+$/.test(environment.PORT || '') || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT debe ser un puerto valido para la API aislada.');
  }
  return { port };
}

/** Solo ejecuta las pruebas cuando ESTE servidor obtuvo el puerto solicitado. */
export async function withListeningServer(server, port, action) {
  try {
    const listening = once(server, 'listening');
    server.listen({ host: '127.0.0.1', port, exclusive: true });
    await listening; // Rechaza si listen emite error, incluido EADDRINUSE.
    return await action(server.address());
  } finally {
    if (server.listening) {
      await new Promise((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve());
        server.closeAllConnections();
      });
    }
  }
}

async function main() {
  const { port } = readIsolatedConfig(process.env);
  const { app } = await import('../backend/dist/src/app.js');
  const { prisma } = await import('../backend/dist/src/lib/prisma.js');
  try {
    await withListeningServer(createServer(app), port, async address => {
      // La URL proviene del socket propio, nunca de una API que respondio en otro proceso.
      const api = `http://127.0.0.1:${address.port}/api/v1`;
      console.log(`API aislada lista en puerto ${address.port}; iniciando integracion.`);
      const child = spawn(process.execPath, [fileURLToPath(new URL('./api-integration.mjs', import.meta.url))], {
        stdio: 'inherit',
        env: { ...process.env, TEST_API: api },
      });
      const [code, signal] = await once(child, 'exit');
      if (code !== 0) throw new Error(`La integracion API fallo (${signal || code}).`);
    });
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    console.error(error.code === 'EADDRINUSE'
      ? 'El puerto de prueba esta ocupado; no se ejecutaron las pruebas contra otra API. Usa -ApiPort con otro puerto.'
      : error.message);
    process.exitCode = 1;
  });
}
