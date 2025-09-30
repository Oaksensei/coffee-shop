import React, { useState, useEffect } from "react";
import api from "../services/api";

const POS = () => {
  const [products, setProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [promotionCode, setPromotionCode] = useState("");
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [orderComplete, setOrderComplete] = useState(false);

  useEffect(() => {
    loadProducts();
    loadPromotions();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await api.getProducts();
      if (response.ok) {
        setProducts(
          response.data.filter((product) => product.status === "active")
        );
      }
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const loadPromotions = async () => {
    try {
      const response = await api.getPromotions();
      if (response.ok) {
        setPromotions(
          response.data.filter((promotion) => promotion.status === "active")
        );
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading promotions:", error);
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(
        cart.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getDiscount = () => {
    if (!selectedPromotion) return 0;

    const subtotal = getSubtotal();
    const { type, value, min_spend } = selectedPromotion;

    // ตรวจสอบเงื่อนไข minimum spend
    if (min_spend && subtotal < min_spend) {
      return 0;
    }

    let discount = 0;
    if (type === "percent" || type === "percentage") {
      discount = (subtotal * value) / 100;
    } else if (type === "fixed" || type === "amount") {
      discount = Math.min(Number(value), subtotal); // ไม่ให้ส่วนลดเกินยอดรวม
    }

    return discount;
  };

  const getTotal = () => {
    return getSubtotal() - getDiscount();
  };

  const applyPromotion = () => {
    if (!promotionCode.trim()) {
      setSelectedPromotion(null);
      return;
    }

    const promotion = promotions.find(
      (p) => p.code.toLowerCase() === promotionCode.toLowerCase()
    );

    if (promotion) {
      setSelectedPromotion(promotion);
    } else {
      alert("Invalid promotion code");
      setSelectedPromotion(null);
    }
  };

  const removePromotion = () => {
    setPromotionCode("");
    setSelectedPromotion(null);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    if (!customerName.trim()) {
      alert("Please enter customer name");
      return;
    }

    try {
      // Create order data
      const orderData = {
        customer: customerName,
        pay_method: paymentMethod,
        discount_code: selectedPromotion?.code || null,
        items: cart.map((item) => ({
          product_id: item.id,
          qty: item.quantity,
        })),
      };

      // Call API to create the order
      const response = await api.createOrder(orderData);

      if (response.ok) {
        alert(`Order created successfully! Total: ฿${getTotal().toFixed(2)}`);
      } else {
        throw new Error(response.error || "Failed to create order");
      }

      // Clear cart
      setCart([]);
      setCustomerName("");
      setPaymentMethod("cash");
      setOrderComplete(true);

      // Reset order complete after 3 seconds
      setTimeout(() => setOrderComplete(false), 3000);
    } catch (error) {
      console.error("Error creating order:", error);
      alert(`Failed to create order: ${error.message}`);
    }
  };

  const clearCart = () => {
    setCart([]);
    setPromotionCode("");
    setSelectedPromotion(null);
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
      {/* Order Complete Notification */}
      {orderComplete && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <i className="fas fa-check-circle mr-2"></i>
          Order completed successfully!
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Point of Sale</h1>
          <p className="mt-2 text-gray-600">
            Process customer orders and payments
          </p>
        </div>
        <button
          onClick={clearCart}
          className="btn btn-secondary self-start sm:self-auto"
          disabled={cart.length === 0}
        >
          <i className="fas fa-trash mr-2"></i>
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Grid */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Products</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left"
                >
                  <div className="text-sm font-medium text-gray-900">
                    {product.name}
                  </div>
                  <div className="text-sm text-gray-500 capitalize">
                    {product.category}
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    ฿{Number(product.price).toFixed(2)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cart and Checkout */}
        <div className="space-y-6">
          {/* Cart */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Cart ({cart.length} items)
            </h3>
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Cart is empty</p>
            ) : (
              <div className="space-y-2">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 border-b border-gray-200"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ฿{Number(item.price).toFixed(2)} each
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkout */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Checkout</h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">Customer Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <label className="form-label">Payment Method</label>
                <select
                  className="form-input"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="transfer">Bank Transfer</option>
                </select>
              </div>

              {/* Promotion Code */}
              <div>
                <label className="form-label">Promotion Code</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    className="form-input flex-1"
                    value={promotionCode}
                    onChange={(e) => setPromotionCode(e.target.value)}
                    placeholder="Enter promotion code"
                  />
                  <button
                    type="button"
                    onClick={applyPromotion}
                    className="btn btn-secondary"
                  >
                    Apply
                  </button>
                </div>
                {selectedPromotion && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          {selectedPromotion.name}
                        </p>
                        <p className="text-xs text-green-600">
                          {selectedPromotion.type === "percent" ||
                          selectedPromotion.type === "percentage"
                            ? `${selectedPromotion.value}% off`
                            : `฿${selectedPromotion.value} off`}
                          {selectedPromotion.min_spend &&
                            ` (Min. ฿${selectedPromotion.min_spend})`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={removePromotion}
                        className="text-red-500 hover:text-red-700"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>฿{getSubtotal().toFixed(2)}</span>
                </div>
                {selectedPromotion && getDiscount() > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({selectedPromotion.name}):</span>
                    <span>-฿{getDiscount().toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>฿{getTotal().toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full btn btn-success"
                disabled={cart.length === 0}
              >
                <i className="fas fa-check mr-2"></i>
                Complete Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POS;
