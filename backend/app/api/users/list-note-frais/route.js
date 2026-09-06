import prisma from "../../../../Utils/db";
import { jsonResponse, corsPreflightResponse } from "../../../../Middleware/CorsMiddleware";
import { authenticateToken, authorizeRole } from "../../../../Middleware/authMiddleware";
import { errorDetails } from "../../../../Utils/errorDetails";

export async function OPTIONS() {
  return corsPreflightResponse("GET, POST, OPTIONS");
}

export async function GET(req) {
  try {
    const authResult = authenticateToken(req);
    if (!authResult.isAuthenticated) {
      return jsonResponse({ error: authResult.error }, 401);
    }

    const { role, id: userId } = authResult.user;
    if (!authorizeRole(["MANAGER", "COMPTABILITE", "EMPLOYE"], role)) {
      return jsonResponse({ error: "Unauthorized role" }, 403);
    }

    let notesDeFrais;
    if (role === "MANAGER") {
      notesDeFrais = await prisma.noteDeFrais.findMany({
        orderBy: { dateSoumission: "desc" },
        include: { user: { select: { email: true, role: true } } },
      });
    } else if (role === "COMPTABILITE") {
      notesDeFrais = await prisma.noteDeFrais.findMany({
        where: { statut: { in: ["VALIDEE", "TRAITEE"] } },
        orderBy: { dateSoumission: "desc" },
        include: { user: { select: { email: true, role: true } } },
      });
    } else {
      // Employé : uniquement ses propres notes
      notesDeFrais = await prisma.noteDeFrais.findMany({
        where: { userId },
        orderBy: { dateSoumission: "desc" },
      });
    }

    return jsonResponse({ note_de_frais: notesDeFrais, role });
  } catch (error) {
    return jsonResponse(
      { error: "Erreur lors de la récupération des notes de frais", details: errorDetails(error) },
      500
    );
  }
}