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
    checkRole(["super_admin", "agency", "admin", "owner"]),
    staffController.createStaff
  );
router.post(
  "/update-balance",
  checkRole(["super_admin", "agency", "admin", "owner"]),
  staffController.updateAllocatedBalance
);
router.get(
  "/getTransaction",
  checkRole(["super_admin", "agency", "admin", "owner"]),
  staffController.updateAllocatedBalance
);

router
  .route("/getUsersSales")
  .get(
    checkToken,
    checkRole(["super_admin", "agency", "sale", "SPO"]),
    staffController.getUsersSales
  );
router
  .route("/getSaleGraph")
  .get(checkRole(["sale", "SPO"]), staffController.getSaleGraph);
router
  .route("/getAll/:id")
  .get(
    checkToken,
    checkRole(["super_admin", "agency"]),
    checkPermission("usersCreate"),
    staffController.getAllStaff
  );
router.route("/getAllSPOStaff/:id").get(
  checkToken,
  checkRole(["super_admin", "agency"]),
  // checkPermission("usersCreate"),
  staffController.getAllSPOStaff
);
router
  .route("/getAllAdmin")
  .get(
    checkToken,
    checkRole(["super_admin", "agency"]),
    staffController.getAllStaffAdmin
  );
router
  .route("/getSingle/:id")
  .get(
    checkToken,
    checkRole(["super_admin", "agency", "staff", "sale", "SPO"]),
    staffController.findStaffById
  );
router
  .route("/delete/:id")
  .delete(
    checkToken,
    checkRole(["super_admin", "agency"]),
    staffController.deleteStaff
  );
router
  .route("/update/:id")
  .patch(
    checkToken,
    checkRole(["super_admin", "agency", "staff", "marketing", "sale", "SPO"]),
    staffController.updateStaff
  );
router
  .route("/status/:id")
  .put(
    checkToken,
    checkRole(["super_admin", "agency"]),
    staffController.updateStaffStatus
  );
router
  .route("/getBooking")
  .get(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    staffController.getBooking
  );
router
  .route("/addlimit")
  .post(checkRole(["super_admin"]), staffController.addlimit);
router
  .route("/resetLimit")
  .post(checkRole(["super_admin"]), staffController.resetLimit);
// router.route("/verify/email/:token").get(
//   // checkRole(["super_admin", "admin", "agency"]),
//   agencyController.verifyEmail
// );
module.exports = router;
