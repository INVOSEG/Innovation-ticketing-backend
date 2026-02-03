const PaxType = require("../../lib/schema/paxType.schema");
const { successResponse } = require("../../lib/utils/success");
const { errorResponse } = require("../../lib/utils/error");

exports.createPaxType = async (req, res) => {
  try {
    const { title, description } = req.body;
    const newPaxType = new PaxType({ title, description });
    await newPaxType.save();
    return successResponse(res, "PaxType created successfully", newPaxType);
  } catch (error) {
    // Check if the error is due to duplicate title
    if (error.code === 11000) {
      return errorResponse(res, "Title must be unique", 400);
    }
    return errorResponse(res, error.message);
  }
};

exports.getAllPaxTypes = async (req, res) => {
  try {
    const paxTypesList = await PaxType.find();
    return successResponse(
      res,
      "PaxType list fetched successfully",
      paxTypesList
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

exports.getPaxTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const paxType = await PaxType.findById(id);
    if (!paxType) return errorResponse(res, "PaxType not found", 404);
    return successResponse(res, "PaxType fetched successfully", paxType);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

exports.updatePaxType = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const updatedPaxType = await PaxType.findByIdAndUpdate(
      id,
      { title, description },
      { new: true }
    );
    if (!updatedPaxType) return errorResponse(res, "PaxType not found", 404);
    return successResponse(res, "PaxType updated successfully", updatedPaxType);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

exports.deletePaxType = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPaxType = await PaxType.findByIdAndDelete(id);
    if (!deletedPaxType) return errorResponse(res, "PaxType not found", 404);
    return successResponse(res, "PaxType deleted successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};
