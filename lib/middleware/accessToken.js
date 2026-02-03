const jwt = require("jsonwebtoken");

const tokenValidation = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid or expired token." });
      }

      req.user = decoded; // decoded contains the payload (e.g., user ID, email)
      next();
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Token validation failed", error: error.message });
  }
};

module.exports = tokenValidation;
