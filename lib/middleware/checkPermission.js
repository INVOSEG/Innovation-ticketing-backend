const jwt = require("jsonwebtoken");
const { errorResponse } = require("../utils/error");
const Permission = require("../schema/permission.schema");
const Role = require("../schema/role.schema");
const USER = require("../../lib/schema/users.schema");

const { log } = require("winston");
const {
  EUserRole,
  UserStatus,
  DeleteStatus,
  DB_Tables,
} = require("../utils/enum");

const checkPermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      const token = req.header("auth-token");

      if (!token) {
        return sendResponse(res, EResponseCode.UNAUTHORIZED, {
          token: "Authentication required",
        });
      }

      if (!token) {
        return errorResponse(res, "Access token is required.", 401);
      }
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
      const roleName = decoded.role;
      const user = await USER.findById(decoded.id);
      // const findRole = await Role.findOne({ name: roleName });
      // if (!findRole) {
      //   return errorResponse(res, "role not found.", 404);
      // }
      // const permissions = await Permission.findOne({ userId: user._Id });

      // if (!permissions) {
      //   return errorResponse(res, "Permissions not found for this user.", 404);
      // }
      // if (permissions.status != UserStatus.ACTIVE) {
      //   return errorResponse(res, `Permission is ${permissions.status}`, 401);
      // }
      // const hasPermission = permissions[permissionName];
      const hasPermission = true;

      if (hasPermission) {
        req.user = user;
        next();
      } else {
        return errorResponse(
          res,
          " You do not have permission to access this ROUTE.",
          403
        );
      }
    } catch (err) {
      return errorResponse(res, err.message);
    }
  };
};

module.exports = checkPermission;
