const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expenseController");
const validateId = require("../middleware/validateId");

router.route("/")
  .get(expenseController.getExpenses)
  .post(expenseController.createExpense);

router.route("/:id")
  .get(validateId("id"), expenseController.getExpenseById)
  .put(validateId("id"), expenseController.updateExpense)
  .delete(validateId("id"), expenseController.deleteExpense);

module.exports = router;

