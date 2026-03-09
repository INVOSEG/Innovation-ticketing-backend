const Agency = require("../../lib/schema/agency.schema");
const Type = require("../../lib/schema/agencytypes.schema");
const User = require("../../lib/schema/users.schema");
const Book = require("../../lib/schema/book.schema");
const { successResponse } = require("../../lib/utils/success");
const { errorResponse } = require("../../lib/utils/error");
const moment = require("moment");
const bcrypt = require("bcryptjs");
const { EUserRole } = require("../../lib/utils/enum");
require("dotenv").config();
const fs = require("fs");
const { sendEmail } = require("../../lib/utils/sendEmail");
const {
  verifyAccount,
} = require("../../lib/utils/emailTemplate/verifyAccount");
const { newAccount } = require("../../lib/utils/emailTemplate/newaccount");
const isValidPassword = (password) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};
const jwt = require("jsonwebtoken");
const { generateActivationToken } = require("../../lib/utils/commonFunction");

// Verify token
const verifyToken = (token) => {
  return jwt.verify(token, process.env.TOKEN_SECRET);
};
const mongoose = require("mongoose");

exports.createAgency = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const newAgency = new Agency({
      ...req.body,
    });

    const findType = await Type.findById(req.body.type);
    console.log(findType);
    if (!findType) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, "Type not found", 404);
    }

    const findAgency = await Agency.findOne({
      email: newAgency.agencyEmail,
      role: "agency",
    });
    if (findAgency) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, "Agency already created with this email", 400);
    }
    const findSuperAdmin = await User.findOne({ role: "super_admin" }).session(
      session
    );

    if (!findSuperAdmin) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, "Super admin account not found", 500);
    }

    // Check if super admin has sufficient cash limit
    if (Number(findSuperAdmin.cashLimit) < Number(req.body.cashLimit)) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, "Cash limit is not sufficient", 400);
    }

    // Deduct the amount from super admin
    findSuperAdmin.cashLimit -= Number(req.body.cashLimit);
    await findSuperAdmin.save({ session });
    console.log(
      "diducted amount from suoer admin.............................."
    );
    const logo = req.files["logo"] ? req.files["logo"][0].path : null;
    const filePaths = req.files["files"]
      ? req.files["files"].map((file) => file.path)
      : [];

    let password;
    if (req.body.agencyPassword) {
      if (!isValidPassword(req.body.agencyPassword)) {
        await session.abortTransaction();
        session.endSession();
        return errorResponse(
          res,
          "Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, one number, and one special character.",
          400
        );
      }
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(req.body.agencyPassword, salt);
    }

    if (!newAgency.CNIC) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, "CNIC is required", 400);
    }
    if (newAgency.CNIC.length !== 13) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, "CNIC must be 13 digits long", 400);
    }
    if (!/^\d+$/.test(newAgency.CNIC)) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, "CNIC must contain only digits", 400);
    }

    if (!newAgency.agencyEmail) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, "Email is required", 400);
    }
    const emailRegex = /^[\w-\.]+@(gmail\.com|[\w-]+\.saboor\.pk)$/;
    if (!emailRegex.test(newAgency.agencyEmail)) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(
        res,
        "Invalid email format. Only .saboor.pk and gmail.com are allowed.",
        400
      );
    }

    newAgency.filePaths = filePaths.length > 0 ? filePaths : null;
    newAgency.logo = logo;
    const userData = {
      firstName: newAgency.personName,
      password: password,
      email: newAgency.agencyEmail,
      phone: newAgency.phoneNumber,
      role: "agency",
    };
    const lastStaff = await User.findOne({
      agentCode: { $regex: /^SA\d+$/ },
    }).sort({ agentCode: -1 });

    let newAgentCode = "SA0001";

    if (lastStaff && lastStaff.agentCode) {
      // Extract numeric part after "SA"
      const lastCodeNum = parseInt(lastStaff.agentCode.replace("SA", ""), 10);

      if (!isNaN(lastCodeNum)) {
        const nextCodeNum = lastCodeNum + 1;
        newAgentCode = `SA${String(nextCodeNum).padStart(4, "0")}`;
      }
    }

    userData.agentCode = newAgentCode;

    const savedUser = await User.create([userData], { session });
    newAgency.userId = savedUser[0]._id;
    newAgency.cashLimit = newAgency.cashRecived; // log;

    const savedAgency = await newAgency.save({ session });
    if (req.body.cashRecived > 0) {
      const description = `${req.body.PayMethod} received ${req.body.agencyName}`;
      const newBook = new Book({
        type: "received",
        date: new Date(),
        agencyId: newAgency._id,
        description,
        debt: "0",
        credit: req.body.cashRecived,
      });
      await newBook.save();
    }
    await User.findByIdAndUpdate(
      savedUser[0]._id,
      { agencyId: savedAgency._id },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    const token = generateActivationToken(savedUser[0]._id);
    const resetPasswordLink = `${process.env.API_URL}/api/agency/verify/email/${token}`;

    await sendEmail(
      newAgency.agencyEmail,
      "Verify Your Account",
      verifyAccount(
        `${newAgency.personName}`,
        req.body.agencyPassword,
        findType.type,
        resetPasswordLink
      )
    );

    return successResponse(res, "Agency created successfully", savedAgency);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating agency:", err);
    return errorResponse(
      res,
      err.message || "An error occurred while creating the agency"
    );
  }
};

