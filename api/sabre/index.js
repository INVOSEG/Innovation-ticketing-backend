const express = require("express");
const router = express.Router();
const flightController = require("./controller");
const checkRole = require("../../lib/middleware/permission");

router.route("/ticketStatus/:ticketNo").get(
  // checkRole(["super_admin", "staff", "marketing", "agency", "sale"]),
  flightController.ticketStatusFormDB
);
router
  .route("/flightData")
  .get(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    flightController.postSabreFlightData
  );
router
  .route("/revalidate")
  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    flightController.revalidateItinerary
  );

router
  .route("/flightData/multipleCity")
  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    flightController.postSabreFlightDataM
  );

router.route("/sabreCityData").get(flightController.postSabreCityData);
router
  .route("/createBooking")
  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    flightController.createBooking
  );
router
  .route("/createBookingM")
  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    flightController.createBookingM
  );
router
  .route("/issueTicket")
  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    flightController.issueTicket
  );
router
  .route("/issueTicketOffline")
  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    flightController.issueTicketOffline
  );
router
  .route("/get-booking-with-logos")
  .get(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    flightController.getBookingWithLogos
  );

//issueTicketOffline
router
  .route("/book&Issue")

  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    flightController.bookAndIssueTicket
  );
router
  .route("/Mbook&Issue")
  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    flightController.bookAndIssueMTicket
  );
router
  .route("/repriceOrder")
  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    flightController.repriceOrder
  );
router
  .route("/cancelBooking")
  .put(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    flightController.deleteBooking
  );

router
  .route("/voidFlightTickets")
  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    flightController.voidFlightTickets
  );

router
  .route("/refundFlightTickets")
  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    flightController.refundFlightTickets
  );
router
  .route("/checkFlightTickets/:bookingId")
  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    flightController.checkFlightTickets
  );
router
  .route("/viewItinary")
  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    flightController.viewItinary
  );
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
    flightController.modifyPNRV2
  );
router
  .route("/getTicketsByMonth")
  .get(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    flightController.getTicketsByMonth
  );

router.route("/fareRules").post(
  // checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
  flightController.getFareRules
);

router.route("/fareRules/fromRevalidate").post(
  // checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
  flightController.getFareRulesFromRevalidate
);

router.route("/fareRulesOTA").post(
  // checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
  flightController.getFareRulesOTA
);

router.route("/allBrandsPricing").post(
  // checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
  flightController.getAllBrandsPricing
);

module.exports = router;
