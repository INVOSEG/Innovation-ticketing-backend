const bcrypt = require("bcryptjs");
const Permission = require("../../lib/schema/permission.schema");
const Agency = require("../../lib/schema/agency.schema");
const Role = require("../../lib/schema/role.schema");

require("dotenv").config();
const mongoose = require("mongoose");
const { successResponse } = require("../../lib/utils/success");
const { errorResponse } = require("../../lib/utils/error");

exports.createPermisssion = async (req, res) => {
  try {
    const permisssionData = req.body;
    const findUserPermission = await Permission.findOne({
      roleId: permisssionData.roleId,
    });
    if (findUserPermission) {
      return errorResponse(res, "user already has permission", 404);
    }
    const findRole = await Role.findById(permisssionData.roleId);
    if (!findRole) {
      return errorResponse(res, "role not found", 404);
    }
    const newUser = new Permission(permisssionData);
    const savedUser = await newUser.save();
    successResponse(res, "permission created successfully", savedUser);
  } catch (err) {
    errorResponse(res, err);
  }
};
exports.getAllUserPermission = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("id of agency is", id);

    const findUserPermission = await Permission.find();
    if (findUserPermission.length <= 0) {
      return errorResponse(res, "permissions not found", 404);
    }

    successResponse(
      res,
      "Permissions fetched successfully",
      findUserPermission
    );
  } catch (err) {
    errorResponse(res, err);
  }
};
exports.deletePermission = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);

    const findPermission = await Permission.findByIdAndDelete(id);
    console.log("findPermission,", findPermission);

    if (!findPermission) {
      return errorResponse(res, "permsission not found", 404);
    }

    successResponse(res, "Permission deleted successfully");
  } catch (err) {
    errorResponse(res, err);
  }
};
exports.updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const updatePermission = await Permission.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatePermission) {
      return errorResponse(res, "permission not found", 404);
    }

    successResponse(res, "permission updated successfully", updatePermission);
  } catch (err) {
    errorResponse(res, err);
  }
};
exports.findPermissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const findPermission = await Permission.findById(id);
    if (findPermission === null) {
      return errorResponse(res, "permisssion not found", 404);
    }

    successResponse(res, "permission fetched successfully", findPermission);
  } catch (err) {
    errorResponse(res, err);
  }
};
exports.updatePermissionStatus = async (req, res) => {
  try {
    const { id } = req.query;
    const { status } = req.body; // Expected to be one of 'ACTIVE', 'INACTIVE', etc.

    console.log(id);
    // Validate the status
    const validStatuses = ["ACTIVE", "INACTIVE", "SUSPENDED", "CLOSED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status provided" });
    }

    // Find user and update status
    const updatedUser = await Permission.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Permission not found" });
    }

    // Send success response
    return sendResponse(
      res,
      EResponseCode.SUCCESS,
      "Permission status updated successfully",
      updatedUser
    );
  } catch (err) {
    // Handle and return errors
    errReturned(res, err);
  }
};
