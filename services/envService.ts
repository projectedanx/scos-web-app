/**
 * Utility service to handle environment variables across different environments
 * (Vite/Browser and Node.js).
 */

/**
 * Retrieves the Gemini API Key from available environment sources.
 * Supports Vite's import.meta.env and standard process.env.
 *
 * @returns The API key if found, otherwise undefined.
 */
export const getGeminiApiKey = (): string | undefined => {
  // 1. Check Vite's import.meta.env (Standard for Vite)
  // We use explicit checks to allow Vite's static replacement if applicable
  const viteApiKey = (import.meta as any).env?.VITE_API_KEY;
  if (viteApiKey) return viteApiKey;

  const viteGeminiApiKey = (import.meta as any).env?.GEMINI_API_KEY;
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
