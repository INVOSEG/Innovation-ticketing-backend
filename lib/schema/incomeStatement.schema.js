const mongoose = require("mongoose");
const { Schema } = mongoose;
const {
  DB_Tables,
  PayMethod,
  voucherType,
  PAYTYPE,
} = require("../../lib/utils/enum");

const incomeStatement = new Schema(
  {
    spo: { type: mongoose.Types.ObjectId, ref: DB_Tables.USER },
    bookingId: { type: mongoose.Types.ObjectId, ref: DB_Tables.BOOOKING },
    agencyId: { type: mongoose.Types.ObjectId, ref: DB_Tables.AGENCY },
    amount: { type: String },
    description: { type: String },
    supplierLedger: {
      type: mongoose.Types.ObjectId,
      ref: DB_Tables.SUPPLIERLEDGER,
    },
    customerLedger: {
      type: mongoose.Types.ObjectId,
      ref: DB_Tables.CUSTOMERLEDGER,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("incomeStatement", incomeStatement);
