const mongoose = require("mongoose");
const { Schema } = mongoose;
const { required } = require("joi");
const {
  EUserRole,
  UserStatus,
  DeleteStatus,
  DB_Tables,
} = require("../../lib/utils/enum");

const StaffSchema = new Schema({
  firstName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  agencyId: { type: String, required: true },
  status: { type: String, default: UserStatus.INACTIVE, enum: [UserStatus] },

  role: { type: mongoose.Types.ObjectId, ref: "Role", required: false },
});

module.exports = mongoose.model("Staff", StaffSchema);
