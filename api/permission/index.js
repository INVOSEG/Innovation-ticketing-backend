const express = require("express");
const router = express.Router();
const permissionController = require("./controller");

router.route("/create").post(permissionController.createPermisssion);
router.route("/getAll").get(permissionController.getAllUserPermission);
router.route("/getSingle/:id").get(permissionController.findPermissionById);
router.route("/delete/:id").delete(permissionController.deletePermission);
router.route("/update/:id").put(permissionController.updatePermission);
router.patch("/status", permissionController.updatePermissionStatus);

module.exports = router;