// exports.createAgency = async (req, res) => {
//   try {
//     console.log("im here");
//     const newAgency = new Agency({
//       ...req.body,
//     });
//     const findType = await Type.findById(req.body.type);
//     console.log("body", req.files.logo);
//     console.log(findType);
//     if (!findType) {
//       return errorResponse(res, "type not found", 404);
//     }
//     const findAgency = await Agency.findOne({
//       email: newAgency.agencyEmail,
//       role: "agency",
//     });
//     if (findAgency) {
//       return errorResponse(res, "Agency already created with this email", 400);
//     }

//     const logo = req.files["logo"] ? req.files["logo"][0].path : null;
//     const filePaths = req.files["files"]
//       ? req.files["files"].map((file) => file.path)
//       : [];

//     let password;
//     if (req.body.agencyPassword) {
//       if (!isValidPassword(req.body.agencyPassword)) {
//         return errorResponse(
//           res,
//           "Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, one number, and one special character.",
//           400
//         );
//       }
//       const salt = await bcrypt.genSalt(10);
//       password = await bcrypt.hash(req.body.agencyPassword, salt);
//     }
//     if (!newAgency.CNIC) {
//       return errorResponse(res, "CNIC is required", 400);
//     }
//     if (newAgency.CNIC.length !== 13) {
//       return errorResponse(res, "CNIC must be 13 digits long", 400);
//     }
//     if (!/^\d+$/.test(newAgency.CNIC)) {
//       return errorResponse(res, "CNIC must contain only digits", 400);
//     }

//     if (!newAgency.agencyEmail) {
//       return errorResponse(res, "Email is required", 400);
//     }
//     const emailRegex = /^[\w-\.]+@(gmail\.com|[\w-]+\.saboor\.pk)$/;
//     if (!emailRegex.test(newAgency.agencyEmail)) {
//       return errorResponse(
//         res,
//         "Invalid email format. Only .saboor.pk and gmail.com are allowed.",
//         400
//       );
//     }

//     newAgency.filePaths = filePaths.length > 0 ? filePaths : null;
//     const userData = {
//       firstName: newAgency.personName,
//       password: password,
//       email: newAgency.agencyEmail,
//       role: "agency",
//     };
//     console.log("userData", userData);
//     const savedUser = await User.create(userData);
//     savedUser.save();
//     newAgency.userId = savedUser._id;
//     newAgency.logo = logo;
//     const savedAgency = await newAgency.save();
//     await User.findByIdAndUpdate(savedUser._id, { agencyId: savedAgency._id });
//     const token = generateActivationToken(savedUser._id); // Generate JWT token
//     const resetPasswordLink = `${process.env.API_URL}/api/agency/verify/email/${token}`;
//     await sendEmail(
//       newAgency.agencyEmail,
//       "Verify You Account",
//       verifyAccount(
//         `${newAgency.personName}`,
//         req.body.agencyPassword,
//         findType.type,
//         resetPasswordLink
//       )
//     );
//     return successResponse(res, "Agency created successfully", savedAgency);
//   } catch (err) {
//     console.error("Error creating agency:", err);
//     return errorResponse(res, err);
//   }
// };
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = verifyToken(token);
    const { id } = decoded;
    console.log(id);
    const agency = await User.findById(id);
    if (!agency) {
      return res.status(404).json({ message: "User not found" });
    }

    agency.status = "ACTIVE";
    await agency.save();

    res.redirect(`${process.env.CLIENT_URL}/login`);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to activate account", error });
  }
};

