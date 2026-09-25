const Vehicle = require("../models/Vehicle");
const Service = require("../models/Service");
const Maintenance = require("../models/Maintenance");
const Expense = require("../models/Expense");
const SparePart = require("../models/SparePart");

// @desc    Get dashboard metrics & analytics
// @route   GET /api/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find();
    const services = await Service.find().populate("vehicle", "vehicleNumber");
    const maintenance = await Maintenance.find().populate("vehicle", "vehicleNumber make model");
    const expenses = await Expense.find();
    const spareParts = await SparePart.find();

    // Fleet stats
    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter((v) => v.status === "Active").length;
    const inServiceVehicles = vehicles.filter((v) => v.status === "In Service").length;
    const maintenanceVehicles = vehicles.filter((v) => v.status === "Maintenance").length;
    const inactiveVehicles = vehicles.filter((v) => v.status === "Inactive").length;

    // Service stats
    const now = new Date();
    const scheduledServices = services.filter((s) => s.status === "Scheduled").length;
    const inProgressServices = services.filter((s) => s.status === "In Progress").length;
    const completedServices = services.filter((s) => s.status === "Completed").length;
    const overdueServices = services.filter((s) => {
      if (s.status === "Completed") return false;
      return new Date(s.scheduledDate) < now || s.status === "Overdue";
    }).length;

    // Upcoming services (next 30 days)
    const upcomingServicesCount = vehicles.filter((v) => {
      if (!v.nextServiceDate) return false;
      const d = new Date(v.nextServiceDate);
      const diff = d.getTime() - now.getTime();
      const days = diff / (1000 * 60 * 60 * 24);
      return days >= 0 && days <= 30;
    }).length;

    // High priority maintenance alerts
    const highPriorityMaintenance = maintenance
      .filter((m) => m.priority === "High" && m.status !== "Completed")
      .map((m) => ({
        id: m._id,
        vehicle: m.vehicle?.vehicleNumber || "Fleet Vehicle",
        message: m.title || "Critical maintenance required",
        dueDate: m.dueDate,
        priority: m.priority,
        status: m.status
      }));

    // Vehicles with status 'Maintenance' also add to high priority if not already there
    const vehicleMaintenanceAlerts = vehicles
      .filter((v) => v.status === "Maintenance")
      .filter((v) => !highPriorityMaintenance.some((h) => h.vehicle === v.vehicleNumber))
      .map((v) => ({
        id: v._id,
        vehicle: v.vehicleNumber,
        message: `Vehicle flagged in Maintenance mode (${v.make} ${v.model})`,
        dueDate: v.nextServiceDate,
        priority: "High",
        status: "In Progress"
      }));

    const combinedAlerts = [...highPriorityMaintenance, ...vehicleMaintenanceAlerts];

    // Total Maintenance Costs (sum of expenses in Maintenance + Service + Spare Part, or total expenses)
    const totalExpenses = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const serviceCosts = services.reduce((acc, curr) => acc + (curr.cost || 0), 0);
    const maintenanceCosts = maintenance.reduce((acc, curr) => acc + (curr.cost || 0), 0);
    const totalMaintenanceSpending = Math.max(totalExpenses, serviceCosts + maintenanceCosts);

    // Monthly Analytics for chart (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthYear = d.toLocaleString("default", { month: "short" });
      const year = d.getFullYear();
      const month = d.getMonth();

      const monthlyExpenses = expenses.filter((e) => {
        const ed = new Date(e.date || e.createdAt);
        return ed.getFullYear() === year && ed.getMonth() === month;
      }).reduce((sum, e) => sum + (e.amount || 0), 0);

      const monthlyServiceCost = services.filter((s) => {
        const sd = new Date(s.scheduledDate || s.createdAt);
        return sd.getFullYear() === year && sd.getMonth() === month;
      }).reduce((sum, s) => sum + (s.cost || 0), 0);

      monthlyData.push({
        month: monthYear,
        cost: Math.max(monthlyExpenses, monthlyServiceCost) || 0,
        services: services.filter((s) => {
          const sd = new Date(s.scheduledDate || s.createdAt);
          return sd.getFullYear() === year && sd.getMonth() === month;
        }).length
      });
    }

    res.json({
      fleet: {
        total: totalVehicles,
        active: activeVehicles,
        inService: inServiceVehicles,
        needsMaintenance: maintenanceVehicles,
        inactive: inactiveVehicles
      },
      services: {
        scheduled: scheduledServices || upcomingServicesCount,
        inProgress: inProgressServices,
        overdue: overdueServices,
        completed: completedServices,
        upcoming: upcomingServicesCount
      },
      maintenance: {
        active: maintenance.filter((m) => m.status !== "Completed").length || maintenanceVehicles,
        highPriority: combinedAlerts
      },
      costs: {
        total: totalMaintenanceSpending,
        services: serviceCosts,
        maintenance: maintenanceCosts,
        monthlyTrend: monthlyData
      },
      spareParts: {
        total: spareParts.length,
        lowStock: spareParts.filter((p) => p.quantity > 0 && p.quantity <= p.minimumStock).length,
        outOfStock: spareParts.filter((p) => p.quantity <= 0).length
      }
    });
  } catch (error) {
    next(error);
  }
};

