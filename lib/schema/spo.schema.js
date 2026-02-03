const mongoose = require("mongoose");
const { Schema } = mongoose;

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

const spoSchema = new Schema(
  {
    code: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    airlines: [airlineFormulaSchema],
    hotels: [hotelFormulaSchema],
    transport: [transporterFormulaSchema],
    visa: [visaFormulaSchema],
    general: [generalVendorFormulaSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Spo", spoSchema);
