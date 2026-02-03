const express = require("express");
const router = express.Router();
const staffController = require("./controller");
const checkPermission = require("../../lib/middleware/checkPermission");
const checkToken = require("../../lib/middleware/checkToken");
const checkRole = require("../../lib/middleware/permission");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "./uploads/payments",
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueFileName = `${Date.now()}-payment${extension}`;
    cb(null, uniqueFileName);
  },
});

const uploads = multer({
  storage: storage,
}).array("images");

router
  .route("/create")
  .post(
    uploads,
    checkToken,
    checkRole(["super_admin", "agency"]),
    staffController.createPayment
  );
router.route("/getAll").get(
  checkToken,
  checkRole(["super_admin", "agency"]),
  // checkPermission("usersCreate"),
  staffController.getAllPayments
);

router.route("/getById/:id").get(
  checkToken,
  checkRole(["super_admin", "agency"]),
  // checkPermission("usersCreate"),
  staffController.getPaymentById
);

router
  .route("/delete/:id")
  .delete(
    checkToken,
    checkRole(["super_admin", "agency"]),
    staffController.deletePayment
  );
router
  .route("/update/:id")
  .patch(
    checkToken,
    checkRole(["super_admin", "agency"]),
    staffController.updatePayment
  );

module.exports = router;
