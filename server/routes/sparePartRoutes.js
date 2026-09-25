const express = require("express");
const router = express.Router();
const sparePartController = require("../controllers/sparePartController");
const validateId = require("../middleware/validateId");

router.route("/")
  .get(sparePartController.getSpareParts)
  .post(sparePartController.createSparePart);

router.route("/:id")
  .get(validateId("id"), sparePartController.getSparePartById)
  .put(validateId("id"), sparePartController.updateSparePart)
  .delete(validateId("id"), sparePartController.deleteSparePart);

module.exports = router;

