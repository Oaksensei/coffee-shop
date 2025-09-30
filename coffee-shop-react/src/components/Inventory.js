import React, { useState, useEffect } from "react";
import api from "../services/api";

const Inventory = ({ setCurrentPage }) => {
  const [inventory, setInventory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

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

  const getStockStatus = (stock_qty, min_stock) => {
    if (stock_qty <= 0)
      return { status: "Out of Stock", class: "status-inactive" };
    if (stock_qty <= min_stock)
      return { status: "Low Stock", class: "status-pending" };
    return { status: "Good", class: "status-active" };
  };

  const getSupplierName = (supplierId) => {
    if (!supplierId) return "N/A";
    const supplier = suppliers.find((s) => s.id === supplierId);
    return supplier ? supplier.name : "Unknown";
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this inventory item?")
    ) {
      try {
        const response = await api.deleteInventoryItem(id);

        if (response.ok) {
          await loadInventory();
          alert("Inventory item deleted successfully");
        } else {
          alert(
            "Failed to delete inventory item: " +
              (response.message || "Unknown error")
          );
        }
      } catch (error) {
        console.error("Error deleting inventory item:", error);
        alert("Failed to delete inventory item: " + error.message);
      }
    }
  };

  const handleEdit = (item) => {
    // Set editing item and show form
    setShowAddForm(true);
    // You can add state for editing item if needed
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const supplierId = formData.get("supplier_id");
    const itemData = {
      name: formData.get("name"),
      stock_qty: parseInt(formData.get("stock_qty")),
      reorder_point: parseInt(formData.get("min_stock")),
      unit: formData.get("unit"),
      cost_per_unit: parseFloat(formData.get("cost_per_unit")),
      supplier_id: supplierId ? parseInt(supplierId) : null,
    };

    try {
      const response = await api.createInventoryItem(itemData);
      if (response.ok) {
        setInventory([...inventory, response.data]);
        setShowAddForm(false);
        alert("Inventory item added successfully");
      } else {
        alert("Failed to add inventory item");
      }
    } catch (error) {
      console.error("Error adding inventory item:", error);
      alert("Failed to add inventory item");
    }
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
          <h1 className="text-3xl font-bold text-gray-900">
            Inventory & Ingredients Management
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your inventory, ingredients, and stock levels
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary"
          >
            <i className="fas fa-plus mr-2"></i>
            Add Item
          </button>
          <button
            onClick={() => setCurrentPage("inventory-receive")}
            className="btn btn-success"
          >
            <i className="fas fa-truck mr-2"></i>
            Receive Stock
          </button>
          <button
            onClick={() => setCurrentPage("inventory-adjust")}
            className="btn btn-warning"
          >
            <i className="fas fa-balance-scale mr-2"></i>
            Adjust Stock
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Name
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min Stock
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventory.map((item) => {
                // Use status from backend or calculate if not available
                const stockStatus = item.status
                  ? {
                      status:
                        item.status === "out_of_stock"
                          ? "Out of Stock"
                          : item.status === "low"
                          ? "Low Stock"
                          : "Good",
                      class:
                        item.status === "out_of_stock"
                          ? "status-inactive"
                          : item.status === "low"
                          ? "status-pending"
                          : "status-active",
                    }
                  : getStockStatus(item.stock_qty, item.min_stock);
                return (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="text-sm font-medium text-gray-900">
                        {item.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center capitalize">
                      {item.unit || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {item.stock_qty}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {item.min_stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      <span className={`status-badge ${stockStatus.class}`}>
                        {stockStatus.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      ฿{Number(item.cost_per_unit).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getSupplierName(item.supplier_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      <div className="flex space-x-2 justify-center">
                        <button
                          onClick={() => handleEdit(item)}
                          className="btn btn-warning text-xs"
                        >
                          <i className="fas fa-edit mr-1"></i>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="btn btn-danger text-xs"
                        >
                          <i className="fas fa-trash mr-1"></i>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-amber-600">
            {inventory.length}
          </div>
          <div className="text-sm text-gray-500">Total Items</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-orange-600">
            {inventory.filter((item) => item.status === "good").length}
          </div>
          <div className="text-sm text-gray-500">Good Stock</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-amber-500">
            {inventory.filter((item) => item.status === "low").length}
          </div>
          <div className="text-sm text-gray-500">Low Stock</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-600">
            {inventory.filter((item) => item.status === "out_of_stock").length}
          </div>
          <div className="text-sm text-gray-500">Out of Stock</div>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddForm && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
          style={{ marginTop: 0, paddingTop: 0 }}
        >
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Add New Item
              </h3>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="form-label">Item Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="Enter item name"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Initial Stock</label>
                    <input
                      type="number"
                      name="stock_qty"
                      className="form-input"
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Min Stock</label>
                    <input
                      type="number"
                      name="min_stock"
                      className="form-input"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Unit</label>
                    <input
                      type="text"
                      name="unit"
                      className="form-input"
                      placeholder="kg, liter, etc."
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Cost per Unit</label>
                    <input
                      type="number"
                      name="cost_per_unit"
                      step="0.01"
                      className="form-input"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Supplier (Optional)</label>
                  <select name="supplier_id" className="form-input">
                    <option value="">Select a supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Item
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

export default Inventory;
