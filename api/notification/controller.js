const fs = require("fs");
const path = require("path");
const Notification = require("../../lib/schema/notification.schema");
const { successResponse } = require("../../lib/utils/success");
const { errorResponse } = require("../../lib/utils/error");

// Create a new notification
exports.createNotification = async (req, res) => {
  try {
    const { name } = req.body;
    const findNotification = await Notification.findOne({ name });
    if (findNotification) {
      return errorResponse(res, "Notification already exists", 404);
    }
    const newNotification = new Notification({
      ...req.body,
      image: req.file?.path,
    });
    const savedNotification = await newNotification.save();
    return successResponse(
      res,
      "Notification created successfully",
      savedNotification
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};
// Get all notifications
exports.getNotification = async (req, res) => {
  try {
    const notifications = await Notification.find();
    return successResponse(
      res,
      "Notifications fetched successfully",
      notifications
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};
//get notification by id
exports.getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return errorResponse(res, "Notification not found", 404);
    return successResponse(
      res,
      "Notification fetched successfully",
      notification
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};
//delete the nitification
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (notification.image) {
      const oldImagePath = path.join(
        __dirname,
        "../../uploads/notification",
        path.basename(notification.image)
      );
      console.log("Old image path:", oldImagePath);

      // Check if the old image file exists
      fs.access(oldImagePath, fs.constants.F_OK, (err) => {
        if (err) {
          console.error("Old image file does not exist:", oldImagePath);
        } else {
          // If the file exists, delete it
          fs.unlink(oldImagePath, (unlinkErr) => {
            if (unlinkErr) {
              console.error("Error deleting old image:", unlinkErr);
            } else {
              console.log("Old image deleted successfully");
            }
          });
        }
      });
    }
    if (!notification) return errorResponse(res, "Notification not found", 404);
    return successResponse(res, "Notification deleted successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};
//update the nitification
exports.updateNotification = async (req, res) => {
  try {
    // Find the current notification
    const notification = await Notification.findById(req.params.id);
    if (!notification) return errorResponse(res, "Notification not found", 404);

    console.log("Current notification:", notification);

    if (notification.image && req.file?.path) {
      const oldImagePath = path.join(
        __dirname,
        "../../uploads/notification",
        path.basename(notification.image)
      );
      console.log("Old image path:", oldImagePath);

      // Check if the old image file exists
      fs.access(oldImagePath, fs.constants.F_OK, (err) => {
        if (err) {
          console.error("Old image file does not exist:", oldImagePath);
        } else {
          // If the file exists, delete it
          fs.unlink(oldImagePath, (unlinkErr) => {
            if (unlinkErr) {
              console.error("Error deleting old image:", unlinkErr);
            } else {
              console.log("Old image deleted successfully");
            }
          });
        }
      });
    }

    // Update the notification with new data (including the new image if present)
    const updatedNotification = await Notification.findByIdAndUpdate(
      req.params.id,
      { ...req.body, image: req.file?.path || notification.image }, // Keep the old image if not updated
      { new: true }
    );

    return successResponse(
      res,
      "Notification updated successfully",
      updatedNotification
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};
//get lateast notification
exports.getLatestNotification = async (req, res) => {
  try {
    const currentDate = new Date();

    // Find the latest active notification where the endDate is greater than the current date/time
    const latestNotification = await Notification.findOne({
      status: "ACTIVE",
      endDate: { $gte: currentDate }, // Ensure the endDate has not passed
    })
      .sort({ updatedAt: -1 }) // Sort by createdAt in descending order (newest first)
      .exec();
    console.log(latestNotification);
    if (
      latestNotification &&
      latestNotification.endDate &&
      latestNotification.endDate <= currentDate
    ) {
      if (latestNotification.status === UserStatus.ACTIVE) {
        latestNotification.status = UserStatus.INACTIVE;
        await latestNotification.save();
        console.log(
          `Notification ${promotion._id} status updated to INACTIVE due to expired endDate.`
        );
      }
    }

    if (!latestNotification) {
      return errorResponse(res, "No active notifications found", 404);
    }

    return successResponse(
      res,
      "Latest active notification fetched successfully",
      latestNotification
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};
