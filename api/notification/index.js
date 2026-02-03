const express = require("express");
const router = express.Router();
const Controller = require("./controller");
const NcheckEndDate = require("../../lib/middleware/notificationendDate");
const checkEndDateAll = require("../../lib/middleware/promotionDate");
const multer = require("multer");
const path = require("path");
// Set up multer storage
const storage = multer.diskStorage({
  destination: "./uploads/notification",
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueFileName = `${Date.now()}-AgencyLogo${extension}`;
    cb(null, uniqueFileName);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpg|jpeg|png/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPG, JPEG, and PNG are allowed for logos."
        )
      );
    }
  },
}).single("image"); //

router.post("/create", upload, Controller.createNotification);

router.get("/getAll", checkEndDateAll, Controller.getNotification);

router.get("/get/:id", NcheckEndDate, Controller.getNotificationById);

router.put("/update/:id", upload, Controller.updateNotification);

router.delete("/delete/:id", Controller.deleteNotification);

router.get(
  "/getLatestNotification",
  // NcheckEndDate,
  Controller.getLatestNotification
);

module.exports = router;
