const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "Vehicle reference is required"]
    },
    title: {
      type: String,
      required: [true, "Maintenance title is required"],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium"
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending"
    },
    dueDate: {
      type: Date,
      default: null
    },
    cost: {
      type: Number,
      default: 0,
      min: [0, "Cost cannot be negative"]
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Maintenance", maintenanceSchema);

