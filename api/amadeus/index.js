const express = require("express");
const router = express.Router();
const flightController = require("./Controller");
const checkRole = require("../../lib/middleware/permission");

router
  .route("/flightData")
  .get(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    flightController.getFlightData
  );
router
  .route("/reValidate")

  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    flightController.reValidate
  );
router
  .route("/multiFlightData")
  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    flightController.getFlightDataMultiCity
  );
router
  .route("/book&Issue")
  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    flightController.bookAndIssueTicket
  );
router.route("/cityData").get(flightController.getCityData);
router
  .route("/createBooking")
  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    flightController.createBooking
  );
router.route("/deleteBooking").delete(
  // checkRole(["super_admin", "staff", "marketing", "agency", "sale"]),
  flightController.deleteBooking
);
router.route("/flightRules").post(flightController.getFlightRules);
router.route("/upselling").post(flightController.upsellingFares);
router.route("/airlineData").get(flightController.flightNameByAirlineCode);
router
  .route("/getFlightSalesData")
  .get(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    flightController.getFlightSalesData
  );
router
  .route("/agencySaleData")
  .get(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    flightController.agencySaleData
  );
router
  .route("/data")
  .get(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    flightController.data
  );
router
  .route("/getSaleReport")
  .get(checkRole(["super_admin", "agency"]), flightController.getSaleReport);
router
  .route("/issueTicket")
  .post(
    checkRole(["super_admin", "agency", "SPO", "sale", "marketing", "staff"]),
    flightController.issueTicket
  );
router
  .route("/refundFlightTickets")
  .post(checkRole(["super_admin", "agency"]), flightController.deleteBooking);
router
  .route("/cancelBooking")
  .put(checkRole(["super_admin", "agency"]), flightController.cancleBooking);
router
  .route("/sale")
  .get(checkRole(["super_admin", "agency"]), flightController.sale);
router
  .route("/filterSale")
  .get(checkRole(["super_admin", "agency"]), flightController.filterSale);
router
  .route("/comparePNR")
  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    flightController.updatePNR
  );
router
  .route("/updateStatus")
  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    flightController.updateStatus
  );
router.route("/viewItinary").post(
  // checkRole(["super_admin", "staff", "marketing", "agency", "sale"]),
  flightController.viewItinary
);
router
  .route("/importPNR")
  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    flightController.importPNR
  );
router
  .route("/modifyPNR")
  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    flightController.modifyPNR
  );
router
  .route("/addDb")
  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    flightController.addDb
  );
//  router.route('/search').post(controller.searchBookings);
//  router.route('/sale').get(controller.calculateSalesAndEarnings);

// router
//   .route('/:id')
//   .get(controller.getBookingById)
//   .put(controller.updateBooking)
//   .delete(controller.cancelBooking);

module.exports = router;
