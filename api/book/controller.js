const Book = require("../../lib/schema/book.schema");
const Agency = require("../../lib/schema/agency.schema");
const User = require("../../lib/schema/users.schema");
const { successResponse } = require("../../lib/utils/success");
const { errorResponse } = require("../../lib/utils/error");

exports.createBook = async (req, res) => {
  try {
    const {
      payMode,
      agencyId,
      voucherType,
      type,
      amount,
      credit,
      debit,
      ...rest
    } = req.body;
    console.log(req.body);

    // Fetch agency
    const agency = await Agency.findById(agencyId);
    if (!agency) return errorResponse(res, "Agency not found", 404);

    let val;
    if (type === "charged") val = "CHGS";
    else if (type === "received") val = "RCVID";
    else return errorResponse(res, "Invalid transaction type", 400);

    const description = `${payMode} ${val} ${agency.agencyName}`;

    // Fetch super admin
    const superAdmin = await User.findOne({ role: "super_admin" });
    if (!superAdmin)
      return errorResponse(res, "Super admin account not found", 404);

    // Fetch super admin's agency
    const superAdminAgency = superAdmin.agencyId
      ? await Agency.findById(superAdmin.agencyId)
      : null;

    if (!superAdminAgency) {
      return errorResponse(res, "Super admin's agency not found", 500);
    }

    // Convert values to numbers for proper arithmetic
    const transactionAmount = Number(amount);
    let superAdminCash = Number(superAdminAgency.cashLimit);
    let agencyCash = Number(agency.cashLimit);

    // Handle cash limit based on transaction type
    if (type === "received") {
      if (superAdminCash < transactionAmount) {
        return errorResponse(
          res,
          "Super admin does not have enough balance",
          400
        );
      }

      // Deduct from super admin and add to agency
      superAdminAgency.cashLimit = superAdminCash - transactionAmount;
      agency.cashLimit = agencyCash + transactionAmount;
    } else if (type === "charged") {
      if (agencyCash < transactionAmount) {
        return errorResponse(
          res,
          "Insufficient funds in agency cash limit",
          400
        );
      }

      // Deduct from agency and add to super admin
      agency.cashLimit = agencyCash - transactionAmount;
      superAdminAgency.cashLimit = superAdminCash + transactionAmount;
    }

    // Save updated balances
    await agency.save();
    await superAdminAgency.save();

    const prefixMap = {
      "Journal Voucher": "JV",
      "Recipt Voucher": "RV",
      "Payment Voucher": "PV",
    };

    const prefix = prefixMap[voucherType];
    if (!prefix) return errorResponse(res, "Invalid voucher type", 400);

    const lastVoucher = await Book.findOne({ voucherType })
      .sort({ createdAt: -1 })
      .select("voucherNumber");

    let voucherNumber;
    if (lastVoucher && lastVoucher.voucherNumber) {
      const lastNumber =
        parseInt(lastVoucher.voucherNumber.replace(prefix, "")) || 0;
      voucherNumber = `${prefix}${lastNumber + 1}`;
    } else {
      voucherNumber = `${prefix}1`;
    }
    const filePaths = req.files ? req.files.map((file) => file.path) : [];

    // Create and save transaction
    const newBook = new Book({
      ...rest,
      payMode,
      agencyId,
      voucherType,
      description,
      credit,
      type,
      debit,
      images: filePaths,
      voucherNumber,
    });
    await newBook.save();

    return successResponse(res, "Transaction created successfully", newBook);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().populate("agencyId userId");
    return successResponse(res, "Books retrieved successfully", books);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("agencyId userId");
    if (!book) return errorResponse(res, "Book not found");
    return successResponse(res, "Book retrieved successfully", book);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};
exports.getBookByagencyId = async (req, res) => {
  try {
    const book = await Book.find({ agencyId: req.params.agencyId }).populate(
      "agencyId userId"
    );
    if (!book) return errorResponse(res, "Book not found");
    return successResponse(res, "Book retrieved successfully", book);
  } catch (error) {
    return errorResponse(res, error);
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { payMode, agencyId, voucherType, ...rest } = req.body;
    const agency = await mongoose.model("Agency").findById(agencyId);
    if (!agency) return errorResponse(res, "Agency not found");

    const description = `${payMode} ${agency.name}`;
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { ...rest, payMode, agencyId, voucherType, description },
      { new: true }
    );
    if (!updatedBook) return errorResponse(res, "Book not found");
    return successResponse(res, "Book updated successfully", updatedBook);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) return errorResponse(res, "Book not found");
    return successResponse(res, "Book deleted successfully", deletedBook);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};
