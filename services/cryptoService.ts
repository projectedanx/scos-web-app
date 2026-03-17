/**
 * Sovereign Cryptographic Service
 * Handles Key Generation, Hashing, and Digital Signatures (ECDSA P-256)
 */

export interface CommanderKeyPair {
  publicKey: JsonWebKey;
  privateKey: JsonWebKey;
  keyId: string;
}

const ALGO = {
  name: "ECDSA",
  namedCurve: "P-256"
};

const SIGN_ALGO = {
  name: "ECDSA",
  hash: { name: "SHA-256" }
};

// --- Utilities ---

/**
 * The arrayBufferToHex function.
 * @param buffer - The buffer parameter.
 * @returns The resulting string.
 */
function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * The strToArrayBuffer function.
 * @param str - The str parameter.
 * @returns The resulting ArrayBuffer.
 */
function strToArrayBuffer(str: string): ArrayBuffer {
  const enc = new TextEncoder();
  return enc.encode(str);
}

// --- Core Functions ---

/**
 * Generates a new ECDSA Key Pair for the Commander
 */
export const generateCommanderKeys = async (): Promise<CommanderKeyPair> => {
  const keyPair = await window.crypto.subtle.generateKey(
    ALGO,
    true, // extractable
    ["sign", "verify"]
  );

  const publicKey = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const privateKey = await window.crypto.subtle.exportKey("jwk", keyPair.privateKey);

  return {
    publicKey,
    privateKey,
    keyId: crypto.randomUUID()
  };
};

/**
 * Computes SHA-256 hash of text content
 */
export const hashContent = async (content: string): Promise<string> => {
  const data = strToArrayBuffer(content);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  return arrayBufferToHex(hashBuffer);
};

/**
 * Signs a Data Object (Manifest)
 * 1. Canonicalizes JSON (sorts keys)
 * 2. Signs with Private Key
 * 3. Returns Hex Signature
 */
export const signData = async (data: Record<string, unknown>, privateKeyJwk: JsonWebKey): Promise<string> => {
  // Import Private Key
  const privateKey = await window.crypto.subtle.importKey(
    "jwk",
    privateKeyJwk,
    ALGO,
    false,
    ["sign"]
  );

  // Canonicalize Data (Simple sorting for deterministic hash)
  // Note: For production, use a library like json-stable-stringify. 
  // Here we assume the manifest structure is consistent enough for this demo context.
  const jsonString = JSON.stringify(data, Object.keys(data).sort());
  const buffer = strToArrayBuffer(jsonString);

  const signature = await window.crypto.subtle.sign(
    SIGN_ALGO,
    privateKey,
    buffer
  );

  return arrayBufferToHex(signature);
};

/**
 * Verifies a Signature
 */
export const verifySignature = async (data: Record<string, unknown>, signatureHex: string, publicKeyJwk: JsonWebKey): Promise<boolean> => {
  try {
    const publicKey = await window.crypto.subtle.importKey(
      "jwk",
      publicKeyJwk,
      ALGO,
      false,
      ["verify"]
    );

    const jsonString = JSON.stringify(data, Object.keys(data).sort());
    const dataBuffer = strToArrayBuffer(jsonString);
    
    // Convert Hex Sig to Buffer
    const signatureBuffer = new Uint8Array(signatureHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

    return await window.crypto.subtle.verify(
      SIGN_ALGO,
      publicKey,
      signatureBuffer,
      dataBuffer
    );
  } catch (e) {
    console.error("Verification failed", e);
    return false;
  }
};
