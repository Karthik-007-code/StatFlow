import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Protect middleware — verifies the Bearer token in the Authorization header
 * and attaches the authenticated user to `req.user`.
 */
const protect = async (req, res, next) => {
  let token;

  // Extract token from "Authorization: Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    return next(new Error("Not authorized — no token provided"));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user (excluding password) to the request object
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      res.status(401);
      return next(new Error("Not authorized — user no longer exists"));
    }

    next();
  } catch (error) {
    res.status(401);
    return next(new Error("Not authorized — invalid token"));
  }
};

export default protect;
