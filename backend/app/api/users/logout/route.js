import { jsonResponse, corsPreflightResponse } from "../../../../Middleware/CorsMiddleware";
import { clearAuthCookie } from "../../../../Utils/authCookie";

export async function OPTIONS() {
  return corsPreflightResponse("POST, OPTIONS");
}

export async function POST() {
  return clearAuthCookie(jsonResponse({ message: "Déconnecté" }));
}