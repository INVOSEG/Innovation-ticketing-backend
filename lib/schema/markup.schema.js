const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { UserStatus, EMarkupType } = require("../../lib/utils/enum");
const flightSchema = new Schema({
  api: { type: String, required: false },
  applyTo: { type: String, required: false },
  markupType: {
    type: String,
    default: EMarkupType.whole,
    enum: [EMarkupType],
  },
  markupValue: {
    type: String,
    required: false,
  },
  startDate: { type: Date }, // Ensure this is a Date type
  endDate: { type: Date },
  airlines: { type: String, required: true },
  airlineName: { type: String, required: true },
  status: { type: String, default: UserStatus.INACTIVE, enum: [UserStatus] },
});

module.exports = mongoose.model("Markup", flightSchema);
