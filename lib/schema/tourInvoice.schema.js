const mongoose = require("mongoose");
const { Schema } = mongoose;

const tourInvoice = new Schema(
  {
    invoiceNumber: { type: String },
    generalInformation: {},
    ticket: {},
    hotel: {},
    transport: {},
    visa: {},
    otherServices: {},
    invoiceSummery: {},
  },
  { timestamps: true }
);

module.exports = mongoose.model("tourInvoice", tourInvoice);
