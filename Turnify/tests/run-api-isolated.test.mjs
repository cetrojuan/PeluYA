import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { readIsolatedConfig, withListeningServer } from './run-api-isolated.mjs';

test('las pruebas empiezan con el socket propio abierto y se cierra al terminar', async () => {
  const server = createServer();
  const result = await withListeningServer(server, 0, async address => {
    assert.equal(server.listening, true);
    assert.equal(address.address, '127.0.0.1');
    assert.ok(address.port > 0);
    return 'pruebas ejecutadas';
  });
  assert.equal(result, 'pruebas ejecutadas');
  assert.equal(server.listening, false);
});

test('un puerto ocupado impide las pruebas y conserva intacto el otro servidor', async () => {
  const other = createServer();
  const ready = once(other, 'listening');
  other.listen({ host: '127.0.0.1', port: 0 });
  await ready;
  let ran = false;
  try {
    await assert.rejects(withListeningServer(createServer(), other.address().port, async () => {
      ran = true;
    }), { code: 'EADDRINUSE' });
    assert.equal(ran, false);
    assert.equal(other.listening, true);
  } finally {
    await new Promise((resolve, reject) => other.close(error => error ? reject(error) : resolve()));
  }
});

test('si la integracion falla, se propaga el error y se cierra el socket propio', async () => {
  const server = createServer();
  await assert.rejects(withListeningServer(server, 0, async () => {
    throw new Error('fallo de integracion simulado');
  }), /fallo de integracion simulado/);
  assert.equal(server.listening, false);
});

test('rechaza configuracion de produccion, base ajena y puertos invalidos antes de iniciar', () => {
  const config = { NODE_ENV: 'test', DATABASE_URL: 'postgresql://pp2_demo:pp2_test_only@127.0.0.1:55432/pp2_review', PORT: '4401' };
  assert.deepEqual(readIsolatedConfig(config), { port: 4401 });
  for (const override of [
    { NODE_ENV: 'production' },
    { DATABASE_URL: 'postgresql://pp2_demo:fake@remote.example/pp2_review' },
    { DATABASE_URL: 'postgresql://pp2_demo:fake@127.0.0.1/base_habitual' },
    { PORT: '0' }, { PORT: '65536' }, { PORT: '4401.5' }, { PORT: '' },
  ]) assert.throws(() => readIsolatedConfig({ ...config, ...override }));
});
