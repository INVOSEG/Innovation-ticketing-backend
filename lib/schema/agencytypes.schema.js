const mongoose = require("mongoose");
const { Schema } = mongoose;
const { DeleteStatus, DB_Tables } = require("../../lib/utils/enum");

const BlogSchema = new Schema(
  {
    type: { type: String, required: true },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

module.exports = mongoose.model("Type", BlogSchema);
