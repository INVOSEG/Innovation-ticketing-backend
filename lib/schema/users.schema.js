const mongoose = require("mongoose");
const { Schema } = mongoose;
const {
  EUserRole,
  UserStatus,
  DeleteStatus,
  DB_Tables,
} = require("../../lib/utils/enum");
const MultiCitySearchSchema = new Schema({
  legs: [
    {
      source: { type: String, required: false },
      destination: { type: String, required: false },
      date: { type: Date, required: false },
      returnDate: { type: Date, required: false },
    },
  ],
  tripType: String,
  adult: Number,
  child: Number,
  infant: Number,
});
function getMidnightDate() {
  const now = new Date();
  return new Date(now.setHours(0, 0, 0, 0));
}
const UserSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    otp: {
      code: String,
      expiresAt: Date,
      count: { type: Number, default: 0 },
      availableAt: { type: Date, default: () => getMidnightDate() },
    },
    agentCode: { type: String },

    otpAttempts: {
      count: { type: Number, default: 0 },
      availableAt: { type: Date },
    },
    password: {
      type: String,
      required: function () {
        return !(this.isGoogleAuth || this.isFacebookAuth || this.isGitHubAuth);
      },
    },
    forgotPasswordAttempts: { type: Number, default: 0 },
    forgotPasswordCooldown: { type: Date, default: null },
    isGoogleAuth: { type: Boolean, default: false },
    phone: { type: String },
    status: { type: String, default: UserStatus.ACTIVE, enum: [UserStatus] },
    role: { type: String, required: true, enum: [EUserRole] },
    CNIC: { type: String },
    allocatedBalance: { type: String, default: 0 },
    allocatedBalanceTime: { type: Date },
    emailVerified: { type: Boolean, default: true },
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },
    bio: { type: String },
    profileImg: { type: String },
    thumbnail: { type: String },
    lastLogin: { type: Date },
    socialLinks: [
      {
        platform: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    agencyId: { type: mongoose.Types.ObjectId, ref: DB_Tables.AGENCY },
    createdBy: { type: mongoose.Types.ObjectId, ref: DB_Tables.USER },
    updatedBy: { type: mongoose.Types.ObjectId, ref: DB_Tables.USER },
    deletedBy: { type: mongoose.Types.ObjectId, ref: DB_Tables.USER },
    isDeleted: {
      type: String,
      default: DeleteStatus.ACTIVE,
      enum: [DeleteStatus],
    },

    creditInformation: {
      creditCardNumber: { type: String },
      expirationDate: { type: Date },
      cvv: { type: String },
    },
    balance: { type: Number, default: 0 },
    spoId: { type: String, required: false },
    recentSearches: { type: [MultiCitySearchSchema], default: [] },
    assignedSPO: { type: mongoose.Types.ObjectId, ref: DB_Tables.USER },
    agencyName: { type: String }, // For staff/agent specific agency name
    officeAddress: { type: String }, // For staff/agent specific office address
    consultant: { type: String }, // For staff/agent specific consultant
    city: { type: String }, // For staff/agent specific city
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", UserSchema);
