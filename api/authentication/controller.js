const _ = require("lodash");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { errorResponse } = require("../../lib/utils/error");
const { sendResponse } = require("../../lib/utils/dto");
const { EResponseCode } = require("../../lib/utils/enum");

const User = require("../../lib/schema/users.schema");
const Agency = require("../../lib/schema/agency.schema");
const ROLE = require("../../lib/schema/role.schema");
const { sendEmail, sendWhatsAppMessage } = require("../../lib/utils/sendEmail");
const { UserStatus } = require("../../lib/utils/enum");
const {
  recentLoginTemplate,
} = require("../../lib/utils/emailTemplate/recentLoginTemplate");
const { warningEmail } = require("../../lib/utils/emailTemplate/warningEmail");
const {
  forgetPassword,
} = require("../../lib/utils/emailTemplate/forgetPAssword");
const {
  otpReceivedTemplate,
} = require("../../lib/utils/emailTemplate/otpReceivedTemplate");
const {
  emailRegistration,
  forgotPasswordEmail,
} = require("../../lib/utils/email");
const {
  userResgisterSchemaValidator,
  userLoginSchemaValidator,
} = require("../../lib/utils/sanitization");
const { getLogger } = require("nodemailer/lib/shared");
const isValidPassword = (password) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};
require("dotenv").config();
const {
  generateActivationToken,
  generateOTP,
  handleOtpAttempts,
} = require("../../lib/utils/commonFunction");

