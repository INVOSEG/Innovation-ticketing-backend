const express = require("express");
const router = express.Router();
const tourInvoiceController = require("./controller");

router.post("/create", tourInvoiceController.createTourInvoice);
router.get("/getAll", tourInvoiceController.getAllTourInvoices);
router.get("/getDetails/:id", tourInvoiceController.getTourInvoiceById);
router.put("/update/:id", tourInvoiceController.updateTourInvoice);
router.delete("/delete/:id", tourInvoiceController.deleteTourInvoice);

module.exports = router;
