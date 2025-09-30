import React, { useState, useEffect } from "react";
import api from "../services/api";

const OrderDetail = ({ orderId, onClose }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrderDetail();
    }
  }, [orderId]);

  const loadOrderDetail = async () => {
    try {
      const response = await api.getOrder(orderId);
      if (response.ok) {
        setOrder(response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading order details:", error);
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      paid: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      cancel: "bg-red-100 text-red-800",
      refund: "bg-gray-100 text-gray-800",
    };
    return statusClasses[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Order not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
        {onClose && (
          <button onClick={onClose} className="btn btn-secondary">
            <i className="fas fa-times mr-2"></i>
            Close
          </button>
        )}
      </div>

      {/* Order Information */}
      <div className="card">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Order Information
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Order ID
              </label>
              <p className="text-lg font-semibold text-gray-900">#{order.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Status
              </label>
              <p className="text-lg">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Total Amount
              </label>
              <p className="text-lg font-semibold text-gray-900">
                ฿{Number(order.total).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Created At
              </label>
              <p className="text-gray-900">
                {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Customer
              </label>
              <p className="text-gray-900">{order.customer || "Walk-in"}</p>
            </div>
          </div>
          {order.discount_code && (
            <div className="mt-6">
              <label className="text-sm font-medium text-gray-500">
                Promotion Applied
              </label>
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-800">
                      {order.promotion_code || order.discount_code}
                    </p>
                    {order.promotion_type && (
                      <p className="text-sm text-green-600">
                        {order.promotion_type === "percent"
                          ? `${order.promotion_value}% off`
                          : `฿${order.promotion_value} off`}
                        {order.promotion_min_spend > 0 &&
                          ` (min. spend ฿${order.promotion_min_spend})`}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-600">Active</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {order.note && (
            <div className="mt-6">
              <label className="text-sm font-medium text-gray-500">Notes</label>
              <p className="text-gray-900">{order.note}</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="card">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="bg-gray-50">
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.items &&
                order.items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div className="text-sm font-medium text-gray-900">
                        {item.product_name}
                      </div>
                    </td>
                    <td className="table td">
                      {item.qty || item.quantity || 0}
                    </td>
                    <td className="table td">
                      ฿{Number(item.unit_price || 0).toFixed(2)}
                    </td>
                    <td className="table td">
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

      {/* Order Summary */}
      <div className="card">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Order Summary</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">
                ฿{Number(order.sub_total || order.total || 0).toFixed(2)}
              </span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Discount{" "}
                  {order.promotion_code
                    ? `(${order.promotion_code})`
                    : order.discount_code
                    ? `(${order.discount_code})`
                    : ""}
                  :
                </span>
                <span className="font-medium text-red-600">
                  -฿{Number(order.discount).toFixed(2)}
                </span>
              </div>
            )}
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-gray-900">
                  Total:
                </span>
                <span className="text-lg font-semibold text-gray-900">
                  ฿{Number(order.total).toFixed(2)}
                </span>
              </div>
            </div>
            {order.discount > 0 && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <i className="fas fa-tag text-green-600 mr-2"></i>
                  <span className="text-sm text-green-800">
                    You saved ฿{Number(order.discount).toFixed(2)} with{" "}
                    {order.promotion_code || order.discount_code}
                    {order.promotion_type && (
                      <span className="ml-1 text-xs">
                        (
                        {order.promotion_type === "percent"
                          ? `${order.promotion_value}% off`
                          : `฿${order.promotion_value} off`}
                        )
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
