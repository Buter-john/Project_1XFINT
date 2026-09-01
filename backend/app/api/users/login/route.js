import prisma from "../../../../Utils/db";
import bcrypt from "bcryptjs";
import { generateToken } from "../../../../Utils/JwtUtils";
import { validateLogin } from "../../../../Middleware/users/UserJoi";
import { jsonResponse, corsPreflightResponse } from "../../../../Middleware/CorsMiddleware";
import { setAuthCookie } from "../../../../Utils/authCookie";
import { errorDetails } from "../../../../Utils/errorDetails";
import { checkRateLimit } from "../../../../Utils/rateLimit";

export async function OPTIONS(){
    return corsPreflightResponse("POST , OPTIONS");
}

export async function POST(req){
    try{

    const ip = req.headers.get(("x-forwarded-for") || "unknown");
    const rateLimitKey = `login:${ip}`;
    if (!checkRateLimit(rateLimitKey).allowed) {
      return jsonResponse({ error: "Trop de tentatives, réessayez plus tard" }, 429);
    }

    const formData = await req.formData();
    const email = formData.get("email");
    const password = formData.get("password");

    const validate = validateLogin({ email, password });
    if (!validate.statut) {
      return jsonResponse({ error: validate.message }, validate.code);
    }

    const user = await prisma.users.findUnique({ where: { email } });
    const isPasswordValid = user && (await bcrypt.compare(password, user.password));
    if (!isPasswordValid) {
      return jsonResponse({ error: "Mot de passe où Email incorrect" }, 401);
    }

    // Réinitialise le compteur de tentatives après une connexion réussie
    checkRateLimit(rateLimitKey, { reset: true });

    const token = generateToken(user);
    const firstLogin = user.firstConnection ?? false;

    const response = jsonResponse({
      message: firstLogin
        ? "Connexion réussie - changement de mot de passe requis"
        : "Connexion réussie",
      user: { email: user.email, role: user.role },
      firstLogin,
    });
    return setAuthCookie(response, token);
  } catch (error) {
    return jsonResponse(
      { error: "Erreur lors de la connexion", details: errorDetails(error) },
      500
    );
  }
}