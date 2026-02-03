const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { UserStatus, EMarkupType } = require("../utils/enum");
const PromotionSchema = new Schema(
  {
    name: { type: String, required: true },
    api: { type: String, required: true },
    amount: {
      type: String,
    },
    startDate: { type: Date },
    endDate: { type: Date },
    airlines: { type: [String], required: true },
    image: { type: String, required: true },
    status: { type: String, default: UserStatus.ACTIVE, enum: [UserStatus] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Promotion", PromotionSchema);
