import jwt from "jsonwebtoken";

// Create JWT token
export function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user._id,
      username: user.username
    },
    process.env.TOKEN_SECRET,
    {
      expiresIn: "1d"
    }
  );
}

// Middleware to protect routes
export function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;

  // Check if Authorization header exists
  if (!authHeader) {
    return res.status(401).json({
      message: "Authorization header missing"
    });
  }

  // Extract token from:
  // "Bearer TOKEN"
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Token missing"
    });
  }

  // Verify token
  jwt.verify(
    token,
    process.env.TOKEN_SECRET,
    (err, decoded) => {
      if (err) {
        return res.status(401).json({
          message: "Invalid token"
        });
      }

      // Save decoded user info to request
      req.user = decoded;

      // Continue to route
      next();
    }
  );
}
