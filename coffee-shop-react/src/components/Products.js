import React, { useState, useEffect } from "react";
import api from "../services/api";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      console.log("Loading products...");
      const response = await api.getProducts();
      console.log("Products response:", response);
      if (response.ok) {
        console.log("Setting products data:", response.data);
        setProducts(response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading products:", error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        console.log("Attempting to delete product with ID:", id);
        const response = await api.deleteProduct(id);
        console.log("Delete response:", response);

        if (response.ok) {
          console.log("Delete successful, reloading products...");
          // Reload products data from server
          await loadProducts();
          console.log("Products reloaded");
          alert("Product deleted successfully");
        } else {
          console.log("Delete failed:", response);
          alert(
            "Failed to delete product: " + (response.message || "Unknown error")
          );
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product: " + error.message);
      }
    }
  };

  const handleDeactivate = async (id) => {
    if (window.confirm("Are you sure you want to deactivate this product?")) {
      try {
        const response = await api.updateProduct(id, { status: "inactive" });
        if (response.ok) {
          setProducts(
            products.map((p) =>
              p.id === id ? { ...p, status: "inactive" } : p
            )
          );
        }
      } catch (error) {
        console.error("Error deactivating product:", error);
        alert("Failed to deactivate product");
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowAddForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const productData = {
      name: formData.get("name"),
      category: formData.get("category"),
      price: parseFloat(formData.get("price")),
      description: formData.get("description"),
      status: formData.get("status"),
    };

    try {
      if (editingProduct) {
        // Update existing product
        const response = await api.updateProduct(
          editingProduct.id,
          productData
        );
        if (response.ok) {
          setProducts(
            products.map((p) =>
              p.id === editingProduct.id ? { ...p, ...productData } : p
            )
          );
          setShowAddForm(false);
          setEditingProduct(null);
        }
      } else {
        // Add new product
        const response = await api.createProduct(productData);
        if (response.ok) {
          setProducts([...products, response.data]);
          setShowAddForm(false);
        }
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product");
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
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="mt-2 text-gray-600">Manage your coffee shop products</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary self-start sm:self-auto"
        >
          <i className="fas fa-plus mr-2"></i>
          Add Product
        </button>
      </div>

      {/* Products Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
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
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="text-sm font-medium text-gray-900">
                      {product.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {product.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    ฿{Number(product.price).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    <span
                      className={`status-badge ${
                        product.status === "active"
                          ? "status-active"
                          : "status-inactive"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    <div className="flex space-x-2 justify-center">
                      <button
                        onClick={() => handleEdit(product)}
                        className="btn btn-warning text-xs"
                      >
                        <i className="fas fa-edit mr-1"></i>
                        Edit
                      </button>
                      {product.status === "active" && (
                        <button
                          onClick={() => handleDeactivate(product.id)}
                          className="btn btn-secondary text-xs"
                        >
                          <i className="fas fa-pause mr-1"></i>
                          Deactivate
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(product.id)}
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

      {/* Add/Edit Product Modal */}
      {showAddForm && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
          style={{ marginTop: 0, paddingTop: 0 }}
        >
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="form-label">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    defaultValue={editingProduct?.name || ""}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Category</label>
                  <select
                    name="category"
                    className="form-input"
                    defaultValue={editingProduct?.category || "coffee"}
                  >
                    <option value="coffee">Coffee</option>
                    <option value="tea">Tea</option>
                    <option value="bakery">Bakery</option>
                    <option value="beverage">Beverage</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Price</label>
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    className="form-input"
                    defaultValue={editingProduct?.price || ""}
                    placeholder="Enter price"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    className="form-input"
                    rows="3"
                    defaultValue={editingProduct?.description || ""}
                    placeholder="Enter product description"
                  />
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    className="form-input"
                    defaultValue={editingProduct?.status || "active"}
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
                      setEditingProduct(null);
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingProduct ? "Update" : "Add"} Product
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

export default Products;
