const mongoose = require("mongoose");
const { Schema } = mongoose;
const {
  DeleteStatus,
  DB_Tables,
  LedgerType,
  PayMethod,
} = require("../utils/enum");

const Ledger = new Schema(
  {
    // invoice: { type: String, required: true },
    credited: { type: Number, default: 0 },
    debited: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    userId: { type: mongoose.Types.ObjectId, ref: DB_Tables.USER },
    agencyId: { type: mongoose.Types.ObjectId, ref: DB_Tables.AGENCY },
    bookingId: { type: String, required: false },
    description: { type: String, default: "N/A" },
    refNo: { type: String, default: "N/A" },
    bankName: { type: String, default: "N/A" },
    remarks: { type: String, default: "N/A" },
    date: { type: Date },
    transactionNo: { type: String, default: "N/A" },
    LedgerType: {
      type: String,

      enum: [LedgerType],
    },
    payMode: {
      type: String,
      default: PayMethod.CASH,
      enum: [PayMethod],
    },
    chequeNo: { type: String, required: false, default: "-" },
    pnr: { type: String, required: false },
    BSP: { type: String, required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ledger", Ledger);
