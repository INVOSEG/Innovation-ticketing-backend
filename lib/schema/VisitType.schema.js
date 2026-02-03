const mongoose = require("mongoose");
const { Schema } = mongoose;

const visitType = new Schema(
  {
    code: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    refundInvoicePrefix: { type: String },
    saleInvoicePrefix: { type: String },
    blockVisitType: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("visitType", visitType);
