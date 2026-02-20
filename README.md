# Bill Box - Microservices Billing Application

A simple and user-friendly billing application designed for local traders using microservices architecture.

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐
│   API Gateway   │────│   User Service   │
│     :3000       │    │      :3001       │
└─────────────────┘    └──────────────────┘
         │              
         ├──────────────┬──────────────────┬──────────────────┐
         │              │                  │                  │
┌─────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  Store Service  │ │ Product Service  │ │ Billing Service  │ │    MongoDB       │
│     :3002       │ │      :3004       │ │      :3003       │ │     :27017       │
└─────────────────┘ └──────────────────┘ └──────────────────┘ └──────────────────┘
```

## Services

- **API Gateway** (Port 3000) - Routes requests and handles authentication
- **User Service** (Port 3001) - Manages merchant accounts and authentication
- **Store Service** (Port 3002) - Handles store management and configuration
- **Product Service** (Port 3004) - Manages product catalog and inventory
- **Billing Service** (Port 3003) - Creates and manages sales bills/invoices
- **MongoDB** (Port 27017) - Database for all services

## Features

- 🏪 Multi-store management
- 👥 User authentication and authorization
- 📦 Product catalog with inventory tracking
- 💰 Invoice generation and management
- 📊 Basic reporting and analytics
- 🔄 RESTful API design
- 🐳 Docker containerization

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- MongoDB (or use Docker)

### Development Setup

1. **Clone and install dependencies**
```bash
# Install dependencies for each service
cd api-gateway && npm install && cd ..
cd user-service && npm install && cd ..
cd store-service && npm install && cd ..
cd product-service && npm install && cd ..
cd billing-service && npm install && cd ..
```

2. **Start with Docker Compose**
```bash
docker-compose up -d
```

3. **Or run services individually**
```bash
# Terminal 1 - MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:7

# Terminal 2 - API Gateway
cd api-gateway && npm run dev

# Terminal 3 - User Service
cd user-service && npm run dev

# Terminal 4 - Store Service
cd store-service && npm run dev

# Terminal 5 - Product Service
cd product-service && npm run dev

# Terminal 6 - Billing Service
cd billing-service && npm run dev
```

### Health Checks
```bash
curl http://localhost:3000/api/health  # API Gateway
curl http://localhost:3001/health      # User Service
curl http://localhost:3002/health      # Store Service
curl http://localhost:3003/health      # Billing Service
curl http://localhost:3004/health      # Product Service
```

## API Endpoints (Planned)

### User Service
- `POST /auth/register` - Register new merchant
- `POST /auth/login` - Login
- `GET /users/profile` - Get user profile

### Store Service
- `POST /stores` - Create store
- `GET /stores` - List user's stores
- `PUT /stores/:id` - Update store

### Product Service
- `POST /products` - Add product
- `GET /products` - List products
- `PUT /products/:id` - Update product

### Billing Service
- `POST /invoices` - Create invoice
- `GET /invoices` - List invoices
- `GET /invoices/:id/pdf` - Generate PDF

## Environment Variables

Create `.env` files in each service directory:

```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/billbox-users
JWT_SECRET=your-secret-key
```

## Next Steps

1. Implement authentication middleware
2. Add API routes and controllers
3. Set up service-to-service communication
4. Add input validation and error handling
5. Implement PDF invoice generation
6. Add unit and integration tests
7. Set up CI/CD pipeline

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Containerization**: Docker
- **API Documentation**: Swagger (planned)
- **Testing**: Jest (planned)