const express = require("express");
const router = express.Router();
const roleController = require("./controller");
const {
  authUser,
  authAdmin,
  authAgencyOwner,
} = require("../../lib/utils/verifyToken");
router.route("/roleAgency").get(roleController.getRolesByAgency);
router.route("/").get(roleController.getRoles).post(roleController.createRole);
router
  .route("/:id")
  .get(roleController.getRoleById)
  .put(authAdmin, roleController.updateRole)
  .delete(authAdmin, roleController.deleteRole);
router.patch("/status", roleController.updateRoleStatus);

module.exports = router;
