const express = require("express");
const router = express.Router();
const staffController = require("./controller");
const checkPermission = require("../../lib/middleware/checkPermission");
const checkToken = require("../../lib/middleware/checkToken");
const checkRole = require("../../lib/middleware/permission");
router
  .route("/create")
  .post(
    checkToken,
    checkRole(["super_admin", "admin"]),
    staffController.createPaymentType
  );
router.route("/getAll").get(
  checkToken,
  checkRole(["super_admin", "admin"]),
  // checkPermission("usersCreate"),
  staffController.getAllPaymentTypes
);
router.route("/getAllActive").get(
  checkToken,
  checkRole(["super_admin", "admin"]),
  // checkPermission("usersCreate"),
  staffController.getAllActivePaymentTypes
);
router.route("/getById/:id").get(
  checkToken,
  checkRole(["super_admin", "admin"]),
  // checkPermission("usersCreate"),
  staffController.getPaymentTypeById
);
router.route("/getBydamin").get(
  checkToken,
  checkRole(["super_admin", "admin"]),
  // checkPermission("usersCreate"),
  staffController.getPaymentTypeCreatedBy
);
router
  .route("/delete/:id")
  .delete(
    checkToken,
    checkRole(["super_admin", "admin"]),
    staffController.deletePaymentType
  );
router
  .route("/update/:id")
  .patch(
    checkToken,
    checkRole(["super_admin", "admin"]),
    staffController.updatePaymentType
  );
router
  .route("/status/:id")
  .patch(
    checkToken,
    checkRole(["super_admin", "admin"]),
    staffController.updatePaymentType
  );

module.exports = router;
