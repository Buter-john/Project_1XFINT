import { json } from "stream/consumers";
import { authenticateToken } from "../../../../Middleware/authMiddleware";
import { jsonResponse, corsMiddleware, corsPreflightResponse } from "../../../../Middleware/CorsMiddleware";
import { error } from "console";


export async function OPTIONS() {
    return corsPreflightResponse("GET , OPTION")
}
export async function GET(req) {

    const auth = authenticateToken(req);

    if (!auth.isAuthenticated) {
        return jsonResponse({ error: auth.error }, 401);
    }

    return jsonResponse({

        email: auth.user.email,
        role: auth.user.role,
        firstLogin: auth.user.firstConnection ?? false,

    });

}

