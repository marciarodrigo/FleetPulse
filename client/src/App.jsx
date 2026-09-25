import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Toast from "./components/Toast";
import DashboardPage from "./pages/DashboardPage";
import VehiclesPage from "./pages/VehiclesPage";
import ServicesPage from "./pages/ServicesPage";
import MaintenancePage from "./pages/MaintenancePage";
import SparePartsPage from "./pages/SparePartsPage";
import ExpensesPage from "./pages/ExpensesPage";
import ReportsPage from "./pages/ReportsPage";
import api from "./services/api";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [vehicleCount, setVehicleCount] = useState(0);
  const [alertCount, setAlertCount] = useState(0);
  const [isDbConnected, setIsDbConnected] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const notify = (message, type = "success") => {
    setToast({ message, type });
  };

  const clearToast = () => {
    setToast({ message: "", type: "success" });
  };

  const refreshGlobalMetrics = async () => {
    try {
      const [dashData, vehData] = await Promise.all([
        api.getDashboard().catch(() => null),
        api.getVehicles().catch(() => [])
      ]);

      if (dashData) {
        setIsDbConnected(true);
        setAlertCount(dashData.maintenance?.highPriority?.length || 0);
      }
      if (Array.isArray(vehData)) {
        setVehicleCount(vehData.length);
      }
    } catch {
      setIsDbConnected(false);
    }
  };

  useEffect(() => {
    refreshGlobalMetrics();
    const interval = setInterval(refreshGlobalMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      {/* SIDEBAR */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        vehicleCount={vehicleCount}
        isDbConnected={isDbConnected}
      />

      {/* MAIN VIEW AREA */}
      <div className="main-content-wrapper">
        <Header activePage={activePage} alertCount={alertCount} />

        <main className="page-body">
          {activePage === "Dashboard" && (
            <DashboardPage
              onNavigate={(page) => setActivePage(page)}
            />
          )}

          {activePage === "Vehicles" && (
            <VehiclesPage
              onDataChange={refreshGlobalMetrics}
              notify={notify}
            />
          )}

          {activePage === "Services" && (
            <ServicesPage
              onDataChange={refreshGlobalMetrics}
              notify={notify}
            />
          )}

          {activePage === "Maintenance" && (
            <MaintenancePage
              onDataChange={refreshGlobalMetrics}
              notify={notify}
            />
          )}

          {activePage === "Spare Parts" && (
            <SparePartsPage
              onDataChange={refreshGlobalMetrics}
              notify={notify}
            />
          )}

          {activePage === "Expenses" && (
            <ExpensesPage
              onDataChange={refreshGlobalMetrics}
              notify={notify}
            />
          )}

          {activePage === "Reports" && (
            <ReportsPage notify={notify} />
          )}
        </main>
      </div>

      {/* GLOBAL TOAST NOTIFICATION */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={clearToast}
      />
    </div>
  );
}

export default App;