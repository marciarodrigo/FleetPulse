const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "Vehicle reference is required"]
    },
    serviceType: {
      type: String,
      required: [true, "Service type is required"],
      trim: true
    },
    scheduledDate: {
      type: Date,
      required: [true, "Scheduled date is required"]
    },
    completedDate: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ["Scheduled", "In Progress", "Completed", "Overdue"],
      default: "Scheduled"
    },
    technician: {
      type: String,
      trim: true,
      default: ""
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    cost: {
      type: Number,
      default: 0,
      min: [0, "Cost cannot be negative"]
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

module.exports = mongoose.model("Service", serviceSchema);

