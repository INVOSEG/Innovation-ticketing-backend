const mongoose = require("mongoose");
const { Schema } = mongoose;
const { required } = require("joi");
const {
  EUserRole,
  UserStatus,
  DeleteStatus,
  DB_Tables,
} = require("../../lib/utils/enum");

// Sales Channel and Affiliate Type Options
const SalesChannelOptions = ["Online", "Offline", "Hybrid"];
const AffiliateTypeOptions = ["B2B", "B2C"]; // You can add more types if needed

const AgencySchema = new Schema(
  {
    code: { type: Number, unique: true },
    affiliateName: { type: String, required: true },
    agencyName: { type: String, required: true },
    // agencyPassword: { type: String },//
    personName: { type: String, required: true },
    agencyEmail: { type: String },
    DTN: { type: Number, min: 1000, max: 9999, required: true },
    logo: { type: String, required: true },
    designation: { type: String, required: true },
    type: { type: mongoose.Types.ObjectId, ref: DB_Tables.TYPES },
    cashLimit: { type: Number, default: 0 },
    cashRecived: { type: Number, default: 0, required: true },
    showLabel: { type: Boolean, default: true },
    phoneNumber: { type: String, trim: true, required: true },
    userId: { type: mongoose.Types.ObjectId, ref: DB_Tables.AGENCY },
    filePaths: [String],
    country: { type: String },
    status: { type: String, default: UserStatus.INACTIVE, enum: [UserStatus] },
    city: { type: String },
    availableBalance: { type: String }, // remove
    timeZone: { type: String },
    defaultCurrency: { type: String },
    currency: { type: String },
    CNIC: { type: String },
    addStaff: { type: Number, default: 0, required: true },
    countStaff: { type: Number, default: 0 },
    defaultLanguage: { type: String },
    salesChannel: { type: String, enum: SalesChannelOptions, required: true },
    poBoxNumber: { type: String },
    affiliateType: { type: String, enum: AffiliateTypeOptions, required: true },
    arCode: { type: String },
    groupArCode: { type: String },
    address: { type: String },
    consultant: { type: String },
    cugAffiliate: { type: Boolean, default: false },
    flightMetaSearchAffiliate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Optional: Add indexes for frequently queried fields
AgencySchema.index({ affiliateName: 1 });
AgencySchema.index({ phoneNumber: 1 });
// Pre-update hook to trigger real-time cash limit updates
AgencySchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.cashLimit !== undefined) {
    // Emit real-time cash limit update when it's modified
    io.emit("cashLimitUpdated", {
      message: "Cash limit has been updated in real-time",
      agencyId: this._conditions._id, // Access the agency's ID
      newCashLimit: update.cashLimit,
    });
    console.log(
      "Real-time cash limit updated for agency:",
      this._conditions._id
    );
  }
  next();
});

module.exports = mongoose.model("Agencies", AgencySchema);
