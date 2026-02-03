const express = require("express");
const router = express.Router();
const supplierController = require("./controller");
const checkRole = require("../../lib/middleware/permission");

// Create a new Supplier
router.route("/create").post(
  // checkRole(["super_admin", "staff", "marketing"]),
  supplierController.createSupplier
);

// Get all Suppliers
router.route("/getAll").get(
  // checkRole(["super_admin", "staff", "marketing", "agency"]),
  supplierController.getAllSuppliers
);

// Get a Supplier by ID
router
  .route("/getDetails/:id")
  .get(
    checkRole(["super_admin", "staff", "marketing", "agency", "SPO"]),
    supplierController.getSupplierById
  );

// Update a Supplier by ID
router
  .route("/update/:id")
  .put(
    checkRole(["super_admin", "staff", "marketing"]),
    supplierController.updateSupplier
  );

// Delete a Supplier by ID
router.route("/delete/:id").delete(
  // checkRole(["super_admin", "staff", "marketing"]),
  supplierController.deleteSupplier
);

module.exports = router;
