import prisma from "../../../../Utils/db";
import { authenticateToken } from "../../../../Middleware/authMiddleware";
import { valideFraisNote } from "../../../../Middleware/users/UserJoi";
import { jsonResponse, corsPreflightResponse } from "../../../../Middleware/CorsMiddleware";
import { errorDetails } from "../../../../Utils/errorDetails";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export async function OPTIONS() {
  return corsPreflightResponse("GET, OPTIONS");
}

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
]);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo
const EXTENSION_BY_MIME = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "application/pdf": ".pdf",
};

export async function POST(req) {
  try {
    const authResult = authenticateToken(req);
    if (!authResult.isAuthenticated) {
      return jsonResponse({ error: authResult.error }, 401);
    }

    const formData = await req.formData();
    const titre = formData.get("titre");
    const commentaire = formData.get("commentaire");
    const fichiers = formData.getAll("fichiers");

    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fichiersPaths = [];
    for (const file of fichiers) {
      if (!file) continue;

      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        return jsonResponse({ error: `Type de fichier non autorisé : ${file.type || "inconnu"}` }, 400);
      }
      if (file.size > MAX_FILE_SIZE) {
        return jsonResponse(
          { error: `Fichier trop volumineux (max ${MAX_FILE_SIZE / 1024 / 1024} Mo)` },
          400
        );
      }

      const fileName = `${crypto.randomUUID()}${EXTENSION_BY_MIME[file.type]}`;
      const filePath = path.join(uploadDir, fileName);
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(filePath, buffer);

      fichiersPaths.push(`/api/users/files/${fileName}`);
    }

    const validate = valideFraisNote({ titre, commentaire, fichiers: fichiersPaths.join(",") });
    if (!validate.statut) {
      return jsonResponse({ error: validate.message }, validate.code);
    }

    const note = await prisma.noteDeFrais.create({
      data: {
        titre,
        commentaire,
        fichiers: JSON.stringify(fichiersPaths),
        statut: "CREEE",
        userId: authResult.user.id,
      },
    });

    return jsonResponse({ message: "Note créée", note }, 201);
  } catch (error) {
    return jsonResponse(
      { error: "Erreur lors de la création de la note de frais", details: errorDetails(error) },
      500
    );
  }
}