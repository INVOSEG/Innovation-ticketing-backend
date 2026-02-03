const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { EPaymentTypeStatus } = require("../../lib/utils/enum");

const paymentSchema = new Schema(
  {
    amount: Number,
    title: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentType",
    },

    images: {
      type: [String],
    },
    description: { type: String, required: true },
    paymentDate: { type: Date, required: true },
    deadLine: { type: Date, required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },

    status: {
      type: String,
      default: EPaymentTypeStatus.pending,
      enum: [EPaymentTypeStatus],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
