const { successResponse } = require("../../lib/utils/success");
const { errorResponse } = require("../../lib/utils/error");
const Payment = require("../../lib/schema/payment.schema");
const User = require("../../lib/schema/users.schema");
const {
  createPaymentTypeSchemaValidator,
  paymentValidator,
} = require("../../lib/utils/sanitization");
const { EChatStatus } = require("../../lib/utils/enum");

// create payment type
exports.createPayment = async (req, res) => {
  try {
    const { error, value } = paymentValidator.validate(req.body);
    if (error) {
      return errorResponse(res, error, 400);
    }
    const findPayment = await Payment.findOne({ title: value.title });
    if (findPayment) {
      return errorResponse(
        res,
        ` Payment with title:${value.title} already present`,
        409
      );
    }
    if (req.files && req.files.length > 0) {
      value.images = req.files.map((file) => file.path);
    }
    value.createdBy = req.user._id;
    console.log("Asdf", value.createdBy);
    const findAssignedTo = await User.findById(value.assignedTo);
    if (!findAssignedTo) {
      return errorResponse(res, "assigned To User not found", 404);
    }
    const findpaidBy = await User.findById(value.paidBy);
    if (!findpaidBy) {
      return errorResponse(res, " paid By User not found", 404);
    }
    const payment = new Payment(value);
    await payment.save();
    return successResponse(res, "Payment created successfully", payment);
  } catch (error) {
    return errorResponse(res, error);
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const { error, value } = paymentValidator.validate(req.body);
    if (error) {
      return errorResponse(res, error, 400);
    }

    const paymentId = req.params.id;
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return errorResponse(res, "Payment not found", 404);
    }

    if (req.files && req.files.length > 0) {
      value.images = req.files.map((file) => file.path);
    }

    // Check assignedTo and paidBy
    if (value.assignedTo) {
      const findAssignedTo = await User.findById(value.assignedTo);
      if (!findAssignedTo) {
        return errorResponse(res, "Assigned To User not found", 404);
      }
    }

    if (value.paidBy) {
      const findPaidBy = await User.findById(value.paidBy);
      if (!findPaidBy) {
        return errorResponse(res, "Paid By User not found", 404);
      }
    }

    await Payment.findByIdAndUpdate(paymentId, value, { new: true });
    return successResponse(res, "Payment updated successfully", value);
  } catch (error) {
    return errorResponse(res, error);
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return errorResponse(res, "Payment not found", 404);
    }

    await Payment.findByIdAndDelete(paymentId);
    return successResponse(res, "Payment deleted successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const {
      status,
      title,
      assignedTo,
      paidBy,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (title) filter.title = title;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (paidBy) filter.paidBy = paidBy;
    console.log(filter);

    const payments = await Payment.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .populate("assignedTo", "firstName lastname email")
      .populate("paidBy", "firstName lastname email")
      .populate("createdBy", "firstName lastname email");

    const total = await Payment.countDocuments(filter);

    return successResponse(res, "Payments retrieved successfully", {
      payments,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const payment = await Payment.findById(paymentId)
      .populate("assignedTo", "firstName lastname email")
      .populate("paidBy", "firstName lastname email")
      .populate("createdBy", "firstName lastname email");

    if (!payment) {
      return errorResponse(res, "Payment not found", 404);
    }

    return successResponse(res, "Payment retrieved successfully", payment);
  } catch (error) {
    return errorResponse(res, error);
  }
};
