const express = require("express");
const router = express.Router();
const maintenanceController = require("../controllers/maintenanceController");
const validateId = require("../middleware/validateId");

router.route("/")
  .get(maintenanceController.getMaintenance)
  .post(maintenanceController.createMaintenance);

router.route("/:id")
  .get(validateId("id"), maintenanceController.getMaintenanceById)
  .put(validateId("id"), maintenanceController.updateMaintenance)
  .delete(validateId("id"), maintenanceController.deleteMaintenance);

module.exports = router;

