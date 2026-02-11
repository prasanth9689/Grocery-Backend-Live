# 🛒 Grocery SaaS Backend - Multi-Tenant E-Commerce Platform

A production-ready, multi-tenant grocery delivery platform built with Node.js, Express, and MySQL. Designed for scalability and easy microservices migration.

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Security](#security)
- [Deployment](#deployment)
- [Related Repositories](#related-repositories)

## ✨ Features

- **Multi-Tenant Architecture** - Isolated databases per tenant
- **JWT Authentication** - Secure token-based auth
- **Role-Based Access Control** - Admin and customer roles
- **Order Management** - Complete order lifecycle tracking
- **Inventory Management** - Real-time stock updates with ACID transactions
- **Payment Integration Ready** - Structured for Razorpay/Stripe
- **Production-Ready** - PM2 process management included

## 🏗️ Architecture

### Feature-Based Module Structure

Each feature module contains:
- **Model** - Database interaction layer
- **Controller** - Request/response handling
- **Service** - Business logic layer
- **Routes** - API endpoints

```
src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── products/
│   ├── orders/
│   └── categories/
├── middleware/
├── config/
└── utils/
```

### Service Layer Pattern

```
Controller → Service → Database
```

- **Controller** = Request/Response handling
- **Service** = Business logic
- **Model** = Database interaction

This pattern keeps controllers clean and business logic testable.

### Production Extensions

For production deployment, add:

```
├── jobs/              # Cron jobs
├── sockets/           # Real-time delivery tracking
├── integrations/      # Payment gateways, SMS, Firebase
└── docs/              # Swagger API documentation
```

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Process Manager:** PM2

## 📦 Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- PM2 (for production)

## 🚀 Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Required Packages

```bash
npm install bcryptjs jsonwebtoken
```

### 3. Install PM2 (Global)

```bash
npm install -g pm2
```

### Windows Users: PowerShell Policy

If you encounter execution policy errors on Windows:

```powershell
# Run as Administrator
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

## 🗄️ Database Setup

### 1. Set MySQL Root Password (XAMPP)

```sql
-- In XAMPP Shell
mysql -u root

-- Set password
ALTER USER 'root'@'localhost' IDENTIFIED BY 'YourNewPassword';
FLUSH PRIVILEGES;
EXIT;
```

### 2. Update phpMyAdmin Config

Edit: `C:\xampp\phpMyAdmin\config.inc.php`

```php
$cfg['Servers'][$i]['auth_type'] = 'config';
$cfg['Servers'][$i]['user'] = 'root';
$cfg['Servers'][$i]['password'] = 'YourNewPassword';
```

### 3. Create Database Schema

#### Users Table

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin','customer') DEFAULT 'customer',
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Products Table

```sql
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    category_id INT,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### Orders Table

```sql
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    order_number VARCHAR(50) UNIQUE,
    total_amount DECIMAL(12,2) NOT NULL,
    status ENUM(
        'pending',
        'confirmed',
        'packed',
        'shipped',
        'delivered',
        'cancelled'
    ) DEFAULT 'pending',
    payment_status ENUM(
        'unpaid',
        'paid',
        'failed',
        'refunded'
    ) DEFAULT 'unpaid',
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### Order Items Table

```sql
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(150),  -- Snapshot for historical accuracy
    quantity INT NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    total DECIMAL(12,2) GENERATED ALWAYS AS (quantity * price) STORED,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

> **Why store `product_name`?**  
> Product names may change over time. Storing a snapshot ensures order history remains accurate.

#### Shipping Address Table

```sql
CREATE TABLE order_addresses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    full_name VARCHAR(150),
    phone VARCHAR(20),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
```

#### Payment Transactions Table (Optional)

For Razorpay/Stripe integration:

```sql
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    transaction_id VARCHAR(150),
    provider VARCHAR(50),
    amount DECIMAL(12,2),
    status ENUM('initiated','success','failed','refunded'),
    response_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
```

### 4. Insert Sample Data

```sql
INSERT INTO products (id, name, description, price, stock, category_id, image, created_at) VALUES
(1, 'Tomato', 'Fresh farm tomatoes 1kg', 30.00, 100, 1, 'tomato.jpg', NOW()),
(2, 'Potato', 'Premium quality potatoes 1kg', 25.00, 200, 1, 'potato.jpg', NOW()),
(3, 'Apple', 'Fresh red apples 1kg', 120.00, 80, 2, 'apple.jpg', NOW()),
(4, 'Banana', 'Organic bananas 1 dozen', 60.00, 150, 2, 'banana.jpg', NOW()),
(5, 'Milk 1L', 'Full cream milk 1 litre', 55.00, 90, 3, 'milk.jpg', NOW()),
(6, 'Cheese', 'Processed cheese 200g', 110.00, 50, 3, 'cheese.jpg', NOW()),
(7, 'Coca Cola 750ml', 'Soft drink bottle', 40.00, 120, 4, 'coke.jpg', NOW()),
(8, 'Lays Chips', 'Classic salted chips 50g', 20.00, 300, 5, 'lays.jpg', NOW());
```

## ⚙️ Configuration

### Generate Secure JWT Secret

```bash
# Linux/Ubuntu/Mac
openssl rand -hex 32
```

Example output:
```
9f3c8a2d7e4b91c6f0a8d1e3b4c7f9a2d8e6c4b1f0a9d3e7c2b6f1a8d4e9c7
```

### Environment Variables

Create `.env` file:

```env
# JWT Configuration
JWT_SECRET=9f3c8a2d7e4b91c6f0a8d1e3b4c7f9a2d8e6c4b1f0a9d3e7c2b6f1a8d4e9c7
JWT_EXPIRES=1d

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YourPassword
DB_NAME=grocery_saas

# Server
PORT=3000
NODE_ENV=production
```

## 📡 API Documentation

### Authentication

#### Register User

```http
POST /api/auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Admin",
  "email": "admin@test.com",
  "password": "123456",
  "role": "admin"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "admin@test.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Orders

#### Create Order

```http
POST /api/orders
Authorization: Bearer <your_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 2, "quantity": 1 }
  ]
}
```

**Features:**
- ✅ Uses tenant database via `req.db`
- ✅ ACID-safe transactions
- ✅ Automatic stock deduction
- ✅ JWT secured
- ✅ User isolation per tenant

### Protected Routes

All protected routes require JWT token:

```http
Authorization: Bearer YOUR_TOKEN
```

## 🔐 Security

### Best Practices (Production)

1. **Tenant Validation** - Always validate tenant inside JWT ✅
2. **Role Verification** - Never trust frontend role claims ❌
3. **HTTPS Only** - Force SSL in production 🔒
4. **Database Security** - Use restricted DB users, not root ⚠️
5. **Password Strength** - Enforce strong password policies 💪
6. **Rate Limiting** - Implement API rate limiting 🚦
7. **Input Validation** - Sanitize all user inputs 🧹

### JWT Secret Requirements

- **Minimum length:** 256-bit (32 bytes)
- **High entropy:** Cryptographically random
- **Never commit:** Keep in `.env` file only
- **Rotate regularly:** Update in production periodically

## 🚀 Deployment

### PM2 Process Management

#### Start Application

```bash
pm2 start src/app.js --name grocery-saas
pm2 save
pm2 startup systemd -u root --hp /root
```

#### PM2 Commands

```bash
# List all processes
pm2 list

