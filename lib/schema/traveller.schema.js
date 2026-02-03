const mongoose = require("mongoose");
const {
  EUserRole,
  UserStatus,
  DeleteStatus,
  DB_Tables,
} = require("../../lib/utils/enum");
const Traveller = new mongoose.Schema({
  code: { type: String, unique: true }, // e.g., NF01
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  cnic: { type: String, required: false },
  title: { type: String, unique: false },
  // headId: { type: mongoose.Types.ObjectId, ref: DB_Tables.TRAVELLER },
  cnicExpiry: { type: String },
  passportNumber: { type: String, required: false },
  passportExpiry: { type: String },
  paxType: { type: String, required: true }, // e.g., Adult, Child, Infant
  dob: { type: String, required: true },
  nationality: { type: String, required: true },
  phoneNumber: { type: String, required: false },
  email: { type: String, required: false },
});

module.exports = mongoose.model("Traveller", Traveller);
