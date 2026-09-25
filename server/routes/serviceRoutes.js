const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");
const validateId = require("../middleware/validateId");

router.route("/")
  .get(serviceController.getServices)
  .post(serviceController.createService);

router.route("/:id")
  .get(validateId("id"), serviceController.getServiceById)
  .put(validateId("id"), serviceController.updateService)
  .delete(validateId("id"), serviceController.deleteService);

module.exports = router;

