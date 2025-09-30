# Coffee Shop Management System - React

A modern, responsive coffee shop management system built with React and Tailwind CSS.

## Features

- **Dashboard**: Real-time metrics and analytics
- **Products**: Manage coffee shop products and menu items
- **Orders**: Track and manage customer orders
- **POS**: Point of sale system for taking orders
- **Inventory**: Manage stock levels and suppliers
- **Suppliers**: Manage supplier information
- **Promotions**: Create and manage promotional offers

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd coffee-shop-react
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Technology Stack

- **React 19** - Frontend framework
- **Tailwind CSS** - Utility-first CSS framework
- **Font Awesome** - Icons
- **Create React App** - Build tooling

## Project Structure

```
src/
├── components/
│   ├── Header.js          # Navigation header
│   ├── Dashboard.js       # Dashboard with metrics
│   ├── Products.js        # Product management
│   ├── Orders.js          # Order management
│   ├── POS.js             # Point of sale system
│   ├── Inventory.js       # Inventory management
│   ├── Suppliers.js      # Supplier management
│   └── Promotions.js      # Promotion management
├── App.js                 # Main app component
├── App.css                # Custom styles
├── index.js               # App entry point
└── index.css              # Tailwind CSS imports
```

## Features Overview

### Dashboard

- Total products count
- Today's orders and revenue
- Low stock alerts
- Recent orders list
- Top products
- Quick action buttons

### Products Management

- Add, edit, delete products
- Category management
- Price and status tracking
- Product search and filtering

### Orders Management

- View all orders
- Update order status
- Order statistics
- Customer information

### POS System

- Product selection grid
- Shopping cart functionality
- Customer information
- Payment method selection
- Order completion

### Inventory Management

- Stock level tracking
- Add new items
- Receive stock
- Adjust stock levels
- Supplier integration

### Suppliers Management

- Supplier information
- Contact details
- Status management
- Supplier statistics

### Promotions Management

- Create promotional offers
- Discount codes
- Validity periods
- Promotion statistics

## Login Credentials

- **Username**: admin
- **Password**: admin123

## Development

The app uses modern React features including:

- Functional components with hooks
- State management with useState
- Effect management with useEffect
- Responsive design with Tailwind CSS

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## License

This project is licensed under the MIT License.
