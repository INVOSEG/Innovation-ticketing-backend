const express = require("express");
const router = express.Router();
const gdsController = require("./controller"); // Import GDS controller

// GDS Routes
router.post("/create", gdsController.createGDS);
router.get("/getAll", gdsController.getAllGDS);
router.get("/getById/:id", gdsController.getGDSById);
router.put("/update/:id", gdsController.updateGDS);
router.delete("/delete/:id", gdsController.deleteGDS);
router.get("/code", gdsController.getNextTitleCode);

module.exports = router;