// exports.getAllAgencies = async (req, res) => {
//   try {
//     const user = req.user;
//     let agencies;

//     if (user.role === EUserRole.SUPERADMIN) {
//       agencies = await Agency.find();
//       if (agencies.length <= 0) {
//         return errorResponse(res, "no agency found", 404);
//       }
//       return successResponse(res, "Agencies fetched successfully", {
//         agency: agencies,
//       });
//     } else if (user.role) {
//       agencies = await Agency.find({ userId: user.id });
//       if (!agencies) {
//         return errorResponse(res, "no agency found", 404);
//       }
//       return successResponse(res, "agency fetched successfully", {
//         agency: agencies,
//       });
//     } else {
//       return res.status(403).json({ message: "Access forbidden" });
//     }
//   } catch (err) {
//     console.error("Error retrieving agencies:", err);
//     res
//       .status(500)
//       .json({ message: "Internal Server Error", error: err.message });
//   }
// };

// Get a single agency by ID

exports.getAllAgencies = async (req, res) => {
  try {
    const user = req.user;

    const {
      CNIC,
      agencyEmail,
      agencyName,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};
    if (CNIC) filter.CNIC = CNIC;
    if (agencyEmail) filter.agencyEmail = agencyEmail;
    if (agencyName) filter.agencyName = agencyName;
    if (status) filter.status = status;

    let agencies;
    if (user.role === EUserRole.SUPERADMIN) {
      agencies = await Agency.find(filter)
        // .skip((page - 1) * limit)
        // .limit(Number(limit))
        .populate("type", "type")
        .sort({ createdAt: -1 });
      const totalAgencies = await Agency.countDocuments(filter);
      const totalPages = Math.ceil(totalAgencies / limit);

      if (agencies.length <= 0) {
        return errorResponse(res, "No agency found", 404);
      }

      return successResponse(res, "Agencies fetched successfully", {
        agency: agencies,
        // totalAgencies,
        // totalPages,
        // currentPage: Number(page),
      });
    } else if (user.role) {
      agencies = await Agency.find({})
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

      const totalAgencies = await Agency.countDocuments({
      });
      const totalPages = Math.ceil(totalAgencies / limit);

      if (agencies.length <= 0) {
        return errorResponse(res, "No agency found", 404);
      }

      return successResponse(res, "Agency fetched successfully", {
        agency: agencies,
        totalAgencies,
        totalPages,
        currentPage: Number(page),
      });
    } else {
      return res.status(403).json({ message: "Access forbidden" });
    }
  } catch (err) {
    console.error("Error retrieving agencies:", err);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};
exports.getAgencyById = async (req, res) => {
  try {
    const { id } = req.params;
    const agency = await Agency.findById(id);

    if (!agency) {
      return res.status(404).json({ message: "Agency not found" });
    }
    return successResponse(res, "agency fetched sucessfully", agency);
  } catch (error) {
    return errorResponse(res, error);
  }
};

// Update an agency by ID
exports.updateAgency = async (req, res) => {
  try {
    const { id } = req.params;

    const agency = await Agency.findById(id);

    if (!agency) {
      return res.status(404).json({ message: "Agency not found" });
    }

    agency.affiliateName = req.body.affiliateName || agency.affiliateName;
    agency.agencyEmail = req.body.agencyEmail || agency.agencyEmail;
    agency.agencyPassword = req.body.agencyPassword || agency.agencyPassword;

    if (req.files && req.files.length > 0) {
      const filePaths = req.files.map((file) => file.path);
      agency.filePaths = filePaths;
    }

    const updatedAgency = await agency.save();

    res.status(200).json(updatedAgency);
  } catch (err) {
    console.error("Error updating agency:", err);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

// Update Status of agency by ID
exports.updateAgencyStatus = async (req, res) => {
  try {
    const { id } = req.query;
    const { status } = req.body; // Expected to be one of 'ACTIVE', 'INACTIVE', etc.
    console.log("status", req.query, status);
    // Validate the status
    const validStatuses = ["ACTIVE", "INACTIVE", "SUSPENDED", "CLOSED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status provided" });
    }

    // Find user and update status
    const updatedUser = await Agency.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Agency not found" });
    }

    // Send success response
    return sendResponse(
      res,
      EResponseCode.SUCCESS,
      "Agency status updated successfully",
      updatedUser
    );
  } catch (err) {
    // Handle and return errors
    errReturned(res, err);
  }
};
// Delete an agency by ID
exports.deleteAgency = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAgency = await Agency.findByIdAndDelete(id);

    if (!deletedAgency) {
      return res.status(404).json({ message: "Agency not found" });
    }

    // Delete files associated with the agency
    if (deletedAgency.filePaths) {
      deletedAgency.filePaths.forEach((filePath) => {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
          }
        });
      });
    }

    res.status(200).json({ message: "Agency deleted successfully" });
  } catch (err) {
    console.error("Error deleting agency:", err);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

exports.getEmployeeData = async (req, res) => {
  try {
    console.log(req.user);
    const findTotalAgencyActive = await Agency.find({ status: "ACTIVE" });
    const findTotalSaleActive = await User.find({
      role: "sale",
      status: "ACTIVE",
    });
    const findTotalMarketingActive = await User.find({
      role: "marketing",
      status: "ACTIVE",
    });
    const findTotalStaffActive = await User.find({
      role: "staff",
      status: "ACTIVE",
    });
    const findTotalAgencyInActive = await Agency.find({ status: "INACTIVE" });
    const findTotalSaleInActive = await User.find({
      role: "sale",
      status: "INACTIVE",
    });
    const findTotalMarketingInActive = await User.find({
      role: "marketing",
      status: "INACTIVE",
    });
    const findTotalStaffInActive = await User.find({
      role: "staff",
      status: "INACTIVE",
    });
    const findTotalAgency = await Agency.find();
    const findTotalSale = await User.find({ role: "sale" });
    const findTotalMarketing = await User.find({ role: "marketing" });
    const findTotalStaff = await User.find({ role: "staff" });

    // Sales data
    const salesData = {
      year: [2024, 2023, 2022, 2021],
      sale: [23, 500, 1000, 200],
    };

    const totalSales = salesData.sale.reduce((acc, curr) => acc + curr, 0);

    const salesPercentage = salesData.sale.map((sale) =>
      ((sale / totalSales) * 100).toFixed(2)
    );

    return successResponse(res, "Dashboard data fetched successfully", {
      totalSaleThisYear: 23,
      saleData: {
        year: salesData.year,
        sale: salesData.sale,
        salesPercentage: salesPercentage,
      },
      saleDataAverage: 481,
      totalAgency: findTotalAgency.length,
      totalAgencyInActive: findTotalAgencyInActive.length,
      totalAgencyActive: findTotalAgencyActive.length,
      totalStaff: findTotalStaff.length,
      totalStaffInActive: findTotalStaffInActive.length,
      totalStaffActive: findTotalStaffActive.length,
      totalSaleStaff: findTotalSale.length,
      totalSaleStaffInActive: findTotalSaleInActive.length,
      totalSaleStaffActive: findTotalSaleActive.length,
      totalMarketingStaff: findTotalMarketing.length,
      totalMarketingStaffInActive: findTotalMarketingInActive.length,
      totalMarketingStaffActive: findTotalMarketingActive.length,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

exports.getSaleData = async (req, res) => {
  try {
    return successResponse(res, "data fetched successfully", {
      totalSaleThisYear: 23,
      saleData: {
        year: [2024, 2023, 2022, 20210],
        sale: [23, 500, 1000, 200],
      },
      saleDataAverage: 481,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

exports.newAgency = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, country, city } = req.body;
    const findemail = await Agency.findOne({ email });
    if (findemail) {
      return errorResponse(res, "Email already exist", 404);
    }
    const findadmin = await User.findOne({ role: "super_admin" });
    await sendEmail(
      findadmin.email,
      "New account request",
      newAccount(firstName, lastName, email, phoneNumber, country, city)
    );
    return successResponse(res, "new account request sent successfully"), 200;
  } catch (error) {
    return errorResponse(res, error);
  }
};
