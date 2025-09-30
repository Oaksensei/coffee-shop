import React, { useState, useEffect } from "react";
import api from "../services/api";

const InventoryReceive = () => {
  const [inventory, setInventory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    item_id: "",
    quantity: "",
    cost_per_unit: "",
    supplier_id: "",
    reason: "",
  });

  useEffect(() => {
    loadInventory();
    loadSuppliers();
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

  const loadSuppliers = async () => {
    try {
      const response = await api.getSuppliers();
      if (response.ok) {
        setSuppliers(response.data);
      }
    } catch (error) {
      console.error("Error loading suppliers:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert form data to backend format
      const receiveData = {
        supplier_id: formData.supplier_id || null,
        date: new Date().toISOString().split("T")[0],
        items: [
          {
            ingredient_id: parseInt(formData.item_id),
            qty: parseFloat(formData.quantity),
            price_per_unit: formData.cost_per_unit
              ? parseFloat(formData.cost_per_unit)
              : null,
          },
        ],
      };

      const response = await api.receiveInventory(receiveData);

      if (response.ok) {
        alert("Stock received successfully!");
        setFormData({
          item_id: "",
          quantity: "",
          cost_per_unit: "",
          supplier_id: "",
          reason: "",
        });
        loadInventory();
      } else {
        alert(
          "Failed to receive inventory: " + (response.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error receiving inventory:", error);
      alert("Failed to receive inventory: " + error.message);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Receive Stock</h1>
        <p className="text-gray-600 mb-4">
          รับสต็อกเพิ่มจากผู้จัดหา (สำหรับวัตถุดิบที่มีอยู่แล้วในระบบ)
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-2xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="flex-shrink-0 mb-3">
              <i className="fas fa-truck text-green-400 text-2xl"></i>
            </div>
            <div>
              <h3 className="text-sm font-medium text-green-800">
                Existing Items Only
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  ใช้ฟังก์ชันนี้สำหรับรับสต็อกเพิ่มของวัตถุดิบที่มีอยู่แล้วในระบบ
                </p>
                <p className="mt-1">
                  หากต้องการเพิ่มวัตถุดิบใหม่ ให้ใช้ "Add New Item"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="card">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Stock Receipt</h3>
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
                  <option value="">Select existing item</option>
                  {inventory.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} (Current: {Number(item.stock_qty).toFixed(2)}{" "}
                      {item.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Quantity to Receive *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="Enter quantity to receive"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Cost per Unit</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  name="cost_per_unit"
                  value={formData.cost_per_unit}
                  onChange={handleChange}
                  placeholder="Enter cost per unit"
                />
              </div>
              <div>
                <label className="form-label">Supplier</label>
                <select
                  className="form-input"
                  name="supplier_id"
                  value={formData.supplier_id}
                  onChange={handleChange}
                >
                  <option value="">Select supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="form-label">Reason/Notes</label>
              <textarea
                className="form-input"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Enter reason or notes for this receipt"
                rows="3"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    item_id: "",
                    quantity: "",
                    cost_per_unit: "",
                    supplier_id: "",
                    reason: "",
                  })
                }
                className="btn btn-secondary"
              >
                Clear Form
              </button>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-truck mr-2"></i>
                Receive Stock
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InventoryReceive;
