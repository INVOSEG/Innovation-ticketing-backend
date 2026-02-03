const CustomerLedger = require("../../lib/schema/customerLedgerr.schema");
const Booking = require("../../lib/schema/booking.schema");
const User = require("../../lib/schema/users.schema");
const mongoose = require("mongoose");

const { successResponse } = require("../../lib/utils/success");
const { errorResponse } = require("../../lib/utils/error");
const { LedgerType, PayMethod } = require("../../lib/utils/enum");
exports.createLedger = async (req, res) => {
  try {
    const { pnr, payMode, chequeNo, amount, bankName, date } = req.body;
    const { agencyId, _id } = req.user;

    const findbooking = await Booking.findOne({ id: pnr });
    console.log("booking", req.body, findbooking);

    if (!findbooking) {
      return errorResponse(res, "Booking not found", 404);
    }
    const findLedger = await CustomerLedger.findOne({ pnr: pnr });
    if (findLedger) {
      return errorResponse(res, "Ledger already exists", 400);
    }

    const newLedger = new CustomerLedger({
      credited: Number(findbooking.finalPrice),
      userId: _id,
      agencyId,
      bookingId: findbooking._id,
      pnr: pnr,
      LedgerType: LedgerType.CUSTOMER,
      payMode: PayMethod.CASH,
      balance: -findbooking.finalPrice,
    });
    const saveLedger = await newLedger.save();
    const oldBalance = await CustomerLedger.findOne({
      userId: _id,
      LedgerType: LedgerType.SUPPLIER,
    })
      .sort({ createdAt: -1 }) // Get the most recent entry
      .limit(1);
    console.log("oldBalance", oldBalance);
    let bal;
    if (oldBalance) {
      bal = Number(oldBalance?.balance) + Number(findbooking?.orignalPrice);
    } else {
      bal = Number(findbooking?.orignalPrice);
    }
    const newSLedger = new CustomerLedger({
      credited: Number(findbooking.orignalPrice),
      userId: _id,
      agencyId,
      bookingId: findbooking._id,
      pnr: pnr,
      LedgerType: LedgerType.SUPPLIER,
      payMode: PayMethod.CASH,
      balance: bal,
      BSP: findbooking.api,
      date: date ? date : new Date(),
    });
    const saveSLedger = await newSLedger.save();
    if (amount) {
      if (Number(amount) > Number(findbooking.finalPrice)) {
        return errorResponse(res, "Amount exceeds the booking price", 400);
      }
      const remainingbalance = Number(findbooking.finalPrice) - Number(amount);
      console.log(remainingbalance, findbooking.finalPrice, amount);
      const ledger = new CustomerLedger({
        debited: Number(amount),
        userId: _id,
        agencyId,
        bookingId: findbooking._id,
        pnr: pnr,
        payMode,
        chequeNo,
        LedgerType: LedgerType.CUSTOMER,
        bankName: bankName,
        balance: -remainingbalance,
      });
      await ledger.save();
      // const remainingbalanceS =
      //   Number(findbooking.orignalPrice) - Number(amount);

      // const Sledger = new CustomerLedger({
      //   debited: Number(amount),
      //   userId: _id,
      //   agencyId,
      //   bookingId: findbooking._id,
      //   pnr: pnr,
      //   payMode,
      //   chequeNo,
      //   // bankName: bankName,
      //   LedgerType: LedgerType.SUPPLIER,
      //   BSP: findbooking.api,

      //   balance: -remainingbalanceS,
      // });
      // await Sledger.save();
      return successResponse(res, "Ledger created successfully", ledger);
    }

    return successResponse(res, "Ledger created successfully", saveLedger);
  } catch (error) {
    return errorResponse(res, error);
  }
};
exports.createsLedger = async (req, res) => {
  try {
    const {
      credited,
      debit,
      payMode,
      platform,
      transNo,
      chequeNo,
      bankName,
      description,
      remarks,
      date,
      refNo,
    } = req.body;
    const { agencyId, _id } = req.user;

    // Find the latest ledger entry for the user to get the previous balance
    const lastLedger = await CustomerLedger.findOne({ userId: _id })
      .sort({ createdAt: -1 }) // Get the most recent entry
      .limit(1);
    console.log("lastLedger balance", lastLedger.balance);
    let previousBalance = Number(lastLedger?.balance) || 0;
    let newBalance = previousBalance;
    const num = Number(debit);
    // Adjust balance with explicit signs
    if (debit) {
      newBalance += Math.abs(num);
    }

    console.log("Previous Balance:", previousBalance);
    console.log("New Balance:", newBalance);

    // Create a new ledger entry
    const newSLedger = new CustomerLedger({
      debited: num,
      userId: _id,
      agencyId,
      LedgerType: LedgerType.SUPPLIER,
      payMode: payMode,
      BSP: platform,
      balance: newBalance,
      remarks,
      description: description,
      refNo: refNo,
      transactionNo: transNo,
      bankName: bankName,
      chequeNo: chequeNo,
      date: date ? date : new Date(),
    });

    const saveSLedger = await newSLedger.save();

    return successResponse(res, "Ledger created successfully", saveSLedger);
  } catch (error) {
    console.error("Error creating ledger:", error);
    return errorResponse(res, error);
  }
};

