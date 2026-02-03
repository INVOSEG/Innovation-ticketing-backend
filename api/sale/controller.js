const Ticket = require("../../lib/schema/sale.schemma");
const Agency = require("../../lib/schema/agency.schema");
const { successResponse } = require("../../lib/utils/success");
const { errorResponse } = require("../../lib/utils/error");
const { DB_Tables } = require("../../lib/utils/enum");
const mongoose = require("mongoose");

const checkReferenceExistence = async (refId, table) => {
  try {
    console.log("cust", refId, table);

    const refDoc = await mongoose.model(table).findById(refId);
    console.log("refDoc", refDoc);

    // if (!refDoc) throw new Error(`${table} not found`);
    return refDoc;
  } catch (error) {
    throw new Error(`Error while checking reference: ${error.message}`);
  }
};

exports.createTicket = async (req, res) => {
  try {
    const ticketData = req.body;
    const agencyId = req.user.agencyId;

    // Check existence of referencedcheckReferenceExistence documents
    const cust = await checkReferenceExistence(
      ticketData.customer,
      DB_Tables.CUSTOMER
    );
    console.log("cust", cust);
    await checkReferenceExistence(ticketData.customer, DB_Tables.CUSTOMER);
    await checkReferenceExistence(ticketData.spo, DB_Tables.CUSTOMER);
    await checkReferenceExistence(ticketData.visitType, DB_Tables.VISITTYPE);
    await checkReferenceExistence(ticketData.paxType, DB_Tables.PAXTYPE);
    await checkReferenceExistence(ticketData.gds, DB_Tables.GDS);

    const newTicket = new Ticket(ticketData);
    await newTicket.save();
    return successResponse(res, "Ticket created successfully", newTicket);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

exports.getAllTickets = async (req, res) => {
  try {
    const ticketsList = await Ticket.find()
      .populate("customer")
      .populate("spo")
      .populate("visitType")
      .populate("paxType")
      .populate("gds");

    return successResponse(res, "Tickets fetched successfully", ticketsList);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findById(id)
      .populate("customer")
      .populate("spo")
      .populate("visitType")
      .populate("paxType")
      .populate("gds");

    if (!ticket) return errorResponse(res, "Ticket not found", 404);
    return successResponse(res, "Ticket fetched successfully", ticket);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

exports.updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticketData = req.body;

    // Check existence of referenced documents
    if (ticketData.customer)
      await checkReferenceExistence(ticketData.customer, DB_Tables.CUSTOMER);
    if (ticketData.spo)
      await checkReferenceExistence(ticketData.spo, DB_Tables.CUSTOMER);
    if (ticketData.visitType)
      await checkReferenceExistence(ticketData.visitType, DB_Tables.VISITTYPE);
    if (ticketData.paxType)
      await checkReferenceExistence(ticketData.paxType, DB_Tables.PAXTYPE);
    if (ticketData.gds)
      await checkReferenceExistence(ticketData.gds, DB_Tables.GDSSchema);

    const updatedTicket = await Ticket.findByIdAndUpdate(id, ticketData, {
      new: true,
    });

    if (!updatedTicket) return errorResponse(res, "Ticket not found", 404);
    return successResponse(res, "Ticket updated successfully", updatedTicket);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTicket = await Ticket.findByIdAndDelete(id);

    if (!deletedTicket) return errorResponse(res, "Ticket not found", 404);
    return successResponse(res, "Ticket deleted successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

exports.getInvoiceNumber = async (req, res) => {
  try {
    // Fetch the latest ticket
    const latestTicket = await Ticket.findOne({})
      .sort({ createdAt: -1 })
      .exec();

    if (latestTicket) {
      const latestInvoice = latestTicket.invoiceNumber;
      const nextInvoice = String(parseInt(latestInvoice) + 1).padStart(2, "0");

      return successResponse(res, "Invoice numbers retrieved successfully", {
        latestInvoice,
        nextInvoice,
      });
    } else {
      // If no tickets exist, start with "01"
      return successResponse(res, "Invoice numbers retrieved successfully", {
        latestInvoice: null,
        nextInvoice: "01",
      });
    }
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while fetching the invoice numbers.",
      500
    );
  }
};
