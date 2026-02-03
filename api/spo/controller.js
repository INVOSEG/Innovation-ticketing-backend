const Spo = require("../../lib/schema/spo.schema");
const { successResponse } = require("../../lib/utils/success");
const { errorResponse } = require("../../lib/utils/error");

// Create SPO
exports.createSpo = async (req, res) => {
  try {
    const spo = new Spo(req.body);
    await spo.save();
    return successResponse(res, "SPO created successfully", spo);
  } catch (error) {
    return errorResponse(res, error);
  }
};

// Get All SPOs
exports.getAllSpos = async (req, res) => {
  try {
    const spos = await Spo.find();
    return successResponse(res, "SPOs retrieved successfully", spos);
  } catch (error) {
    return errorResponse(res, error);
  }
};

// Get SPO by ID
exports.getSpoById = async (req, res) => {
  try {
    const spo = await Spo.findById(req.params.id);
    if (!spo) {
      return errorResponse(res, "SPO not found", 404);
    }
    return successResponse(res, "SPO retrieved successfully", spo);
  } catch (error) {
    return errorResponse(res, error);
  }
};

// Update SPO
exports.updateSpo = async (req, res) => {
  try {
    const spo = await Spo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!spo) {
      return errorResponse(res, "SPO not found", 404);
    }
    return successResponse(res, "SPO updated successfully", spo);
  } catch (error) {
    return errorResponse(res, error);
  }
};

// Delete SPO
exports.deleteSpo = async (req, res) => {
  try {
    const spo = await Spo.findByIdAndDelete(req.params.id);
    if (!spo) {
      return errorResponse(res, "SPO not found", 404);
    }
    return successResponse(res, "SPO deleted successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};
