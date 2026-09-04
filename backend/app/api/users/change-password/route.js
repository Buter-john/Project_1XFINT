import prisma from "../../../../Utils/db";
import bcrypt from "bcryptjs";
import { authenticateToken } from "../../../../Middleware/authMiddleware";
import { jsonResponse, corsPreflightResponse } from "../../../../Middleware/CorsMiddleware";
import { generateToken } from "../../../../Utils/JwtUtils";
import { setAuthCookie } from "../../../../Utils/authCookie";

export async function OPTIONS() {
  return corsPreflightResponse("PATCH, OPTIONS");
}

export async function PATCH(req) {
  const auth = authenticateToken(req);
  if (!auth.isAuthenticated) {
    return jsonResponse({ error: auth.error }, 401);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Body JSON requis" }, 400);
  }

  const { currentPassword, newPassword } = body || {};
  if (!currentPassword || !newPassword) {
    return jsonResponse({ error: "Champs manquants" }, 400);
  }
  if (newPassword.length < 8) {
    return jsonResponse({ error: "Mot de passe trop court (min 8)" }, 400);
  }

  const user = await prisma.users.findUnique({ where: { id: auth.user.id } });
  if (!user) {
    return jsonResponse({ error: "Utilisateur introuvable" }, 404);
  }

  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    return jsonResponse({ error: "Mot de passe actuel incorrect" }, 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const updated = await prisma.users.update({
    where: { id: user.id },
    data: { password: hashedPassword, firstConnection: false },
  });

  const newToken = generateToken(updated);
  return setAuthCookie(jsonResponse({ message: "Mot de passe mis à jour" }), newToken);
}