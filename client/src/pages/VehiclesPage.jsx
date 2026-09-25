import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Truck, Calendar, X, RefreshCw } from "lucide-react";
import api from "../services/api";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

const initialFormState = {
  vehicleNumber: "",
  vehicleType: "Truck",
  make: "",
  model: "",
  year: "",
  driver: "",
  mileage: "",
  status: "Active",
  lastServiceDate: "",
  nextServiceDate: "",
  notes: ""
};

const VehiclesPage = ({ onDataChange, notify }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const data = await api.getVehicles({ status: statusFilter, search });
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      notify(err.message || "Failed to fetch vehicles", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchVehicles();
  };

  const openAddModal = () => {
    setEditingVehicle(null);
    setFormData(initialFormState);
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicleNumber: vehicle.vehicleNumber || "",
      vehicleType: vehicle.vehicleType || "Truck",
      make: vehicle.make || "",
      model: vehicle.model || "",
      year: vehicle.year ? String(vehicle.year) : "",
      driver: vehicle.driver || "",
      mileage: vehicle.mileage ? String(vehicle.mileage) : "",
      status: vehicle.status || "Active",
      lastServiceDate: vehicle.lastServiceDate ? vehicle.lastServiceDate.substring(0, 10) : "",
      nextServiceDate: vehicle.nextServiceDate ? vehicle.nextServiceDate.substring(0, 10) : "",
      notes: vehicle.notes || ""
    });
    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (formSubmitting) return;
    setShowModal(false);
    setEditingVehicle(null);
    setFormData(initialFormState);
    setFormError("");
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.vehicleNumber.trim()) {
      setFormError("Vehicle number is required");
      return;
    }

    if (!formData.vehicleType) {
      setFormError("Vehicle type is required");
      return;
    }

    setFormSubmitting(true);

    try {
      const payload = {
        ...formData,
        vehicleNumber: formData.vehicleNumber.trim().toUpperCase(),
        year: formData.year ? Number(formData.year) : null,
        mileage: formData.mileage ? Number(formData.mileage) : 0,
        lastServiceDate: formData.lastServiceDate || null,
        nextServiceDate: formData.nextServiceDate || null
      };

      if (editingVehicle) {
        await api.updateVehicle(editingVehicle._id, payload);
        notify("Vehicle updated successfully!", "success");
      } else {
        await api.createVehicle(payload);
        notify("Vehicle added successfully!", "success");
      }

      closeModal();
      await fetchVehicles();
      if (onDataChange) onDataChange();
    } catch (err) {
      setFormError(err.message || "Failed to save vehicle. Please check backend.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id, vehicleNumber) => {
    const confirmed = window.confirm(`Are you sure you want to delete vehicle ${vehicleNumber}? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      await api.deleteVehicle(id);
      notify(`Vehicle ${vehicleNumber} deleted successfully!`, "success");
      await fetchVehicles();
      if (onDataChange) onDataChange();
    } catch (err) {
      notify(err.message || "Failed to delete vehicle", "error");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="module-view">
      {/* TOOLBAR */}
      <div className="module-toolbar">
        <div className="toolbar-left">
          <h2>Fleet Vehicles</h2>
          <p>Manage all vehicles registered in FleetPulse</p>
        </div>
        <div className="toolbar-actions">
          <button className="primary-button" onClick={openAddModal}>
            <Plus size={18} /> Add Vehicle
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="controls-bar">
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search vehicle number, driver, make..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="filter-button-group">
          {["All", "Active", "In Service", "Maintenance", "Inactive"].map((st) => (
            <button
              key={st}
              className={`filter-pill-btn ${statusFilter === st ? "active" : ""}`}
              onClick={() => setStatusFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="results-counter">
          <span>{vehicles.length} vehicles</span>
        </div>
      </div>

      {/* VEHICLES TABLE CARD */}
      <div className="table-card">
        {loading ? (
          <LoadingSpinner message="Loading vehicles list..." />
        ) : vehicles.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="No vehicles found"
            description={search || statusFilter !== "All" ? "No vehicles matched your search filters." : "Add your first vehicle to start tracking your fleet."}
            actionLabel="Add Vehicle"
            onAction={openAddModal}
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Type</th>
                  <th>Make / Model</th>
                  <th>Driver</th>
                  <th>Mileage</th>
                  <th>Status</th>
                  <th>Next Service</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v._id}>
                    <td>
                      <div className="table-cell-title">
                        <div className="table-icon-wrap">
                          <Truck size={18} />
                        </div>
                        <div>
                          <span className="font-semibold text-main">{v.vehicleNumber}</span>
                          <span className="text-muted text-xs block">{v.year ? `Model Year ${v.year}` : "Year N/A"}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="type-badge">{v.vehicleType || "General"}</span>
                    </td>
                    <td>
                      <div className="make-model-cell">
                        <strong>{v.make || "—"}</strong>
                        <span className="text-muted text-xs block">{v.model || "—"}</span>
                      </div>
                    </td>
                    <td>{v.driver || <span className="text-muted">Unassigned</span>}</td>
                    <td>
                      {v.mileage !== undefined && v.mileage !== null
                        ? `${Number(v.mileage).toLocaleString("en-IN")} km`
                        : "—"}
                    </td>
                    <td>
                      <StatusBadge status={v.status} />
                    </td>
                    <td>
                      <div className="date-with-icon">
                        <Calendar size={14} className="text-muted" />
                        <span>{formatDate(v.nextServiceDate)}</span>
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="action-buttons-group">
                        <button
                          className="table-action-btn edit-btn"
                          title="Edit vehicle"
                          onClick={() => openEditModal(v)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="table-action-btn delete-btn"
                          title="Delete vehicle"
                          onClick={() => handleDelete(v._id, v.vehicleNumber)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD / EDIT VEHICLE MODAL */}
      {showModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-dialog modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>{editingVehicle ? "Edit Vehicle" : "Add Vehicle"}</h3>
                <p>{editingVehicle ? "Update fleet vehicle details" : "Register a new vehicle in FleetPulse"}</p>
              </div>
              <button className="modal-close-btn" onClick={closeModal} disabled={formSubmitting}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {formError && (
                <div className="form-error-banner">
                  <span>{formError}</span>
                </div>
              )}

              <div className="form-grid-2">
                <div className="form-field">
                  <label>Vehicle Number *</label>
                  <input
                    type="text"
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleFormChange}
                    placeholder="TN 01 AB 1234"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Vehicle Type *</label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="Car">Car</option>
                    <option value="Van">Van</option>
                    <option value="Truck">Truck</option>
                    <option value="Bus">Bus</option>
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Make</label>
                  <input
                    type="text"
                    name="make"
                    value={formData.make}
                    onChange={handleFormChange}
                    placeholder="e.g. Tata, Mahindra"
                  />
                </div>

                <div className="form-field">
                  <label>Model</label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleFormChange}
                    placeholder="e.g. Prima, Bolero"
                  />
                </div>

                <div className="form-field">
                  <label>Year</label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleFormChange}
                    placeholder="2024"
                    min="1980"
                    max="2035"
                  />
                </div>

                <div className="form-field">
                  <label>Driver</label>
                  <input
                    type="text"
                    name="driver"
                    value={formData.driver}
                    onChange={handleFormChange}
                    placeholder="Assigned driver name"
                  />
                </div>

                <div className="form-field">
                  <label>Mileage (km)</label>
                  <input
                    type="number"
                    name="mileage"
                    value={formData.mileage}
                    onChange={handleFormChange}
                    placeholder="45000"
                    min="0"
                  />
                </div>

                <div className="form-field">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleFormChange}>
                    <option value="Active">Active</option>
                    <option value="In Service">In Service</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Last Service Date</label>
                  <input
                    type="date"
                    name="lastServiceDate"
                    value={formData.lastServiceDate}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-field">
                  <label>Next Service Date</label>
                  <input
                    type="date"
                    name="nextServiceDate"
                    value={formData.nextServiceDate}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="form-field full-width">
                <label>Notes / Specifications</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  rows={3}
                  placeholder="Additional notes, chassis details, or route assignment..."
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-button" onClick={closeModal} disabled={formSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={formSubmitting}>
                  {formSubmitting ? "Saving..." : editingVehicle ? "Update Vehicle" : "Save Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiclesPage;

