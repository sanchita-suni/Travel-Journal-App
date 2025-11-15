// backend/middleware/auth.js
import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "No token" });

  const token = header.split(" ")[1];
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = data.userId;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
