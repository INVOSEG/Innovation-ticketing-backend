const Role = require("../../lib/schema/role.schema");
const User = require("../../lib/schema/users.schema");
const Agency = require("../../lib/schema/agency.schema");
const { successResponse } = require("../../lib/utils/success");
const { errorResponse } = require("../../lib/utils/error");
const mongoose = require("mongoose");
exports.updateRoleStatus = async (req, res) => {
  try {
    const { id } = req.query;
    const { status } = req.body; // Expected to be one of 'ACTIVE', 'INACTIVE', etc.

    // Validate the status
    const validStatuses = ["ACTIVE", "INACTIVE", "SUSPENDED", "CLOSED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status provided" });
    }

    // Find role and update status
    const updatedUser = await Role.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Send success response
    return sendResponse(
      res,
      EResponseCode.SUCCESS,
      "Role status updated successfully",
      updatedUser
    );
  } catch (err) {
    // Handle and return errors
    errReturned(res, err);
  }
};
exports.createRole = async (req, res) => {
  try {
    const { name, createdBy, agencyId } = req.body;
    const user = await User.findById(createdBy);
    console.log(user, "user");
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    // const agencyDoc = await Agency.findById(agencyId);
    // if (!agencyDoc) {
    //   return res.status(400).json({ message: "Agency not found" });
    // }
    const newRole = new Role({
      name,
      createdBy,
    });
    const savedRole = await newRole.save();
    res.status(201).json(savedRole);
  } catch (err) {
    console.error("Error creating role:", err);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.status(200).json(roles);
  } catch (err) {
    console.error("Error fetching roles:", err);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};
exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id)
      .populate("createdBy")
      .populate("agency");
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    res.status(200).json(role);
  } catch (err) {
    console.error("Error fetching role:", err);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};
exports.updateRole = async (req, res) => {
  try {
    const { name, createdBy, agency } = req.body;
    // Validate that the user and agency exist
    if (createdBy) {
      const user = await User.findById(createdBy);
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
    }
    if (agency) {
      const agencyDoc = await Agency.findById(agency);
      if (!agencyDoc) {
        return res.status(400).json({ message: "Agency not found" });
      }
    }
    const updatedRole = await Role.findByIdAndUpdate(
      req.params.id,
      { name, createdBy, agency },
      { new: true }
    )
      .populate("createdBy")
      .populate("agency");
    if (!updatedRole) {
      return res.status(404).json({ message: "Role not found" });
    }
    res.status(200).json(updatedRole);
  } catch (err) {
    console.error("Error updating role:", err);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};
exports.deleteRole = async (req, res) => {
  try {
    const deletedRole = await Role.findByIdAndDelete(req.params.id);
    if (!deletedRole) {
      return res.status(404).json({ message: "Role not found" });
    }
    res.status(200).json({ message: "Role deleted successfully" });
  } catch (err) {
    console.error("Error deleting role:", err);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};
exports.getRolesByAgency = async (req, res) => {
  try {
    const findRoles = await Role.find({
      name: { $nin: ["super_admin", "owner", "agency", "admin"] },
    });
    if (findRoles.length <= 0) {
      return errorResponse(res, "Roles not found", 404);
    }
    successResponse(res, "roles fetched successfully", findRoles);
  } catch (error) {
    return errorResponse(res, error);
  }
};
// exports.getRolesByAgency = async (req, res) => {
//   try {
//     console.log(req.params);
//     const { id } = req.params;
//     // Validate that agencyId is a valid ObjectId
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid agencyId format" });
//     }
//     // Validate that the agency exists
//     const agency = await Agency.findById(id);
//     agencyId = agency._id;
//     if (!agency) {
//       return res.status(400).json({ message: "Agency not found" });
//     }
//     // Find roles associated with the agency
//     const roles = await Role.find({ agencyId }) // Correctly query by agencyId
//       .populate("createdBy") // Assuming createdBy is a reference field
//       .populate("agencyId"); // Assuming agencyId is a reference field
//     if (roles.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No roles found for this agency" });
//     }
//     res.status(200).json(roles);
//   } catch (err) {
//     console.error("Error fetching roles by agency:", err);
//     res
//       .status(500)
//       .json({ message: "Internal Server Error", error: err.message });
//   }
// };
