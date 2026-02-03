const VisitType = require("../../lib/schema/VisitType.schema");
const { successResponse } = require("../../lib/utils/success");
const { errorResponse } = require("../../lib/utils/error");

// Create VisitType
exports.createVisitType = async (req, res) => {
  try {
    const {
      code,
      title,
      description,
      refundInvoicePrefix,
      saleInvoicePrefix,
      blockVisitType,
    } = req.body;
    const existingVisitType = await VisitType.findOne({
      $or: [{ code }, { title }],
    });
    if (existingVisitType) {
      if (existingVisitType.code === code) {
        return errorResponse(res, "Code already exists.", 400);
      } else if (existingVisitType.title === title) {
        return errorResponse(res, "Title already exists.", 400);
      }
    }
    const visitType = new VisitType({
      code,
      title,
      description,
      refundInvoicePrefix,
      saleInvoicePrefix,
      blockVisitType,
    });
    await visitType.save();
    return successResponse(res, "VisitType created successfully.", visitType);
  } catch (error) {
    return errorResponse(res, error);
  }
};

// Get All VisitTypes
exports.getAllVisitTypes = async (req, res) => {
  try {
    const visitTypes = await VisitType.find();
    return successResponse(res, "VisitTypes fetched successfully.", visitTypes);
  } catch (error) {
    return errorResponse(res, error);
  }
};

// Get VisitType by ID
exports.getVisitTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const visitType = await VisitType.findById(id);
    if (!visitType) {
      return errorResponse(res, "VisitType not found.", 404);
    }
    return successResponse(res, "VisitType fetched successfully.", visitType);
  } catch (error) {
    return errorResponse(res, error);
  }
};

// Update VisitType
exports.updateVisitType = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      title,
      description,
      refundInvoicePrefix,
      saleInvoicePrefix,
      blockVisitType,
    } = req.body;
    const existingVisitType = await VisitType.findOne({
      $or: [{ code }, { title }],
      _id: { $ne: id },
    });
    if (existingVisitType) {
      if (existingVisitType.code === code) {
        return errorResponse(res, "Code already exists.", 400);
      } else if (existingVisitType.title === title) {
        return errorResponse(res, "Title already exists.", 400);
      }
    }
    const visitType = await VisitType.findByIdAndUpdate(
      id,
      {
        code,
        title,
        description,
        refundInvoicePrefix,
        saleInvoicePrefix,
        blockVisitType,
      },
      { new: true }
    );
    if (!visitType) {
      return errorResponse(res, "VisitType not found.", 404);
    }
    return successResponse(res, "VisitType updated successfully.", visitType);
  } catch (error) {
    return errorResponse(res, error);
  }
};

// Delete VisitType
exports.deleteVisitType = async (req, res) => {
  try {
    const { id } = req.params;
    const visitType = await VisitType.findByIdAndDelete(id);
    if (!visitType) {
      return errorResponse(res, "VisitType not found.", 404);
    }
    return successResponse(res, "VisitType deleted successfully.", visitType);
  } catch (error) {
    return errorResponse(res, error);
  }
};
