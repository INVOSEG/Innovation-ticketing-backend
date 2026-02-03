const CustomerType = require("../../lib/schema/customerType.schema");
const Customer = require("../../lib/schema/customer.schema");
const Booking = require("../../lib/schema/booking.schema");
const { successResponse } = require("../../lib/utils/success");
const { errorResponse } = require("../../lib/utils/error");

// Create a new Customer Type
exports.createCustomerType = async (req, res) => {
  try {
    const { title, description } = req.body;
    const findtype = await CustomerType.findOne({ title });
    if (findtype) {
      return errorResponse(res, "Customer Type already exists", 404);
    }
    const newCustomerType = new CustomerType({ title, description });
    await newCustomerType.save();
    return successResponse(
      res,
      "Customer type created successfully",
      newCustomerType
    );
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// Get all Customer Types
exports.getAllCustomerTypes = async (req, res) => {
  try {
    const customerTypes = await CustomerType.find();
    return successResponse(
      res,
      "Customer types fetched successfully",
      customerTypes
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get a single Customer Type by ID
exports.getCustomerTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const customerType = await CustomerType.findById(id);
    if (!customerType) {
      return errorResponse(res, "Customer Type not found", 404);
    }
    return successResponse(
      res,
      "Customer type fetched successfully",
      customerType
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Update a Customer Type by ID
exports.updateCustomerType = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const updatedCustomerType = await CustomerType.findByIdAndUpdate(
      id,
      { title, description },
      { new: true, runValidators: true }
    );
    if (!updatedCustomerType) {
      return errorResponse(res, "Customer Type not found", 404);
    }
    return successResponse(
      res,
      "Customer type updated successfully",
      updatedCustomerType
    );
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// Delete a Customer Type by ID
exports.deleteCustomerType = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCustomerType = await CustomerType.findByIdAndDelete(id);
    if (!deletedCustomerType) {
      return errorResponse(res, "Customer Type not found", 404);
    }
    return successResponse(res, "Customer Type deleted successfully");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
/////////////////////////creating customer///////////////////////////////////////////////

// Create a new Customer
exports.createCustomer = async (req, res) => {
  try {
    const {
      code,
      title,
      shortName,
      details,
      fax,
      address1,
      address2,
      state,
      zip,
      country,
      city,
      phone1,
      phone2,
      contact,
      parentCustomer,
      customerType,
      creditLimit,
      creditTerm,
      GLAccount,
      NTNNumber,
      saleTaxNumber,
      dateOfCreation,
      dateOfExpiry,
      IATANumber,
      createAutoLedgerAccount,
      visibleToAllBranches,
      hideOnInvoice,
      SPO,
    } = req.body;
    console.log("create customer data", req.body);
    const cust = await Customer.findOne({ code: code });
    if (cust) {
      return errorResponse(res, "Customer already exists", 400);
    }
    const newCustomer = new Customer({
      code,
      title,
      fax,
      GLAccount,
      shortName,
      creditTerm,
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
      parentCustomer,
      customerType,
      creditLimit,
      NTNNumber,
      saleTaxNumber,
      dateOfCreation,
      dateOfExpiry,
      IATANumber,
      createAutoLedgerAccount,
      visibleToAllBranches,
      hideOnInvoice,
      SPO,
    });

    await newCustomer.save();
    return successResponse(res, "Customer created successfully", newCustomer);
  } catch (error) {
    console.log(error);
    return errorResponse(res, error);
  }
};

// Get all Customers
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    return successResponse(res, "Customers fetched successfully", customers);
  } catch (error) {
    return errorResponse(res, error);
  }
};

// Get a Customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id);
    if (!customer) {
      return errorResponse(res, "Customer not found", 404);
    }
    return successResponse(res, "Customer fetched successfully", customer);
  } catch (error) {
    return errorResponse(res, error);
  }
};

// Update a Customer by ID
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedCustomer = await Customer.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedCustomer) {
      return errorResponse(res, "Customer not found", 404);
    }

    return successResponse(
      res,
      "Customer updated successfully",
      updatedCustomer
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};

// Delete a Customer by ID
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCustomer = await Customer.findByIdAndDelete(id);
    if (!deletedCustomer) {
      return errorResponse(res, "Customer not found", 404);
    }
    return successResponse(res, "Customer deleted successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

// Get all Customers without ParentCustomer
exports.getCustomersWithoutParent = async (req, res) => {
  try {
    const customers = await Customer.find({
      ParentCustomer: { $exists: false },
    });
    return successResponse(
      res,
      "Customers without ParentCustomer fetched successfully",
      customers
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// const getUser data
exports.getUserDetails = async (req, res) => {
  try {
    const { documentNumber } = req.body;
    const findData = await Booking.findOne({
      "travelers.documents.number": documentNumber,
    });
    if (!findData) {
      return res.status(404).json({ message: "Traveler not found" });
    }
    const travelerDetails = findData.travelers.filter((traveler) =>
      traveler.documents.some((doc) => doc.number === documentNumber)
    );

    return successResponse(
      res,
      "Customers details fetched successfuly",
      travelerDetails
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};
