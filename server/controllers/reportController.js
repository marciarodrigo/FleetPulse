const Vehicle = require("../models/Vehicle");
const Service = require("../models/Service");
const Maintenance = require("../models/Maintenance");
const SparePart = require("../models/SparePart");
const Expense = require("../models/Expense");

// @desc    Get reports data & analytics
// @route   GET /api/reports
exports.getReports = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find();
    const services = await Service.find().populate("vehicle", "vehicleNumber make model");
    const maintenance = await Maintenance.find().populate("vehicle", "vehicleNumber make model");
    const spareParts = await SparePart.find().populate("vehicle", "vehicleNumber");
    const expenses = await Expense.find().populate("vehicle", "vehicleNumber");

    // KPI Totals
    const totalVehicles = vehicles.length;
    const totalServices = services.length;
    const totalMaintenance = maintenance.length;
    const totalSpareParts = spareParts.length;
    const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);

    // 1. Monthly Maintenance Cost (Last 6 Months)
    const monthlyCost = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = d.toLocaleString("default", { month: "short" });
      const year = d.getFullYear();
      const month = d.getMonth();

      const expenseSum = expenses
        .filter((e) => {
          const ed = new Date(e.date || e.createdAt);
          return ed.getFullYear() === year && ed.getMonth() === month;
        })
        .reduce((sum, e) => sum + (e.amount || 0), 0);

      const serviceCostSum = services
        .filter((s) => {
          const sd = new Date(s.scheduledDate || s.createdAt);
          return sd.getFullYear() === year && sd.getMonth() === month;
        })
        .reduce((sum, s) => sum + (s.cost || 0), 0);

      monthlyCost.push({
        month: monthName,
        amount: Math.max(expenseSum, serviceCostSum) || 0
      });
    }

    // 2. Expense by Category
    const categoryMap = {};
    expenses.forEach((e) => {
      const cat = e.category || "Other";
      categoryMap[cat] = (categoryMap[cat] || 0) + (e.amount || 0);
    });
    const expenseByCategory = Object.keys(categoryMap).map((category) => ({
      category,
      amount: categoryMap[category]
    }));

    // If no expenses yet, provide empty category structure
    if (expenseByCategory.length === 0) {
      ["Maintenance", "Fuel", "Service", "Insurance", "Spare Part"].forEach((c) => {
        expenseByCategory.push({ category: c, amount: 0 });
      });
    }

    // 3. Vehicle Maintenance Frequency (Top vehicles with highest maintenance/service count)
    const vehicleFrequencyMap = {};
    maintenance.forEach((m) => {
      const vNum = m.vehicle?.vehicleNumber || "Unknown";
      vehicleFrequencyMap[vNum] = (vehicleFrequencyMap[vNum] || 0) + 1;
    });
    services.forEach((s) => {
      const vNum = s.vehicle?.vehicleNumber || "Unknown";
      vehicleFrequencyMap[vNum] = (vehicleFrequencyMap[vNum] || 0) + 1;
    });

    const vehicleFrequency = Object.keys(vehicleFrequencyMap).map((vNum) => ({
      vehicleNumber: vNum,
      count: vehicleFrequencyMap[vNum]
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    // 4. Service Status Distribution
    const serviceStatusMap = { Scheduled: 0, "In Progress": 0, Completed: 0, Overdue: 0 };
    services.forEach((s) => {
      if (serviceStatusMap[s.status] !== undefined) {
        serviceStatusMap[s.status]++;
      } else {
        serviceStatusMap[s.status] = 1;
      }
    });
    const serviceDistribution = Object.keys(serviceStatusMap).map((status) => ({
      status,
      count: serviceStatusMap[status]
    }));

    res.json({
      summary: {
        totalVehicles,
        totalServices,
        totalMaintenance,
        totalSpareParts,
        totalExpenses
      },
      charts: {
        monthlyCost,
        expenseByCategory,
        vehicleFrequency,
        serviceDistribution
      },
      raw: {
        vehicles,
        services,
        maintenance,
        spareParts,
        expenses
      }
    });
  } catch (error) {
    next(error);
  }
};

