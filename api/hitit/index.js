const express = require("express");
const router = express.Router();
const hititController = require("./controller");
const checkRole = require("../../lib/middleware/permission");

// General Parameters
router
  .route("/general-params")
  .get(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    hititController.getGeneralParams
  );

// Airline Profile
router
  .route("/airline-profile")
  .get(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    hititController.getAirlineProfile
  );

// Flight Search
router
  .route("/search-flights")
  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    hititController.searchFlights
  );

// Order Management
router
  .route("/order")
  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    hititController.createOrder
  );

router
  .route("/order/:orderId")
  .get(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    hititController.retrieveOrder
  );

router
  .route("/order/cancel")
  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    hititController.cancelOrder
  );

router
  .route("/order/change")
  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    hititController.changeOrder
  );

router
  .route("/order/fare")
  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    hititController.getOrderFare
  );

// Ticket Operations
router
  .route("/ticket/preview/:orderId")
  .get(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    hititController.previewTicket
  );

router
  .route("/ticket/void")
  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    hititController.voidTicket
  );

// Ancillary Services
router
  .route("/services")
  .get(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    hititController.getServiceList
  );

router
  .route("/services/baggage")
  .get(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    hititController.getBaggageServiceList
  );

router
  .route("/services/seat-availability")
  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    hititController.getSeatAvailability
  );

router
  .route("/ancillary/add")
  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    hititController.addAncillary
  );

router
  .route("/ancillary/delete")
  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    hititController.deleteAncillary
  );

router
  .route("/ancillary/sell")
  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    hititController.sellAncillary
  );

router
  .route("/ancillary/offer-price")
  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    hititController.getOfferPrice
  );

// Reissue Operations
router
  .route("/reissue/preview")
  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    hititController.previewReissue
  );

router
  .route("/reissue/commit")
  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    hititController.commitReissue
  );

// Split Passenger
router
  .route("/split")
  .post(
    checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
    hititController.splitPassenger
  );

module.exports = router;
