const jwt = require("jsonwebtoken");
const USER = require("../../lib/schema/users.schema");

const { sendResponse } = require("./dto");
const { EUserRole, EResponseCode } = require("./enum");
const { findById } = require("./abstractRepository");

exports.authUser = async function (req, res, next) {
  const token = req.header("auth-token");
  console.log("token authUser", token);


  try {
    if (!token)
      return sendResponse(res, EResponseCode.UNAUTHORIZED, {
        token: "Authentication required",
      });
    const verified = await jwt.verify(token, process.env.TOKEN_SECRET);

    console.log(verified);
    let userRole = await findById({ model: USER, id: verified?.id });

    console.log(userRole);

    if (!userRole) {
      return sendResponse(
        res,
        EResponseCode.UNAUTHORIZED,
        "Authentication required"
      );
    }
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).send({ token: "Invalid Token" });
  }
};

exports.authAdmin = async function (req, res, next) {
  const token = req.header("auth-token");
  console.log("token authAdmin", token);

  try {
    if (!token)
      return sendResponse(res, EResponseCode.UNAUTHORIZED, {
        token: "Authentication required",
      });

    const verified = await jwt.verify(token, process.env.TOKEN_SECRET);
    // const userRole = await USER.findById(verified._id);

    if (
      ![EUserRole.ADMIN, EUserRole.SUPERADMIN].includes(
        verified.role.toString()
      )
    ) {
      return sendResponse(
        res,
        EResponseCode.UNAUTHORIZED,
        "Only Admins and Super Admins can access this route"
      );
    }

    req.user = verified;
    next();
  } catch (error) {
    res.status(400).send({ token: "Invalid Token" });
  }
};

exports.authAgencyOwner = async function (req, res, next) {
  const token = req.header("auth-token");

  try {
    if (!token)
      return sendResponse(res, EResponseCode.UNAUTHORIZED, {
        token: "Authentication required",
      });

    const verified = await jwt.verify(token, process.env.TOKEN_SECRET);
    const userRole = await USER.findById(verified._id);

    if (userRole.role.toString() !== EUserRole.AGENCY_OWNER) {
      return sendResponse(
        res,
        EResponseCode.UNAUTHORIZED,
        "Only agency owners can access this route"
      );
    }

    req.user = verified;
    req.agencyId = userRole.agencyId; // Attach agency ID for Agency Owner
    next();
  } catch (error) {
    res.status(400).send({ token: "Invalid Token" });
  }
};
