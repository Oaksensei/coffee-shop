import React, { useState, useEffect } from "react";
import api from "../services/api";

const InventoryAdjust = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    item_id: "",
    adjustment_type: "",
    quantity: "",
    reason: "",
  });

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const response = await api.getInventory();
      if (response.ok) {
        setInventory(response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading inventory:", error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Submitting adjustment:", formData);

      // Convert quantity to amount for backend
      const adjustmentData = {
        item_id: formData.item_id,
        adjustment_type: formData.adjustment_type,
        amount: parseFloat(formData.quantity), // Backend expects 'amount' not 'quantity'
        reason: formData.reason,
      };

      console.log("Sending adjustment data:", adjustmentData);
      const response = await api.adjustInventory(adjustmentData);
      console.log("Adjustment response:", response);

      if (response.ok) {
        alert("Stock adjusted successfully!");
        setFormData({
          item_id: "",
          adjustment_type: "",
          quantity: "",
          reason: "",
        });
        loadInventory();
      } else {
        alert(
          "Failed to adjust inventory: " + (response.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error adjusting inventory:", error);
      alert("Failed to adjust inventory: " + error.message);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Adjust Stock</h1>
        <p className="text-gray-600 mb-4">
          ปรับสต็อกด้วยตนเอง (สำหรับการนับสต็อก, เสียหาย, หรือเหตุผลอื่นๆ)
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="flex-shrink-0 mb-3">
              <i className="fas fa-balance-scale text-yellow-400 text-2xl"></i>
            </div>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Manual Adjustment
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  ใช้ฟังก์ชันนี้สำหรับการปรับสต็อกด้วยตนเอง เช่น การนับสต็อก,
                  สินค้าเสียหาย
                </p>
                <p className="mt-1">ไม่ใช่สำหรับการรับสต็อกจากผู้จัดหา</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="card">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Stock Adjustment
          </h3>
        </div>
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Select Item *</label>
                <select
                  className="form-input"
                  name="item_id"
                  value={formData.item_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select item to adjust</option>
                  {inventory.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} (Current: {Number(item.stock_qty).toFixed(2)}{" "}
                      {item.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Adjustment Type *</label>
                <select
                  className="form-input"
                  name="adjustment_type"
                  value={formData.adjustment_type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select adjustment type</option>
                  <option value="increase">Increase Stock</option>
                  <option value="decrease">Decrease Stock</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Quantity *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="Enter quantity"
                  required
                />
              </div>
              <div>
                <label className="form-label">Reason *</label>
                <input
                  type="text"
                  className="form-input"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Enter reason for adjustment"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    item_id: "",
                    adjustment_type: "",
                    quantity: "",
                    reason: "",
                  })
                }
                className="btn btn-secondary"
              >
                Clear Form
              </button>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-balance-scale mr-2"></i>
                Adjust Stock
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InventoryAdjust;
