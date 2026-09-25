import React from "react";
import { CalendarDays, Bell } from "lucide-react";

const pageDescriptions = {
  Dashboard: "Comprehensive vehicle health monitoring, scheduled maintenance, and expense analytics",
  Vehicles: "Manage all vehicles registered in FleetPulse",
  Services: "Track scheduled services, workshop visits, and periodic inspections",
  Maintenance: "Manage reactive repairs, fault tickets, and priority breakdown tasks",
  "Spare Parts": "Inventory management, part tracking, and minimum stock alerts",
  Expenses: "Financial records, fuel logs, and comprehensive maintenance expenditure",
  Reports: "Fleet performance KPIs, exportable summaries, and cost breakdown charts"
};

const Header = ({ activePage, alertCount = 0 }) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  return (
    <header className="header">
      <div className="header-titles">
        <h2>{activePage === "Dashboard" ? "Fleet Operations Dashboard" : activePage}</h2>
        <p>{pageDescriptions[activePage] || "Manage your fleet operations efficiently"}</p>
      </div>

      <div className="header-actions">
        <div className="date-badge">
          <CalendarDays size={18} />
          <span>{currentDate}</span>
        </div>

        <div className="notification-bell" title={`${alertCount} high-priority alert(s)`}>
          <Bell size={20} />
          {alertCount > 0 && <span className="notification-counter">{alertCount}</span>}
        </div>

        <div className="admin-profile">
          <div className="admin-avatar">FA</div>
          <div className="admin-info">
            <strong>Fleet Admin</strong>
            <span>Operations Lead</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

