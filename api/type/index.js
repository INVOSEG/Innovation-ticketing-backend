const express = require("express");
const router = express.Router();
const controller = require("./controller");

router.route("/getAll").get(controller.getAll);
router.route("/create").post(controller.createType);
router.route("/getById/:id").get(controller.getById);
router.route("/update/:id").put(controller.update);
router.route("/cancel/:id").delete(controller.delete);

module.exports = router;
