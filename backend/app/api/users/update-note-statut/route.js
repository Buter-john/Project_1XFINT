import prisma from "../../../../Utils/db";
import { authenticateToken } from "../../../../Middleware/authMiddleware";
import { jsonResponse, corsPreflightResponse } from "../../../../Middleware/CorsMiddleware";
import { errorDetails } from "../../../../Utils/errorDetails";

export async function OPTIONS() {
  return corsPreflightResponse("PATCH, OPTIONS");
}

// Doit correspondre à l'enum Statut du schéma Prisma
const VALID_STATUTS = ["CREEE", "VALIDEE", "REFUSEE", "TRAITEE"];

// Règles de transition autorisées selon le rôle
function canChange(role, from, to) {
  if (role === "MANAGER") {
    return from === "CREEE" && (to === "VALIDEE" || to === "REFUSEE");
  }
  if (role === "COMPTABILITE") {
    return from === "VALIDEE" && to === "TRAITEE";
  }
  return false;
}

export async function PATCH(req) {
  try {
    const auth = authenticateToken(req);
    if (!auth.isAuthenticated) {
      return jsonResponse({ error: auth.error }, 401);
    }
    const role = auth.user.role;

    let body;
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "Body JSON requis" }, 400);
    }
    const { noteId, statut } = body || {};

    const id = Number(noteId);
    if (!id || Number.isNaN(id)) {
      return jsonResponse({ error: "noteId invalide" }, 400);
    }
    if (!VALID_STATUTS.includes(statut)) {
      return jsonResponse({ error: "Statut invalide" }, 400);
    }
    if (!["MANAGER", "COMPTABILITE"].includes(role)) {
      return jsonResponse({ error: "Rôle non autorisé" }, 403);
    }

    const current = await prisma.noteDeFrais.findUnique({
      where: { id },
      select: { statut: true },
    });
    if (!current) {
      return jsonResponse({ error: "Note introuvable" }, 404);
    }

    if (!canChange(role, current.statut, statut)) {
      return jsonResponse({ error: "Transition non autorisée" }, 403);
    }

    const updated = await prisma.noteDeFrais.update({
      where: { id },
      data: { statut },
    });

    return jsonResponse({ message: "OK", note: updated });
  } catch (error) {
    return jsonResponse({ error: "Erreur serveur", details: errorDetails(error) }, 500);
  }
}