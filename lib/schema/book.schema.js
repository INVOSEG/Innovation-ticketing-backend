const mongoose = require("mongoose");
const { Schema } = mongoose;
const {
  DB_Tables,
  PayMethod,
  voucherType,
  PAYTYPE,
} = require("../../lib/utils/enum");
const book = new Schema(
  {
    date: { type: String, required: true },
    voucherType: {
      type: String,
      default: voucherType.JOURNALVOUCHER,
      enum: [voucherType],
    },
    type: {
      type: String,
      default: PAYTYPE.CHARGED,
      enum: [PAYTYPE],
    },
    voucherNumber: { type: String, required: false },
    description: { type: String },
    payMode: {
      type: String,
      default: PayMethod.CASH,
      enum: [PayMethod],
    },
    chequeNo: { type: String },
    reference: { type: String, required: false },
    agencyId: { type: mongoose.Types.ObjectId, ref: DB_Tables.AGENCY },
    userId: { type: mongoose.Types.ObjectId, ref: DB_Tables.USER },
    debit: { type: String, required: false },
    credit: { type: String, required: false },
    images: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("book", book);
