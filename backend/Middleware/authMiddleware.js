import { verifyToken } from "../Utils/JwtUtils";
import { AUTH_COOKIE_NAME } from "../Utils/authCookie";

export function authenticateToken(req){
    const authHearder = req.hearders.get("authorization");
    const token = authHearder.split(' ')[1]

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
