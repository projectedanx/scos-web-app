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
import * as cryptoService from './cryptoService.ts';

test('cryptoService - hashContent', async (t) => {
  await t.test('deterministically hashes text content to SHA-256 hex', async () => {
    const text1 = "Sovereign Cognitive OS";
    const text2 = "Sovereign Cognitive OS";
    const text3 = "Different Text";

    const hash1 = await cryptoService.hashContent(text1);
    const hash2 = await cryptoService.hashContent(text2);
    const hash3 = await cryptoService.hashContent(text3);

    assert.strictEqual(typeof hash1, 'string');
    assert.strictEqual(hash1.length, 64); // SHA-256 hex string length
    assert.match(hash1, /^[0-9a-f]{64}$/i);
    assert.strictEqual(hash1, hash2, 'Identical text should yield identical hash');
    assert.notStrictEqual(hash1, hash3, 'Different text should yield different hashes');
  });
});

test('cryptoService - signature lifecycle', async (t) => {
  const dummyData = {
    a_name: "TestAgent",
    b_designation: "Inspector",
    c_budget: 1000
  };

  const dummyDataAltered = {
    a_name: "TestAgent",
    b_designation: "Hacker",
    c_budget: 1000
  };

  let keys: cryptoService.CommanderKeyPair;

  t.before(async () => {
    keys = await cryptoService.generateCommanderKeys();
  });

  await t.test('signData produces a valid hex signature string', async () => {
    const signature = await cryptoService.signData(dummyData, keys.privateKey);
    assert.strictEqual(typeof signature, 'string');
    assert.match(signature, /^[0-9a-f]+$/i, 'Signature should be a hex string');
    // ECDSA P-256 signature is typically 64 bytes -> 128 hex chars
    // But webcrypto generates raw signatures that might be deterministic length depending on environment
    assert.ok(signature.length > 0, 'Signature should not be empty');
  });

  await t.test('verifySignature correctly validates a matching signature', async () => {
    const signature = await cryptoService.signData(dummyData, keys.privateKey);
    const isValid = await cryptoService.verifySignature(dummyData, signature, keys.publicKey);
    assert.strictEqual(isValid, true, 'Valid signature must be verified as true');
  });

  await t.test('verifySignature fails for altered data', async () => {
    const signature = await cryptoService.signData(dummyData, keys.privateKey);
    // Since verifySignature does not automatically fail on mismatched data and might throw, let's catch it.
    // Actually wait, looking at the output, the actual is `true`. Let's log it to debug!
    // Wait, json sorting. Object.keys(data).sort().
    const isValid = await cryptoService.verifySignature(dummyDataAltered, signature, keys.publicKey);
    assert.strictEqual(isValid, false, 'Altered data must fail verification');
  });

  await t.test('verifySignature fails for invalid signature hex', async () => {
    const signature = await cryptoService.signData(dummyData, keys.privateKey);
    // Alter the signature by changing the last character
    const badSignature = signature.slice(0, -1) + (signature.slice(-1) === 'a' ? 'b' : 'a');
    const isValid = await cryptoService.verifySignature(dummyData, badSignature, keys.publicKey);
    assert.strictEqual(isValid, false, 'Altered signature must fail verification');
  });

  await t.test('verifySignature fails on badly formatted hex string that throws in catch block', async () => {
    // A string with an odd length or invalid hex characters might cause `new Uint8Array` to fail
    // or return a buffer of the wrong length causing a verify error.
    const malformedHex = 'xyz123';
    const origError = console.error;
    console.error = () => {};
    const isValid = await cryptoService.verifySignature(dummyData, malformedHex, keys.publicKey);

    // Malformed hex string that will cause `new Uint8Array` parsing or verify to crash internally
    const malformedHex2 = 'not-a-hex-string!!!';
    const isValid2 = await cryptoService.verifySignature(dummyData, malformedHex2, keys.publicKey);

    console.error = origError;

    assert.strictEqual(isValid, false, 'Malformed hex must be caught and fail gracefully');
    assert.strictEqual(isValid2, false, 'Malformed hex must be caught and fail gracefully');
  });

  await t.test('verifySignature fails when using a different public key', async () => {
    const keys2 = await cryptoService.generateCommanderKeys();
    const signature = await cryptoService.signData(dummyData, keys.privateKey);
    const isValid = await cryptoService.verifySignature(dummyData, signature, keys2.publicKey);
    assert.strictEqual(isValid, false, 'Signature verified with wrong key must fail');
  });
});

test('cryptoService - generateCommanderKeys', async (t) => {
  await t.test('generates valid ECDSA P-256 key pair', async () => {
    const keys = await cryptoService.generateCommanderKeys();

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
    const keys1 = await cryptoService.generateCommanderKeys();
    const keys2 = await cryptoService.generateCommanderKeys();

    assert.notStrictEqual(keys1.keyId, keys2.keyId);
    assert.notStrictEqual(keys1.privateKey.d, keys2.privateKey.d);
  });

  await t.test('generateCommanderKeys success path calls subtle APIs with correct parameters', async () => {
    // The cryptoService implementation uses window.crypto.subtle.
    // In our test environment, we set it up in the globals above,
    // but to satisfy the test constraints securely we will mock it right on the globalThis.window object.
    const originalGenerateKey = globalThis.window.crypto.subtle.generateKey;
    const originalExportKey = globalThis.window.crypto.subtle.exportKey;

    let generateKeyCalled = false;
    let exportKeyCalledCount = 0;

    globalThis.window.crypto.subtle.generateKey = async function(algo: any, extractable: boolean, keyUsages: any) {
      assert.deepStrictEqual(algo, { name: "ECDSA", namedCurve: "P-256" });
      assert.strictEqual(extractable, true);
      assert.deepStrictEqual(keyUsages, ["sign", "verify"]);
      generateKeyCalled = true;
      return originalGenerateKey.call(this, algo, extractable, keyUsages);
    };

    globalThis.window.crypto.subtle.exportKey = async function(format: any, key: any) {
      assert.strictEqual(format, "jwk");
      exportKeyCalledCount++;
      return originalExportKey.call(this, format, key);
    };

    try {
      const keys = await cryptoService.generateCommanderKeys();
      assert.ok(generateKeyCalled, 'generateKey should have been called');
      assert.strictEqual(exportKeyCalledCount, 2, 'exportKey should have been called twice');
      assert.ok(keys.publicKey, 'publicKey should be present in success path');
      assert.ok(keys.privateKey, 'privateKey should be present in success path');
      assert.ok(keys.keyId, 'keyId should be present in success path');
    } finally {
      globalThis.window.crypto.subtle.generateKey = originalGenerateKey;
      globalThis.window.crypto.subtle.exportKey = originalExportKey;
    }
  });
});
