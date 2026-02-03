const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { UserStatus } = require("../utils/enum");
const notificationSchema = new Schema(
  {
    name: { type: String, required: true },
    description: {
      type: String,
    },
    startDate: { type: Date },
    endDate: { type: Date },
    image: { type: String, required: true },
    status: { type: String, default: UserStatus.ACTIVE, enum: [UserStatus] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("notification", notificationSchema);
