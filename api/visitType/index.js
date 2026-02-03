const express = require("express");
const router = express.Router();
const visitTypeController = require("./controller");

// Create VisitType
router.post("/create", visitTypeController.createVisitType);

// Get All VisitTypes
router.get("/getAll", visitTypeController.getAllVisitTypes);

// Get VisitType by ID
router.get("/getById/:id", visitTypeController.getVisitTypeById);

// Update VisitType
router.put("/update/:id", visitTypeController.updateVisitType);

// Delete VisitType
router.delete("/delete/:id", visitTypeController.deleteVisitType);

module.exports = router;
