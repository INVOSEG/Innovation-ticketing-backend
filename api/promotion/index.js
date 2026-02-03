const express = require("express");
const router = express.Router();
const promotionController = require("./controller");
const checkEndDate = require("../../lib/middleware/checkEndDate");
const checkEndDateAll = require("../../lib/middleware/promotionDate");
const multer = require("multer");
const path = require("path");
const checkRole = require("../../lib/middleware/permission");

// Set up multer storage
const storage = multer.diskStorage({
  destination: "./uploads/promotion",
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueFileName = `${Date.now()}-AgencyLogo${extension}`;
    cb(null, uniqueFileName);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5 MB
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
}).single("image");

router.post(
  "/create",
  checkRole(["super_admin"]),
  upload,
  promotionController.createPromotion
);

router.get("/getAll", checkEndDateAll, promotionController.getPromotions);

router.get("/get/:id", checkEndDate, promotionController.getPromotionById);

router.put(
  "/promotions/:id",
  checkRole(["super_admin"]),
  checkEndDate,
  promotionController.updatePromotion
);

router.delete(
  "/delete/:id",
  checkRole(["super_admin"]),
  checkEndDate,
  promotionController.deletePromotion
);

module.exports = router;
