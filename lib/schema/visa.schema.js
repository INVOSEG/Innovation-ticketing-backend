const mongoose = require("mongoose");
const { Schema } = mongoose;
const { EVisaStatus } = require("../utils/enum");

const visaSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    cnicNumber: { type: String, required: false },
    cnicExpiry: { type: String, required: true },
    passportNumber: { type: String, required: true },
    passportExpiry: { type: String, required: true },
    passportPicture: { type: String, required: true },
    residentCountry: { type: String, required: true },
    cnicPicture: { type: String, required: false },
    visaCountry: { type: String, required: true },
    visaNumber: { type: String, required: false },
    visaExpiry: { type: String, required: false },
    status: {
      type: String,
      enum: EVisaStatus,
      default: EVisaStatus.PENDING,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Visa", visaSchema);
