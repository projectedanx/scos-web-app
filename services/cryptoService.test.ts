import test from 'node:test';
import assert from 'node:assert';
import crypto from 'node:crypto';

// Setup global crypto for Node.js environment
Object.defineProperty(globalThis, 'window', {
  value: { crypto: crypto.webcrypto },
  writable: true,
  configurable: true
});

Object.defineProperty(globalThis, 'crypto', {
  value: crypto, // node's crypto has randomUUID
  writable: true,
  configurable: true
});

// Import after globals are set
import { generateCommanderKeys } from './cryptoService.ts';

test('cryptoService - generateCommanderKeys', async (t) => {
  await t.test('generates valid ECDSA P-256 key pair', async () => {
    const keys = await generateCommanderKeys();

    // Verify it returns the expected structure
    assert.ok(keys.keyId, 'keyId should be present');
    assert.ok(keys.publicKey, 'publicKey should be present');
    assert.ok(keys.privateKey, 'privateKey should be present');

    // Verify keyId format (UUID)
    assert.match(keys.keyId, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

    // Verify public key attributes
    assert.strictEqual(keys.publicKey.kty, 'EC');
    assert.strictEqual(keys.publicKey.crv, 'P-256');
    assert.deepStrictEqual(keys.publicKey.key_ops, ['verify']);
    assert.strictEqual(keys.publicKey.ext, true);
    assert.ok(keys.publicKey.x, 'x coordinate should be present');
    assert.ok(keys.publicKey.y, 'y coordinate should be present');

    // Verify private key attributes
    assert.strictEqual(keys.privateKey.kty, 'EC');
    assert.strictEqual(keys.privateKey.crv, 'P-256');
    assert.deepStrictEqual(keys.privateKey.key_ops, ['sign']);
    assert.strictEqual(keys.privateKey.ext, true);
    assert.ok(keys.privateKey.x, 'x coordinate should be present');
    assert.ok(keys.privateKey.y, 'y coordinate should be present');
    assert.ok(keys.privateKey.d, 'private exponent d should be present');
  });

  await t.test('generates unique keys each time', async () => {
    const keys1 = await generateCommanderKeys();
    const keys2 = await generateCommanderKeys();

    assert.notStrictEqual(keys1.keyId, keys2.keyId);
    assert.notStrictEqual(keys1.privateKey.d, keys2.privateKey.d);
  });
});
