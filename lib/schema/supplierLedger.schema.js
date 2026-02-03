const mongoose = require("mongoose");
const { Schema } = mongoose;
const {
  DB_Tables,
  PayMethod,
  voucherType,
  PAYTYPE,
  Typpe,
} = require("../../lib/utils/enum");
const supplierLedger = new Schema(
  {
    spo: { type: mongoose.Types.ObjectId, ref: DB_Tables.USER },
    bookingId: { type: mongoose.Types.ObjectId, ref: DB_Tables.BOOOKING },
    agencyId: { type: mongoose.Types.ObjectId, ref: DB_Tables.AGENCY },
    amount: { type: String },

    customerId: {
      type: mongoose.Types.ObjectId,
      ref: DB_Tables.CUSTOMERLEDGER,
    },
    description: { type: String },
    payMode: {
      type: String,
      default: PayMethod.CASH,
      enum: [PayMethod],
    },
    supplierName: { type: String },
    status: { type: String },
    type: {
      type: String,
      default: Typpe.CREDITED,
      enum: [Typpe],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("supplierLedger", supplierLedger);
