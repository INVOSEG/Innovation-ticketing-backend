const mongoose = require("mongoose");
const { Schema } = mongoose;
const { DeleteStatus, DB_Tables } = require("../../lib/utils/enum");

const BlogSchema = new Schema(
  {
    title: { type: String, required: true },
    author: { type: String },
    cateogry: { type: String },
    date: { type: Date },
    image: { type: String },
    thumbnail: { type: String },
    createdBy: { type: mongoose.Types.ObjectId, ref: DB_Tables.USER },
    udpatedBy: { type: mongoose.Types.ObjectId, ref: DB_Tables.USER },
    deletedBy: { type: mongoose.Types.ObjectId, ref: DB_Tables.USER },
    isDeleted: {
      type: String,
      default: DeleteStatus.ACTIVE,
      enum: [DeleteStatus],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", BlogSchema);
