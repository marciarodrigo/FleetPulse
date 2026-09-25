import React from "react";
import {
  LayoutDashboard,
  Truck,
  Wrench,
  Settings,
  Package,
  Receipt,
  FileText,
  Database
} from "lucide-react";

const Sidebar = ({ activePage, setActivePage, vehicleCount = 0, isDbConnected = true }) => {
  const menuItems = [
    { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "Vehicles", label: "Vehicles", icon: Truck, count: vehicleCount },
    { id: "Services", label: "Services", icon: Wrench },
    { id: "Maintenance", label: "Maintenance", icon: Settings },
    { id: "Spare Parts", label: "Spare Parts", icon: Package },
    { id: "Expenses", label: "Expenses", icon: Receipt },
    { id: "Reports", label: "Reports", icon: FileText }
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <Truck size={26} />
        </div>
        <div className="brand-text">
          <h1>FleetPulse</h1>
          <span>OPERATIONS HUB</span>
        </div>
      </div>

      <div className="navigation-title">MAIN NAVIGATION</div>

      <nav className="nav-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => setActivePage(item.id)}
            >
              <Icon size={20} className="nav-icon" />
              <span className="nav-label">{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span className="vehicle-count-badge">{item.count}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="database-status-card">
        <div className="status-indicator-wrapper">
          <span className={`status-dot ${isDbConnected ? "online" : "offline"}`}></span>
        </div>
        <div className="status-details">
          <strong>{isDbConnected ? "MongoDB Connected" : "Connecting..."}</strong>
          <span>FleetPulse • Live</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

