import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Wrench, Calendar, X } from "lucide-react";
import api from "../services/api";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

const initialFormState = {
  vehicle: "",
  serviceType: "",
  scheduledDate: new Date().toISOString().substring(0, 10),
  completedDate: "",
  status: "Scheduled",
  technician: "",
  description: "",
  cost: "",
  notes: ""
};

const ServicesPage = ({ onDataChange, notify }) => {
  const [services, setServices] = useState([]);
  const [vehiclesList, setVehiclesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [servicesData, vehiclesData] = await Promise.all([
        api.getServices({ status: statusFilter, search }),
        api.getVehicles()
      ]);
      setServices(Array.isArray(servicesData) ? servicesData : []);
      setVehiclesList(Array.isArray(vehiclesData) ? vehiclesData : []);
    } catch (err) {
      notify(err.message || "Failed to fetch services", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const openAddModal = () => {
    setEditingService(null);
    setFormData({
      ...initialFormState,
      vehicle: vehiclesList.length > 0 ? vehiclesList[0]._id : ""
    });
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setFormData({
      vehicle: service.vehicle?._id || service.vehicle || "",
      serviceType: service.serviceType || "",
      scheduledDate: service.scheduledDate ? service.scheduledDate.substring(0, 10) : "",
      completedDate: service.completedDate ? service.completedDate.substring(0, 10) : "",
      status: service.status || "Scheduled",
      technician: service.technician || "",
      description: service.description || "",
      cost: service.cost !== undefined ? String(service.cost) : "",
      notes: service.notes || ""
    });
    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (formSubmitting) return;
    setShowModal(false);
    setEditingService(null);
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

    if (!formData.vehicle) {
      setFormError("Please select a vehicle");
      return;
    }

    if (!formData.serviceType.trim()) {
      setFormError("Service type is required");
      return;
    }

    if (!formData.scheduledDate) {
      setFormError("Scheduled date is required");
      return;
    }

    setFormSubmitting(true);

    try {
      const payload = {
        ...formData,
        cost: formData.cost ? Number(formData.cost) : 0,
        completedDate: formData.completedDate || null
      };

      if (editingService) {
        await api.updateService(editingService._id, payload);
        notify("Service record updated successfully!", "success");
      } else {
        await api.createService(payload);
        notify("Service appointment scheduled successfully!", "success");
      }

      closeModal();
      await fetchData();
      if (onDataChange) onDataChange();
    } catch (err) {
      setFormError(err.message || "Failed to save service record");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id, type) => {
    const confirmed = window.confirm(`Are you sure you want to delete this service record (${type})?`);
    if (!confirmed) return;

    try {
      await api.deleteService(id);
      notify("Service record deleted successfully!", "success");
      await fetchData();
      if (onDataChange) onDataChange();
    } catch (err) {
      notify(err.message || "Failed to delete service", "error");
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
          <h2>Fleet Services & Inspection</h2>
          <p>Track scheduled services, workshop visits, and periodic maintenance</p>
        </div>
        <div className="toolbar-actions">
          <button className="primary-button" onClick={openAddModal}>
            <Plus size={18} /> Schedule Service
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="controls-bar">
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search service type, technician, vehicle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="filter-button-group">
          {["All", "Scheduled", "In Progress", "Completed", "Overdue"].map((st) => (
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
          <span>{services.length} services</span>
        </div>
      </div>

      {/* SERVICES TABLE CARD */}
      <div className="table-card">
        {loading ? (
          <LoadingSpinner message="Loading service records..." />
        ) : services.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No service records found"
            description={search || statusFilter !== "All" ? "No services match your filters." : "Schedule your first fleet vehicle service."}
            actionLabel="Schedule Service"
            onAction={openAddModal}
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Service Type</th>
                  <th>Scheduled Date</th>
                  <th>Technician / Center</th>
                  <th>Status</th>
                  <th>Cost (₹)</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <div className="table-cell-title">
                        <span className="font-semibold text-main">{s.vehicle?.vehicleNumber || "Unknown Vehicle"}</span>
                        <span className="text-muted text-xs block">
                          {s.vehicle?.make} {s.vehicle?.model}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong className="text-sm block">{s.serviceType}</strong>
                        {s.description && <span className="text-muted text-xs truncate max-w-xs block">{s.description}</span>}
                      </div>
                    </td>
                    <td>
                      <div className="date-with-icon">
                        <Calendar size={14} className="text-muted" />
                        <span>{formatDate(s.scheduledDate)}</span>
                      </div>
                    </td>
                    <td>{s.technician || <span className="text-muted">Unspecified</span>}</td>
                    <td>
                      <StatusBadge status={s.status} />
                    </td>
                    <td>
                      {s.cost !== undefined && s.cost !== null ? (
                        <span className="font-medium">₹{Number(s.cost).toLocaleString("en-IN")}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="text-right">
                      <div className="action-buttons-group">
                        <button
                          className="table-action-btn edit-btn"
                          title="Edit service record"
                          onClick={() => openEditModal(s)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="table-action-btn delete-btn"
                          title="Delete service record"
                          onClick={() => handleDelete(s._id, s.serviceType)}
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

      {/* ADD / EDIT SERVICE MODAL */}
      {showModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-dialog modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>{editingService ? "Edit Service Record" : "Schedule New Service"}</h3>
                <p>{editingService ? "Update service details & inspection findings" : "Book a service appointment for a fleet vehicle"}</p>
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
                  <label>Vehicle *</label>
                  <select
                    name="vehicle"
                    value={formData.vehicle}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select vehicle</option>
                    {vehiclesList.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.vehicleNumber} ({v.make} {v.model})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Service Type *</label>
                  <input
                    type="text"
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleFormChange}
                    placeholder="e.g. Engine Oil Change, Brake Inspection"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Scheduled Date *</label>
                  <input
                    type="date"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Completed Date</label>
                  <input
                    type="date"
                    name="completedDate"
                    value={formData.completedDate}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-field">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleFormChange}>
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Technician / Center</label>
                  <input
                    type="text"
                    name="technician"
                    value={formData.technician}
                    onChange={handleFormChange}
                    placeholder="e.g. Tata Authorized Workshop"
                  />
                </div>

                <div className="form-field">
                  <label>Estimated / Actual Cost (₹)</label>
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleFormChange}
                    placeholder="5000"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-field full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={2}
                  placeholder="Details of service requested or inspection checklist..."
                />
              </div>

              <div className="form-field full-width">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  rows={2}
                  placeholder="Technician remarks, parts replaced, warranty notes..."
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-button" onClick={closeModal} disabled={formSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={formSubmitting}>
                  {formSubmitting ? "Saving..." : editingService ? "Update Record" : "Schedule Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;

