import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { GoogleGenAI } from "@google/genai";

admin.initializeApp();

// Define the secret
const geminiApiKey = functions.defineSecret("GEMINI_API_KEY");

export const secureProxy = functions
  .runWith({ secrets: [geminiApiKey] })
  .https.onCall(async (data, context) => {
    // Ensure user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }

    const apiKey = geminiApiKey.value();
    if (!apiKey) {
      throw new functions.https.HttpsError(
        "internal",
        "API key not configured."
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const { model, contents, config } = data;
      const response = await ai.models.generateContent({
        model: model || "gemini-3-pro-preview",
        contents,
        config: {
          ...config,
          abortSignal: controller.signal
        }
      });

      return {
        text: response.text,
        usage: response.usageMetadata
      };
    } catch (error: any) {
      console.error("Proxy Error:", error);
      throw new functions.https.HttpsError("internal", error.message);
    } finally {
      clearTimeout(timeoutId);
    }
  });
