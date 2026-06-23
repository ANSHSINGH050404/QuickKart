# Zepto Clone PRD

## Project Name

QuickKart

## Vision

A 10-minute grocery delivery platform allowing users to browse products, place orders, track deliveries, and receive groceries from nearby dark stores.

---

# Phase 1: MVP

## User Features

### Authentication

* Email OTP Login
* Google Login
* Profile Management

### Location Selection

* Detect current location
* Save multiple addresses
* Check service availability

### Product Catalog

* Categories
* Search
* Filters
* Product details

### Cart

* Add/Remove Items
* Quantity Update
* Price Calculation

### Checkout

* Address Selection
* Payment Method
* Order Summary

### Order Tracking

* Order Confirmed
* Packed
* Out for Delivery
* Delivered

---

# Admin Features

### Dashboard

* Revenue Analytics
* Orders Analytics

### Product Management

* Add Products
* Edit Products
* Inventory Tracking

### Category Management

* Create Categories
* Update Categories

### Order Management

* Assign Orders
* Update Status

### Customer Management

* User Analytics

---

# Delivery Partner Features

### Partner Login

### Assigned Orders

### Delivery Route

### Earnings Dashboard

---

# Tech Stack

Frontend:

* Next.js 16
* TypeScript
* Tailwind CSS
* Zustand
* TanStack Query

Backend:

* express.js


Database:

* PostgreSQL
* Prisma ORM

Caching:

* Redis

Realtime:

* Socket.IO

Storage:

* AWS S3

Authentication:

* Better Auth

Payments:

* Razorpay
* Stripe

Maps:

* Google Maps API

Deployment:

* Docker
* Kubernetes
* AWS

Monitoring:

* Grafana
* Prometheus

---

# User Flow

User Opens App
↓
Location Selected
↓
Browse Products
↓
Add To Cart
↓
Checkout
↓
Payment
↓
Order Created
↓
Dark Store Receives Order
↓
Delivery Partner Assigned
↓
Live Tracking
↓
Order Delivered

---

# Database Design

Users
Addresses
Categories
Products
ProductImages
Inventory
Cart
CartItems
Orders
OrderItems
Payments
Stores
DeliveryPartners
Notifications

---

# Realtime Events

order.created
order.accepted
order.packed
partner.assigned
partner.location.updated
order.delivered

---

# Success Metrics

1000 Orders/Day
99.9% Uptime
<200ms API Latency
<2s Page Load
