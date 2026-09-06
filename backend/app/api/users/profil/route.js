import prisma from "../../../../Utils/db";
import { authenticateToken } from "../../../../Middleware/authMiddleware";
import { jsonResponse, corsPreflightResponse } from "../../../../Middleware/CorsMiddleware";

export async function OPTIONS() {
  return corsPreflightResponse("GET, OPTIONS");
}

export async function GET(req) {
  const auth = authenticateToken(req);
  if (!auth.isAuthenticated) {
    return jsonResponse({ error: auth.error }, 401);
  }

  const user = await prisma.users.findUnique({
    where: { id: auth.user.id },
    select: { email: true, role: true },
  });

  if (!user) {
    return jsonResponse({ error: "Utilisateur introuvable" }, 404);
  }

  return jsonResponse({ user });
}