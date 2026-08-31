import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: "10h",
  });

  return token;
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return error;
  }
}

export { generateToken, verifyToken };