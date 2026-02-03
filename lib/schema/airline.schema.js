const mongoose = require("mongoose");
const { Schema } = mongoose;
const { DeleteStatus, DB_Tables } = require("../utils/enum");

const customerType = new Schema(
  {
    code: { type: String, required: true },
    title: { type: String, required: true },
    shortName: { type: String },
    details: { type: String },
    digitCode: { type: String, required: true },
    characterCode: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("customerType", customerType);
