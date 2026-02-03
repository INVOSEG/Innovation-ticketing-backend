const express = require("express");
const router = express.Router();
const bookController = require("./controller"); // Import GDS controller
const multer = require("multer");
const path = require("path");
// Set up multer storage
const storage = multer.diskStorage({
  destination: "./uploads/book",
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueFileName = `${Date.now()}-ledger${extension}`;
    cb(null, uniqueFileName);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpg|jpeg|png/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPG, JPEG, and PNG are allowed."));
    }
  },
}).array("chequeImage", 5); // Accept up to 5 images

// GDS Routes
router.post("/create", upload, bookController.createBook);
router.get("/getAll", bookController.getAllBooks);
router.get("/getById/:id", bookController.getBookById);
router.get("/getByagencyId/:agencyId", bookController.getBookByagencyId);
router.put("/update/:id", bookController.updateBook);
router.delete("/delete/:id", bookController.deleteBook);

module.exports = router;
