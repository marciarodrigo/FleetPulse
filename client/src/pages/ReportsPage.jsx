import React, { useState, useEffect } from "react";
import {
  Download,
  FileText,
  Truck,
  Wrench,
  Settings,
  Package,
  IndianRupee,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon
} from "lucide-react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import api from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

const ReportsPage = ({ notify }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.getReports();
      setData(res);
    } catch (err) {
      setError(err.message || "Failed to load reports data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const exportCSV = () => {
    if (!data) return;

    try {
      let csvContent = "data:text/csv;charset=utf-8,";

      // 1. Header
      csvContent += "FLEETPULSE FLEET OPERATIONS & MAINTENANCE REPORT\r\n";
      csvContent += `Generated On,${new Date().toLocaleString()}\r\n\r\n`;

      // 2. Summary
      csvContent += "EXECUTIVE SUMMARY\r\n";
      csvContent += `Total Fleet Assets,${data.summary?.totalVehicles || 0}\r\n`;
      csvContent += `Total Services Performed,${data.summary?.totalServices || 0}\r\n`;
      csvContent += `Total Maintenance Tickets,${data.summary?.totalMaintenance || 0}\r\n`;
      csvContent += `Total Spare Parts in Stock,${data.summary?.totalSpareParts || 0}\r\n`;
      csvContent += `Total Recorded Fleet Expenses (INR),${data.summary?.totalExpenses || 0}\r\n\r\n`;

      // 3. Vehicles
      csvContent += "REGISTERED FLEET VEHICLES\r\n";
      csvContent += "Vehicle Number,Type,Make,Model,Year,Driver,Mileage (km),Status\r\n";
      (data.raw?.vehicles || []).forEach((v) => {
        csvContent += `"${v.vehicleNumber}","${v.vehicleType}","${v.make || ""}","${v.model || ""}","${v.year || ""}","${v.driver || ""}","${v.mileage || 0}","${v.status}"\r\n`;
      });
      csvContent += "\r\n";

      // 4. Expenses
      csvContent += "RECORDED EXPENSES\r\n";
      csvContent += "Date,Category,Amount (INR),Description\r\n";
      (data.raw?.expenses || []).forEach((e) => {
        const d = e.date ? new Date(e.date).toISOString().substring(0, 10) : "";
        csvContent += `"${d}","${e.category}","${e.amount}","${(e.description || "").replace(/"/g, '""')}"\r\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `FleetPulse_Report_${new Date().toISOString().substring(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      notify("Report exported to CSV successfully!", "success");
    } catch (err) {
      notify("Failed to export report: " + err.message, "error");
    }
  };

  if (loading && !data) {
    return <LoadingSpinner message="Generating Fleet Analytics & Reports..." />;
  }

  if (error && !data) {
    return (
      <div className="error-card">
        <FileText size={32} className="text-red-500" />
        <h3>Unable to load reports</h3>
        <p>{error}</p>
        <button className="primary-button" onClick={fetchReports}>
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  const summary = data?.summary || {};
  const charts = data?.charts || {};

  return (
    <div className="module-view">
      {/* TOOLBAR */}
      <div className="module-toolbar">
        <div className="toolbar-left">
          <h2>Fleet Intelligence & Reports</h2>
          <p>Analytical breakdown of costs, service distributions, and maintenance metrics</p>
        </div>
        <div className="toolbar-actions">
          <button className="primary-button" onClick={exportCSV}>
            <Download size={18} /> Export CSV Report
          </button>
        </div>
      </div>

      {/* KPI METRICS OVERVIEW */}
      <div className="kpi-grid">
        <div className="kpi-card card-blue">
          <div className="kpi-card-header">
            <h3>Total Vehicles</h3>
            <div className="kpi-icon-badge icon-blue">
              <Truck size={20} />
            </div>
          </div>
          <div className="kpi-value">{summary.totalVehicles || 0}</div>
          <div className="kpi-divider"></div>
          <p className="kpi-subtext">Active registered fleet assets</p>
        </div>

        <div className="kpi-card card-orange">
          <div className="kpi-card-header">
            <h3>Total Services</h3>
            <div className="kpi-icon-badge icon-orange">
              <Wrench size={20} />
            </div>
          </div>
          <div className="kpi-value">{summary.totalServices || 0}</div>
          <div className="kpi-divider"></div>
          <p className="kpi-subtext">Completed & scheduled checkups</p>
        </div>

        <div className="kpi-card card-purple">
          <div className="kpi-card-header">
            <h3>Maintenance Tasks</h3>
            <div className="kpi-icon-badge icon-purple">
              <Settings size={20} />
            </div>
          </div>
          <div className="kpi-value">{summary.totalMaintenance || 0}</div>
          <div className="kpi-divider"></div>
          <p className="kpi-subtext">Reactive & periodic work orders</p>
        </div>

        <div className="kpi-card card-green">
          <div className="kpi-card-header">
            <h3>Total Fleet Expenses</h3>
            <div className="kpi-icon-badge icon-green">
              <IndianRupee size={20} />
            </div>
          </div>
          <div className="kpi-value">₹{Number(summary.totalExpenses || 0).toLocaleString("en-IN")}</div>
          <div className="kpi-divider"></div>
          <p className="kpi-subtext">Total recorded operational spending</p>
        </div>
      </div>

      {/* 4 RECHARTS ANALYTICAL CHARTS */}
      <div className="reports-grid">
        {/* 1. Monthly Maintenance Cost */}
        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title-with-icon">
              <BarChart3 size={18} className="text-blue-500" />
              <h3>Monthly Maintenance Spending Trend</h3>
            </div>
          </div>
          <div className="panel-body chart-wrapper">
            {charts.monthlyCost && charts.monthlyCost.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={charts.monthlyCost} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="repCostGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Spending"]} />
                  <Area type="monotone" dataKey="amount" stroke="#2563eb" fill="url(#repCostGrad)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted text-center py-8">No cost data available</p>
            )}
          </div>
        </div>

        {/* 2. Expense by Category */}
        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title-with-icon">
              <PieChartIcon size={18} className="text-green-500" />
              <h3>Expenditure by Category</h3>
            </div>
          </div>
          <div className="panel-body chart-wrapper">
            {charts.expenseByCategory && charts.expenseByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={charts.expenseByCategory}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {charts.expenseByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Amount"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted text-center py-8">No expense category data</p>
            )}
          </div>
        </div>

        {/* 3. Top Vehicle Maintenance Frequency */}
        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title-with-icon">
              <Truck size={18} className="text-orange-500" />
              <h3>Vehicle Maintenance & Service Frequency</h3>
            </div>
          </div>
          <div className="panel-body chart-wrapper">
            {charts.vehicleFrequency && charts.vehicleFrequency.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={charts.vehicleFrequency} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="vehicleNumber" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                  <Tooltip formatter={(v) => [v, "Tickets / Services"]} />
                  <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted text-center py-8">No vehicle frequency data</p>
            )}
          </div>
        </div>

        {/* 4. Service Status Distribution */}
        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title-with-icon">
              <Wrench size={18} className="text-purple-500" />
              <h3>Service Workflow Status Breakdown</h3>
            </div>
          </div>
          <div className="panel-body chart-wrapper">
            {charts.serviceDistribution && charts.serviceDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={charts.serviceDistribution} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="status" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                  <Tooltip formatter={(v) => [v, "Services"]} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted text-center py-8">No service distribution data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

