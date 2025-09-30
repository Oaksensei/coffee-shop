# Coffee Shop Management System - Full Stack

A complete coffee shop management system with React frontend and Node.js backend.

## 🚀 Quick Start

### 1. Database Setup

```sql
CREATE DATABASE coffee_shop;
USE coffee_shop;

-- Copy the database schema from your existing EJS project
-- Make sure to include all tables: users, products, orders, order_items, inventory, suppliers, promotions
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Servers

```bash
# Start both frontend (port 3000) and backend (port 5000)
npm run full:dev

# Or start separately:
npm run server:dev  # Backend only
npm run dev         # Frontend only
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Login**: admin / admin123

## 📁 Project Structure

```
coffee-shop-react/
├── src/
│   ├── components/          # React components
│   ├── services/           # API service layer
│   └── App.js              # Main app component
├── server.js               # Express backend server
├── config.js               # Database configuration
└── package.json            # Dependencies and scripts
```

## 🔧 Available Scripts

- `npm run full:dev` - Start both frontend and backend
- `npm run dev` - Start React development server
- `npm run server:dev` - Start backend with nodemon
- `npm run server` - Start backend normally
- `npm run build` - Build React for production

## 🗄️ Database Schema

The system uses the same MySQL database schema as your EJS project:

- **users** - User authentication
- **products** - Coffee shop products
- **orders** - Customer orders
- **order_items** - Order line items
- **inventory** - Stock management
- **suppliers** - Supplier information
- **promotions** - Promotional offers

## 🔐 Authentication

- JWT-based authentication
- Login endpoint: `POST /api/auth/login`
- Protected routes require `Authorization: Bearer <token>`
- Default admin user: `admin` / `admin123`

## 📡 API Endpoints

### Authentication

- `POST /api/auth/login` - User login

### Products

- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders

- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status

### Inventory

- `GET /api/inventory` - Get inventory items
- `POST /api/inventory` - Create inventory item

### Suppliers

- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Create supplier

### Promotions

- `GET /api/promotions` - Get all promotions
- `POST /api/promotions` - Create promotion

### Dashboard

- `GET /api/dashboard` - Get dashboard metrics

## 🎯 Features

### ✅ Implemented

- Full CRUD operations for all entities
- JWT authentication
- Real-time dashboard metrics
- Responsive React UI
- MySQL database integration
- Error handling and validation

### 🔄 Same as EJS Project

- All database operations
- User authentication
- Data persistence
- Real functionality
- Complete feature parity

## 🚀 Production Deployment

1. Build the React app:

```bash
npm run build
```

2. Start the production server:

```bash
npm run server
```

3. The server will serve the built React app and handle API requests.

## 🔧 Configuration

Update `config.js` for your database settings:

```javascript
module.exports = {
  DB_HOST: "localhost",
  DB_USER: "root",
  DB_PASSWORD: "your_password",
  DB_NAME: "coffee_shop",
  JWT_SECRET: "your-secret-key",
  PORT: 5000,
};
```

## 📝 Notes

- The React app automatically connects to the backend API
- All components use the API service layer for data operations
- Authentication state is managed with localStorage
- The system maintains the same functionality as your EJS project
- Database schema is identical to ensure compatibility
