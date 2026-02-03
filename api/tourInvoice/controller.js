const TourInvoice = require("../../lib/schema/tourInvoice.schema");
const Booking = require("../../lib/schema/booking.schema");
const { EPaidStatus } = require("../../lib/utils/enum");
const { successResponse } = require("../../lib/utils/success");
const { errorResponse } = require("../../lib/utils/error");

// Create a new tour invoice
exports.createTourInvoice = async (req, res) => {
  try {
    // Find the last created invoice
    const lastInvoice = await TourInvoice.findOne().sort({ createdAt: -1 });

    let newInvoiceNumber = "INV_01"; // Default if no previous invoice exists

    if (lastInvoice && lastInvoice.invoiceNumber) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber.split("_")[1]); // Extract numeric part
      const nextNumber = (lastNumber + 1).toString().padStart(2, "0"); // Increment and format
      newInvoiceNumber = `INV_${nextNumber}`;
    }

    let newInvoice;

    // Check if tickets exist in the request body
    if (req.body.ticket) {
      // Find bookings with matching ticket numbers
      const matchingBookings = await Booking.find({
        "travelers.ticketNumber": { $in: req.body.ticket.ticketNo },
      });

      if (matchingBookings.length > 0) {
        console.log("Matching ticket number found");

        for (let booking of matchingBookings) {
          let currentPaidAmount = Number(booking.paidAmount); // Ensure numeric values
          let ticketFare = Number(req.body.ticket.fare);
          let finalPrice = Number(booking.finalPrice);

          let updatedPaidAmount = currentPaidAmount + ticketFare;

          // Ensure only full payment is allowed
          if (updatedPaidAmount !== finalPrice) {
            return errorResponse(
              res,
              `Error: You can only make full payments which is ${finalPrice}. Remaining balance: ${
                finalPrice - currentPaidAmount
              }`
            );
          }

          let newPaidStatus = EPaidStatus.PAID; // Mark as fully paid

          // Create invoice (only once)
          if (!newInvoice) {
            newInvoice = new TourInvoice({
              ...req.body,
              invoiceNumber: newInvoiceNumber,
            });
            await newInvoice.save();
          }

          // Update booking with new paidAmount and paidStatus
          await Booking.updateOne(
            { _id: booking._id },
            {
              $set: {
                invoiceNumber: newInvoice._id, // Attach invoice to booking
                paidAmount: updatedPaidAmount,
                paidStatus: newPaidStatus,
              },
            }
          );
        }
      } else {
        // Create invoice even if no matching booking is found
        newInvoice = new TourInvoice({
          ...req.body,
          invoiceNumber: newInvoiceNumber,
        });

        await newInvoice.save();
        console.log("No matching ticket number found");
      }
    }

    return successResponse(
      res,
      "Tour invoice created successfully",
      newInvoice
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};

// Get all tour invoices
exports.getAllTourInvoices = async (req, res) => {
  try {
    const invoices = await TourInvoice.find();
    return successResponse(res, "Tour invoices fetched successfully", invoices);
  } catch (error) {
    return errorResponse(res, error);
  }
};

// Get a single tour invoice by ID
exports.getTourInvoiceById = async (req, res) => {
  try {
    const invoice = await TourInvoice.findById(req.params.id);
    if (!invoice) {
      return errorResponse(res, "Invoice not found", 404);
    }
    return successResponse(res, "Tour invoice fetched successfully", invoice);
  } catch (error) {
    return errorResponse(res, error);
  }
};

// Update a tour invoice
exports.updateTourInvoice = async (req, res) => {
  try {
    const updatedInvoice = await TourInvoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedInvoice) {
      return errorResponse(res, "Invoice not found", 404);
    }
    return successResponse(res, "Invoice updated successfully", updatedInvoice);
  } catch (error) {
    return errorResponse(res, error);
  }
};

// Delete a tour invoice
exports.deleteTourInvoice = async (req, res) => {
  try {
    const deletedInvoice = await TourInvoice.findByIdAndDelete(req.params.id);
    if (!deletedInvoice) {
      return errorResponse(res, "Invoice not found", 404);
    }
    return successResponse(res, "Invoice deleted successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

exports.updateBookingPayment = async (req, res) => {
  try {
    const { bookingId, amountPaid } = req.body;

    // Validate request data
    if (!bookingId || amountPaid === undefined) {
      return errorResponse(res, "Booking ID and amountPaid are required.");
    }

    // Find the booking by ID
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return errorResponse(res, "Booking not found.");
    }

    // Calculate the updated paid amount
    const updatedPaidAmount = (booking.paidAmount || 0) + amountPaid;

    // Determine the new paid status
    let newPaidStatus = EPaidStatus.UNPAID;
    if (updatedPaidAmount >= booking.finalPrice) {
      newPaidStatus = EPaidStatus.PAID; // Fully paid
    } else if (updatedPaidAmount > 0) {
      newPaidStatus = EPaidStatus.PARTIALLY_PAID; // Partial payment
    }

    // Update booking details
    await Booking.updateOne(
      { _id: bookingId },
      {
        $set: {
          paidAmount: updatedPaidAmount,
          paidStatus: newPaidStatus,
        },
      }
    );

    return successResponse(res, "Payment updated successfully", {
      bookingId,
      updatedPaidAmount,
      newPaidStatus,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};
