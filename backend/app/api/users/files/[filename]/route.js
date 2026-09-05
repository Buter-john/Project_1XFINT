import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { authenticateToken } from "../../../../../Middleware/authMiddleware";
import { jsonResponse, corsMiddleware, corsPreflightResponse } from "../../../../../Middleware/CorsMiddleware";

export async function OPTIONS() {
  return corsPreflightResponse("GET, OPTIONS");
}

const CONTENT_TYPE_BY_EXT = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

export async function GET(req, { params }) {
  const auth = authenticateToken(req);
  if (!auth.isAuthenticated) {
    return jsonResponse({ error: auth.error }, 401);
  }

  const { filename } = await params;
  const fileName = path.basename(filename);
  const filePath = path.join(process.cwd(), "uploads", fileName);

  if (!fs.existsSync(filePath)) {
    return jsonResponse({ error: "Fichier introuvable" }, 404);
  }

  const buffer = fs.readFileSync(filePath);
  const contentType = CONTENT_TYPE_BY_EXT[path.extname(fileName)] || "application/octet-stream";

  const response = new NextResponse(buffer, {
    status: 200,
    headers: { "Content-Type": contentType },
  });
  return corsMiddleware(response);
}