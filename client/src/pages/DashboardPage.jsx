import React, { useEffect, useState } from "react";
import {
  Truck,
  AlertTriangle,
  CalendarDays,
  IndianRupee,
  CheckCircle,
  ClipboardList,
  Wrench,
  RefreshCw
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import api from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

const DashboardPage = ({ onNavigate }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDashboard();
      setData(res);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading && !data) {
    return <LoadingSpinner message="Loading FleetPulse Dashboard..." />;
  }

  if (error && !data) {
    return (
      <div className="error-card">
        <AlertTriangle size={32} className="text-red-500" />
        <h3>Unable to load dashboard</h3>
        <p>{error}</p>
        <button className="primary-button" onClick={fetchDashboard}>
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  const fleet = data?.fleet || { total: 0, active: 0, inService: 0, needsMaintenance: 0, inactive: 0 };
  const services = data?.services || { scheduled: 0, inProgress: 0, overdue: 0, completed: 0 };
  const maintenance = data?.maintenance || { active: 0, highPriority: [] };
  const costs = data?.costs || { total: 0, monthlyTrend: [] };

  return (
    <div className="dashboard-view">
      {/* 4 TOP CARDS */}
      <div className="kpi-grid">
        {/* TOTAL FLEET ASSETS */}
        <div className="kpi-card card-blue" onClick={() => onNavigate("Vehicles")}>
          <div className="kpi-card-header">
            <h3>Total Fleet Assets</h3>
            <div className="kpi-icon-badge icon-blue">
              <Truck size={22} />
            </div>
          </div>
          <div className="kpi-value">{fleet.total}</div>
          <div className="kpi-divider"></div>
          <div className="fleet-status-pills">
            <span className="pill-green">● {fleet.active} Active</span>
            <span className="pill-orange">● {fleet.inService} In Service</span>
            <span className="pill-red">● {fleet.needsMaintenance} Attention</span>
          </div>
        </div>

        {/* VEHICLES DUE FOR SERVICE */}
        <div className="kpi-card card-orange" onClick={() => onNavigate("Maintenance")}>
          <div className="kpi-card-header">
            <h3>Vehicles Due for Service</h3>
            <div className="kpi-icon-badge icon-orange">
              <AlertTriangle size={22} />
            </div>
          </div>
          <div className="kpi-value text-orange">{fleet.needsMaintenance}</div>
          <div className="kpi-divider"></div>
          <p className="kpi-subtext">Vehicles requiring immediate maintenance attention</p>
        </div>

        {/* UPCOMING SERVICES */}
        <div className="kpi-card card-purple" onClick={() => onNavigate("Services")}>
          <div className="kpi-card-header">
            <h3>Upcoming Services</h3>
            <div className="kpi-icon-badge icon-purple">
              <CalendarDays size={22} />
            </div>
          </div>
          <div className="kpi-value">{services.scheduled}</div>
          <div className="kpi-divider"></div>
          <p className="kpi-subtext">Scheduled maintenance appointments in next 30 days</p>
        </div>

        {/* TOTAL MAINTENANCE COST */}
        <div className="kpi-card card-green" onClick={() => onNavigate("Expenses")}>
          <div className="kpi-card-header">
            <h3>Total Maintenance Cost</h3>
            <div className="kpi-icon-badge icon-green">
              <IndianRupee size={22} />
            </div>
          </div>
          <div className="kpi-value">₹{Number(costs.total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="kpi-divider"></div>
          <p className="kpi-subtext">Services + Repairs + Spare Parts</p>
        </div>
      </div>

      {/* HIGH PRIORITY ALERTS */}
      <div className="panel-card alerts-panel">
        <div className="panel-header">
          <div className="panel-title-group">
            <div className="panel-title-with-icon">
              <AlertTriangle size={20} className="text-red-500" />
              <h3>High Priority Maintenance Alerts</h3>
            </div>
            <p className="panel-subtitle">Immediate operational attention recommended</p>
          </div>
          <div className="alert-count-pill">{maintenance.highPriority?.length || 0}</div>
        </div>

        <div className="panel-body">
          {maintenance.highPriority && maintenance.highPriority.length > 0 ? (
            <div className="alerts-list">
              {maintenance.highPriority.map((alert, idx) => (
                <div key={alert.id || idx} className="alert-item-row" onClick={() => onNavigate("Maintenance")}>
                  <div className="alert-icon-wrap">
                    <AlertTriangle size={18} />
                  </div>
                  <div className="alert-content">
                    <strong>{alert.vehicle}</strong>
                    <span>{alert.message}</span>
                  </div>
                  {alert.dueDate && (
                    <div className="alert-due-date">
                      Due: {new Date(alert.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-alerts-state">
              <div className="check-icon-circle">
                <CheckCircle size={28} />
              </div>
              <h4>No High Priority Alerts</h4>
              <p>Your fleet currently has no high-priority maintenance alerts.</p>
            </div>
          )}
        </div>
      </div>

      {/* LOWER SECTION: COST ANALYTICS & SERVICE STATS */}
      <div className="dashboard-split-grid">
        {/* MAINTENANCE COST ANALYTICS CHART */}
        <div className="panel-card chart-panel">
          <div className="panel-header">
            <div>
              <h3>Maintenance Cost Analytics</h3>
              <p className="panel-subtitle">Monthly expenditure trend over the last 6 months</p>
            </div>
            <span className="badge-tag">Last 6 months</span>
          </div>
          <div className="panel-body chart-wrapper">
            {costs.monthlyTrend && costs.monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={costs.monthlyTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip
                    formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Cost"]}
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", border: "none" }}
                  />
                  <Area type="monotone" dataKey="cost" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#costGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-placeholder-box">
                <IndianRupee size={32} />
                <p>No monthly cost data available yet</p>
              </div>
            )}
          </div>
        </div>

        {/* SERVICE STATUS METRICS */}
        <div className="panel-card stats-panel">
          <div className="panel-header">
            <div>
              <h3>Scheduled & In Progress Services</h3>
              <p className="panel-subtitle">Current workflow status distribution</p>
            </div>
            <span className="badge-tag">Live Status</span>
          </div>
          <div className="panel-body">
            <div className="service-metrics-grid">
              <div className="service-metric-box box-blue" onClick={() => onNavigate("Services")}>
                <ClipboardList size={24} className="metric-icon" />
                <span className="metric-num">{services.scheduled}</span>
                <span className="metric-label">Scheduled</span>
              </div>
              <div className="service-metric-box box-orange" onClick={() => onNavigate("Services")}>
                <Wrench size={24} className="metric-icon" />
                <span className="metric-num">{services.inProgress}</span>
                <span className="metric-label">In Progress</span>
              </div>
              <div className="service-metric-box box-red" onClick={() => onNavigate("Services")}>
                <AlertTriangle size={24} className="metric-icon" />
                <span className="metric-num">{services.overdue}</span>
                <span className="metric-label">Overdue</span>
              </div>
              <div className="service-metric-box box-green" onClick={() => onNavigate("Services")}>
                <CheckCircle size={24} className="metric-icon" />
                <span className="metric-num">{services.completed}</span>
                <span className="metric-label">Completed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

