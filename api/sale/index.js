const express = require("express");
const router = express.Router();
const staffController = require("./controller"); // Import the staff controller

// Ticket Routes
router.post("/create", staffController.createTicket); // Create a new staff

router.get("/getAll", staffController.getAllTickets); // Get all staff
router.get("/getById/:id", staffController.getTicketById); // Get a staff by ID
router.put("/update/:id", staffController.updateTicket); // Update a staff by ID
router.delete("/delete/:id", staffController.deleteTicket); // Delete a staff by ID
router.get("/getInvoiceNumber", staffController.getInvoiceNumber);
module.exports = router;
