const Promotion = require("../../lib/schema/promotion.schema"); // Import the Promotion model
const { successResponse } = require("../../lib/utils/success");
const { errorResponse } = require("../../lib/utils/error");
const fs = require("fs");
const path = require("path");
// Create a new promotion
exports.createPromotion = async (req, res) => {
  try {
    const { name } = req.body;
    console.log("image", req.file);
    const findPromotion = await Promotion.findOne({ name: name });
    if (findPromotion) return errorResponse(res, "Name already present", 404);

    const promotion = new Promotion({
      ...req.body,
      image: req.file.path, // Save the file path
    });
    await promotion.save();
    return successResponse(res, "Promotion added Successfully", promotion);
  } catch (error) {
    return errorResponse(res, error);
  }
};

// Get all promotions
exports.getPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find();
    return successResponse(res, "Promotion fetched Successfully", promotions);
  } catch (error) {
    return errorResponse(res, error);
  }
};

// Get promotion by ID
exports.getPromotionById = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) return successResponse(res, "Promotion not found", 404);
    return successResponse(res, "Promotion fetched Successfully", promotion);
  } catch (error) {
    return errorResponse(res, error);
  }
};

// Update promotion by ID
exports.updatePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (promotion.image && req.file?.path) {
      const oldImagePath = path.join(
        __dirname,
        "../../uploads/promotion",
        path.basename(promotion.image)
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
    const promotions = await PromotiPromotionon.findByIdAndUpdate(
      req.params.id,
      { ...req.body, image: req.file?.path || promotion.image }, // Keep the old image if not updated,
      { new: true }
    );
    if (!promotions) return successResponse(res, "Promotion not found", 404);
    return successResponse(res, "Promotion updated Successfully", promotions);
  } catch (error) {
    return errorResponse(res, error);
  }
};

// Delete promotion by ID
exports.deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);
    if (promotion.image && req.file?.path) {
      const oldImagePath = path.join(
        __dirname,
        "../../uploads/promotion",
        path.basename(promotion.image)
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
    if (!promotion) return successResponse(res, "Promotion not found", 404);
    return successResponse(res, "Promotion deleted Successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};
