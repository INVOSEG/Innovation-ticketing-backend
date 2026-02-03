const mongoose = require("mongoose");
const { Schema } = mongoose;
const { DeleteStatus, DB_Tables } = require("../../lib/utils/enum");

const BillingInformationSchema = new Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: DB_Tables.USER },
    firstName: { type: String, required: true },
    lastName: { type: String },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    phone: { type: String },
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },
    billingMethod: { type: String },
    billingDetails: { type: String },
    cardNumber: { type: Number },
    expirationDate: { type: Date },
    cvv: { type: Number },
    createdBy: { type: mongoose.Types.ObjectId, ref: DB_Tables.USER },
    udpatedBy: { type: mongoose.Types.ObjectId, ref: DB_Tables.USER },
    deletedBy: { type: mongoose.Types.ObjectId, ref: DB_Tables.USER },
    isDeleted: {
      type: String,
      default: DeleteStatus.ACTIVE,
      enum: [DeleteStatus],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BillingInformation", BillingInformationSchema);
