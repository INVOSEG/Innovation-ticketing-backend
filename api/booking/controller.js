const Booking = require("../../lib/schema/booking.schema");
const User = require("../../lib/schema/users.schema");
const moment = require("moment");
const { EUserRole } = require("../../lib/utils/enum");
const { successResponse } = require("../../lib/utils/success");
const { errorResponse } = require("../../lib/utils/error");
const { create } = require("lodash");
const mongoose = require("mongoose");

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    const savedBooking = await newBooking.save();
    res.status(201).json(savedBooking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    let allBookings;
    const role = req.user.role;
    if (role === EUserRole.SUPERADMIN) {
      console.log("super admin");
      allBookings = await Booking.find().sort({ createdAt: -1 });
    } else if (role === EUserRole.AGENCY) {
      // console.log("agency", req.user.agencyId);

      allBookings = await Booking.find({
        userId: req.user._id,
      })
        .sort({ createdAt: -1 })
        .populate(
          "agencyId",
          "agencyEmail address agencyName logo phoneNumber"
        );
    } else {
      console.log("role");

      allBookings = await Booking.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .populate(
          "agencyId",
          "agencyEmail address agencyName logo phoneNumber"
        );
    }

    if (allBookings.length <= 0) {
      return errorResponse(res, "bookings not found", 404);
    }
    return successResponse(res, "bookings fetched successfully", allBookings);
  } catch (err) {
    console.log(err);
    return errorResponse(res, err);
  }
};

