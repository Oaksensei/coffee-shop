import React, { useState } from "react";

const Header = ({ currentPage, setCurrentPage, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", page: "dashboard", icon: "fas fa-tachometer-alt" },
    { name: "Products", page: "products", icon: "fas fa-coffee" },
    { name: "Orders", page: "orders", icon: "fas fa-shopping-cart" },
    { name: "POS", page: "pos", icon: "fas fa-cash-register" },
    { name: "Inventory", page: "inventory", icon: "fas fa-boxes" },
    { name: "Suppliers", page: "suppliers", icon: "fas fa-truck" },
    { name: "Promotions", page: "promotions", icon: "fas fa-tags" },
  ];

  return (
    <nav className="bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-amber-800 flex items-center">
                <i className="fas fa-coffee text-amber-600 mr-2"></i>
                Coffee Shop
              </h1>
            </div>
            <div className="hidden lg:ml-8 lg:flex lg:space-x-1">
              {navigation.map((item) => (
                <button
                  key={item.page}
                  onClick={() => setCurrentPage(item.page)}
                  className={`nav-link ${
                    currentPage === item.page
                      ? "nav-link-active"
                      : "nav-link-inactive"
                  }`}
                >
                  <i className={`${item.icon} mr-2`}></i>
                  <span className="hidden xl:inline">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
            >
              <i className="fas fa-sign-out-alt mr-1"></i>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-amber-50 border-t border-amber-200">
            {navigation.map((item) => (
              <button
                key={item.page}
                onClick={() => {
                  setCurrentPage(item.page);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                  currentPage === item.page
                    ? "bg-amber-100 text-amber-700"
                    : "text-amber-700 hover:bg-amber-100 hover:text-amber-800"
                }`}
              >
                <i className={`${item.icon} mr-3`}></i>
                {item.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
