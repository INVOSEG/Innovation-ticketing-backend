const mongoose = require("mongoose");
const {
  EUserRole,
  UserStatus,
  DeleteStatus,
  DB_Tables,
  Typpe,
} = require("../../lib/utils/enum");
const transactionSchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: DB_Tables.USER,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: [Typpe],
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
