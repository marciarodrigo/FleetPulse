const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    vehicleNumber: {
      type: String,
      required: [true, "Vehicle number is required"],
      unique: true,
      trim: true,
      uppercase: true
    },
    vehicleType: {
      type: String,
      required: [true, "Vehicle type is required"],
      enum: ["Car", "Van", "Truck", "Bus", "Motorcycle", "Other"],
      default: "Truck"
    },
    make: {
      type: String,
      trim: true,
      default: ""
    },
    model: {
      type: String,
      trim: true,
      default: ""
    },
    year: {
      type: Number,
      default: null
    },
    driver: {
      type: String,
      trim: true,
      default: ""
    },
    mileage: {
      type: Number,
      default: 0,
      min: [0, "Mileage cannot be negative"]
    },
    status: {
      type: String,
      enum: ["Active", "In Service", "Maintenance", "Inactive"],
      default: "Active"
    },
    lastServiceDate: {
      type: Date,
      default: null
    },
    nextServiceDate: {
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

module.exports = mongoose.model("Vehicle", vehicleSchema);

