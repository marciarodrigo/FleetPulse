const SparePart = require("../models/SparePart");

// @desc    Get all spare parts
// @route   GET /api/spare-parts
exports.getSpareParts = async (req, res, next) => {
  try {
    const { category, stockStatus, search } = req.query;
    let query = {};

    if (category && category !== "All") {
      query.category = category;
    }

    let parts = await SparePart.find(query)
      .populate("vehicle", "vehicleNumber make model")
      .sort({ createdAt: -1 });

    if (stockStatus && stockStatus !== "All") {
      parts = parts.filter((p) => {
        if (stockStatus === "Out of Stock") return p.quantity <= 0;
        if (stockStatus === "Low Stock") return p.quantity > 0 && p.quantity <= p.minimumStock;
        if (stockStatus === "In Stock") return p.quantity > p.minimumStock;
        return true;
      });
    }

    if (search) {
      const s = search.toLowerCase();
      parts = parts.filter((p) => {
        return (
          p.partName?.toLowerCase().includes(s) ||
          p.partNumber?.toLowerCase().includes(s) ||
          p.category?.toLowerCase().includes(s) ||
          p.supplier?.toLowerCase().includes(s)
        );
      });
    }

    res.json(parts);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single spare part by ID
// @route   GET /api/spare-parts/:id
exports.getSparePartById = async (req, res, next) => {
  try {
    const part = await SparePart.findById(req.params.id).populate("vehicle");
    if (!part) {
      return res.status(404).json({
        success: false,
        message: "Spare part not found"
      });
    }
    res.json(part);
  } catch (error) {
    next(error);
  }
};

// @desc    Create spare part
// @route   POST /api/spare-parts
exports.createSparePart = async (req, res, next) => {
  try {
    const {
      partName,
      partNumber,
      category,
      quantity,
      minimumStock,
      unitCost,
      supplier,
      vehicle,
      lastReplaced,
      notes
    } = req.body;

    if (!partName || !partName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Part name is required"
      });
    }

    if (!partNumber || !partNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: "Part number is required"
      });
    }

    const part = new SparePart({
      partName: partName.trim(),
      partNumber: partNumber.trim().toUpperCase(),
      category: category || "General",
      quantity: quantity !== undefined && !isNaN(Number(quantity)) ? Math.max(0, Number(quantity)) : 0,
      minimumStock: minimumStock !== undefined && !isNaN(Number(minimumStock)) ? Math.max(0, Number(minimumStock)) : 5,
      unitCost: unitCost !== undefined && !isNaN(Number(unitCost)) ? Math.max(0, Number(unitCost)) : 0,
      supplier: supplier ? supplier.trim() : "",
      vehicle: vehicle || null,
      lastReplaced: lastReplaced ? new Date(lastReplaced) : null,
      notes: notes ? notes.trim() : ""
    });

    const saved = await part.save();
    const populated = await SparePart.findById(saved._id).populate("vehicle");
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Update spare part
// @route   PUT /api/spare-parts/:id
exports.updateSparePart = async (req, res, next) => {
  try {
    const {
      partName,
      partNumber,
      category,
      quantity,
      minimumStock,
      unitCost,
      supplier,
      vehicle,
      lastReplaced,
      notes
    } = req.body;

    const part = await SparePart.findById(req.params.id);
    if (!part) {
      return res.status(404).json({
        success: false,
        message: "Spare part not found"
      });
    }

    if (partName !== undefined) part.partName = partName.trim();
    if (partNumber !== undefined) part.partNumber = partNumber.trim().toUpperCase();
    if (category !== undefined) part.category = category;
    if (quantity !== undefined) part.quantity = Math.max(0, Number(quantity));
    if (minimumStock !== undefined) part.minimumStock = Math.max(0, Number(minimumStock));
    if (unitCost !== undefined) part.unitCost = Math.max(0, Number(unitCost));
    if (supplier !== undefined) part.supplier = supplier.trim();
    if (vehicle !== undefined) part.vehicle = vehicle || null;
    if (lastReplaced !== undefined) part.lastReplaced = lastReplaced ? new Date(lastReplaced) : null;
    if (notes !== undefined) part.notes = notes.trim();

    const updated = await part.save();
    const populated = await SparePart.findById(updated._id).populate("vehicle");
    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete spare part
// @route   DELETE /api/spare-parts/:id
exports.deleteSparePart = async (req, res, next) => {
  try {
    const part = await SparePart.findByIdAndDelete(req.params.id);
    if (!part) {
      return res.status(404).json({
        success: false,
        message: "Spare part not found"
      });
    }
    res.json({
      success: true,
      message: "Spare part deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

