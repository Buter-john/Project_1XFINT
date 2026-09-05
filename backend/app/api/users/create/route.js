import prisma from "../../../../Utils/db";
import bcrypt from "bcryptjs";
import { validateRegister } from "../../../../Middleware/users/UserJoi";
import { jsonResponse, corsPreflightResponse } from "../../../../Middleware/CorsMiddleware";
import { authenticateToken } from "../../../../Middleware/authMiddleware";
import { errorDetails } from "../../../../Utils/errorDetails";

export const config = {
    api: {
        bodyParser: false, 
    },
};

export async function OPTIONS() {
    return corsPreflightResponse("POST, OPTIONS");
}

const ALLOWED_ROLES = ["EMPLOYE", "MANAGER", "COMPTABILITE"];

export async function POST(request) {
    try {
        const auth = authenticateToken(request);
        if (!auth.isAuthenticated) {
            return jsonResponse({ error: auth.error }, 401);
        }
        if (auth.user.role !== "MANAGER") {
            return jsonResponse({ error: "Seul un manager peut créer un utilisateur" }, 403);
        }

        const formData = await request.formData();
        const email = formData.get("email");
        const password = formData.get("password");
        const role = formData.get("role");

        if (!ALLOWED_ROLES.includes(role)) {
            return jsonResponse(
                { error: "Rôle invalide. Choisissez : EMPLOYE, MANAGER ou COMPTABILITE." },
                400
            );
        }

        const validate = validateRegister({ email, password, role });
        if (!validate.statut) {
            return jsonResponse({ error: validate.message }, validate.code);
        }

        const emailExists = await prisma.users.findUnique({ where: { email } });
        if (emailExists) {
            return jsonResponse({ error: "Email déjà utilisé" }, 409);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.users.create({
            data: { email, password: hashedPassword, role },
        });

        return jsonResponse(
            {
                message: "Utilisateur créé avec succès",
                user: { email: user.email, role: user.role },
            },
            201
        );
    } catch (error) {
        return jsonResponse(
            { error: "Erreur lors de la création de l'utilisateur", details: errorDetails(error) },
            500
        );
    }
}