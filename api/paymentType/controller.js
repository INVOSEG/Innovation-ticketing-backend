const { successResponse } = require("../../lib/utils/success");
const { errorResponse } = require("../../lib/utils/error");
const PaymentType = require("../../lib/schema/paymenttype.schema");
const {
  createPaymentTypeSchemaValidator,
  UpadatePaymentTypeSchemaValidator,
} = require("../../lib/utils/sanitization");
const { EChatStatus } = require("../../lib/utils/enum");

// create payment type
exports.createPaymentType = async (req, res) => {
  try {
    const { name } = req.body;
    const createdBy = req.user._id;
    const { error, value } = createPaymentTypeSchemaValidator.validate(
      req.body
    );
    if (error) {
      return errorResponse(res, error.details[0].message, 400);
    }
    console.log("createdBy", createdBy, value);
    const findPaymentType = await PaymentType.findOne({ name: value.name });
    if (findPaymentType) {
      return errorResponse(
        res,
        ` Payment type with name:${value.name} already present`,
        409
      );
    }
    const paymentType = new PaymentType({
      name: value.name,
      createdBy: createdBy,
    });
    await paymentType.save();
    return successResponse(
      res,
      "Payment Type created successfully",
      paymentType
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};
// Get all payment types
exports.getAllPaymentTypes = async (req, res) => {
  try {
    const { name, page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10

    // Create a filter object
    const filter = {};
    if (name) {
      filter.name = { $regex: name, $options: "i" }; // Case-insensitive search
    }

    // Convert page and limit to integers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Get the total count of documents matching the filter
    const totalCount = await PaymentType.countDocuments(filter);

    // Get the payment types with pagination
    const paymentTypes = await PaymentType.find(filter)
      .limit(limitNumber)
      .skip((pageNumber - 1) * limitNumber)
      .exec();

    return successResponse(res, "All PaymentTypeFetched", {
      paymentTypes,
      totalCount,
      page: pageNumber,
      totalPages: Math.ceil(totalCount / limitNumber),
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};
// Get all Active payment types
exports.getAllActivePaymentTypes = async (req, res) => {
  try {
    const { name, page = 1, limit = 10 } = req.query; // Default limit and page

    const filter = { status: EChatStatus.ACTIVE };
    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const totalCount = await PaymentType.countDocuments(filter);

    const paymentTypes = await PaymentType.find(filter)
      .limit(limitNumber)
      .skip((pageNumber - 1) * limitNumber)
      .exec();

    return successResponse(res, "All active Paymant type fetched", {
      paymentTypes,
      totalCount,
      page: pageNumber,
      totalPages: Math.ceil(totalCount / limitNumber),
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

// Get payment type by ID
exports.getPaymentTypeById = async (req, res) => {
  try {
    const paymentType = await PaymentType.findById(req.params.id);
    if (!paymentType) {
      return errorResponse(res, "Payment Type not found", 404);
    }
    return successResponse(res, paymentType, 200);
  } catch (error) {
    return errorResponse(res, error);
  }
};

// Get payment type by creTED BY
exports.getPaymentTypeCreatedBy = async (req, res) => {
  try {
    const createdBy = req.user._id;

    const paymentType = await PaymentType.find({ createdBy: createdBy });
    if (!paymentType) {
      return errorResponse(res, "Payment Type not found", 404);
    }
    return successResponse(res, paymentType, 200);
  } catch (error) {
    return errorResponse(res, error);
  }
};
// Update payment type
exports.updatePaymentType = async (req, res) => {
  try {
    const updatedBy = req.user.id;

    const { error, value } = UpadatePaymentTypeSchemaValidator.validate(
      req.body
    );

    if (error) {
      return errorResponse(res, error.details[0].message, 400);
    }

    const paymentType = await PaymentType.findById(req.params.id);
    if (!paymentType) {
      return errorResponse(res, "Payment Type not found", 404);
    }

    if (value.name) {
      const findPaymentType = await PaymentType.findOne({ name: value.name });
      if (findPaymentType && findPaymentType._id.toString() !== req.params.id) {
        return errorResponse(
          res,
          ` Payment type with name:${value.name} already present`,
          409
        );
      }
      paymentType.name = value.name;
    }

    if (value.status) {
      paymentType.status = value.status;
    }

    paymentType.updatedBy = updatedBy;

    await paymentType.save();

    return successResponse(
      res,
      "Payment Type updated successfully",
      paymentType
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};
// Delete payment type
exports.deletePaymentType = async (req, res) => {
  try {
    const paymentType = await PaymentType.findById(req.params.id);
    if (!paymentType) {
      return errorResponse(res, "Payment Type not found", 404);
    }

    await paymentType.deleteOne();
    return successResponse(res, "Payment Type deleted successfully", 200);
  } catch (error) {
    return errorResponse(res, error);
  }
};
