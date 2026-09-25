const Service = require("../models/Service");
const Vehicle = require("../models/Vehicle");

// @desc    Get all services
// @route   GET /api/services
exports.getServices = async (req, res, next) => {
  try {
    const { status, vehicleId, search } = req.query;
    let query = {};

    if (status && status !== "All") {
      query.status = status;
    }

    if (vehicleId) {
      query.vehicle = vehicleId;
    }

    let services = await Service.find(query)
      .populate("vehicle", "vehicleNumber make model year driver status")
      .sort({ scheduledDate: -1 });

    if (search) {
      const s = search.toLowerCase();
      services = services.filter((item) => {
        return (
          item.serviceType?.toLowerCase().includes(s) ||
          item.technician?.toLowerCase().includes(s) ||
          item.description?.toLowerCase().includes(s) ||
          item.vehicle?.vehicleNumber?.toLowerCase().includes(s) ||
          item.vehicle?.driver?.toLowerCase().includes(s)
        );
      });
    }

    res.json(services);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single service by ID
// @route   GET /api/services/:id
exports.getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).populate("vehicle");
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service record not found"
      });
    }
    res.json(service);
  } catch (error) {
    next(error);
  }
};

// @desc    Create service record
// @route   POST /api/services
exports.createService = async (req, res, next) => {
  try {
    const {
      vehicle,
      serviceType,
      scheduledDate,
      completedDate,
      status,
      technician,
      description,
      cost,
      notes
    } = req.body;

    if (!vehicle) {
      return res.status(400).json({
        success: false,
        message: "Vehicle is required"
      });
    }

    if (!serviceType || !serviceType.trim()) {
      return res.status(400).json({
        success: false,
        message: "Service type is required"
      });
    }

    if (!scheduledDate) {
      return res.status(400).json({
        success: false,
        message: "Scheduled date is required"
      });
    }

    const vehicleDoc = await Vehicle.findById(vehicle);
    if (!vehicleDoc) {
      return res.status(404).json({
        success: false,
        message: "Selected vehicle not found"
      });
    }

    const service = new Service({
      vehicle,
      serviceType: serviceType.trim(),
      scheduledDate: new Date(scheduledDate),
      completedDate: completedDate ? new Date(completedDate) : null,
      status: status || "Scheduled",
      technician: technician ? technician.trim() : "",
      description: description ? description.trim() : "",
      cost: cost && !isNaN(Number(cost)) ? Math.max(0, Number(cost)) : 0,
      notes: notes ? notes.trim() : ""
    });

    const savedService = await service.save();
    const populated = await Service.findById(savedService._id).populate("vehicle");

    // Update vehicle's last or next service date if completed or scheduled
    if (status === "Completed") {
      vehicleDoc.lastServiceDate = completedDate ? new Date(completedDate) : new Date();
      await vehicleDoc.save();
    } else if (status === "Scheduled") {
      if (!vehicleDoc.nextServiceDate || new Date(scheduledDate) < new Date(vehicleDoc.nextServiceDate)) {
        vehicleDoc.nextServiceDate = new Date(scheduledDate);
        await vehicleDoc.save();
      }
    }

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Update service record
// @route   PUT /api/services/:id
exports.updateService = async (req, res, next) => {
  try {
    const {
      vehicle,
      serviceType,
      scheduledDate,
      completedDate,
      status,
      technician,
      description,
      cost,
      notes
    } = req.body;

    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service record not found"
      });
    }

    if (vehicle) service.vehicle = vehicle;
    if (serviceType !== undefined) service.serviceType = serviceType.trim();
    if (scheduledDate !== undefined) service.scheduledDate = new Date(scheduledDate);
    if (completedDate !== undefined) service.completedDate = completedDate ? new Date(completedDate) : null;
    if (status !== undefined) service.status = status;
    if (technician !== undefined) service.technician = technician.trim();
    if (description !== undefined) service.description = description.trim();
    if (cost !== undefined) service.cost = cost && !isNaN(Number(cost)) ? Math.max(0, Number(cost)) : 0;
    if (notes !== undefined) service.notes = notes.trim();

    const updatedService = await service.save();
    const populated = await Service.findById(updatedService._id).populate("vehicle");
    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete service record
// @route   DELETE /api/services/:id
exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service record not found"
      });
    }
    res.json({
      success: true,
      message: "Service record deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

