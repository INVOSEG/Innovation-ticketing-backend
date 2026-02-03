const Supplier = require("../../lib/schema/supplier.schema");
const { successResponse } = require("../../lib/utils/success");
const { errorResponse } = require("../../lib/utils/error");

// Create a new Supplier
exports.createSupplier = async (req, res) => {
  try {
    const {
      code,
      title,
      shortName,
      details,
      address1,
      address2,
      state,
      zip,
      country,
      fax,
      city,
      phone1,
      NTNNumber,
      phone2,
      contact,
      GLAccount,
      creditLimit,
      createAutoLedgerAccount,
      visibleToAllBranches,
      addAllVendors,
    } = req.body;
    console.log("body is", req.body);
    const existingSupplier = await Supplier.findOne({ code });
    if (existingSupplier) {
      return errorResponse(res, "Supplier already exists", 400);
    }

    const newSupplier = new Supplier({
      code,
      title,
      fax,
      shortName,
      details,
      address1,
      address2,
      state,
      zip,
      country,
      city,
      phone1,
      phone2,
      contact,
      NTNNumber,
      GLAccount,
      creditLimit,
      createAutoLedgerAccount,
      visibleToAllBranches,
      addAllVendors,
    });

    await newSupplier.save();
    return successResponse(res, "Supplier created successfully", newSupplier);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// Get all Suppliers
exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    return successResponse(res, "Suppliers fetched successfully", suppliers);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get a Supplier by ID
exports.getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return errorResponse(res, "Supplier not found", 404);
    }
    return successResponse(res, "Supplier fetched successfully", supplier);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Update a Supplier by ID
exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      title,
      shortName,
      details,
      address1,
      address2,
      state,
      zip,
      fax,
      country,
      city,
      phone1,
      phone2,
      contact,
      GLAccount,
      creditLimit,
      createAutoLedgerAccount,
      visibleToAllBranches,
      addAllVendors,
      NTNNumber,
    } = req.body;
    console.log("body is", req.body);

    const updatedSupplier = await Supplier.findByIdAndUpdate(
      id,
      {
        code,
        title,
        shortName,
        details,
        address1,
        address2,
        state,
        zip,
        country,
        city,
        phone1,
        phone2,
        contact,
        GLAccount,
        creditLimit,
        createAutoLedgerAccount,
        visibleToAllBranches,
        addAllVendors,
        NTNNumber,
      },
      { new: true, runValidators: true }
    );

    if (!updatedSupplier) {
      return errorResponse(res, "Supplier not found", 404);
    }

    return successResponse(
      res,
      "Supplier updated successfully",
      updatedSupplier
    );
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// Delete a Supplier by ID
exports.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSupplier = await Supplier.findByIdAndDelete(id);
    if (!deletedSupplier) {
      return errorResponse(res, "Supplier not found", 404);
    }
    return successResponse(res, "Supplier deleted successfully");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
