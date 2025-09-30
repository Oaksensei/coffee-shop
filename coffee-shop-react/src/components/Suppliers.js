import React, { useState, useEffect } from "react";
import api from "../services/api";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const response = await api.getSuppliers();
      if (response.ok) {
        setSuppliers(response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading suppliers:", error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      try {
        const response = await api.deleteSupplier(id);
        if (response.ok) {
          setSuppliers(suppliers.filter((supplier) => supplier.id !== id));
          alert("Supplier deleted successfully");
        } else {
          alert("Failed to delete supplier");
        }
      } catch (error) {
        console.error("Error deleting supplier:", error);
        alert("Failed to delete supplier");
      }
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setShowAddForm(true);
  };

  const handleStatusToggle = async (id) => {
    try {
      const supplier = suppliers.find((s) => s.id === id);
      const newStatus = supplier.status === "active" ? "inactive" : "active";
      const response = await api.updateSupplierStatus(id, newStatus);
      if (response.ok) {
        setSuppliers(
          suppliers.map((supplier) =>
            supplier.id === id ? { ...supplier, status: newStatus } : supplier
          )
        );
        alert(
          `Supplier ${
            newStatus === "active" ? "activated" : "deactivated"
          } successfully`
        );
      } else {
        alert("Failed to update supplier status");
      }
    } catch (error) {
      console.error("Error updating supplier status:", error);
      alert("Failed to update supplier status");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const supplierData = {
      name: formData.get("name"),
      contact_name: formData.get("contact_name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      status: formData.get("status"),
    };

    try {
      if (editingSupplier) {
        // Update existing supplier
        const response = await api.updateSupplier(
          editingSupplier.id,
          supplierData
        );
        if (response.ok) {
          setSuppliers(
            suppliers.map((s) =>
              s.id === editingSupplier.id ? { ...s, ...supplierData } : s
            )
          );
          setShowAddForm(false);
          setEditingSupplier(null);
          alert("Supplier updated successfully");
        } else {
          alert("Failed to update supplier");
        }
      } else {
        // Add new supplier
        const response = await api.createSupplier(supplierData);
        if (response.ok) {
          setSuppliers([...suppliers, response.data]);
          setShowAddForm(false);
          alert("Supplier added successfully");
        } else {
          alert("Failed to add supplier");
        }
      }
    } catch (error) {
      console.error("Error saving supplier:", error);
      alert("Failed to save supplier");
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
          <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
          <p className="mt-2 text-gray-600">
            Manage your suppliers and vendors
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary self-start sm:self-auto"
        >
          <i className="fas fa-plus mr-2"></i>
          Add Supplier
        </button>
      </div>

      {/* Suppliers Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Person
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
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
              {suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="text-sm font-medium text-gray-900">
                      {supplier.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {supplier.contact_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {supplier.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {supplier.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {supplier.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    <span
                      className={`status-badge ${
                        supplier.status === "active"
                          ? "status-active"
                          : "status-inactive"
                      }`}
                    >
                      {supplier.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    <div className="flex space-x-2 justify-center">
                      <button
                        onClick={() => handleEdit(supplier)}
                        className="btn btn-warning text-xs"
                      >
                        <i className="fas fa-edit mr-1"></i>
                        Edit
                      </button>
                      <button
                        onClick={() => handleStatusToggle(supplier.id)}
                        className={`btn text-xs ${
                          supplier.status === "active"
                            ? "btn-danger"
                            : "btn-success"
                        }`}
                      >
                        <i
                          className={`fas ${
                            supplier.status === "active"
                              ? "fa-pause"
                              : "fa-play"
                          } mr-1`}
                        ></i>
                        {supplier.status === "active"
                          ? "Deactivate"
                          : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDelete(supplier.id)}
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

      {/* Supplier Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">
            {suppliers.length}
          </div>
          <div className="text-sm text-gray-500">Total Suppliers</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">
            {suppliers.filter((s) => s.status === "active").length}
          </div>
          <div className="text-sm text-gray-500">Active Suppliers</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-600">
            {suppliers.filter((s) => s.status === "inactive").length}
          </div>
          <div className="text-sm text-gray-500">Inactive Suppliers</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {suppliers.filter((s) => s.status === "active").length}
          </div>
          <div className="text-sm text-gray-500">Available Suppliers</div>
        </div>
      </div>

      {/* Add/Edit Supplier Modal */}
      {showAddForm && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
          style={{ marginTop: 0, paddingTop: 0 }}
        >
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingSupplier ? "Edit Supplier" : "Add New Supplier"}
              </h3>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    defaultValue={editingSupplier?.name || ""}
                    placeholder="Enter company name"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Contact Person</label>
                  <input
                    type="text"
                    name="contact_name"
                    className="form-input"
                    defaultValue={editingSupplier?.contact_name || ""}
                    placeholder="Enter contact person name"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    defaultValue={editingSupplier?.email || ""}
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    defaultValue={editingSupplier?.phone || ""}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Address</label>
                  <textarea
                    name="address"
                    className="form-input"
                    rows="3"
                    defaultValue={editingSupplier?.address || ""}
                    placeholder="Enter address"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    className="form-input"
                    defaultValue={editingSupplier?.status || "active"}
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
                      setEditingSupplier(null);
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingSupplier ? "Update" : "Add"} Supplier
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

export default Suppliers;
