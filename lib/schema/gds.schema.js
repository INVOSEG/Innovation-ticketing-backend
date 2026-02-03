const mongoose = require("mongoose");
const { Schema } = mongoose;

const GDSSchema = new Schema(
  {
    code: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GDSSchema", GDSSchema);