# Restart all processes
pm2 restart all

# View logs
pm2 logs grocery-saas

# Stop application
pm2 stop grocery-saas

# Delete process
pm2 delete grocery-saas
```

### Production Checklist

- [ ] Generate secure JWT secret
- [ ] Configure environment variables
- [ ] Set up database with restricted user
- [ ] Enable HTTPS
- [ ] Configure PM2 for auto-restart
- [ ] Set up monitoring and logging
- [ ] Implement rate limiting
- [ ] Configure CORS properly
- [ ] Set up backups
- [ ] Enable security headers

## 📚 Related Repositories

- [Grocery Backend - Tenant Build Script](https://github.com/prasanth9689/Grocery-Backend-NodeJs-Grocery-Build-Script-Create-Tenant)
- [Grocery Backend - Live](https://github.com/prasanth9689/Grocery-Backend-Live)

## 🏛️ Database Architecture

### Per-Tenant Database Structure

Each tenant database contains:

```
├── users                 # User accounts
├── products             # Product catalog
├── categories           # Product categories
├── orders               # Order records
├── order_items          # Order line items
├── order_addresses      # Shipping addresses
└── payments             # Payment transactions
```

### Multi-Tenant Benefits

- **Data Isolation** - Complete separation between tenants
- **Scalability** - Easy to scale individual tenants
- **Customization** - Per-tenant configurations
- **Security** - Natural data boundaries
- **Microservices Ready** - Easy migration path

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue in the GitHub repository.

---

**Built with ❤️ for the grocery delivery ecosystem**
