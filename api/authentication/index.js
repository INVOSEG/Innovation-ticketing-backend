const express = require("express");
const router = express.Router();
const { authUser } = require("../../lib/utils/verifyToken");
const checkToken = require("../../lib/middleware/checkToken");

const controller = require("./controller");

router.post("/login", controller.login);
router.post("/verifyOTP", controller.verifyOTP);
router.post("/resendOTP", controller.resendOTP);
router.post("/logout", controller.logout);
router.post("/register", controller.register);
router.post("/forgotPassword", controller.forgotPassword);
router.post("/verifyToken", authUser, controller.verify);
router.post("/resetPassword/:token", controller.resetPassword);
router.post("/refreshToken", controller.refreshToken);
// router.post("/verifyEmail" ,controller.verify);
router.post("/verifyEmail", controller.verfiyEmail);
router.get("/verify/email/:token", controller.verfiyEmaill);
router.post("/reverifyEmail", controller.revarify);
router.patch("/updatePassword", checkToken, controller.updateUserPassword);

module.exports = router;
