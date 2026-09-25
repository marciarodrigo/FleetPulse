import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Settings, Calendar, X } from "lucide-react";
import api from "../services/api";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

const initialFormState = {
  vehicle: "",
  title: "",
  description: "",
  priority: "Medium",
  status: "Pending",
  dueDate: new Date().toISOString().substring(0, 10),
  cost: ""
};

const MaintenancePage = ({ onDataChange, notify }) => {
  const [tasks, setTasks] = useState([]);
  const [vehiclesList, setVehiclesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksData, vehiclesData] = await Promise.all([
        api.getMaintenance({ priority: priorityFilter, status: statusFilter, search }),
        api.getVehicles()
      ]);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setVehiclesList(Array.isArray(vehiclesData) ? vehiclesData : []);
    } catch (err) {
      notify(err.message || "Failed to fetch maintenance tasks", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [priorityFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const openAddModal = () => {
    setEditingTask(null);
    setFormData({
      ...initialFormState,
      vehicle: vehiclesList.length > 0 ? vehiclesList[0]._id : ""
    });
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      vehicle: task.vehicle?._id || task.vehicle || "",
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "Medium",
      status: task.status || "Pending",
      dueDate: task.dueDate ? task.dueDate.substring(0, 10) : "",
      cost: task.cost !== undefined ? String(task.cost) : ""
    });
    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (formSubmitting) return;
    setShowModal(false);
    setEditingTask(null);
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

    if (!formData.title.trim()) {
      setFormError("Maintenance title is required");
      return;
    }

    setFormSubmitting(true);

    try {
      const payload = {
        ...formData,
        cost: formData.cost ? Number(formData.cost) : 0,
        dueDate: formData.dueDate || null
      };

      if (editingTask) {
        await api.updateMaintenance(editingTask._id, payload);
        notify("Maintenance task updated successfully!", "success");
      } else {
        await api.createMaintenance(payload);
        notify("Maintenance task created successfully!", "success");
      }

      closeModal();
      await fetchData();
      if (onDataChange) onDataChange();
    } catch (err) {
      setFormError(err.message || "Failed to save maintenance task");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    const confirmed = window.confirm(`Are you sure you want to delete this maintenance task ("${title}")?`);
    if (!confirmed) return;

    try {
      await api.deleteMaintenance(id);
      notify("Maintenance task deleted successfully!", "success");
      await fetchData();
      if (onDataChange) onDataChange();
    } catch (err) {
      notify(err.message || "Failed to delete maintenance task", "error");
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
          <h2>Maintenance & Breakdown Management</h2>
          <p>Manage reactive repairs, fault tickets, and priority breakdown tasks</p>
        </div>
        <div className="toolbar-actions">
          <button className="primary-button" onClick={openAddModal}>
            <Plus size={18} /> Add Maintenance Task
          </button>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="controls-bar">
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search task, vehicle, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="filter-group-inline">
          <label className="filter-label">Priority:</label>
          <div className="filter-button-group">
            {["All", "High", "Medium", "Low"].map((p) => (
              <button
                key={p}
                className={`filter-pill-btn ${priorityFilter === p ? "active" : ""}`}
                onClick={() => setPriorityFilter(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group-inline">
          <label className="filter-label">Status:</label>
          <div className="filter-button-group">
            {["All", "Pending", "In Progress", "Completed"].map((st) => (
              <button
                key={st}
                className={`filter-pill-btn ${statusFilter === st ? "active" : ""}`}
                onClick={() => setStatusFilter(st)}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="results-counter">
          <span>{tasks.length} tasks</span>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-card">
        {loading ? (
          <LoadingSpinner message="Loading maintenance tasks..." />
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={Settings}
            title="No maintenance tasks found"
            description="No records matched your search filters."
            actionLabel="Add Maintenance Task"
            onAction={openAddModal}
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Maintenance Task</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Cost (₹)</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t._id} className={t.priority === "High" && t.status !== "Completed" ? "row-highlight-danger" : ""}>
                    <td>
                      <div className="table-cell-title">
                        <span className="font-semibold text-main">{t.vehicle?.vehicleNumber || "Fleet Vehicle"}</span>
                        <span className="text-muted text-xs block">
                          {t.vehicle?.make} {t.vehicle?.model}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong className="text-sm block">{t.title}</strong>
                        {t.description && <span className="text-muted text-xs truncate max-w-xs block">{t.description}</span>}
                      </div>
                    </td>
                    <td>
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td>
                      <div className="date-with-icon">
                        <Calendar size={14} className="text-muted" />
                        <span>{formatDate(t.dueDate)}</span>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={t.status} />
                    </td>
                    <td>
                      {t.cost !== undefined && t.cost !== null ? (
                        <span className="font-medium">₹{Number(t.cost).toLocaleString("en-IN")}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="text-right">
                      <div className="action-buttons-group">
                        <button
                          className="table-action-btn edit-btn"
                          title="Edit maintenance task"
                          onClick={() => openEditModal(t)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="table-action-btn delete-btn"
                          title="Delete task"
                          onClick={() => handleDelete(t._id, t.title)}
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

      {/* ADD / EDIT MAINTENANCE MODAL */}
      {showModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-dialog modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>{editingTask ? "Edit Maintenance Task" : "Create Maintenance Task"}</h3>
                <p>{editingTask ? "Update repair status and details" : "Log a repair or maintenance requirement"}</p>
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
                  <label>Priority *</label>
                  <select name="priority" value={formData.priority} onChange={handleFormChange}>
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High (Immediate Action)</option>
                  </select>
                </div>

                <div className="form-field full-width">
                  <label>Task Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    placeholder="e.g. Brake fluid leak repair"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleFormChange}>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-field">
                  <label>Estimated Cost (₹)</label>
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleFormChange}
                    placeholder="3500"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-field full-width">
                <label>Description & Findings</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={3}
                  placeholder="Detailed symptoms, diagnostic codes, or technician findings..."
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-button" onClick={closeModal} disabled={formSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={formSubmitting}>
                  {formSubmitting ? "Saving..." : editingTask ? "Update Task" : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenancePage;

