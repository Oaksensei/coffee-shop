import React, { useState, useEffect } from "react";
import api from "../services/api";

const Dashboard = ({ setCurrentPage }) => {
  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    todayOrders: 0,
    todayRevenue: 0,
    lowStockItems: 0,
    totalSuppliers: 0,
    activePromotions: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // ดึงข้อมูลจาก dashboard API และ API อื่นๆ
      const [
        dashboardResponse,
        productsResponse,
        ordersResponse,
        suppliersResponse,
        promotionsResponse,
        topProductsResponse,
      ] = await Promise.all([
        api.getDashboardData(),
        api.getProducts(),
        api.getOrders(),
        api.getSuppliers(),
        api.getPromotions(),
        api.getTopProducts(),
      ]);

      // ข้อมูลจาก dashboard API
      const dashboardData = dashboardResponse.ok ? dashboardResponse.data : {};
      const products = productsResponse.ok ? productsResponse.data : [];
      const orders = ordersResponse.ok ? ordersResponse.data : [];
      const suppliers = suppliersResponse.ok ? suppliersResponse.data : [];
      const promotions = promotionsResponse.ok ? promotionsResponse.data : [];
      const topProductsData = topProductsResponse.ok
        ? topProductsResponse.data
        : [];

      // คำนวณข้อมูลวันนี้
      const today = new Date().toDateString();
      const todayOrders = orders.filter(
        (order) => new Date(order.created_at).toDateString() === today
      );

      const todayRevenue = todayOrders.reduce(
        (sum, order) => sum + Number(order.total || 0),
        0
      );

      // คำนวณ active promotions
      const activePromotions = promotions.filter(
        (promotion) =>
          promotion.status === "active" &&
          new Date(promotion.end_at) > new Date()
      ).length;

      // ดึง recent orders (5 อันดับล่าสุด)
      const recentOrdersData = orders
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      setMetrics({
        totalProducts: products.length,
        todayOrders: todayOrders.length,
        todayRevenue: todayRevenue,
        lowStockItems: dashboardData.low_stock
          ? dashboardData.low_stock.length
          : 0,
        totalSuppliers: suppliers.length,
        activePromotions: activePromotions,
      });

      setRecentOrders(recentOrdersData);
      setTopProducts(topProductsData);
      setLoading(false);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setLoading(false);
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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to your coffee shop management system
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-coffee text-blue-500 text-2xl"></i>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500">
                  Total Products
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {metrics.totalProducts}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-shopping-cart text-green-500 text-2xl"></i>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500">
                  Today's Orders
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {metrics.todayOrders}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-dollar-sign text-yellow-500 text-2xl"></i>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500">
                  Today's Revenue
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  ฿{Number(metrics.todayRevenue).toFixed(2)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-box text-purple-500 text-2xl"></i>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500">
                  Low Stock Items
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {metrics.lowStockItems}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-truck text-orange-500 text-2xl"></i>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500">
                  Total Suppliers
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {metrics.totalSuppliers}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-tags text-pink-500 text-2xl"></i>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500">
                  Active Promotions
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {metrics.activePromotions}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Orders
          </h3>
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between py-2 border-b border-gray-200"
              >
                <div>
                  <p className="font-medium">Order #{order.id}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ฿{Number(order.total).toFixed(2)}
                  </p>
                  <p
                    className={`text-sm status-badge ${
                      order.status === "paid"
                        ? "status-paid"
                        : order.status === "cancel"
                        ? "status-cancel"
                        : order.status === "refund"
                        ? "status-refund"
                        : "status-pending"
                    }`}
                  >
                    {order.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Top Selling Products
          </h3>
          <div className="space-y-2">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div
                  key={product.product_id || index}
                  className="flex items-center justify-between py-2 border-b border-gray-200"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-bold text-blue-600">
                        #{index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{product.product_name}</p>
                      <p className="text-sm text-gray-500">
                        Product ID: {product.product_id}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      {product.qty} sold
                    </p>
                    <p className="text-sm text-gray-500">
                      ฿{Number(product.amount).toFixed(2)} total
                    </p>
                    {/* Progress bar showing relative sales */}
                    <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            (product.qty /
                              Math.max(...topProducts.map((p) => p.qty), 1)) *
                              100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <i className="fas fa-chart-line text-3xl mb-2 block"></i>
                <p>No sales data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <button
            onClick={() => setCurrentPage("pos")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg text-center transition-colors duration-200"
          >
            <i className="fas fa-cash-register text-2xl mb-2 block"></i>
            <div className="font-medium">New Sale</div>
          </button>
          <button
            onClick={() => setCurrentPage("products")}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg text-center transition-colors duration-200"
          >
            <i className="fas fa-plus text-2xl mb-2 block"></i>
            <div className="font-medium">Add Product</div>
          </button>
          <button
            onClick={() => setCurrentPage("inventory")}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-lg text-center transition-colors duration-200"
          >
            <i className="fas fa-edit text-2xl mb-2 block"></i>
            <div className="font-medium">Adjust Stock</div>
          </button>
          <button
            onClick={() => setCurrentPage("orders")}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg text-center transition-colors duration-200"
          >
            <i className="fas fa-list text-2xl mb-2 block"></i>
            <div className="font-medium">View Orders</div>
          </button>
          <button
            onClick={() => setCurrentPage("suppliers")}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg text-center transition-colors duration-200"
          >
            <i className="fas fa-truck text-2xl mb-2 block"></i>
            <div className="font-medium">Suppliers</div>
          </button>
          <button
            onClick={() => setCurrentPage("promotions")}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-3 rounded-lg text-center transition-colors duration-200"
          >
            <i className="fas fa-tags text-2xl mb-2 block"></i>
            <div className="font-medium">Promotions</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
