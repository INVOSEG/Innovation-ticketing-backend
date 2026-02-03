const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { EChatStatus } = require("../../lib/utils/enum");
const PaymentTypeSchema = new Schema(
  {
    name: String,
    createdBy: String,
    updatedBy: String,
    status: {
      type: String,
      default: EChatStatus.INACTIVE,
      enum: [EChatStatus],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentType", PaymentTypeSchema);
