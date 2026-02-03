const CustomerLedger = require("../../lib/schema/customerLedger.schema");
const SupplierLedger = require("../../lib/schema/supplierLedger.schema");
const IncomeStatement = require("../../lib/schema/incomeStatement.schema");
const { successResponse } = require("../../lib/utils/success");
const { errorResponse } = require("../../lib/utils/error");
const RecentSearch = require("../../lib/schema/users.schema");
const Users = require("../../lib/schema/users.schema");

exports.transaction = async (req, res) => {
  try {
    const {
      customerName,
      ticketNumber,
      supplierName,
      orignalPrice,
      finalPrice,
      markupType,
      markupAmount,
      payMode,
      status,
    } = req.body;

    if (
      !customerName ||
      !ticketNumber ||
      !supplierName ||
      !orignalPrice ||
      !finalPrice ||
      !markupAmount
    ) {
      return errorResponse(res, "All fields are required");
    }

    // Save Customer Ledger Entry (Final Price)
    const newCustomerLedger = new CustomerLedger({
      customerName,
      ticketNumber,
      amount: finalPrice,
      payMode,
      status,
    });

    // Save Supplier Ledger Entry (Original Price)
    const newSupplierLedger = new SupplierLedger({
      supplierName,
      ticketNumber,
      amount: orignalPrice,
      payMode,
      status,
    });

    // Save Income Statement Entry (Markup)
    const newIncomeStatement = new IncomeStatement({
      amount: markupAmount,
      type: markupType,
      description: `Markup from ticket ${ticketNumber}`,
    });

    // Save all operations using `Promise.all` for efficiency
    await Promise.all([
      newCustomerLedger.save(),
      newSupplierLedger.save(),
      newIncomeStatement.save(),
    ]);

    return successResponse(res, "Transaction processed successfully", {
      customerLedger: newCustomerLedger,
      supplierLedger: newSupplierLedger,
      incomeStatement: newIncomeStatement,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};
exports.getAllLedger = async (req, res) => {
  try {
    const role = req.user.role;
    console.log(role);
    if (role === "super_admin") {
      const customerLedgers = await CustomerLedger.find();
      const supplierLedgers = await SupplierLedger.find()
        .populate("agencyId", "agencyEmail agencyName")
        .populate("bookingId");
      const incomeStatements = await IncomeStatement.find()
        .populate("supplierLedger")
        .populate("customerLedger")
        .populate("agencyId", "agencyEmail agencyName")
        .populate("bookingId")
        .populate("spo", "firstName email");
      return successResponse(res, "All ledger entries retrieved successfully", {
        customerLedgers,
        supplierLedgers,
        incomeStatements,
      });
    }

    if (role === "agency") {
      console.log();
      const customerLedgers = await CustomerLedger.find({
        agencyId: req.user.agency_id,
      });
      const supplierLedgers = await SupplierLedger.find({
        agencyId: req.user.agency_id,
      })
        .populate("agencyId", "agencyEmail agencyName")
        .populate("bookingId");
      const incomeStatements = await IncomeStatement.find({
        agencyId: req.user.agency_id,
      })
        .populate("supplierLedger")
        .populate("customerLedger")
        .populate("agencyId", "agencyEmail agencyName")
        .populate("bookingId")
        .populate("spo", "firstName email");
      return successResponse(res, "All ledger entries retrieved successfully", {
        customerLedgers,
        supplierLedgers,
        incomeStatements,
      });
    } else {
      const customerLedgers = await CustomerLedger.find({ spo: req.user.id });
      const supplierLedgers = await SupplierLedger.find({ spo: req.user.id })
        .populate("agencyId", "agencyEmail agencyName")
        .populate("bookingId");
      const incomeStatements = await IncomeStatement.find({ spo: req.user.id })
        .populate("supplierLedger")
        .populate("customerLedger")
        .populate("agencyId", "agencyEmail agencyName")
        .populate("bookingId")
        .populate("spo", "firstName email");
      return successResponse(res, "All ledger entries retrieved successfully", {
        customerLedgers,
        supplierLedgers,
        incomeStatements,
      });
    }
    return errorResponse(res, "Invalid role", 404);
  } catch (error) {
    return errorResponse(res, error);
  }
};

// ✅ Save Recent Searches (New API)
exports.saveRecentSearch = async (req, res) => {
  try {
    const { legs, tripType, adult, child, infant } = req.body;
    const { id } = req.user;
    if (!legs || legs.length === 0) {
      return errorResponse(res, "At least one search leg is required", 400);
    }

    // Find user from Users collection
    const user = await Users.findById(id);
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    // Add recent search object
    const recentSearchData = { legs, tripType, adult, child, infant };
    console.log("recentSearchData", recentSearchData);
    user.recentSearches.unshift(recentSearchData);

    // Keep only the latest 3 searches
    if (user.recentSearches.length > 5) {
      user.recentSearches = user.recentSearches.slice(0, 5); // ✅ fix here
    }

    await user.save();

    return successResponse(
      res,
      "Recent search saved successfully",
      user.recentSearches
    );
  } catch (error) {
    console.error("Save Recent Search Error:", error);
    return errorResponse(res, error.message || "Internal Server Error", 500);
  }
};

// ✅ Delete Recent Search API
exports.deleteRecentSearch = async (req, res) => {
  try {
    const { index } = req.params;
    const { id } = req.user;
    console.log("search id", index);
    // Find the user
    const user = await Users.findById(id);
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    const initialLength = user.recentSearches.length;
    user.recentSearches = user.recentSearches.filter(
      (search) => search._id.toString() !== index
    );
    console.log(initialLength);
    console.log(
      user.recentSearches.filter((search) => search._id.toString() !== index)
    );

    // Check if any item was removed
    if (user.recentSearches.length === initialLength) {
      return errorResponse(res, "Search ID not found", 404);
    }

    await user.save();

    return successResponse(
      res,
      "Recent search deleted successfully",
      user.recentSearches
    );
  } catch (error) {
    console.error("Delete Recent Search Error:", error);
    return errorResponse(res, error);
  }
};

// ✅ Get Recent Searches
exports.getRecentSearches = async (req, res) => {
  try {
    const { id } = req.user;
    if (!id) return errorResponse(res, "User ID is required", 400);

    const userSearches = await RecentSearch.findOne({ _id: id });
    return successResponse(
      res,
      "Recent searches retrieved successfully",
      userSearches?.recentSearches || []
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};
