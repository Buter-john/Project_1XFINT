import { verifyToken } from "../Utils/JwtUtils";
import { AUTH_COOKIE_NAME } from "../Utils/authCookie";

export function authenticateToken(req){
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1] || req.cookies?.get(AUTH_COOKIE_NAME)?.value;

    if (!token){
        return {isAuthenticated: false, error: "Token required"}
    }
    
    const decodedToken = verifyToken(token)

    if (!decodedToken || decodedToken instanceof Error ){
     return { isAuthenticated: false, error: "Invalid or expired token" };
  }

  return { isAuthenticated: true, user: decodedToken };
}

function authorizeRole(allowedRoles, role) {
  return allowedRoles.includes(role);
}

export { authenticateToken, authorizeRole };
