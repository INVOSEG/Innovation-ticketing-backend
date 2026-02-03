const express = require("express");
const router = express.Router();
const paxController = require("./controller");
const checkRole = require("../../lib/middleware/permission");

router.post("/create", paxController.createPax);
router.get("/getAll", paxController.getAllPax);
router.get("/search", paxController.searchPax);
router.get("/getDetails/:id", paxController.getPaxById);
router.put("/update/:id", paxController.updatePax);
router.delete("/delete/:id", paxController.deletePax);
router.get("/code", paxController.getNextCode);

module.exports = router;
