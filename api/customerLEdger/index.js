const express = require("express");
const router = express.Router();
const checkRole = require("../../lib/middleware/permission");

const processTransaction = require("./controller"); // Import GDS controller

router.post("/process", processTransaction.transaction);

router.get(
  "/getAllLedger",
  checkRole(["super_admin", "SPO", "agency"]),
  processTransaction.getAllLedger
);
router.post(
  "/addsearch",
  checkRole(["sale", "agency", "SPO"]),
  processTransaction.saveRecentSearch
);
router.delete(
  "/deleteRecentSearch/:index",
  checkRole(["sale", "agency", "SPO"]),
  processTransaction.deleteRecentSearch
);

router.get(
  "/getsearch",
  checkRole(["sale", "agency", "SPO"]),
  processTransaction.getRecentSearches
);

module.exports = router;
