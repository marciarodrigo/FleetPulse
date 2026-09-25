const Expense = require("../models/Expense");

// @desc    Get all expenses
// @route   GET /api/expenses
exports.getExpenses = async (req, res, next) => {
  try {
    const { category, vehicleId, startDate, endDate, search } = req.query;
    let query = {};

    if (category && category !== "All") {
      query.category = category;
    }

    if (vehicleId && vehicleId !== "All") {
      query.vehicle = vehicleId;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    let expenses = await Expense.find(query)
      .populate("vehicle", "vehicleNumber make model")
      .populate("service", "serviceType scheduledDate")
      .populate("sparePart", "partName partNumber")
      .sort({ date: -1 });

    if (search) {
      const s = search.toLowerCase();
      expenses = expenses.filter((e) => {
        return (
          e.description?.toLowerCase().includes(s) ||
          e.category?.toLowerCase().includes(s) ||
          e.vehicle?.vehicleNumber?.toLowerCase().includes(s)
        );
      });
    }

    res.json(expenses);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single expense by ID
// @route   GET /api/expenses/:id
exports.getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate("vehicle")
      .populate("service")
      .populate("sparePart");

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }
    res.json(expense);
  } catch (error) {
    next(error);
  }
};

// @desc    Create expense
// @route   POST /api/expenses
exports.createExpense = async (req, res, next) => {
  try {
    const { vehicle, category, amount, date, description, service, sparePart } = req.body;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Expense category is required"
      });
    }

    if (amount === undefined || isNaN(Number(amount)) || Number(amount) < 0) {
      return res.status(400).json({
        success: false,
        message: "Valid positive amount is required"
      });
    }

    const expense = new Expense({
      vehicle: vehicle || null,
      category,
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
      description: description ? description.trim() : "",
      service: service || null,
      sparePart: sparePart || null
    });

    const saved = await expense.save();
    const populated = await Expense.findById(saved._id)
      .populate("vehicle")
      .populate("service")
      .populate("sparePart");

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
exports.updateExpense = async (req, res, next) => {
  try {
    const { vehicle, category, amount, date, description, service, sparePart } = req.body;

    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }

    if (vehicle !== undefined) expense.vehicle = vehicle || null;
    if (category !== undefined) expense.category = category;
    if (amount !== undefined) expense.amount = Math.max(0, Number(amount));
    if (date !== undefined) expense.date = date ? new Date(date) : new Date();
    if (description !== undefined) expense.description = description.trim();
    if (service !== undefined) expense.service = service || null;
    if (sparePart !== undefined) expense.sparePart = sparePart || null;

    const updated = await expense.save();
    const populated = await Expense.findById(updated._id)
      .populate("vehicle")
      .populate("service")
      .populate("sparePart");

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }
    res.json({
      success: true,
      message: "Expense deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