exports.updateLedger = async (req, res) => {
  try {
    const { ledgerId } = req.params; // Get ledger ID from request params
    const { credited, debited, pnr, payMode, chequeNo, amount, bankName } =
      req.body;
    const { agencyId, _id } = req.user;

    const findbooking = await Booking.findOne({ id: pnr });
    if (!findbooking) {
      return errorResponse(res, "Booking not found", 404);
    }
    const findLedger = await CustomerLedger.findOne({ pnr: pnr }).sort({
      createdAt: -1,
    });
    if (!findLedger) {
      return errorResponse(res, "Ledger not found", 404);
    }
    let previousBalance = findLedger ? Math.abs(Number(findLedger.balance)) : 0;

    console.log(amount, previousBalance);
    // Ensure amount does not exceed final price
    if (Number(previousBalance) === 0) {
      return errorResponse(res, "already paid full amount");
    }
    if (Number(amount) > Number(previousBalance)) {
      return errorResponse(res, "Amount exceeds the booking price");
    }

    // Calculate updated balance
    const updatedBalance = previousBalance - Number(amount);

    // Formatting the balance sign correctly
    let finalBalance;
    if (updatedBalance > 0) {
      finalBalance = +updatedBalance; // If positive, add a + sign
    } else if (updatedBalance < 0) {
      finalBalance = -Math.abs(updatedBalance); // If negative, add a - sign
    } else {
      finalBalance = 0; // If zero, keep it as 0
    }
    const ledger = new CustomerLedger({
      debited: Number(amount),
      userId: _id,
      agencyId,
      bookingId: findbooking.id,
      pnr: pnr,
      payMode,
      chequeNo,
      bankName: bankName,
      LedgerType: LedgerType.CUSTOMER,
      balance: finalBalance,
    });

    await ledger.save();
    const Sledger = new CustomerLedger({
      debited: Number(amount),
      userId: _id,
      agencyId,
      bookingId: findbooking.id,
      pnr: pnr,
      payMode,
      chequeNo,
      LedgerType: LedgerType.SUPPLIER,
      BSP: findbooking.api,
      balance: finalBalance,
    });
    await Sledger.save();

    return successResponse(res, "Ledger added successfully", ledger);
  } catch (error) {
    return errorResponse(res, error);
  }
};
exports.customerLedger = async (req, res) => {
  try {
    const { startDate, endDate, spoId } = req.query;
    const { agencyId, _id: userId } = req.user; // Extract user ID
    let userIds = [];
    const oldBalance = await CustomerLedger.findOne({
      userId: req.user._id,
      LedgerType: LedgerType.SUPPLIER,
    })
      .sort({ createdAt: -1 }) // Get the most recent entry
      .limit(1);
    console.log("oldBalance", oldBalance);
    // if (spoId) {
    //   const findSpo = await User.findOne({ role: "SPO", _id: spoId });
    //   if (!findSpo) {
    //     return errorResponse(res, "Data not found", 404);
    //   }

    //   const usersUnderSPO = await User.find({ assignedSPO: spoId }).select(
    //     "_id"
    //   );
    //   console.log("usersUnderSPO", usersUnderSPO);
    //   userIds = usersUnderSPO.map((user) => user._id.toString());
    //   userIds.push(findSpo._id.toString());
    // }

    // console.log("userIds", userIds);

    // Convert dates to ignore time
    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);

    const filterCriteria = {
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      LedgerType: LedgerType.CUSTOMER,
      agencyId: agencyId,
      // userId: spoId ? { $in: userIds } : userId, // ✅ Fix: Use `userId` directly when `spoId` is not provided
    };

    // **Check if any ledger exists for these users**
    const ledgerCount = await CustomerLedger.countDocuments(filterCriteria);
    if (ledgerCount === 0) {
      return errorResponse(res, "No data found", 404);
    }

    // Get the last ledger entry before startDate
    const lastEntryBeforeStartDate = await CustomerLedger.findOne({
      createdAt: { $lt: startOfDay },
      LedgerType: LedgerType.CUSTOMER,
      agencyId: agencyId,
      // ...(spoId ? { userId: { $in: userIds } } : { userId }), // ✅ Fix: Avoid passing `req`
    }).sort({ createdAt: -1 });

    const openingBalance = lastEntryBeforeStartDate
      ? Number(lastEntryBeforeStartDate.balance)
      : 0;

    // Fetch all ledger entries within the given date range
    const bookings = await CustomerLedger.find(filterCriteria).sort({
      createdAt: 1,
    });

    return successResponse(res, "Customer Ledger Fetched Successfully", {
      bookings,
      openingBalance,
    });
  } catch (err) {
    return errorResponse(res, err);
  }
};

