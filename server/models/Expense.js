const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      default: null
    },
    category: {
      type: String,
      required: [true, "Expense category is required"],
      enum: ["Maintenance", "Service", "Spare Part", "Fuel", "Insurance", "Toll", "Permit", "Other"],
      default: "Maintenance"
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"]
    },
    date: {
      type: Date,
      default: Date.now
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      default: null
    },
    sparePart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SparePart",
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Expense", expenseSchema);

