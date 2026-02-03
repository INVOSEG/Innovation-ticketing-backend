const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const {
  EUserRole,
  UserStatus,
  DeleteStatus,
  DB_Tables,
} = require("../../lib/utils/enum");

const RoleSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    createdBy: { type: mongoose.Types.ObjectId, ref: DB_Tables.USER },
    status: { type: String, default: UserStatus.INACTIVE, enum: [UserStatus] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Role", RoleSchema);
