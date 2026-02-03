const mongoose = require("mongoose");
const { Schema } = mongoose;
const { DeleteStatus, DB_Tables } = require("../utils/enum");

const customerType = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("customerType", customerType);
