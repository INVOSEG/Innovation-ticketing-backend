const express = require("express");
const router = express.Router();
const { authUser } = require("../../lib/utils/verifyToken");
const path = require("path");
const multer = require("multer");
const checkRole = require("../../lib/middleware/permission");

const controller = require("./controller");

const storage = multer.diskStorage({
  destination: "./uploads/user/",
  filename: function (req, file, cb) {
    const { body } = req;
    const userName = "mandy";
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueFileName = `${userName}-${Date.now()}${extension}`;
    cb(null, uniqueFileName);
  },
});

const upload = multer({
  storage: storage,
  // limits: { fileSize: 1 * 1024 * 1024 },
});

// router
//   .route("/profile")
//   .get(authUser, controller.userProfile)
//   .patch(authUser, controller.updateProfile);

router.get("/agent", controller.agentList);
// router.patch('/status/:id', controller.updateUserStatus);
router.get("/userRoleOwner", controller.getUserRoleOwner);
router.get("/userRoleUser", controller.getUserRoleUser);
router.get(
  "/getAllSPOs",
  checkRole(["super_admin", "staff", "marketing", "agency", "sale", "SPO"]),
  controller.getAllSPOs
);

router.patch("/status", controller.updateUserStatus);

// router.route('/daily/:id')
// .get(roleController.getRolesByAgency);

router
  .route("/")
  .get(controller.userList)
  .patch(controller.updatePassword)
  .post(controller.createUser);

router
  .route("/:id")
  // .get(authUser, controller.userDetail)
  .get(controller.userProfile)
  .put(upload.single("profileImg"), controller.updateProfile)
  .delete(controller.deleteUser);

module.exports = router;

// router.route( "/daily" )
//   .get( controller.getDeals )
//   .post( upload, controller.createDeal );
// // soft deleted services
// // router.route( "/deleted" ).get( controller.getDeletedServices );
// // // hard delete
// // router.route( "/deleted/:id" ).delete( controller.hardDeleteService );

// router.route("/serviceAddToDeal").post(controller.addServiceToDeal);
// router.route("/serviceRemoveFromDeal").post(controller.removeServiceFromDeal);

// router
//   .route( "/daily/:id" )
//   .get( controller.getDeal )
// //   .delete( controller.deleteService )
// //   .patch( controller.updateService );

// module.exports = router;
