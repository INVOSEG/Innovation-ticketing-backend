const mongoose = require("mongoose");
const { Schema } = mongoose;

const supplierSchema = new Schema(
  {
    code: { type: String, required: true },
    title: { type: String, required: true },
    shortName: { type: String },
    details: { type: String },
    address1: { type: String, required: false },
    address2: { type: String, required: false },
    state: { type: String, required: false },
    zip: { type: String, required: false },
    country: { type: String, required: false },
    city: { type: String, required: false },
    phone1: { type: String, required: false },
    phone2: { type: String, required: false },
    fax: { type: String, required: false },
    NTNNumber: { type: String, required: false },

    contact: [
      {
        name: { type: String },
        designation: { type: String },
        phone: { type: String },
      },
    ],
    GLAccount: { type: String, required: false },
    creditLimit: { type: String, required: false },
    createAutoLedgerAccount: { type: Boolean, required: false, default: false },
    visibleToAllBranches: { type: Boolean, required: false, default: false },
    addAllVendors: { type: Boolean, required: false, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("supplierSchema", supplierSchema);
