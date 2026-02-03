const express = require("express");
const router = express.Router();
const spoController = require("./controller");

// Create SPO
router.post("/create", spoController.createSpo);

// Get All SPOs
router.get("/getAll", spoController.getAllSpos);

// Get SPO by ID
router.get("/getById/:id", spoController.getSpoById);

// Update SPO
router.put("/update/:id", spoController.updateSpo);

// Delete SPO
router.delete("/delete/:id", spoController.deleteSpo);

module.exports = router;