const {
  reVarifyAccount,
} = require("../../lib/utils/emailTemplate/verifyAccount copy");
const { successResponse } = require("../../lib/utils/success");
const UAParser = require("ua-parser-js");
const axios = require("axios");
exports.login = async (req, res) => {
  try {
    const { error, value } = userLoginSchemaValidator.validate(req.body);
    if (error) return errorResponse(res, error.message);

    const { email, password, agentCode } = value;
    const user = await User.findOne({ email, agentCode });
    if (!user) return errorResponse(res, "User not found", 404);

    let agency;
    if (user.agencyId) agency = await Agency.findById(user.agencyId);

    if (!user.emailVerified)
      return errorResponse(res, "Please verify your email first to login.");
    if (user.status === UserStatus.INACTIVE)
      return errorResponse(res, "Your account is inactive.", 404);

    // Handle OTP attempts and cooldown
    if (user.otp.count > 2 && !user.otp.availableAt) {
      user.otp.availableAt = new Date(Date.now() + 5 * 60 * 1000); // 5-minute cooldown
      await user.save();
      return errorResponse(
        res,
        "Too many incorrect OTP attempts. Please try again in 5 minutes.",
        403
      );
    }

    if (user.otp.count >= 3 && user.otp.availableAt > new Date()) {
      const remainingTime = user.otp.availableAt - new Date();
      const remainingMinutes = Math.floor(remainingTime / 60000); // Get remaining minutes
      const remainingSeconds = Math.floor((remainingTime % 60000) / 1000); // Get remaining seconds

      return errorResponse(
        res,
        `Too many OTP generation attempts. Please try again in ${remainingMinutes}m ${remainingSeconds}s.`,
        403
      );
    }

    if (user.otp.count >= 3 && user.otp.availableAt <= new Date()) {
      user.otp.count = 0;
      user.otp.availableAt = null;
    }

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return errorResponse(res, "Invalid credentials", 401);

    const otp = generateOTP();
    user.otp = {
      code: otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // OTP expires in 5 minutes
      count: user.otp.count + 1,
      availableAt: user.otp.availableAt, // Retain existing cooldown
    };
    await user.save();

    // Simulate OTP send (replace with actual API call)
    console.log(
      user.email,
      `OTP for ${
        agency?.agencyName || "your account"
      } is ${otp}. Do not disclose OTP to anyone.`
    );
    await sendEmail(
      user.email,
      "OTP Recived",
      otpReceivedTemplate(`${user.firstName}`, otp)
    );
    // await sendWhatsAppMessage(
    //   user.phone,
    //   ` One Time Password to complete your first time login for ${agency.agencyName} is ${otp}. Al-Saboor Travels never calls to verify OTP. \n *Do not disclose OTP to anyone*.`
    // );
    return successResponse(res, "OTP has been sent to your email.");
  } catch (error) {
    return errorResponse(res, error);
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    // Log the last login date before updating it
    const previousLoginDate = user.lastLogin;

    const otpValidationResult = await handleOtpAttempts(user, otp);

    if (!otpValidationResult.success) {
      return res.status(otpValidationResult.status).json({
        error: otpValidationResult.message,
      });
    }

    let agency;
    if (user.agencyId) {
      agency = await Agency.findById(user.agencyId);
    }

    let response = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      agentCode: user.agentCode ? user.agentCode : null,
      profileImg: user?.profileImg,
      agency_id: user.agencyId,
      logo: agency ? agency.logo : null,
      showLable: agency?.showLabel,
      allocatedBalance: user.allocatedBalance ? user.allocatedBalance : 0,
      lastLogin: previousLoginDate, // Include the previous last login in the response
    };

    // Update the lastLogin field to the current date and time
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(response, process.env.TOKEN_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    const userAgent = req.headers["user-agent"] || "Unknown User-Agent";
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    console.log("result", result);
    const osName = result.os.name || "Unknown OS";
    const browser = result.browser.name || "Unknown browser";
    const deviceInfo = `${osName}`;

    // Format time correctly
    const loginTime = new Date().toLocaleString("en-US", {
      timeZone: "UTC",
    });

    // Send Email
    const loginDetails = `
      📌 **Login Details**:
      - **Time**: ${loginTime} UTC
    `;

    console.log(loginDetails);
    await sendEmail(
      user.email,
      "Recent Login Detected",
      recentLoginTemplate(`${user.firstName}`, loginDetails)
    );
    await sendWhatsAppMessage(user.phone, `OTP verified successfully`);
    // res.cookie('jwt', token, { to set auth-token in cookie
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: 'None',
    // });
    res.header("auth-token", token).json({
      message: "OTP verified successfully!",
      token,
      user: response,
      previousLoginDate, // Optional: Include this if you want to explicitly show it
    });
  } catch (error) {
    console.log("error,", error);
    return errorResponse(res, error);
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return errorResponse(res, "User not found", 404);

    let agency;
    if (user.agencyId) agency = await Agency.findById(user.agencyId);

    if (!user.emailVerified)
      return errorResponse(
        res,
        "Please verify your email first to request OTP."
      );

    // Handle OTP attempts and cooldown
    if (user.otp.count > 2 && !user.otp.availableAt) {
      user.otp.availableAt = new Date(Date.now() + 5 * 60 * 1000); // 5-minute cooldown
      await user.save();
      return errorResponse(
        res,
        "Too many incorrect OTP attempts. Please try again in 5 minutes.",
        403
      );
    }

    if (user.otp.count >= 3 && user.otp.availableAt > new Date()) {
      const remainingTime = user.otp.availableAt - new Date();
      const remainingMinutes = Math.floor(remainingTime / 60000); // Get remaining minutes
      const remainingSeconds = Math.floor((remainingTime % 60000) / 1000); // Get remaining seconds

      return errorResponse(
        res,
        `Too many OTP generation attempts. Please try again in ${remainingMinutes}m ${remainingSeconds}s.`,
        403
      );
    }

    if (user.otp.count >= 3 && user.otp.availableAt <= new Date()) {
      user.otp.count = 0;
      user.otp.availableAt = null;
    }

    // Generate new OTP
    const otp = generateOTP();
    user.otp = {
      code: otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // OTP expires in 5 minutes
      count: user.otp.count + 1,
      availableAt: user.otp.availableAt, // Retain existing cooldown
    };
    await user.save();

    // Simulate OTP send (replace with actual API call)
    console.log(
      `OTP for ${
        agency?.agencyName || "your account"
      } is ${otp}. Do not disclose OTP to anyone.`
    );

    await sendEmail(
      user.email,
      "OTP Resent",
      otpReceivedTemplate(`${user.firstName}`, otp)
    );
    await sendWhatsAppMessage(
      user.phone,
      ` One Time Password to complete your first time login for ${agency?.agencyName} is ${otp}. Al-Saboor Travels never calls to verify OTP. \n *Do not disclose OTP to anyone*.`
    );

    res.json({
      message: "OTP has been resent to your registered WhatsApp number.",
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

exports.revarify = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log("user is as folloe:", user);
    if (!user) return errorResponse(res, "User not found");
    if (user.emailVerified)
      return errorResponse(res, "Email already  verified");
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return errorResponse(res, "Invalid Password");
    const token = generateActivationToken(user._id); // Generate JWT token
    const resetPasswordLink = `${process.env.API_URL}/api/auth/verify/email/${token}`;

    await sendEmail(
      user.email,
      "re-varify You Account",
      reVarifyAccount(`${user.firstName}`, user.role, resetPasswordLink)
    );
    res.json({ message: "Email sent to your email" });
  } catch (error) {
    console.log("error,", error);
    return errorResponse(res, error);
  }
};

exports.logout = async (req, res) => {
  try {
    // Clear the authentication token
    res.setHeader("auth-token", ""); // Clearing the token from headers

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return errorResponse(res, error);
  }
};

exports.register = async (req, res) => {
  try {
    const { error, value } = userResgisterSchemaValidator.validate(req.body);
    if (error) {
      return errorResponse(res, error);
    }
    const { email } = value;

    const emailExist = await User.findOne({ email });
    if (emailExist) return errorResponse(res, "Email Already Exists");

    const salt = await bcrypt.genSalt(10);
    value.password = await bcrypt.hash(value.password, salt);

    const user = new User(value);
    const data = await user.save();

    const token = jwt.sign(
      {
        id: data._id,
      },
      process.env.TOKEN_SECRET,
      { expiresIn: 150 * 60 }
    );

    await emailRegistration(user, token);

    return sendResponse(
      res,
      EResponseCode.SUCCESS,
      "Please check your email for verification.!",
      user
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    // const token = req.header("auth-token");
    const token = req.params.token;
    // const { token } = req.params;
    // console.log("token", token, req.query);
    // let payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url"));

    const user_password = req.body.password;
    if (user_password) {
      if (!isValidPassword(user_password)) {
        return errorResponse(
          res,
          "Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, one number, and one special character.",
          400
        );
      }
    }
    if (!token) {
      return res.json({
        success: false,
        error: "token must be required",
      });
    }
    if (!user_password) {
      return errorResponse(res, "password must be required", 404);
    }
    const verify = await jwt.verify(token, process.env.TOKEN_SECRET);

    if (!verify) {
      return res.json({
        success: "false",
        error: "Token is not valid",
      });
    }

    const userObj = await User.findOne({ _id: verify.id });
    if (!userObj) return errorResponse(res, "User not found!", 404);

    const salt = await bcrypt.genSalt(10);
    userObj.password = await bcrypt.hash(user_password, salt);

    userObj.user_token = "";
    userObj.forgotPasswordAttempts = 0;
    await userObj.save();

    return successResponse(
      res,
      "User password has been reset successfully",
      200
    );
  } catch (err) {
    return errorResponse(res, err);
  }
};

exports.forgotPassword = async (req, res) => {
  const user_email = req.body.email;

  try {
    if (!user_email) {
      return errorResponse(res, "User email must be provided", 404);
    }

    const user = await User.findOne({ email: user_email });
    if (!user) {
      return errorResponse(res, `User with email ${user_email} not found`, 404);
    }

    const currentTime = Date.now();

    // Check if the user is in the cooldown period
    if (
      user.forgotPasswordCooldown &&
      currentTime < user.forgotPasswordCooldown
    ) {
      const timeLeft = Math.ceil(
        (user.forgotPasswordCooldown - currentTime) / 1000
      ); // Time in seconds
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      return errorResponse(
        res,
        `Too many password reset attempts. Please try again in ${minutes} minutes and ${seconds} seconds.`,
        429
      );
    }

    // Reset attempts if the cooldown period has expired
    if (
      user.forgotPasswordCooldown &&
      currentTime >= user.forgotPasswordCooldown
    ) {
      user.forgotPasswordAttempts = 0;
      user.forgotPasswordCooldown = null;
    }

    // Increment the password reset attempts
    user.forgotPasswordAttempts += 1;

    // If attempts reach 3, then start tiemr of 5 min
    if (user.forgotPasswordAttempts === 3) {
      user.forgotPasswordCooldown = currentTime + 5 * 60 * 1000; // 5 minutes
      await user.save();

      // Send warning email
      await sendEmail(
        user.email,
        "Warning: Multiple Password Reset Attempts",
        warningEmail(`${user.firstName}`)
      );

      return errorResponse(
        res,
        "Too many password reset attempts. Please try again in 5 minutes.",
        429
      );
    }

    // Save the updated attempts count
    await user.save();

    // Generate the token
    const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: "1h", // token will expire within 1 hour
    });
    const url = `${process.env.CLIENT_URL}/forget-password/${token}`;

    // Send the reset email
    await sendEmail(
      user.email,
      "Password Reset Request",
      forgetPassword(`${user.firstName}`, url)
    );

    return successResponse(
      res,
      "Password reset instructions have been sent to your email. Please check your inbox and follow the instructions to reset your password.",
      200
    );
  } catch (error) {
    return errorResponse(res, error.message || "An error occurred");
  }
};

// const bcrypt = require("bcryptjs");
// const { isValidPassword } = require("../utils/validation"); // adjust path if needed
// const { errorResponse, successResponse } = require("../utils/responseHandlers"); // adjust path if needed

exports.updateUserPassword = async (req, res) => {
  try {
    const user = req.user;
    const { newPassword, otp } = req.body;

    if (!otp) {
      return errorResponse(res, "otp are required", 400);
    }
    if (!newPassword) {
      return errorResponse(res, "New passwords are required", 400);
    }

    if (!isValidPassword(newPassword)) {
      return errorResponse(
        res,
        "Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, one number, and one special character.",
        400
      );
    }
    const findUser = await User.findById(user.id);
    if (!findUser) {
      return errorResponse(res, "User not found", 404);
    }
    if (otp !== findUser.otp.code) {
      return errorResponse(res, "Invalid OTP", 400);
    }
    // Check if old password matches
    // const isMatch = await bcrypt.compare(oldPassword, user.password);
    // if (!isMatch) {
    //   return errorResponse(res, "Old password is incorrect", 401);
    // }

    // Hash and update the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Optionally reset related fields
    user.user_token = "";
    user.forgotPasswordAttempts = 0;
    user.forgotPasswordCooldown = null;
    user.otp.code = null;
    user.otp.expiresAt = null;
    user.otp.count = 0;

    await user.save();

    return successResponse(res, "Password updated successfully", 200);
  } catch (error) {
    return errorResponse(res, error.message || "An error occurred", 500);
  }
};

exports.verify = async (req, res) => {
  try {
    return sendResponse(res, EResponseCode.SUCCESS);
  } catch (error) {
    return errorResponse(res, "Invalid token.", 404);
  }
};

exports.verfiyEmail = async (req, res) => {
  const token = req.header("auth-token");
  try {
    // const token = req.header("auth-token");
    // console.log("token", token);

    //  let payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url"));

    //

    if (!token) {
      return errorResponse(res, "token must be required", 404);
    }

    const verify = await jwt.verify(token, process.env.TOKEN_SECRET);
    console.log("verify", verify);
    if (!verify) {
      return errorResponse(res, "Token is not valid", 404);
    }

    const userObj = await User.findOne({ _id: verify.id });
    console.log("verify", userObj);

    if (!userObj) {
      return errorResponse(res, "User not found!", 404);
    }

    userObj.emailVerified = true;
    await userObj.save();
    return successResponse(
      res,
      "Congratulations! Your email address has been successfully verified."
    );
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.verfiyEmaill = async (req, res) => {
  const token = req.params.token;
  console.log(token);
  try {
    if (!token) {
      return res.json({
        success: false,
        error: "token must be required",
      });
    }

    const verify = await jwt.verify(token, process.env.TOKEN_SECRET);
    console.log("verify", verify);
    if (!verify) {
      return res.json({
        success: "false",
        error: "Token is not valid",
      });
    }

    const userObj = await User.findOne({ _id: verify.id });
    console.log("user", userObj);

    if (!userObj) return res.json({ success: false, error: "User not found!" });

    userObj.emailVerified = true;
    await userObj.save();

    return res.json({
      success: true,
      message:
        "Congratulations! Your email address has been successfully verified.",
    });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const token = req.header("auth-token");
    console.log(token);
    if (!token) {
      return errorResponse(res, "Authentication required", 401);
    }

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    console.log(decoded);
    const user = await User.findById(decoded.id);
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    const newToken = jwt.sign(
      { id: user._id, role: decoded.role },
      process.env.TOKEN_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    req.user = user;
    req.userRole = decoded.role;

    res.json({ success: true, token: newToken });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return errorResponse(res, "Token has expired", 401);
    }
    return errorResponse(res, error);
  }
};
