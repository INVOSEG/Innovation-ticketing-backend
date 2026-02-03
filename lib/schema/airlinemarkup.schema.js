const mongoose = require("mongoose");
const { Schema } = mongoose;
const { DB_Tables } = require("../../lib/utils/enum");
const AirlineMarkupSchema = new Schema(
  {
    type: { type: mongoose.Types.ObjectId, ref: DB_Tables.TYPES },
    markup: { type: String, required: true },
    airline: { type: [String], required: true },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

module.exports = mongoose.model("AirlineMarkup", AirlineMarkupSchema);
