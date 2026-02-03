const mongoose = require("mongoose");
const { Schema } = mongoose;
const { required, boolean } = require("joi");
const {
  EUserRole,
  UserStatus,
  DeleteStatus,
  DB_Tables,
} = require("../../lib/utils/enum");

const permissionSchema = Schema({
  userId: { type: String, required: true },
  agencyCreate: { type: Boolean, required: true, default: false },
  agencyDelete: { type: Boolean, required: true, default: false },
  agencyUpdate: { type: Boolean, required: true, default: false },
  agencyGet: { type: Boolean, required: true, default: false },
  bookingCreate: { type: Boolean, required: true, default: false },
  bookingDelete: { type: Boolean, required: true, default: false },
  bookingUpdate: { type: Boolean, required: true, default: false },
  bookingGet: { type: Boolean, required: true, default: false },
  roleCreate: { type: Boolean, required: true, default: false },
  roleDelete: { type: Boolean, required: true, default: false },
  roleUpdate: { type: Boolean, required: true, default: false },
  roleGet: { type: Boolean, required: true, default: false },
  usersCreate: { type: Boolean, required: true, default: false },
  usersDelete: { type: Boolean, required: true, default: false },
  usersUpdate: { type: Boolean, required: true, default: false },
  usersGet: { type: Boolean, required: true, default: false },
  status: { type: String, default: UserStatus.ACTIVE, enum: [UserStatus] },
});

module.exports = mongoose.model("permission", permissionSchema);
