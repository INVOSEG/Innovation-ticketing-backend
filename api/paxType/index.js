const express = require("express");
const router = express.Router();
const paxTypeController = require("./controller"); // Import PaxType controller

// PaxType Routes
router.post("/create", paxTypeController.createPaxType);
router.get("/getAll", paxTypeController.getAllPaxTypes);
router.get("/getById/:id", paxTypeController.getPaxTypeById);
router.put("/update/:id", paxTypeController.updatePaxType);
router.delete("/delete/:id", paxTypeController.deletePaxType);

module.exports = router;
