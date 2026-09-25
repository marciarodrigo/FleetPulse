const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json"
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  if (config.body && typeof config.body === "object") {
    config.body = JSON.stringify(config.body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkError) {
    throw new Error(
      `Network error: Unable to connect to FleetPulse backend at ${API_BASE_URL}. Please ensure the backend server is running and accessible.`
    );
  }

  let data;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage =
      (typeof data === "object" && data !== null && (data.message || data.error)) ||
      (typeof data === "string" && data.length > 0 ? data : `HTTP ${response.status} Error`);
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const api = {
  // Health
  getHealth: () => request("/health"),

  // Dashboard
  getDashboard: () => request("/dashboard"),

  // Vehicles
  getVehicles: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== "All") query.append("status", params.status);
    if (params.search) query.append("search", params.search);
    const qs = query.toString();
    return request(`/vehicles${qs ? `?${qs}` : ""}`);
  },
  getVehicleById: (id) => request(`/vehicles/${id}`),
  createVehicle: (data) => request("/vehicles", { method: "POST", body: data }),
  updateVehicle: (id, data) => request(`/vehicles/${id}`, { method: "PUT", body: data }),
  deleteVehicle: (id) => request(`/vehicles/${id}`, { method: "DELETE" }),

  // Services
  getServices: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== "All") query.append("status", params.status);
    if (params.vehicleId && params.vehicleId !== "All") query.append("vehicleId", params.vehicleId);
    if (params.search) query.append("search", params.search);
    const qs = query.toString();
    return request(`/services${qs ? `?${qs}` : ""}`);
  },
  getServiceById: (id) => request(`/services/${id}`),
  createService: (data) => request("/services", { method: "POST", body: data }),
  updateService: (id, data) => request(`/services/${id}`, { method: "PUT", body: data }),
  deleteService: (id) => request(`/services/${id}`, { method: "DELETE" }),

  // Maintenance
  getMaintenance: (params = {}) => {
    const query = new URLSearchParams();
    if (params.priority && params.priority !== "All") query.append("priority", params.priority);
    if (params.status && params.status !== "All") query.append("status", params.status);
    if (params.search) query.append("search", params.search);
    const qs = query.toString();
    return request(`/maintenance${qs ? `?${qs}` : ""}`);
  },
  getMaintenanceById: (id) => request(`/maintenance/${id}`),
  createMaintenance: (data) => request("/maintenance", { method: "POST", body: data }),
  updateMaintenance: (id, data) => request(`/maintenance/${id}`, { method: "PUT", body: data }),
  deleteMaintenance: (id) => request(`/maintenance/${id}`, { method: "DELETE" }),

  // Spare Parts
  getSpareParts: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== "All") query.append("category", params.category);
    if (params.stockStatus && params.stockStatus !== "All") query.append("stockStatus", params.stockStatus);
    if (params.search) query.append("search", params.search);
    const qs = query.toString();
    return request(`/spare-parts${qs ? `?${qs}` : ""}`);
  },
  getSparePartById: (id) => request(`/spare-parts/${id}`),
  createSparePart: (data) => request("/spare-parts", { method: "POST", body: data }),
  updateSparePart: (id, data) => request(`/spare-parts/${id}`, { method: "PUT", body: data }),
  deleteSparePart: (id) => request(`/spare-parts/${id}`, { method: "DELETE" }),

  // Expenses
  getExpenses: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== "All") query.append("category", params.category);
    if (params.vehicleId && params.vehicleId !== "All") query.append("vehicleId", params.vehicleId);
    if (params.startDate) query.append("startDate", params.startDate);
    if (params.endDate) query.append("endDate", params.endDate);
    if (params.search) query.append("search", params.search);
    const qs = query.toString();
    return request(`/expenses${qs ? `?${qs}` : ""}`);
  },
  getExpenseById: (id) => request(`/expenses/${id}`),
  createExpense: (data) => request("/expenses", { method: "POST", body: data }),
  updateExpense: (id, data) => request(`/expenses/${id}`, { method: "PUT", body: data }),
  deleteExpense: (id) => request(`/expenses/${id}`, { method: "DELETE" }),

  // Reports
  getReports: () => request("/reports")
};

export default api;

