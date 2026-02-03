const mongoose = require("mongoose");
const { Schema } = mongoose;

const paxType = new Schema(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("paxType", paxType);
