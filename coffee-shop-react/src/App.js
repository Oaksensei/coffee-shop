import React, { useState, useEffect } from "react";
import "./App.css";
import api from "./services/api";

// Components
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import Products from "./components/Products";
import Orders from "./components/Orders";
import POS from "./components/POS";
import Inventory from "./components/Inventory";
import InventoryAdjust from "./components/InventoryAdjust";
import InventoryReceive from "./components/InventoryReceive";
import Suppliers from "./components/Suppliers";
import Promotions from "./components/Promotions";
import OrderDetail from "./components/OrderDetail";
import LoginPage from "./components/Login";

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }

    // Test API connection
    const testAPI = async () => {
      const API = process.env.REACT_APP_API_URL;
      try {
        const response = await fetch(`${API}/health`);
        const data = await response.json();
        console.log("API Health Check:", data);
      } catch (error) {
        console.error("API connection failed:", error);
      }
    };

    testAPI();
  }, []);

  // Login component
  const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
      e.preventDefault();
      try {
        const response = await api.login(username, password);
        if (response.ok) {
          setIsLoggedIn(true);
          setError("");
        } else {
          setError(response.error || "Login failed");
        }
      } catch (error) {
        console.error("Login error:", error);
        setError(error.message || "Login failed. Please try again.");
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Coffee Shop Management
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Sign in to your account
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Main app content
  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard setCurrentPage={setCurrentPage} />;
      case "products":
        return <Products />;
      case "orders":
        return <Orders />;
      case "pos":
        return <POS />;
      case "inventory":
        return <Inventory setCurrentPage={setCurrentPage} />;
      case "inventory-adjust":
        return <InventoryAdjust />;
      case "inventory-receive":
        return <InventoryReceive />;
      case "suppliers":
        return <Suppliers />;
      case "promotions":
        return <Promotions />;
      case "order-detail":
        return <OrderDetail />;
      default:
        return <Dashboard />;
    }
  };

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLogout={() => {
          api.clearToken();
          setIsLoggedIn(false);
        }}
      />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">{renderPage()}</div>
      </main>
    </div>
  );
}

export default App;