exports.searchBookings = async (req, res) => {
  try {
    const { pnr, passengerName, email, mobile, fromDate, toDate, reference } =
      req.body;

    // Check if any query parameters are provided
    if (
      !pnr &&
      !passengerName &&
      !email &&
      !mobile &&
      !fromDate &&
      !toDate &&
      !reference
    ) {
      return res
        .status(400)
        .json({ message: "At least one query parameter is required" });
    }

    // Define search criteria based on provided parameters
    const searchCriteria = {};
    if (pnr) searchCriteria.id = pnr;
    if (passengerName)
      searchCriteria["contacts.addresseeName.firstName"] = new RegExp(
        passengerName,
        "i"
      );
    if (email)
      searchCriteria["travelers.contact.emailAddress"] = new RegExp(email, "i");
    if (mobile) searchCriteria["contacts.phones.number"] = mobile;
    if (fromDate && toDate) {
      searchCriteria["associatedRecords.creationDate"] = {
        $gte: moment(fromDate).startOf("day").toDate(),
        $lte: moment(toDate).endOf("day").toDate(),
      };
    }
    if (reference) searchCriteria["associatedRecords.reference"] = reference;

    // Query the database with the search criteria
    const bookings = await Booking.find(searchCriteria);

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.calculateSalesAndEarnings = async (req, res) => {
  try {
    // Fetch all bookings from the database
    const allBookings = await Booking.find();

    let totalBookings = allBookings.length;
    let totalSales = 0;

    allBookings.forEach((booking) => {
      booking.flightOffers.forEach((flightOffer) => {
        totalSales += parseFloat(flightOffer.price.grandTotal);
      });
    });

    let totalEarnings = totalSales * 0.1; // 10% earnings

    totalSales = totalSales.toFixed(2);
    totalEarnings = totalEarnings.toFixed(2);

    res.status(200).json({
      totalBookings: totalBookings,
      totalSales: totalSales,
      totalEarnings: totalEarnings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userBookings = await Booking.find({ userId: userId });
    res.status(200).json(userBookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cancel a booking
exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const cancelledBooking = await Booking.findByIdAndDelete(bookingId);
    if (!cancelledBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a booking
exports.updateBooking = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const { status, paymentStatus } = req.body;
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { status, paymentStatus },
      { new: true }
    );
    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json(updatedBooking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all bookings
exports.getByuserId = async (req, res) => {
  try {
    let allBookings;
    const { id } = req.params;
    const role = req.user.role;
    if (role === "agency") {
      allBookings = await Booking.find({
        agencyId: id,
        status: "confirmed",
      });
      allBookings = await Booking.find({
        agencyId: id,
        status: "confirmed",
      })
        .populate({
          path: "userId",
          select: "firstName lastName email role",
          populate: {
            path: "assignedSPO",
            select: "firstName lastName email",
          },
        })
        // .populate("agencyId", "agencyName agencyEmail")
        .sort({
          createdAt: -1,
        });
      // .populate("userId", "firstName lastName email role ");
    }
    if (role === "super_admin") {
      allBookings = await Booking.find({
        status: "confirmed",
      })
        .populate({
          path: "userId",
          select: "firstName lastName email role",
          populate: {
            path: "assignedSPO",
            select: "firstName lastName email", // Adjust fields as needed
          },
        })
        .populate("agencyId", "agencyName agencyEmail")
        .sort({
          createdAt: -1,
        });
    } else {
      allBookings = await Booking.find({
        userId: id,
        status: "confirmed",
      });
      allBookings = await Booking.find({
        agencyId: id,
        status: "confirmed",
      })
        .populate({
          path: "userId",
          select: "firstName lastName email role",
          populate: {
            path: "assignedSPO",
            select: "firstName lastName email", // Adjust fields as needed
          },
        })
        .sort({
          createdAt: -1,
        });
    }
    if (allBookings.length < 0) {
      return errorResponse(res, "bookings not found", 404);
    }
    return successResponse(res, "bookings fetched successfully", allBookings);
  } catch (err) {
    return errorResponse(res, err);
  }
};
exports.getUserBooking = async (req, res) => {
  try {
    let allBookings;
    const { id } = req.params;

    allBookings = await Booking.find({
      userId: id,
      status: "confirmed",
    })
      .populate("userId", "firstName lastName email role ")
      .sort({
        createdAt: -1,
      });

    if (allBookings.length < 0) {
      return errorResponse(res, "bookings not found", 404);
    }
    return successResponse(res, "bookings fetched successfully", allBookings);
  } catch (err) {
    return errorResponse(res, err);
  }
};
exports.getUserBooking = async (req, res) => {
  try {
    let allBookings;
    const { id } = req.params;

    allBookings = await Booking.find({
      userId: id,
      status: "confirmed",
    })
      .populate("userId", "firstName lastName email role ")
      .sort({
        createdAt: -1,
      });

    if (allBookings.length < 0) {
      return errorResponse(res, "bookings not found", 404);
    }
    return successResponse(res, "bookings fetched successfully", allBookings);
  } catch (err) {
    return errorResponse(res, err);
  }
};
exports.agentBookung = async (req, res) => {
  try {
    const { id } = req.params;

    const allBookings = await Booking.find({
      agencyId: id,
      status: "confirmed",
    })
      .populate("userId", "firstName lastName email role")
      .sort({ createdAt: -1 });

    if (!allBookings || allBookings.length === 0) {
      return errorResponse(res, "Bookings not found", 404);
    }

    // Group bookings and calculate total price
    const groupedBookings = allBookings.reduce((acc, booking) => {
      const userId = booking.userId._id.toString();

      if (!acc[userId]) {
        acc[userId] = {
          userId,
          userName: `${booking.userId.firstName} ${booking.userId.lastName}`,
          email: booking.userId.email,
          role: booking.userId.role,
          totalPrice: 0,
        };
      }

      acc[userId].totalPrice += booking.finalPrice || 0;
      acc[userId].bookings.push(booking);

      return acc;
    }, {});

    return successResponse(
      res,
      "Bookings fetched successfully",
      Object.values(groupedBookings)
    );
  } catch (err) {
    return errorResponse(res, err);
  }
};

exports.accountstatement = async (req, res) => {
  try {
    const { startDate, endDate, spoId } = req.query;
    const { agencyId } = req.user;

    let userIds = [];

    if (spoId) {
      const findSpo = await User.findOne({ role: "SPO", _id: spoId });

      if (findSpo) {
        const usersUnderSPO = await User.find({ assignedSPO: spoId }).select(
          "_id"
        );
        userIds = usersUnderSPO.map((user) => user._id.toString());
        userIds.push(findSpo._id.toString());
      }
    }

    console.log("userIds", userIds);

    // Convert userIds to ObjectId only if they exist
    const userObjectIds =
      userIds.length > 0
        ? userIds.map((id) => new mongoose.Types.ObjectId(id))
        : [];

    // Define base query criteria
    const baseCriteria = {
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
      agencyId: agencyId,
    };

    // Add user filtering only if there are userIds
    if (userObjectIds.length > 0) {
      baseCriteria.userId = { $in: userObjectIds };
    }

    // Fetch confirmed and refunded bookings
    const confirmedBooking = await Booking.find({
      ...baseCriteria,
      status: "confirmed",
    });
    const refundedBooking = await Booking.find({
      ...baseCriteria,
      status: "refunded",
    });

    // Fetch test payment bookings (not filtered by userId)
    const testPaymentBooking = await Booking.find({
      ...baseCriteria,
      status: "confirmed",
      paidStatus: "PAID",
    }).populate("invoiceNumber");

    console.log("Test Payment Booking:", testPaymentBooking);

    // Fetch actual payment bookings (filtered by userId)
    const paymentBooking = await Booking.find({
      ...baseCriteria,
      status: "confirmed",
      paidStatus: "PAID",
      ...(userObjectIds.length > 0 && { userId: { $in: userObjectIds } }),
    }).populate("invoiceNumber");

    console.log("Filtered Payment Booking:", paymentBooking);
    console.log(
      "Booking User ID:",
      paymentBooking.map((b) => b.userId)
    );

    return successResponse(res, "Account Statement Fetched Successfully", {
      confirmedBooking,
      refundedBooking,
      paymentBooking,
    });
  } catch (err) {
    return errorResponse(res, err);
  }
};

exports.getBookingsGroupedBySPO = async (req, res) => {
  try {
    const bookings = await Booking.aggregate([
      {
        $lookup: {
          from: "Users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $match: {
          "userDetails.role": EUserRole.SPO,
        },
      },
      {
        $group: {
          _id: "$userDetails._id",
          totalBookings: { $sum: 1 },
          userDetails: { $first: "$userDetails" },
          bookings: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          spoId: "$_id",
          spoName: {
            $concat: [
              "$userDetails.firstName",
              " ",
              { $ifNull: ["$userDetails.lastName", ""] },
            ],
          },
          totalBookings: 1,
          bookings: 1,
        },
      },
    ]);

    return successResponse(res, "SPO bookings fetched successfully", bookings);
  } catch (error) {
    console.error("Error fetching SPO bookings:", error);
    return errorResponse(res, error);
  }
};
exports.supplierAccountstatement = async (req, res) => {
  try {
    const { startDate, endDate, spoId } = req.query;
    const { agencyId } = req.user;

    let userIds = [];

    // If an SPO ID is provided, find the SPO and users under them
    if (spoId) {
      const findSpo = await User.findOne({ role: "SPO", _id: spoId });

      if (findSpo) {
        const usersUnderSPO = await User.find({ assignedSPO: spoId }).select(
          "_id"
        );
        userIds = usersUnderSPO.map((user) => user._id.toString());
        userIds.push(findSpo._id.toString());
      }
    }

    console.log("userIds", userIds);

    const filterCriteria = {
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
      status: { $in: ["confirmed", "refunded"] },
      agencyId: agencyId,
    };

    // If there are user IDs (SPO + assigned users), filter by userId
    if (userIds.length > 0) {
      filterCriteria.userId = { $in: userIds };
    }

    // Fetch both confirmed and refunded bookings
    const bookings = await Booking.find(filterCriteria);

    // Separate confirmed and refunded bookings
    const confirmedBooking = bookings.filter(
      (booking) => booking.status === "confirmed"
    );
    const refundedBooking = bookings.filter(
      (booking) => booking.status === "refunded"
    );

    return successResponse(res, "Account Statement Fetched Successfully", {
      confirmedBooking,
      refundedBooking,
    });
  } catch (err) {
    return errorResponse(res, err);
  }
};
exports.addPSF = async (req, res) => {
  try {
    const { pnr, psfValue, type } = req.body;
    console.log("PNR:", pnr, "PSF Value:", psfValue, "Type:", type);

    const FindBooking = await Booking.findOne({ id: pnr });
    if (!FindBooking) {
      return errorResponse(res, "Booking not found", 404);
    }

    if (FindBooking.psf > 0) {
      return errorResponse(res, "PSF already added", 400);
    }

    let updatedPSF = Number(psfValue);
    let updatedFinalPrice = Number(FindBooking.finalPrice);

    console.log("Initial Final Price:", updatedFinalPrice);

    if (type === "percentage") {
      if (updatedFinalPrice === 0) {
        return errorResponse(
          res,
          "Cannot apply percentage on zero final price",
          400
        );
      }
      updatedPSF = (updatedFinalPrice * Number(psfValue)) / 100;
    }

    const booking = await Booking.findOneAndUpdate(
      { id: pnr },
      {
        $set: {
          psf: updatedPSF,
        },
        $inc: {
          finalPrice: updatedPSF,
        },
      },
      { new: true }
    );

    console.log(
      "Updated Final Price:",
      booking.finalPrice,
      "Updated PSF:",
      booking.psf
    );

    return successResponse(res, "PSF Added Successfully", booking);
  } catch (err) {
    console.error("Error adding PSF:", err);
    return errorResponse(res, "Internal Server Error", 500);
  }
};
