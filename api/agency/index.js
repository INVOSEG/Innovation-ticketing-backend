const express = require("express");
const router = express.Router();
const agencyController = require("./controller");
const checkRole = require("../../lib/middleware/permission");
const multer = require("multer");
const path = require("path");
const ALLOWED_TYPES_FILES = /jpg|jpeg|png|pdf/;
const ALLOWED_TYPES_LOGO = /jpg|jpeg|png/;

// Define storage and fileFilter for general files
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueFileName = `${Date.now()}-Al-Assam${extension}`;
    cb(null, uniqueFileName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpg|jpeg|png|pdf/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPG, PNG, and PDF are allowed."));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: fileFilter,
});

// Define a separate multer instance for the logo
// const logoStorage = multer.diskStorage({
//   destination: "./uploads/logos",
//   filename: function (req, file, cb) {
//     const extension = path.extname(file.originalname).toLowerCase();
//     const uniqueFileName = `${Date.now()}-AgencyLogo${extension}`;
//     cb(null, uniqueFileName);
//   },
// });

// const logoFilter = (req, file, cb) => {
//   const allowedTypes = /jpg|jpeg|png/;
//   const extname = allowedTypes.test(
//     path.extname(file.originalname).toLowerCase()
//   );
//   const mimetype = allowedTypes.test(file.mimetype);

//   if (extname && mimetype) {
//     return cb(null, true);
//   } else {
//     cb(
//       new Error(
//         "Invalid file type. Only JPG, JPEG, and PNG are allowed for logos."
//       )
//     );
//   }
// };

// Define fields for multiple file uploads
const uploadMultiple = upload.fields([
  { name: "logo", maxCount: 1 }, // Single logo upload
  { name: "files", maxCount: 5 }, // Multiple file uploads
]);
// const {
//   authUser,
//   authAdmin,
//   authAgencyOwner,
// } = require("../../lib/utils/verifyToken");
router
  .route("/saleData")
  .get(checkRole(["super_admin"]), agencyController.getSaleData);
router
  .route("/EmployeeData")
  .get(checkRole(["super_admin, agency"]), agencyController.getEmployeeData);

router
  .route("/")
  .get(
    checkRole(["super_admin", "admin", "agency"]),
    agencyController.getAllAgencies
  )
  .post(
    // checkRole(["super_admin", "admin"]),
    (req, res, next) => {
      uploadMultiple(req, res, function (err) {
        if (err) {
          return res
            .status(400)
            .json({ message: "Error uploading files", error: err });
        }
        next(); // Proceed to the next middleware (controller action)
      });
    },
    agencyController.createAgency
  );
router.patch(
  "/status",
  checkRole(["super_admin", "admin"]),
  agencyController.updateAgencyStatus
);
router
  .route("/:id")
  .get(
    // checkRole(["super_admin", "admin", "agency", "sale"]),
    agencyController.getAgencyById
  )
  .put(checkRole(["super_admin", "admin"]), agencyController.updateAgency)
  .delete(checkRole(["super_admin", "admin"]), agencyController.deleteAgency);
// to get logged in agency details
router
  .route("/loggedIn")
  .get(
    checkRole(["super_admin", "admin", "agency"]),
    agencyController.getAgencyById
  );
router.route("/verify/email/:token").get(
  // checkRole(["super_admin", "admin", "agency"]),
  agencyController.verifyEmail
);
router
  .route("/newAccount")
  .post(checkRole(["super_admin"]), agencyController.newAgency);
//coderise.io/install-anydesk-on-ubuntu/

// router
//   .route("/")
//   .get(
//     authUser,
//     agencyController.getAllAgencies
//   )
//   .post(checkRole(["super_admin", "agent"]), agencyController.createAgency);

https: module.exports = router;