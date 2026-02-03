const express = require("express");
const router = express.Router();
const customerController = require("./controller");
const checkRole = require("../../lib/middleware/permission");

// Routes for Customer Type
router.post(
  "/create",
  checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
  customerController.createLedger
);
router.post(
  "/supplierLedger",
  checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
  customerController.createsLedger
);
router.patch(
  "/update",
  checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
  customerController.updateLedger
);
router.get(
  "/customerLedger",
  checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
  customerController.customerLedger
);
router.get(
  "/supplierLedger",
  checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
  customerController.supplierLedger
);

module.exports = router;
