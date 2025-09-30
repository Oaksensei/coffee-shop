import React, { useState, useEffect } from "react";
import api from "../services/api";

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      const response = await api.getPromotions();
      if (response.ok) {
        setPromotions(response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading promotions:", error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this promotion?")) {
      try {
        const response = await api.deletePromotion(id);
        if (response.ok) {
          setPromotions(promotions.filter((promotion) => promotion.id !== id));
          alert("Promotion deleted successfully");
        } else {
          alert("Failed to delete promotion");
        }
      } catch (error) {
        console.error("Error deleting promotion:", error);
        alert("Failed to delete promotion");
      }
    }
  };

  const handleEdit = (promotion) => {
    setEditingPromotion(promotion);
    setShowAddForm(true);
  };

  const handleStatusToggle = async (id) => {
    try {
      const promotion = promotions.find((p) => p.id === id);
      const newStatus = promotion.status === "active" ? "inactive" : "active";
      const response = await api.updatePromotionStatus(id, newStatus);
      if (response.ok) {
        setPromotions(
          promotions.map((promotion) =>
            promotion.id === id
              ? { ...promotion, status: newStatus }
              : promotion
          )
        );
        alert(
          `Promotion ${
            newStatus === "active" ? "activated" : "deactivated"
          } successfully`
        );
      } else {
        alert("Failed to update promotion status");
      }
    } catch (error) {
      console.error("Error updating promotion status:", error);
      alert("Failed to update promotion status");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const promotionData = {
      code: formData.get("code"),
      type: formData.get("type"),
      value: parseFloat(formData.get("value")) || 0,
      min_spend: parseFloat(formData.get("min_spend")) || 0,
      start_at: formData.get("start_at")
        ? new Date(formData.get("start_at"))
            .toISOString()
            .slice(0, 19)
            .replace("T", " ")
        : null,
      end_at: formData.get("end_at")
        ? new Date(formData.get("end_at"))
            .toISOString()
            .slice(0, 19)
            .replace("T", " ")
        : null,
      status: formData.get("status"),
    };

    try {
      if (editingPromotion) {
        // Update existing promotion
        const response = await api.updatePromotion(
          editingPromotion.id,
          promotionData
        );
        if (response.ok) {
          setPromotions(
            promotions.map((p) =>
              p.id === editingPromotion.id ? { ...p, ...promotionData } : p
            )
          );
          setShowAddForm(false);
          setEditingPromotion(null);
          alert("Promotion updated successfully");
        } else {
          alert(
            `Failed to update promotion: ${response.error || "Unknown error"}`
          );
        }
      } else {
        // Add new promotion
        const response = await api.createPromotion(promotionData);
        if (response.ok) {
          setPromotions([...promotions, response.data]);
          setShowAddForm(false);
          alert("Promotion added successfully");
        } else {
          alert(
            `Failed to add promotion: ${response.error || "Unknown error"}`
          );
        }
      }
    } catch (error) {
      console.error("Error saving promotion:", error);
      alert(`Failed to save promotion: ${error.message || "Unknown error"}`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPromotionValue = (promotion) => {
    if (promotion.type === "percent") {
      return `${promotion.value}%`;
    } else {
      return `฿${promotion.value}`;
    }
  };

  const isExpired = (endDate) => {
    return new Date(endDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promotions</h1>
          <p className="mt-2 text-gray-600">
            Manage your promotions and discounts
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary self-start sm:self-auto"
        >
          <i className="fas fa-plus mr-2"></i>
          Add Promotion
        </button>
      </div>

      {/* Promotions Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min Spend
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valid Period
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {promotions.map((promotion) => (
                <tr key={promotion.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {promotion.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center capitalize">
                    {promotion.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {getPromotionValue(promotion)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    ฿{promotion.min_spend}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    <div className="text-sm">
                      <div>{formatDate(promotion.start_at)}</div>
                      <div className="text-gray-500">
                        to {formatDate(promotion.end_at)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    <span
                      className={`status-badge ${
                        isExpired(promotion.end_at)
                          ? "status-inactive"
                          : promotion.status === "active"
                          ? "status-active"
                          : "status-inactive"
                      }`}
                    >
                      {isExpired(promotion.end_at)
                        ? "Expired"
                        : promotion.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    <div className="flex space-x-2 justify-center">
                      <button
                        onClick={() => handleEdit(promotion)}
                        className="btn btn-warning text-xs"
                      >
                        <i className="fas fa-edit mr-1"></i>
                        Edit
                      </button>
                      <button
                        onClick={() => handleStatusToggle(promotion.id)}
                        className={`btn text-xs ${
                          promotion.status === "active"
                            ? "btn-danger"
                            : "btn-success"
                        }`}
                        disabled={isExpired(promotion.end_at)}
                      >
                        <i
                          className={`fas ${
                            promotion.status === "active"
                              ? "fa-pause"
                              : "fa-play"
                          } mr-1`}
                        ></i>
                        {promotion.status === "active"
                          ? "Deactivate"
                          : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDelete(promotion.id)}
                        className="btn btn-danger text-xs"
                      >
                        <i className="fas fa-trash mr-1"></i>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Promotion Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">
            {promotions.length}
          </div>
          <div className="text-sm text-gray-500">Total Promotions</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">
            {
              promotions.filter(
                (p) => p.status === "active" && !isExpired(p.end_at)
              ).length
            }
          </div>
          <div className="text-sm text-gray-500">Active Promotions</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-600">
            {promotions.filter((p) => isExpired(p.end_at)).length}
          </div>
          <div className="text-sm text-gray-500">Expired Promotions</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {
              promotions.filter(
                (p) => p.status === "inactive" && !isExpired(p.end_at)
              ).length
            }
          </div>
          <div className="text-sm text-gray-500">Inactive Promotions</div>
        </div>
      </div>

      {/* Add/Edit Promotion Modal */}
      {showAddForm && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
          style={{ marginTop: 0, paddingTop: 0 }}
        >
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingPromotion ? "Edit Promotion" : "Add New Promotion"}
              </h3>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="form-label">Promotion Code</label>
                  <input
                    type="text"
                    name="code"
                    className="form-input"
                    defaultValue={editingPromotion?.code || ""}
                    placeholder="Enter promotion code"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Discount Type</label>
                    <select
                      name="type"
                      className="form-input"
                      defaultValue={editingPromotion?.type || "percent"}
                    >
                      <option value="percent">Percentage (%)</option>
                      <option value="amount">Fixed Amount (฿)</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Discount Value</label>
                    <input
                      type="number"
                      name="value"
                      step="0.01"
                      className="form-input"
                      defaultValue={editingPromotion?.value || ""}
                      placeholder="Enter discount value"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Minimum Spend</label>
                  <input
                    type="number"
                    name="min_spend"
                    step="0.01"
                    className="form-input"
                    defaultValue={editingPromotion?.min_spend || ""}
                    placeholder="Enter minimum spend"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      name="start_at"
                      className="form-input"
                      defaultValue={
                        editingPromotion?.start_at
                          ? editingPromotion.start_at.split("T")[0]
                          : ""
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      name="end_at"
                      className="form-input"
                      defaultValue={
                        editingPromotion?.end_at
                          ? editingPromotion.end_at.split("T")[0]
                          : ""
                      }
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    className="form-input"
                    defaultValue={editingPromotion?.status || "active"}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingPromotion(null);
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingPromotion ? "Update" : "Add"} Promotion
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Promotions;
