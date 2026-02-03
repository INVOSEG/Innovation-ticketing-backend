const { errorResponse } = require("../utils/error");
const jwt = require("jsonwebtoken");
const USER = require("../../lib/schema/users.schema");

const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const token = req.header("auth-token");
      if (!token) {
        return errorResponse(res, "Authentication required", 401);
      }

      const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

      const user = await USER.findById(decoded.id);
      if (!user) {
        return errorResponse(res, "User not found", 404);
      }

      const userRole = decoded.role;
      if (!allowedRoles.includes(userRole)) {
        return errorResponse(
          res,
          `Only users with roles ${allowedRoles.join(
            ", "
          )} can access this route`,
          403
        );
      }

      req.user = user;
      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return errorResponse(res, "Token has expired", 401);
      }
      return errorResponse(res, "Invalid token", 401);
    }
  };
};

module.exports = checkRole;
