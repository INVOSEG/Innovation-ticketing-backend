const jwt = require("jsonwebtoken");
const { successResponse } = require("../utils/success");
const { errorResponse } = require("../utils/error");
exports.isValidPassword = (password) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};
exports.generateActivationToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.TOKEN_SECRET, {
    expiresIn: "1h", // Token expires in 1 hour
  });
};

exports.updateMarkupStatus = async (activeMarkups, currentDateTime) => {
  const currentDate = currentDateTime.toISOString().split("T")[0];
  const timeValue = currentDateTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  for (const markup of activeMarkups) {
    const markupEndDate = new Date(markup.endDate);
    const markupDate = markupEndDate.toISOString().split("T")[0];
    const markupTime = markupEndDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    // Check if the markup's end date is today
    if (markupDate === currentDate) {
      console.log("Today's date", markupTime, timeValue);
      // If today's date but time has passed
      if (markupTime < timeValue) {
        console.log("Today's date but time has passed, updating to INACTIVE");
        markup.status = "INACTIVE";
        await markup.save();
      }
    }
    // Check if the markup's end date has passed
    else if (markupEndDate < currentDateTime) {
      console.log("Date has passed, updating to INACTIVE");
      markup.status = "INACTIVE";
      await markup.save();
    }
  }
};
exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};
// OTP Validation and Attempt Handling
exports.handleOtpAttempts = async (user, otp) => {
  try {
    // Check if user has exceeded OTP attempt limit and cooldown period
    if (
      user.otpAttempts.count >= 3 &&
      user.otpAttempts.availableAt > new Date()
    ) {
      const remainingTime = user.otpAttempts.availableAt - new Date();

      const remainingHours = Math.floor(remainingTime / (1000 * 60 * 60));
      const remainingMinutes = Math.floor(
        (remainingTime % (1000 * 60 * 60)) / (1000 * 60)
      );
      const remainingSeconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

      return {
        success: false,
        message: `Too many invalid attempts. Please try again in ${remainingHours} hour ${remainingMinutes} minutes and ${remainingSeconds} seconds.`,
        status: 403,
      };
    }

    // Check if OTP is valid
    if (!user.otp || user.otp.code !== otp || user.otp.expiresAt < new Date()) {
      user.otpAttempts.count += 1;

      // If the 3rd failed attempt, set availableAt to 5 minutes from now
      if (user.otpAttempts.count >= 3) {
        user.otpAttempts.availableAt = new Date(Date.now() + 5 * 60 * 1000);
      }

      await user.save();
      return {
        success: false,
        message: "Invalid or expired OTP",
        status: 400,
      };
    }

    // OTP is valid, reset OTP and attempts
    user.otp.code = null;
    user.otp.expiresAt = null;
    user.otp.count = 0;
    user.otpAttempts.count = 0;
    user.otpAttempts.availableAt = null;
    await user.save();

    return { success: true };
  } catch (error) {
    throw error;
  }
};
