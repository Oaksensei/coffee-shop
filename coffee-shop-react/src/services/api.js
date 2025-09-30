const API =
  process.env.REACT_APP_API_URL || "https://coffee-shop-7r8l.onrender.com"; // ตัวอย่าง: https://coffee-shop-7t8l.onrender.com

class ApiService {
  constructor() {
    this.token = localStorage.getItem("token");
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem("token", token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("token");
  }

  async request(endpoint, options = {}) {
    const url = `${API}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Auth
  async login(username, password) {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // credentials: "include", // เปิดถ้า backend ใช้คุกกี้/เซสชัน
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

    if (data.ok) {
      this.setToken(data.data.token);
    }

    return data;
  }

  // Products
  async getProducts() {
    return this.request("/products");
  }

  async createProduct(productData) {
    return this.request("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id, productData) {
    return this.request(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: "DELETE",
    });
  }

  // Orders
  async getOrders() {
    return this.request("/orders");
  }

  async getOrder(id) {
    return this.request(`/orders/${id}`);
  }

  async createOrder(orderData) {
    return this.request("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  }

  async updateOrderStatus(id, status) {
    return this.request(`/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  async deleteOrder(id) {
    return this.request(`/orders/${id}`, {
      method: "DELETE",
    });
  }

  // Inventory
  async getInventory() {
    return this.request("/inventory");
  }

  async createInventoryItem(itemData) {
    return this.request("/inventory", {
      method: "POST",
      body: JSON.stringify(itemData),
    });
  }

  async updateInventoryItem(id, itemData) {
    return this.request(`/inventory/${id}`, {
      method: "PUT",
      body: JSON.stringify(itemData),
    });
  }

  async deleteInventoryItem(id) {
    return this.request(`/inventory/${id}`, {
      method: "DELETE",
    });
  }

  // Suppliers
  async getSuppliers() {
    return this.request("/suppliers");
  }

  async createSupplier(supplierData) {
    return this.request("/suppliers", {
      method: "POST",
      body: JSON.stringify(supplierData),
    });
  }

  async updateSupplier(id, supplierData) {
    return this.request(`/suppliers/${id}`, {
      method: "PUT",
      body: JSON.stringify(supplierData),
    });
  }

  async updateSupplierStatus(id, status) {
    return this.request(`/suppliers/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  async deleteSupplier(id) {
    return this.request(`/suppliers/${id}`, {
      method: "DELETE",
    });
  }

  // Promotions
  async getPromotions() {
    return this.request("/promotions");
  }

  async createPromotion(promotionData) {
    return this.request("/promotions", {
      method: "POST",
      body: JSON.stringify(promotionData),
    });
  }

  async updatePromotion(id, promotionData) {
    return this.request(`/promotions/${id}`, {
      method: "PUT",
      body: JSON.stringify(promotionData),
    });
  }

  async updatePromotionStatus(id, status) {
    return this.request(`/promotions/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  async deletePromotion(id) {
    return this.request(`/promotions/${id}`, {
      method: "DELETE",
    });
  }

  // Ingredients
  async getIngredients() {
    return this.request("/ingredients");
  }

  async createIngredient(ingredientData) {
    return this.request("/ingredients", {
      method: "POST",
      body: JSON.stringify(ingredientData),
    });
  }

  async updateIngredient(id, ingredientData) {
    return this.request(`/ingredients/${id}`, {
      method: "PUT",
      body: JSON.stringify(ingredientData),
    });
  }

  async deleteIngredient(id) {
    return this.request(`/ingredients/${id}`, {
      method: "DELETE",
    });
  }

  // Inventory Management
  async adjustInventory(adjustmentData) {
    return this.request("/inventory/adjust", {
      method: "POST",
      body: JSON.stringify(adjustmentData),
    });
  }

  async receiveInventory(receiptData) {
    return this.request("/stock/receive", {
      method: "POST",
      body: JSON.stringify(receiptData),
    });
  }

  // Dashboard
  async getDashboardData() {
    return this.request("/dashboard/summary");
  }

  async getTopProducts() {
    return this.request("/dashboard/top-products");
  }
}

export default new ApiService();