exports.supplierLedger = async (req, res) => {
  try {
    const { startDate, endDate, spoId } = req.query;
    const { agencyId, _id: userId } = req.user;
    let userIds = [];

    // if (spoId) {
    //   const findSpo = await User.findOne({ role: "SPO", _id: spoId });
    //   if (!findSpo) {
    //     return errorResponse(res, "Data not found", 404);
    //   }

    //   const usersUnderSPO = await User.find({ assignedSPO: spoId }).select(
    //     "_id"
    //   );
    //   console.log("usersUnderSPO", usersUnderSPO);
    //   userIds = usersUnderSPO.map((user) => user._id.toString());
    //   userIds.push(findSpo._id.toString());
    // }

    console.log("userIds", userIds);

    // Convert dates to ignore time
    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);

    const filterCriteria = {
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      LedgerType: LedgerType.SUPPLIER,
      agencyId: agencyId,
      // userId: spoId ? { $in: userIds } : userId,
    };

    // **Check if any ledger exists for these users**
    const ledgerCount = await CustomerLedger.countDocuments(filterCriteria);
    if (ledgerCount === 0) {
      return errorResponse(res, "No data found", 404);
    }

    // Get the last ledger entry before startDate
    const lastEntryBeforeStartDate = await CustomerLedger.findOne({
      createdAt: { $lt: startOfDay },
      LedgerType: LedgerType.SUPPLIER,
      agencyId: agencyId,
      // ...(spoId ? { userId: { $in: userIds } } : { userId }), // ✅ Fix: Avoid passing `req`
    }).sort({ createdAt: -1 });

    const openingBalance = lastEntryBeforeStartDate
      ? Number(lastEntryBeforeStartDate.balance)
      : 0;

    // Fetch all ledger entries within the given date range
    const bookings = await CustomerLedger.find(filterCriteria).sort({
      createdAt: 1,
    });

    return successResponse(res, "Customer Ledger Fetched Successfully", {
      bookings,
      openingBalance,
    });
  } catch (err) {
    return errorResponse(res, err);
  }
};
