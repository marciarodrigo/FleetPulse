const mongoose = require("mongoose");

const sparePartSchema = new mongoose.Schema(
  {
    partName: {
      type: String,
      required: [true, "Part name is required"],
      trim: true
    },
    partNumber: {
      type: String,
      required: [true, "Part number is required"],
      trim: true,
      uppercase: true
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      default: "General"
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      default: 0,
      min: [0, "Quantity cannot be negative"]
    },
    minimumStock: {
      type: Number,
      default: 5,
      min: [0, "Minimum stock cannot be negative"]
    },
    unitCost: {
      type: Number,
      default: 0,
      min: [0, "Unit cost cannot be negative"]
    },
    supplier: {
      type: String,
      trim: true,
      default: ""
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      default: null
    },
    lastReplaced: {
      type: Date,
      default: null
    },
    notes: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("SparePart", sparePartSchema);

