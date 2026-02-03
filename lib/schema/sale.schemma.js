const mongoose = require("mongoose");
const { Schema } = mongoose;
const {
  PayMode,
  DB_Tables,
  SaleStatus,
  sector,
  category,
} = require("../../lib/utils/enum");
const ticketSchema = new Schema(
  {
    invoiceNumber: { type: String, required: true },
    ticketNumber: { type: String, required: true },
    invDate: { type: Date, required: true },
    customer: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: DB_Tables.CUSTOMER,
    },
    payMode: {
      type: String,
      required: true,
      enum: PayMode,
      default: PayMode.CR,
    },
    ccNo: { type: String },
    ourXO: { type: String },
    adjDate: { type: Date },
    printName: { type: String },
    spo: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: DB_Tables.CUSTOMER,
    },
    status: {
      type: String,
      required: true,
      enum: SaleStatus,
      default: SaleStatus.C,
    },
    clientXO: { type: String },
    invNo: { type: String },
    costCenter: { type: String },
    visitType: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: DB_Tables.VISITTYPE,
    },
    shift: { type: String },
    staff: { type: String },
    remarks: { type: String },
    iataNo: { type: String },
    template: { type: String, required: true },
    supplier: { type: String, required: true },
    pax: { type: String, required: true }, // traveller name
    paxType: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: DB_Tables.PAXTYPE,
    },
    ppNo: { type: String },
    ppIssueDate: { type: Date },

    ourOXNo: { type: String },
    ticketNo: { type: String },
    pnr: { type: String },
    autoNo: { type: String },
    doc: { type: String },
    type: { type: String },
    sector: { type: String, required: true, enum: [sector] },
    gds: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: DB_Tables.GDS,
    },
    tourCode: { type: String },
    airline: { type: String },
    sbp: { type: String },
    issueDate: { type: Date },
    category: { type: String, required: true, enum: [category] },
    pnrGroup: { type: String },
    conjunctionTicket: [
      {
        city: { type: String },
        FLNo: { type: String },
        CL: { type: String },
        depDate: { type: String },
        depTime: { type: String },
        arrTime: { type: String },
        fareBasis: { type: String },
      },
    ],
    airlineCityTax: [
      {
        city: { type: String },
        amount: { type: Number },
      },
    ],
    cityTax: [
      {
        airline: { type: String },
        amount: { type: Number },
      },
    ],
    fare: { type: Number },
    rn: { type: Number },
    fields: [
      {
        name: { type: String },
        percentage: { type: Number },
        amount: { type: Number },
      },
    ],
    cancellationCharges: {
      self: { type: Number },
      supplier: { type: Number },
    },
    totals: {
      customerGross: { type: Number },
      customerNet: { type: Number },
      invoiceRecGross: { type: Number },
      invoiceRecNet: { type: Number },
      supplierGross: { type: Number },
      supplierNet: { type: Number },
      invoicePayGross: { type: Number },
      invoicePayNet: { type: Number },
      supplierGrossWithoutWHT: { type: Number },
    },
    conjunctionTicket: {
      ticketNo: { type: String },
      routeDetails: { type: String },
    },
    createdBy: { type: String },
    createdOn: { type: Date },
    modifiedBy: { type: String },
    modifiedOn: { type: Date },
  },
  { timestamps: true }
);

// Pre-save middleware for auto-incrementing invoice number
ticketSchema.pre("save", async function (next) {
  if (!this.invoiceNumber) {
    try {
      // Fetch the latest invoice from the database
      const lastTicket = await mongoose
        .model("Ticket")
        .findOne({})
        .sort({ createdAt: -1 })
        .exec();

      if (lastTicket) {
        const lastInvoice = parseInt(lastTicket.invoiceNumber) || 0;
        this.invoiceNumber = String(lastInvoice + 1).padStart(2, "0");
      } else {
        this.invoiceNumber = "01"; // Start with 01 if no ticket exists
      }
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model("Ticket", ticketSchema);
