const Vehicle = require("../models/Vehicle");

// @desc    Get all vehicles
// @route   GET /api/vehicles
exports.getVehicles = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status && status !== "All") {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { vehicleNumber: searchRegex },
        { make: searchRegex },
        { model: searchRegex },
        { driver: searchRegex },
        { vehicleType: searchRegex }
      ];
    }

    const vehicles = await Vehicle.find(query).sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single vehicle by ID
// @route   GET /api/vehicles/:id
exports.getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found"
      });
    }
    res.json(vehicle);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new vehicle
// @route   POST /api/vehicles
exports.createVehicle = async (req, res, next) => {
  try {
    const {
      vehicleNumber,
      vehicleType,
      make,
      model,
      year,
      driver,
      mileage,
      status,
      lastServiceDate,
      nextServiceDate,
      notes
    } = req.body;

    if (!vehicleNumber || !vehicleNumber.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: "Vehicle number is required"
      });
    }

    if (!vehicleType || !vehicleType.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: "Vehicle type is required"
      });
    }

    const formattedVehicleNumber = vehicleNumber.toString().trim().toUpperCase();

    // Check for existing vehicle number
    const existing = await Vehicle.findOne({ vehicleNumber: formattedVehicleNumber });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Vehicle with number "${formattedVehicleNumber}" already exists.`
      });
    }

    const vehicle = new Vehicle({
      vehicleNumber: formattedVehicleNumber,
      vehicleType: vehicleType.toString().trim(),
      make: make ? make.toString().trim() : "",
      model: model ? model.toString().trim() : "",
      year: year && !isNaN(Number(year)) ? Number(year) : null,
      driver: driver ? driver.toString().trim() : "",
      mileage: mileage && !isNaN(Number(mileage)) ? Math.max(0, Number(mileage)) : 0,
      status: status || "Active",
      lastServiceDate: lastServiceDate ? new Date(lastServiceDate) : null,
      nextServiceDate: nextServiceDate ? new Date(nextServiceDate) : null,
      notes: notes ? notes.toString().trim() : ""
    });

    const savedVehicle = await vehicle.save();
    console.log(`[API] Created vehicle: ${savedVehicle.vehicleNumber} (ID: ${savedVehicle._id})`);
    res.status(201).json(savedVehicle);
  } catch (error) {
    next(error);
  }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
exports.updateVehicle = async (req, res, next) => {
  try {
    const {
      vehicleNumber,
      vehicleType,
      make,
      model,
      year,
      driver,
      mileage,
      status,
      lastServiceDate,
      nextServiceDate,
      notes
    } = req.body;

    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found"
      });
    }

    if (vehicleNumber) {
      const formattedVehicleNumber = vehicleNumber.toString().trim().toUpperCase();
      const existing = await Vehicle.findOne({
        vehicleNumber: formattedVehicleNumber,
        _id: { $ne: req.params.id }
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Vehicle number "${formattedVehicleNumber}" is already in use by another vehicle.`
        });
      }
      vehicle.vehicleNumber = formattedVehicleNumber;
    }

    if (vehicleType !== undefined) vehicle.vehicleType = vehicleType;
    if (make !== undefined) vehicle.make = make.toString().trim();
    if (model !== undefined) vehicle.model = model.toString().trim();
    if (year !== undefined) vehicle.year = year && !isNaN(Number(year)) ? Number(year) : null;
    if (driver !== undefined) vehicle.driver = driver.toString().trim();
    if (mileage !== undefined) vehicle.mileage = mileage && !isNaN(Number(mileage)) ? Math.max(0, Number(mileage)) : 0;
    if (status !== undefined) vehicle.status = status;
    if (lastServiceDate !== undefined) vehicle.lastServiceDate = lastServiceDate ? new Date(lastServiceDate) : null;
    if (nextServiceDate !== undefined) vehicle.nextServiceDate = nextServiceDate ? new Date(nextServiceDate) : null;
    if (notes !== undefined) vehicle.notes = notes.toString().trim();

    const updatedVehicle = await vehicle.save();
    res.json(updatedVehicle);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
exports.deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found"
      });
    }

    res.json({
      success: true,
      message: `Vehicle ${vehicle.vehicleNumber} deleted successfully`
    });
  } catch (error) {
    next(error);
  }
};

