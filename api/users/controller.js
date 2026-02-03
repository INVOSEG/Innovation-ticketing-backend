const bcrypt = require("bcryptjs");
const USER = require("../../lib/schema/users.schema");
require("dotenv").config();

const { successResponse } = require("../../lib/utils/success");
const { errorResponse } = require("../../lib/utils/error");

const { sendResponse, errReturned } = require("../../lib/utils/dto");
const { EResponseCode } = require("../../lib/utils/enum");
const {
  findByIdAndUpdate,
  findById,
  pagenate,
} = require("../../lib/utils/abstractRepository");

const {
  updateProfileSchemaValidator,
  updatePasswordSchemaValidator,
} = require("../../lib/utils/sanitization");
const fs = require("fs/promises");
const { isValidPassword } = require("../../lib/utils/commonFunction");
exports.userProfile = async (req, res) => {
  try {
    let user = await findById({ model: USER, id: req?.params?.id });

    return sendResponse(res, EResponseCode.SUCCESS, "User Profile", user);
  } catch (e) {
    errReturned(res, e);
  }
};

exports.createUser = async (req, res) => {
  try {
    // Extract user data from request body
    const userData = req.body;
    if (!userData.email) {
      return errorResponse(res, "Email is required", 400);
    }
    const emailRegex = /^[\w-\.]+@(gmail\.com|[\w-]+\.saboor\.pk)$/;
    if (!emailRegex.test(userData.email)) {
      return errorResponse(
        res,
        "Invalid email format. Only saboor.pk and gmail.com are allowed.",
        400
      );
    }
    if (userData.password) {
      if (!isValidPassword(userData.password)) {
        return errorResponse(
          res,
          "Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, one number, and one special character.",
          400
        );
      }
    }
    // Check if password is present in the userData
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }

    // Create new user object
    const newUser = new USER(userData);

    // Save new user to the database
    const savedUser = await newUser.save();

    // Send success response
    return sendResponse(
      res,
      EResponseCode.SUCCESS,
      "User created successfully",
      savedUser
    );
  } catch (err) {
    // Handle and return errors
    console.log("error =============", err);
    errReturned(res, err);
  }
};

exports.userList = async (req, res) => {
  try {
    const users = await pagenate({
      model: USER,
      projection: "name email role status firstName",
    });
    return sendResponse(res, EResponseCode.SUCCESS, "User list", users);
  } catch (err) {
    errReturned(res, err);
  }
};

exports.agentList = async (req, res) => {
  try {
    const agents = await USER.find(
      { role: "agency" },
      "firstName email status"
    ); // Query users with role 'agent'
    return sendResponse(res, EResponseCode.SUCCESS, "Agent list", agents);
  } catch (err) {
    errReturned(res, err);
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { error, value } = updatePasswordSchemaValidator.validate(req.body);
    if (error) return errReturned(res, error.message);

    const salt = await bcrypt.genSalt(10);
    let hashedPassword = await bcrypt.hash(value.newpassword, salt);

    let user = await findById({ model: USER, id: req?.user?.id });

    const validPass = await bcrypt.compare(value.oldpassword, user.password);
    if (!validPass) return errReturned(res, "Invalid Password");

    let status = await findByIdAndUpdate({
      model: USER,
      id: req?.user?.id,
      updateData: { password: hashedPassword },
    });

    if (status["nModified"])
      return sendResponse(res, EResponseCode.NOTFOUND, "Already updated");

    return sendResponse(
      res,
      EResponseCode.SUCCESS,
      "Password has been updated"
    );
  } catch (error) {
    errReturned(res, error);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    console.log("value.profileImg", req.body);

    const userId = req?.params?.id;

    console.log("userId", userId);

    // const { error, value } = updateProfileSchemaValidator.validate(req.body, {
    //   stripUnknown: true, // Exclude unknown fields, including "_id"
    // });    if (error) {
    //   return errReturned(res, error.message);
    // }
    let value = req.body;

    console.log("value.profileImg", req.file.path);

    const hasNewImage = req.file.path !== undefined && req.file.path !== null;
    console.log("hasNewImage", hasNewImage);

    // If a new image is provided, delete the previous image
    if (hasNewImage) {
      console.log(hasNewImage);
      const user = await findById({ model: USER, id: userId });

      if (user && user.profileImg) {
        // Assuming user.image is the field where the image path is stored
        // Delete the previous image
        await fs.unlink(user.profileImg);
      }
    }

    value.profileImg = req?.file?.path;

    const profile = await findByIdAndUpdate({
      model: USER,
      id: userId,
      updateData: value,
    });
    return sendResponse(res, EResponseCode.SUCCESS, "success", profile);
  } catch (error) {
    console.log("here --------", error);

    errReturned(res, error);
  }
};

exports.userDetail = async (req, res) => {
  try {
    let user = await findById({ model: USER, id: req?.params?.id });

    return sendResponse(res, EResponseCode.SUCCESS, "User Detail", user);
  } catch (error) {
    errReturned(res, error);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user and remove from database
    const deletedUser = await USER.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send success response
    return sendResponse(
      res,
      EResponseCode.SUCCESS,
      "User deleted successfully",
      deletedUser
    );
  } catch (err) {
    // Handle and return errors
    errReturned(res, err);
  }
};

exports.updateUserStatus = async (req, res) => {
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
    const updatedUser = await USER.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Users not found" });
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

exports.getUserRoleOwner = async (req, res) => {
  try {
    const findUsers = await USER.find({ role: "owner" });
    if (findUsers.length <= 0) {
      return errorResponse(res, "Users not found with role owner", 404);
    }
    const sanitizedUsers = findUsers.map((user) => {
      const { password, ...sanitizedUser } = user.toObject();
      return sanitizedUser;
    });

    return successResponse(
      res,
      "Users with role owner fetched successfully",
      sanitizedUsers
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};

exports.getUserRoleUser = async (req, res) => {
  try {
    const findUsers = await USER.find({ role: "user" });
    if (findUsers.length <= 0) {
      return errorResponse(res, "Users not found with role user", 404);
    }
    const sanitizedUsers = findUsers.map((user) => {
      const { password, ...sanitizedUser } = user.toObject();
      return sanitizedUser;
    });

    return successResponse(
      res,
      "Users with role user fetched successfully",
      sanitizedUsers
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};
exports.getAllSPOs = async (req, res) => {
  try {
    const findUsers = await USER.find(
      { role: "SPO" },
      "firstName email status"
    );
    if (findUsers.length === 0) {
      return errorResponse(res, "No SPOs found", 404);
    }

    return successResponse(res, "SPOs fetched successfully", findUsers);
  } catch (error) {
    return errorResponse(res, error);
  }
};
