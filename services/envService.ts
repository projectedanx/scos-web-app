/**
 * Utility service to handle environment variables across different environments
 * (Vite/Browser and Node.js).
 */

const getMetaEnv = () => {
    try {
        if ((globalThis as any).__MOCK_IMPORT_META_ENV) return (globalThis as any).__MOCK_IMPORT_META_ENV;
        return (import.meta as any).env;
    } catch {
        return undefined;
    }
};

/**
 * Retrieves the Gemini API Key from available environment sources.
 * Supports Vite's import.meta.env and standard process.env.
 *
 * @returns The API key if found, otherwise undefined.
 */
export const getGeminiApiKey = (): string | undefined => {
  // 1. Check Vite's import.meta.env (Standard for Vite)
  // We use explicit checks to allow Vite's static replacement if applicable
  const metaEnv = getMetaEnv();

  const viteApiKey = metaEnv?.VITE_API_KEY;
  if (viteApiKey) return viteApiKey;

  const viteGeminiApiKey = metaEnv?.GEMINI_API_KEY;
  if (viteGeminiApiKey) return viteGeminiApiKey;

  // 2. Check process.env (Standard for Node/CommonJS environments)
  if (typeof process !== 'undefined' && process.env) {
    const procGeminiApiKey = process.env.GEMINI_API_KEY;
    if (procGeminiApiKey) return procGeminiApiKey;

    const procApiKey = process.env.API_KEY;
    if (procApiKey) return procApiKey;
  }

  return undefined;
};

/**
 * Retrieves a Firebase configuration value from available environment sources.
 * Supports Vite's import.meta.env and standard process.env.
 *
 * @param key - The key of the Firebase config (e.g., 'API_KEY', 'PROJECT_ID').
 * @returns The value if found, otherwise an empty string.
 */
export const getFirebaseEnv = (key: string): string => {
  const viteKey = `VITE_FIREBASE_${key}`;

  const metaEnv = getMetaEnv();
  const envValue = metaEnv?.[viteKey];
  if (envValue) return envValue;

  if (typeof process !== 'undefined' && process.env) {
    const procValue = process.env[viteKey];
    if (procValue) return procValue;
  }

  return "";
};
