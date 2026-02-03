const mongoose = require("mongoose");
const { Schema } = mongoose;
const { DB_Tables, PayMethod, Typpe } = require("../../lib/utils/enum");

const customerLedger = new Schema(
  {
    spo: { type: mongoose.Types.ObjectId, ref: DB_Tables.USER },
    bookingId: { type: mongoose.Types.ObjectId, ref: DB_Tables.BOOOKING },
    agencyId: { type: mongoose.Types.ObjectId, ref: DB_Tables.AGENCY },
    amount: { type: String },
    customerName: { type: String },
    ticketNumber: { type: String },
    PNR: { type: String },
    paxtype: { type: String },
    description: { type: String },
    payMode: {
      type: String,
      default: PayMethod.CASH,
      enum: [PayMethod],
    },
    supplierType: { type: String },
    status: { type: String },
    type: {
      type: String,
      default: Typpe.CREDITED,
      enum: [Typpe],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("customerLedger", customerLedger);
