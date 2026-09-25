import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Package, AlertTriangle, CheckCircle, X } from "lucide-react";
import api from "../services/api";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

const initialFormState = {
  partName: "",
  partNumber: "",
  category: "Engine & Filtration",
  quantity: "",
  minimumStock: "5",
  unitCost: "",
  supplier: "",
  vehicle: "",
  notes: ""
};

const SparePartsPage = ({ onDataChange, notify }) => {
  const [parts, setParts] = useState([]);
  const [vehiclesList, setVehiclesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [partsData, vehiclesData] = await Promise.all([
        api.getSpareParts({ category: categoryFilter, stockStatus: stockFilter, search }),
        api.getVehicles()
      ]);
      setParts(Array.isArray(partsData) ? partsData : []);
      setVehiclesList(Array.isArray(vehiclesData) ? vehiclesData : []);
    } catch (err) {
      notify(err.message || "Failed to fetch spare parts", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryFilter, stockFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const openAddModal = () => {
    setEditingPart(null);
    setFormData(initialFormState);
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (part) => {
    setEditingPart(part);
    setFormData({
      partName: part.partName || "",
      partNumber: part.partNumber || "",
      category: part.category || "Engine & Filtration",
      quantity: part.quantity !== undefined ? String(part.quantity) : "0",
      minimumStock: part.minimumStock !== undefined ? String(part.minimumStock) : "5",
      unitCost: part.unitCost !== undefined ? String(part.unitCost) : "",
      supplier: part.supplier || "",
      vehicle: part.vehicle?._id || part.vehicle || "",
      notes: part.notes || ""
    });
    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (formSubmitting) return;
    setShowModal(false);
    setEditingPart(null);
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

    if (!formData.partName.trim()) {
      setFormError("Part name is required");
      return;
    }

    if (!formData.partNumber.trim()) {
      setFormError("Part number is required");
      return;
    }

    setFormSubmitting(true);

    try {
      const payload = {
        ...formData,
        partNumber: formData.partNumber.trim().toUpperCase(),
        quantity: Number(formData.quantity) || 0,
        minimumStock: Number(formData.minimumStock) || 0,
        unitCost: Number(formData.unitCost) || 0,
        vehicle: formData.vehicle || null
      };

      if (editingPart) {
        await api.updateSparePart(editingPart._id, payload);
        notify("Spare part updated successfully!", "success");
      } else {
        await api.createSparePart(payload);
        notify("Spare part registered in inventory!", "success");
      }

      closeModal();
      await fetchData();
      if (onDataChange) onDataChange();
    } catch (err) {
      setFormError(err.message || "Failed to save spare part");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(`Are you sure you want to delete spare part "${name}"?`);
    if (!confirmed) return;

    try {
      await api.deleteSparePart(id);
      notify("Spare part deleted successfully!", "success");
      await fetchData();
      if (onDataChange) onDataChange();
    } catch (err) {
      notify(err.message || "Failed to delete spare part", "error");
    }
  };

  const getStockStatus = (part) => {
    const qty = part.quantity || 0;
    const min = part.minimumStock || 0;
    if (qty <= 0) return "Out of Stock";
    if (qty <= min) return "Low Stock";
    return "In Stock";
  };

  return (
    <div className="module-view">
      {/* TOOLBAR */}
      <div className="module-toolbar">
        <div className="toolbar-left">
          <h2>Spare Parts & Inventory</h2>
          <p>Inventory management, critical spares, and reorder levels</p>
        </div>
        <div className="toolbar-actions">
          <button className="primary-button" onClick={openAddModal}>
            <Plus size={18} /> Add Spare Part
          </button>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="controls-bar">
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search part name, SKU, supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="filter-group-inline">
          <label className="filter-label">Stock:</label>
          <div className="filter-button-group">
            {["All", "In Stock", "Low Stock", "Out of Stock"].map((st) => (
              <button
                key={st}
                className={`filter-pill-btn ${stockFilter === st ? "active" : ""}`}
                onClick={() => setStockFilter(st)}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="results-counter">
          <span>{parts.length} parts</span>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-card">
        {loading ? (
          <LoadingSpinner message="Loading spare parts inventory..." />
        ) : parts.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No spare parts found"
            description="No inventory items matched your search filters."
            actionLabel="Add Spare Part"
            onAction={openAddModal}
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Part Name</th>
                  <th>Part Number</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Min Stock</th>
                  <th>Unit Cost (₹)</th>
                  <th>Supplier</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {parts.map((p) => {
                  const stockStatus = getStockStatus(p);
                  return (
                    <tr key={p._id}>
                      <td>
                        <div className="table-cell-title">
                          <span className="font-semibold text-main">{p.partName}</span>
                          {p.vehicle && (
                            <span className="text-muted text-xs block">
                              Fit: {p.vehicle.vehicleNumber} ({p.vehicle.make})
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="sku-tag font-mono">{p.partNumber}</span>
                      </td>
                      <td>{p.category}</td>
                      <td>
                        <strong className={p.quantity <= p.minimumStock ? "text-red-500" : ""}>
                          {p.quantity} units
                        </strong>
                      </td>
                      <td>{p.minimumStock} units</td>
                      <td>₹{Number(p.unitCost || 0).toLocaleString("en-IN")}</td>
                      <td>{p.supplier || <span className="text-muted">—</span>}</td>
                      <td>
                        <StatusBadge status={stockStatus} />
                      </td>
                      <td className="text-right">
                        <div className="action-buttons-group">
                          <button
                            className="table-action-btn edit-btn"
                            title="Edit part"
                            onClick={() => openEditModal(p)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="table-action-btn delete-btn"
                            title="Delete part"
                            onClick={() => handleDelete(p._id, p.partName)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD / EDIT SPARE PART MODAL */}
      {showModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-dialog modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>{editingPart ? "Edit Spare Part" : "Add Spare Part to Inventory"}</h3>
                <p>{editingPart ? "Update inventory item and pricing" : "Add a replacement part to the warehouse stock"}</p>
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
                  <label>Part Name *</label>
                  <input
                    type="text"
                    name="partName"
                    value={formData.partName}
                    onChange={handleFormChange}
                    placeholder="e.g. Heavy Duty Oil Filter"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Part Number / SKU *</label>
                  <input
                    type="text"
                    name="partNumber"
                    value={formData.partNumber}
                    onChange={handleFormChange}
                    placeholder="e.g. FLT-TT-9821"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Category *</label>
                  <select name="category" value={formData.category} onChange={handleFormChange}>
                    <option value="Engine & Filtration">Engine & Filtration</option>
                    <option value="Braking System">Braking System</option>
                    <option value="Suspension">Suspension</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Lighting">Lighting</option>
                    <option value="Pneumatics">Pneumatics</option>
                    <option value="Engine Drive">Engine Drive</option>
                    <option value="General">General Spares</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>In Stock Quantity *</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleFormChange}
                    placeholder="10"
                    min="0"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Minimum Stock Level</label>
                  <input
                    type="number"
                    name="minimumStock"
                    value={formData.minimumStock}
                    onChange={handleFormChange}
                    placeholder="5"
                    min="0"
                  />
                </div>

                <div className="form-field">
                  <label>Unit Cost (₹)</label>
                  <input
                    type="number"
                    name="unitCost"
                    value={formData.unitCost}
                    onChange={handleFormChange}
                    placeholder="650"
                    min="0"
                  />
                </div>

                <div className="form-field">
                  <label>Supplier Name</label>
                  <input
                    type="text"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleFormChange}
                    placeholder="e.g. Bosch India"
                  />
                </div>

                <div className="form-field">
                  <label>Specific Vehicle Fit (Optional)</label>
                  <select name="vehicle" value={formData.vehicle} onChange={handleFormChange}>
                    <option value="">Universal / Unassigned</option>
                    {vehiclesList.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.vehicleNumber} ({v.make} {v.model})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-field full-width">
                <label>Storage Location & Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  rows={2}
                  placeholder="Shelf bin code, OEM manufacturer notes..."
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-button" onClick={closeModal} disabled={formSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={formSubmitting}>
                  {formSubmitting ? "Saving..." : editingPart ? "Update Part" : "Add to Inventory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SparePartsPage;

