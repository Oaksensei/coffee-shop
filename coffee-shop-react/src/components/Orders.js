import React, { useState, useEffect } from "react";
import api from "../services/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await api.getOrders();
      if (response.ok) {
        setOrders(response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading orders:", error);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await api.updateOrderStatus(orderId, newStatus);
      if (response.ok) {
        setOrders(
          orders.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
        alert(`Order status updated to ${newStatus}`);
      } else {
        alert("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      console.log("Loading order details for ID:", orderId);
      const response = await api.getOrder(orderId);
      console.log("Order details response:", response);

      if (response.ok) {
        setSelectedOrder(response.data);
        setShowOrderDetail(true);
        console.log("Order details loaded successfully");
      } else {
        console.log("Order details response not ok:", response);
        alert(
          "Failed to load order details: " + (response.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error loading order details:", error);
      alert("Failed to load order details: " + error.message);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        console.log("Attempting to delete order with ID:", orderId);
        const response = await api.deleteOrder(orderId);
        console.log("Delete response:", response);

        if (response.ok) {
          console.log("Delete successful, reloading orders...");
          await loadOrders();
          console.log("Orders reloaded");
          alert("Order deleted successfully");
        } else {
          console.log("Delete failed:", response);
          alert(
            "Failed to delete order: " + (response.message || "Unknown error")
          );
        }
      } catch (error) {
        console.error("Error deleting order:", error);
        alert("Failed to delete order: " + error.message);
      }
    }
  };

  const handlePrintReceipt = async (orderId) => {
    try {
      // Get order details
      const response = await api.getOrder(orderId);
      if (!response.ok) {
        alert("Failed to load order details");
        return;
      }

      const order = response.data;

      // Create receipt content
      const receiptContent = `
        <div style="font-family: 'Courier New', monospace; font-size: 12px; max-width: 300px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="font-size: 18px; margin: 0; font-weight: bold;">COFFEE SHOP</h1>
            <p style="margin: 5px 0; font-size: 10px;">123 Coffee Street, Bangkok 10110</p>
            <p style="margin: 5px 0; font-size: 10px;">Tel: 02-123-4567</p>
            <p style="margin: 5px 0; font-size: 10px;">Tax ID: 1234567890123</p>
          </div>
          
          <div style="border-top: 1px dashed #000; padding-top: 10px; margin-bottom: 10px;">
            <p style="margin: 2px 0;"><strong>Receipt #${order.id}</strong></p>
            <p style="margin: 2px 0;">Date: ${new Date(
              order.created_at
            ).toLocaleString("th-TH")}</p>
            <p style="margin: 2px 0;">Customer: ${
              order.customer || "Walk-in"
            }</p>
            <p style="margin: 2px 0;">Payment: ${order.pay_method.toUpperCase()}</p>
          </div>
          
          <div style="border-top: 1px dashed #000; padding-top: 10px; margin-bottom: 10px;">
            ${order.items
              .map(
                (item) => `
              <div style="display: flex; justify-content: space-between; margin: 3px 0;">
                <span>${item.product_name}</span>
                <span>${item.qty}x</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 0 0 5px 0; font-size: 11px;">
                <span>@ ฿${Number(item.unit_price).toFixed(2)}</span>
                <span>฿${(Number(item.qty) * Number(item.unit_price)).toFixed(
                  2
                )}</span>
              </div>
            `
              )
              .join("")}
          </div>
          
          <div style="border-top: 1px dashed #000; padding-top: 10px;">
            <div style="display: flex; justify-content: space-between; margin: 3px 0;">
              <span>Subtotal:</span>
              <span>฿${Number(order.sub_total).toFixed(2)}</span>
            </div>
            ${
              order.discount > 0
                ? `
              <div style="display: flex; justify-content: space-between; margin: 3px 0; color: #d32f2f;">
                <span>Discount (${order.discount_code}):</span>
                <span>-฿${Number(order.discount).toFixed(2)}</span>
              </div>
            `
                : ""
            }
            <div style="display: flex; justify-content: space-between; margin: 5px 0; font-weight: bold; border-top: 1px solid #000; padding-top: 5px;">
              <span>TOTAL:</span>
              <span>฿${Number(order.total).toFixed(2)}</span>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; border-top: 1px dashed #000; padding-top: 10px;">
            <p style="margin: 5px 0; font-size: 10px;">Thank you for your visit!</p>
            <p style="margin: 5px 0; font-size: 10px;">Please come again</p>
          </div>
        </div>
      `;

      // Create new window for printing
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt #${order.id}</title>
            <style>
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${receiptContent}
            <div class="no-print" style="text-align: center; margin-top: 20px;">
              <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Receipt</button>
              <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      console.error("Error printing receipt:", error);
      alert("Failed to print receipt: " + error.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      paid: "status-paid",
      cancel: "status-cancel",
      refund: "status-refund",
      pending: "status-pending",
    };

    return `status-badge ${statusClasses[status] || "status-pending"}`;
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
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="mt-2 text-gray-600">View and manage customer orders</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button className="btn btn-primary">
            <i className="fas fa-plus mr-2"></i>
            New Order
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="text-sm font-medium text-gray-900">
                      #{order.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {order.items_count || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    ฿{Number(order.total).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    <span className={getStatusBadge(order.status)}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    <div className="flex space-x-2 justify-center">
                      <button
                        onClick={() => handleStatusUpdate(order.id, "paid")}
                        className="btn btn-success text-xs"
                        disabled={order.status === "paid"}
                      >
                        <i className="fas fa-check mr-1"></i>
                        Paid
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(order.id, "cancel")}
                        className="btn btn-danger text-xs"
                        disabled={order.status === "cancel"}
                      >
                        <i className="fas fa-times mr-1"></i>
                        Cancel
                      </button>
                      <button
                        onClick={() => handleViewOrder(order.id)}
                        className="btn btn-secondary text-xs"
                      >
                        <i className="fas fa-eye mr-1"></i>
                        View
                      </button>
                      <button
                        onClick={() => handlePrintReceipt(order.id)}
                        className="btn btn-warning text-xs"
                      >
                        <i className="fas fa-print mr-1"></i>
                        Print
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
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

      {/* Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">
            {orders.length}
          </div>
          <div className="text-sm text-gray-500">Total Orders</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">
            {orders.filter((o) => o.status === "paid").length}
          </div>
          <div className="text-sm text-gray-500">Paid Orders</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-600">
            {orders.filter((o) => o.status === "cancel").length}
          </div>
          <div className="text-sm text-gray-500">Cancelled Orders</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-600">
            ฿
            {Number(
              orders.reduce((sum, order) => sum + Number(order.total), 0)
            ).toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">Total Revenue</div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          style={{ marginTop: 0, paddingTop: 0 }}
        >
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Order Details - #{selectedOrder.id}
              </h2>
              <button
                onClick={() => setShowOrderDetail(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            {/* Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="card">
                <h3 className="font-semibold mb-2">Order Information</h3>
                <p>
                  <strong>Order ID:</strong> #{selectedOrder.id}
                </p>
                <p>
                  <strong>Customer:</strong> {selectedOrder.customer || "N/A"}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={getStatusBadge(selectedOrder.status)}>
                    {selectedOrder.status}
                  </span>
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
              </div>
              <div className="card">
                <h3 className="font-semibold mb-2">Order Summary</h3>
                <p>
                  <strong>Subtotal:</strong> ฿
                  {Number(
                    selectedOrder.sub_total || selectedOrder.total || 0
                  ).toFixed(2)}
                </p>
                {selectedOrder.discount &&
                  Number(selectedOrder.discount) > 0 && (
                    <>
                      <p>
                        <strong>Promotion Applied:</strong>{" "}
                        <span className="text-green-600 font-medium">Yes</span>
                      </p>
                      <p>
                        <strong>Discount:</strong>{" "}
                        <span className="text-green-600">
                          -฿{Number(selectedOrder.discount).toFixed(2)}
                        </span>
                      </p>
                    </>
                  )}
                <p>
                  <strong>Total:</strong> ฿
                  {Number(selectedOrder.total || 0).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Order Items */}
            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div className="card">
                <h3 className="font-semibold mb-4">Order Items</h3>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.product_name}</td>
                          <td>{item.qty || item.quantity || 0}</td>
                          <td>฿{Number(item.unit_price || 0).toFixed(2)}</td>
                          <td>
                            ฿
                            {Number(
                              (item.qty || item.quantity || 0) *
                                (item.unit_price || 0)
                            ).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowOrderDetail(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
              {selectedOrder.status !== "paid" && (
                <button
                  onClick={() => {
                    handleStatusUpdate(selectedOrder.id, "paid");
                    setShowOrderDetail(false);
                  }}
                  className="btn btn-success"
                >
                  Mark as Paid
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
