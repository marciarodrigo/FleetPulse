const Maintenance = require("../models/Maintenance");
const Vehicle = require("../models/Vehicle");

// @desc    Get all maintenance tasks
// @route   GET /api/maintenance
exports.getMaintenance = async (req, res, next) => {
  try {
    const { priority, status, search } = req.query;
    let query = {};

    if (priority && priority !== "All") {
      query.priority = priority;
    }

    if (status && status !== "All") {
      query.status = status;
    }

    let records = await Maintenance.find(query)
      .populate("vehicle", "vehicleNumber make model year driver status")
      .sort({ createdAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      records = records.filter((item) => {
        return (
          item.title?.toLowerCase().includes(s) ||
          item.description?.toLowerCase().includes(s) ||
          item.vehicle?.vehicleNumber?.toLowerCase().includes(s) ||
          item.priority?.toLowerCase().includes(s)
        );
      });
    }

    res.json(records);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single maintenance task by ID
// @route   GET /api/maintenance/:id
exports.getMaintenanceById = async (req, res, next) => {
  try {
    const record = await Maintenance.findById(req.params.id).populate("vehicle");
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Maintenance task not found"
      });
    }
    res.json(record);
  } catch (error) {
    next(error);
  }
};

// @desc    Create maintenance task
// @route   POST /api/maintenance
exports.createMaintenance = async (req, res, next) => {
  try {
    const { vehicle, title, description, priority, status, dueDate, cost } = req.body;

    if (!vehicle) {
      return res.status(400).json({
        success: false,
        message: "Vehicle is required"
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Maintenance title is required"
      });
    }

    const vehicleDoc = await Vehicle.findById(vehicle);
    if (!vehicleDoc) {
      return res.status(404).json({
        success: false,
        message: "Selected vehicle not found"
      });
    }

    const maintenance = new Maintenance({
      vehicle,
      title: title.trim(),
      description: description ? description.trim() : "",
      priority: priority || "Medium",
      status: status || "Pending",
      dueDate: dueDate ? new Date(dueDate) : null,
      cost: cost && !isNaN(Number(cost)) ? Math.max(0, Number(cost)) : 0
    });

    const saved = await maintenance.save();

    // If high priority or pending, update vehicle status if appropriate
    if (priority === "High" && status !== "Completed") {
      vehicleDoc.status = "Maintenance";
      await vehicleDoc.save();
    }

    const populated = await Maintenance.findById(saved._id).populate("vehicle");
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Update maintenance task
// @route   PUT /api/maintenance/:id
exports.updateMaintenance = async (req, res, next) => {
  try {
    const { vehicle, title, description, priority, status, dueDate, cost } = req.body;

    const maintenance = await Maintenance.findById(req.params.id);
    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: "Maintenance task not found"
      });
    }

    if (vehicle) maintenance.vehicle = vehicle;
    if (title !== undefined) maintenance.title = title.trim();
    if (description !== undefined) maintenance.description = description.trim();
    if (priority !== undefined) maintenance.priority = priority;
    if (status !== undefined) maintenance.status = status;
    if (dueDate !== undefined) maintenance.dueDate = dueDate ? new Date(dueDate) : null;
    if (cost !== undefined) maintenance.cost = cost && !isNaN(Number(cost)) ? Math.max(0, Number(cost)) : 0;

    const updated = await maintenance.save();
    const populated = await Maintenance.findById(updated._id).populate("vehicle");
    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete maintenance task
// @route   DELETE /api/maintenance/:id
exports.deleteMaintenance = async (req, res, next) => {
  try {
    const maintenance = await Maintenance.findByIdAndDelete(req.params.id);
    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: "Maintenance task not found"
      });
    }
    res.json({
      success: true,
      message: "Maintenance task deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

