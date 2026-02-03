const express = require("express");
const router = express.Router();
const controller = require("./controller");
const checkRole = require("../../lib/middleware/permission");

router
  .route("/getAll")
  .get(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    controller.getAllBookings
  );
router.route("/create").post(controller.createBooking);

router.route("/search").post(controller.searchBookings);
router.route("/sale").get(controller.calculateSalesAndEarnings);

router.route("/getById/:id").get(controller.getBookingById);
router.route("/update/:id").put(controller.updateBooking);
router.route("/cancel/:id").delete(controller.cancelBooking);
router
  .route("/getByRole/:id")
  .get(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    controller.getByuserId
  );
router
  .route("/getBookingsGroupedBySPO")
  .get(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    controller.getByuserId
  );
router
  .route("/getUserBooking/:id")
  .get(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    controller.getUserBooking
  );
router
  .route("/agentBookung/:id")
  .get(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    controller.agentBookung
  );

router
  .route("/customerAccountstatement")
  .get(checkRole(["super_admin", "agency"]), controller.accountstatement);
router
  .route("/supplierAccountstatement")
  .get(
    checkRole(["super_admin", "agency"]),
    controller.supplierAccountstatement
  );
router
  .route("/addPSF")
  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    controller.addPSF
  );

module.exports = router;
