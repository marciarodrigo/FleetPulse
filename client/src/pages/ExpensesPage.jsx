import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Receipt, Calendar, IndianRupee, X } from "lucide-react";
import api from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

const initialFormState = {
  vehicle: "",
  category: "Maintenance",
  amount: "",
  date: new Date().toISOString().substring(0, 10),
  description: ""
};

const ExpensesPage = ({ onDataChange, notify }) => {
  const [expenses, setExpenses] = useState([]);
  const [vehiclesList, setVehiclesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [vehicleFilter, setVehicleFilter] = useState("All");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expensesData, vehiclesData] = await Promise.all([
        api.getExpenses({ category: categoryFilter, vehicleId: vehicleFilter, search }),
        api.getVehicles()
      ]);
      setExpenses(Array.isArray(expensesData) ? expensesData : []);
      setVehiclesList(Array.isArray(vehiclesData) ? vehiclesData : []);
    } catch (err) {
      notify(err.message || "Failed to fetch expenses", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryFilter, vehicleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const openAddModal = () => {
    setEditingExpense(null);
    setFormData(initialFormState);
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (expense) => {
    setEditingExpense(expense);
    setFormData({
      vehicle: expense.vehicle?._id || expense.vehicle || "",
      category: expense.category || "Maintenance",
      amount: expense.amount !== undefined ? String(expense.amount) : "",
      date: expense.date ? expense.date.substring(0, 10) : "",
      description: expense.description || ""
    });
    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (formSubmitting) return;
    setShowModal(false);
    setEditingExpense(null);
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

    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      setFormError("Valid positive amount is required");
      return;
    }

    if (!formData.date) {
      setFormError("Date is required");
      return;
    }

    setFormSubmitting(true);

    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
        vehicle: formData.vehicle || null
      };

      if (editingExpense) {
        await api.updateExpense(editingExpense._id, payload);
        notify("Expense record updated!", "success");
      } else {
        await api.createExpense(payload);
        notify("Expense recorded successfully!", "success");
      }

      closeModal();
      await fetchData();
      if (onDataChange) onDataChange();
    } catch (err) {
      setFormError(err.message || "Failed to save expense");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id, cat, amt) => {
    const confirmed = window.confirm(`Are you sure you want to delete this expense record (${cat} - ₹${amt})?`);
    if (!confirmed) return;

    try {
      await api.deleteExpense(id);
      notify("Expense record deleted successfully!", "success");
      await fetchData();
      if (onDataChange) onDataChange();
    } catch (err) {
      notify(err.message || "Failed to delete expense", "error");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  // Metrics calculations
  const totalExpensesSum = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const now = new Date();
  const thisMonthExpensesSum = expenses
    .filter((e) => {
      const d = new Date(e.date || e.createdAt);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    })
    .reduce((acc, e) => acc + (e.amount || 0), 0);

  const serviceExpensesSum = expenses
    .filter((e) => e.category === "Service" || e.category === "Maintenance")
    .reduce((acc, e) => acc + (e.amount || 0), 0);

  const sparePartsExpensesSum = expenses
    .filter((e) => e.category === "Spare Part")
    .reduce((acc, e) => acc + (e.amount || 0), 0);

  return (
    <div className="module-view">
      {/* TOOLBAR */}
      <div className="module-toolbar">
        <div className="toolbar-left">
          <h2>Fleet Expenses & Operational Costs</h2>
          <p>Financial accounting, fuel logs, service receipts, and fleet operational costs</p>
        </div>
        <div className="toolbar-actions">
          <button className="primary-button" onClick={openAddModal}>
            <Plus size={18} /> Record Expense
          </button>
        </div>
      </div>

      {/* 4 SUMMARY METRICS CARDS */}
      <div className="kpi-grid">
        <div className="kpi-card card-blue">
          <div className="kpi-card-header">
            <h3>Total Expenses</h3>
            <div className="kpi-icon-badge icon-blue">
              <IndianRupee size={20} />
            </div>
          </div>
          <div className="kpi-value">₹{totalExpensesSum.toLocaleString("en-IN")}</div>
          <div className="kpi-divider"></div>
          <p className="kpi-subtext">Cumulative recorded fleet expenditure</p>
        </div>

        <div className="kpi-card card-green">
          <div className="kpi-card-header">
            <h3>This Month</h3>
            <div className="kpi-icon-badge icon-green">
              <Calendar size={20} />
            </div>
          </div>
          <div className="kpi-value">₹{thisMonthExpensesSum.toLocaleString("en-IN")}</div>
          <div className="kpi-divider"></div>
          <p className="kpi-subtext">Spent in {now.toLocaleString("default", { month: "long" })}</p>
        </div>

        <div className="kpi-card card-orange">
          <div className="kpi-card-header">
            <h3>Service & Maintenance</h3>
            <div className="kpi-icon-badge icon-orange">
              <Receipt size={20} />
            </div>
          </div>
          <div className="kpi-value">₹{serviceExpensesSum.toLocaleString("en-IN")}</div>
          <div className="kpi-divider"></div>
          <p className="kpi-subtext">Workshop repairs and inspections</p>
        </div>

        <div className="kpi-card card-purple">
          <div className="kpi-card-header">
            <h3>Spare Part Expenses</h3>
            <div className="kpi-icon-badge icon-purple">
              <Receipt size={20} />
            </div>
          </div>
          <div className="kpi-value">₹{sparePartsExpensesSum.toLocaleString("en-IN")}</div>
          <div className="kpi-divider"></div>
          <p className="kpi-subtext">Replacement hardware & consumables</p>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="controls-bar">
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search description, vehicle, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="filter-group-inline">
          <label className="filter-label">Category:</label>
          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Service">Service</option>
            <option value="Spare Part">Spare Part</option>
            <option value="Fuel">Fuel</option>
            <option value="Insurance">Insurance</option>
            <option value="Toll">Toll</option>
            <option value="Permit">Permit</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="filter-group-inline">
          <label className="filter-label">Vehicle:</label>
          <select
            className="filter-select"
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
          >
            <option value="All">All Vehicles</option>
            {vehiclesList.map((v) => (
              <option key={v._id} value={v._id}>
                {v.vehicleNumber}
              </option>
            ))}
          </select>
        </div>

        <div className="results-counter">
          <span>{expenses.length} records</span>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-card">
        {loading ? (
          <LoadingSpinner message="Loading expense ledger..." />
        ) : expenses.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No expense records found"
            description="No expense transactions matched your search criteria."
            actionLabel="Record Expense"
            onAction={openAddModal}
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vehicle</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount (₹)</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e._id}>
                    <td>
                      <div className="date-with-icon">
                        <Calendar size={14} className="text-muted" />
                        <span>{formatDate(e.date)}</span>
                      </div>
                    </td>
                    <td>
                      {e.vehicle ? (
                        <div className="table-cell-title">
                          <span className="font-semibold text-main">{e.vehicle.vehicleNumber}</span>
                          <span className="text-muted text-xs block">{e.vehicle.make}</span>
                        </div>
                      ) : (
                        <span className="text-muted">General Fleet</span>
                      )}
                    </td>
                    <td>
                      <span className="category-pill">{e.category}</span>
                    </td>
                    <td>
                      <span className="text-sm">{e.description || "—"}</span>
                    </td>
                    <td>
                      <strong className="text-main font-semibold">₹{Number(e.amount).toLocaleString("en-IN")}</strong>
                    </td>
                    <td className="text-right">
                      <div className="action-buttons-group">
                        <button
                          className="table-action-btn edit-btn"
                          title="Edit expense"
                          onClick={() => openEditModal(e)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="table-action-btn delete-btn"
                          title="Delete expense"
                          onClick={() => handleDelete(e._id, e.category, e.amount)}
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

      {/* ADD / EDIT EXPENSE MODAL */}
      {showModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-dialog modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>{editingExpense ? "Edit Expense Entry" : "Record New Fleet Expense"}</h3>
                <p>{editingExpense ? "Update expense details" : "Add a financial transaction to the ledger"}</p>
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
                  <label>Vehicle (Optional)</label>
                  <select name="vehicle" value={formData.vehicle} onChange={handleFormChange}>
                    <option value="">General Fleet / Unassigned</option>
                    {vehiclesList.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.vehicleNumber} ({v.make} {v.model})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Category *</label>
                  <select name="category" value={formData.category} onChange={handleFormChange}>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Service">Service</option>
                    <option value="Spare Part">Spare Part</option>
                    <option value="Fuel">Fuel</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Toll">Toll</option>
                    <option value="Permit">Permit</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Amount (₹) *</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleFormChange}
                    placeholder="2500"
                    min="0"
                    step="any"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Transaction Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              <div className="form-field full-width">
                <label>Description & Invoice Details</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={3}
                  placeholder="e.g. Diesel fuel purchase bill #9021 from HP petrol station..."
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-button" onClick={closeModal} disabled={formSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={formSubmitting}>
                  {formSubmitting ? "Saving..." : editingExpense ? "Update Expense" : "Record Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;

