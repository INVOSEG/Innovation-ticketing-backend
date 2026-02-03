const { required } = require("joi");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const {
  EUserRole,
  UserStatus,
  DB_Tables,
  DeleteStatus,
  DB_Tables,
} = require("../../lib/utils/enum");

const bookingsabreSchema = new Schema(
  {
    type: String,
    api: String,
    id: String,
    createdby: String,
    userId: { type: mongoose.Types.ObjectId, ref: DB_Tables.USER },
    agencyId: { type: mongoose.Types.ObjectId, ref: DB_Tables.USER },
    queuingOfficeId: String,
    orignalPrice: { type: Number, required: false },
    finalPrice: {
      type: Number,
      required: false,
    },
    markupType: {
      type: String,
    },
    markupAmount: {
      type: Number,
    },
    deptTime: { type: String, default: "" },
    pnr: { type: String },
    arrivalTime: { type: String, default: "" },
    isTicketed: { Type: Boolean, default: false },
    mealType: { type: String },
    baggage: { type: String },
    travelers: [
      {
        id: { type: String, default: "" },
        dateOfBirth: { type: Date, default: Date.now },
        gender: { type: String, default: "" },
        name: {
          firstName: { type: String, default: "" },
          lastName: { type: String, default: "" },
        },
        documents: [
          {
            number: { type: String, default: "" },
            issuanceDate: { type: Date, default: Date.now },
            expiryDate: { type: Date, default: Date.now },
            issuanceCountry: { type: String, default: "" },
            issuanceLocation: { type: String, default: "" },
            nationality: { type: String, default: "" },
            birthPlace: { type: String, default: "" },
            documentType: { type: String, default: "" },
            holder: { type: Boolean, default: false },
          },
        ],
        departure: {
          airportCode: { type: String, default: "" },
          terminal: { type: String, default: "" },
          gate: { type: String, default: "" },
          seat: { type: String, default: "" },
        },
        arrrival: {
          airportCode: { type: String, default: "" },
          terminal: { type: String, default: "" },
          gate: { type: String, default: "" },
          seat: { type: String, default: "" },
        },
        contact: {
          purpose: { type: String, default: "" },
          phones: [
            {
              deviceType: { type: String, default: "" },
              countryCallingCode: { type: String, default: "" },
              number: { type: String, default: "" },
            },
          ],
          emailAddress: { type: String, default: "" },
        },
      },
    ],
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const Bookingsabre = mongoose.model("Bookingsabre", bookingsabreSchema);

module.exports = Bookingsabre;
