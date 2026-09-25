const express = require("express");
const router = express.Router();
const vehicleController = require("../controllers/vehicleController");
const validateId = require("../middleware/validateId");

router.route("/")
  .get(vehicleController.getVehicles)
  .post(vehicleController.createVehicle);

router.route("/:id")
  .get(validateId("id"), vehicleController.getVehicleById)
  .put(validateId("id"), vehicleController.updateVehicle)
  .delete(validateId("id"), vehicleController.deleteVehicle);

module.exports = router;

