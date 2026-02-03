const express = require("express");
const router = express.Router();
const customerController = require("./controller");
const checkRole = require("../../lib/middleware/permission");

// Routes for Customer Type

router.post("/create", customerController.createCustomerType);
router.get("/getAll", customerController.getAllCustomerTypes);
router.get("/getbyId/:id", customerController.getCustomerTypeById);
router.put("/update/:id", customerController.updateCustomerType);
router.delete("/delete/:id", customerController.deleteCustomerType);
//asdf
router.post("/createCustomer", customerController.createCustomer);
router.get(
  "/getAllCustomer",
  //   checkRole(["super_admin", "staff", "marketing", "agency", "sale"]),
  customerController.getAllCustomers
);
router.get("/getCustomer/:id", customerController.getCustomerById);
router.put("/updateCustomer/:id", customerController.updateCustomer);
router.delete("/deleteCustomer/:id", customerController.deleteCustomer);
router.get("/parent", customerController.getCustomersWithoutParent);
router.post("/getUserDetails", customerController.getUserDetails);

module.exports = router;
