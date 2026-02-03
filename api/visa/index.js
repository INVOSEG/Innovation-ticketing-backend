const express = require("express");
const router = express.Router();
const visaController = require("./controller");
const checkRole = require("../../lib/middleware/permission");

router.post("/create", visaController.createVisa);
router.get("/getAll", visaController.getAllVisa);
router.patch("/update/:id", visaController.updateVisa);

module.exports = router;
