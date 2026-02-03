const mongoose = require("mongoose");
const { Schema } = mongoose;
const { required, boolean } = require("joi");
const {
  EUserRole,
  UserStatus,
  DeleteStatus,
  DB_Tables,
} = require("../../lib/utils/enum");

const ticketPermissionSchema = Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: DB_Tables.USER },
    createBooking: { type: Boolean, required: true, default: false },
    Issueticket: { type: Boolean, required: true, default: false },
    voidTicket: { type: Boolean, required: true, default: false },
    updateTicket: { type: Boolean, required: true, default: false },
    searchBooking: { type: Boolean, required: true, default: false },
    status: { type: String, default: UserStatus.ACTIVE, enum: [UserStatus] },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

module.exports = mongoose.model(
  "ticketPermissionSchema",
  ticketPermissionSchema
);
