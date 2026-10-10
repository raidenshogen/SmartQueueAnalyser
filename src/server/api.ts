import { initDb } from "./db.js"; // Adjust path as needed
import { handleAuthRequest } from "./handlers/auth.handler";
import { handleChatRequest } from "./handlers/chat.handler";
import { handleDataRequest } from "./handlers/data.handler";

initDb();

export async function handleApiRequest(body: any, geminiApiKey?: string): Promise<any> {
  const { type, payload = {} } = body;

  // ==========================================
  // AUTH ROUTES
  // ==========================================
  if (type === 'auth') {
    return handleAuthRequest(payload);
  }

  // ==========================================
  // TEST
  // ==========================================
  if (type === 'test') {
    return { success: true, message: "API connection healthy" };
  }

  // ==========================================
  // CHAT
  // ==========================================
  if (type === 'chat') {
    return handleChatRequest(body);
  }

  // ==========================================
  // DATA ROUTES: overview, history, prediction
  // ==========================================
  if (type === 'overview' || type === 'history' || type === 'prediction') {
    return handleDataRequest(type, body);
  }

  return { success: false, error: `Unknown type: ${type}` };
}