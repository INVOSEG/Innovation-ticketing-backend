const mongoose = require("mongoose");
const { Schema } = mongoose;
const { DB_Tables } = require("../utils/enum");
const formulaSchema = new Schema({
  field: { type: String },
  formula: { type: String },
  value: { type: String },
  debitAmount: { type: String },
  creditAmount: { type: String },
});

const hotelFormulaSchema = new Schema({
  hotel: {
    type: mongoose.Types.ObjectId,
    ref: "Hotel",
  },
  formula: [formulaSchema],
});
const airlineFormulaSchema = new Schema({
  hotel: {
    type: mongoose.Types.ObjectId,
    ref: "airline",
  },
  formula: [formulaSchema],
});
const transporterFormulaSchema = new Schema({
  hotel: {
    type: mongoose.Types.ObjectId,
    ref: "transport",
  },
  formula: [formulaSchema],
});
const visaFormulaSchema = new Schema({
  hotel: {
    type: mongoose.Types.ObjectId,
    ref: "visa",
  },
  formula: [formulaSchema],
});
const generalVendorFormulaSchema = new Schema({
  hotel: {
    type: mongoose.Types.ObjectId,
    ref: "general",
  },
  formula: [formulaSchema],
});
const customer = new Schema(
  {
    code: { type: String, required: true },
    title: { type: String, required: true },
    shortName: { type: String, required: false },
    details: { type: String, required: false },
    address1: { type: String, required: false },
    address2: { type: String, required: false },
    fax: { type: String, required: false },
    state: { type: String, required: false },
    zip: { type: String, required: false },
    country: { type: String, required: false },
    city: { type: String, required: false },
    phone1: { type: String, required: false },
    phone2: { type: String, required: false },
    contact: [
      {
        name: { type: String, required: false },
        designation: { type: String, required: false },
        phone: { type: String, required: false },
      },
    ],
    parentCustomer: {
      type: mongoose.Types.ObjectId,
      required: false,
      ref: DB_Tables.CUSTOMER,
    },
    customerType: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: DB_Tables.CUSTTYPE,
    },
    creditLimit: { type: String, required: false },
    creditTerm: { type: String, required: false },
    NTNNumber: { type: String, required: false },
    saleTaxNumber: { type: String, required: false },
    dateOfCreation: { type: String, required: false },
    dateOfExpiry: { type: String, required: false },
    IATANumber: { type: String, required: false },
    GLAccount: { type: String, required: false },
    createAutoLedgerAccount: { type: String, required: false },
    visibleToAllBranches: { type: String, required: false },
    hideOnInvoice: { type: String, required: false },
    SPO: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: DB_Tables.SPO,
    },
    airlines: [airlineFormulaSchema],
    hotels: [hotelFormulaSchema],
    transport: [transporterFormulaSchema],
    visa: [visaFormulaSchema],
    general: [generalVendorFormulaSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("customer", customer);
