# PharmEZ Backend API

A robust Node.js + Express + PostgreSQL backend for the PharmIQ++ pharmacy management system.

## Features

✅ **Multi-tenant Architecture** - Complete data isolation per pharmacy  
✅ **Role-Based Access Control** - Admin, Pharmacist, Cashier, Manager, Viewer roles  
✅ **POS Transaction Management** - Real-time sales processing with FEFO batch selection  
✅ **Inventory Management** - Stock tracking, expiry management, FIFO/FEFO support  
✅ **Customer Management** - Loyalty program support, prescription tracking  
✅ **Supplier & Procurement** - Invoice management, OCR-ready invoice parsing  
✅ **Prescription Compliance** - Schedule H restriction enforcement, audit trails  
✅ **Audit Logging** - Complete action history for regulatory compliance  

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js + TypeScript
- **Database**: PostgreSQL 14+
- **ORM**: Prisma 5.x
- **Authentication**: JWT + bcryptjs
- **Validation**: Zod

## Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

**Required Environment Variables:**

```env
DATABASE_URL=postgresql://user:password@localhost:5432/pharmez_db
PORT=3000
JWT_SECRET=your_super_secret_jwt_key_here
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key_for_ocr
```

### 3. Setup Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Or sync schema (dev only)
npm run prisma:push
```

### 4. Start Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3000`

## API Endpoints

### Authentication

```
POST   /api/auth/register        # Create new tenant & user
POST   /api/auth/login           # User login
GET    /api/auth/me              # Get current user
```

### Medicines

```
GET    /api/medicines            # List all medicines
GET    /api/medicines/:id        # Get medicine details
POST   /api/medicines            # Create medicine
PUT    /api/medicines/:id        # Update medicine
GET    /api/medicines/low-stock/alert       # Low stock alerts
GET    /api/medicines/expiry/soon           # Expiring soon
```

### Batches

```
GET    /api/batches              # List batches
GET    /api/batches/:id          # Get batch
POST   /api/batches              # Create batch
PATCH  /api/batches/:id/quantity # Update stock
GET    /api/batches/stock/low    # Low stock
GET    /api/batches/expiry/alert # Expiry alerts
```

### Customers

```
GET    /api/customers            # List customers
GET    /api/customers/:id        # Get customer
POST   /api/customers            # Create customer
PUT    /api/customers/:id        # Update customer
GET    /api/customers/:id/history            # Purchase history
GET    /api/customers/search/:query          # Search customers
```

### Suppliers

```
GET    /api/suppliers            # List suppliers
GET    /api/suppliers/:id        # Get supplier details
POST   /api/suppliers            # Create supplier
PUT    /api/suppliers/:id        # Update supplier
DELETE /api/suppliers/:id        # Delete supplier
```

### Invoices

```
GET    /api/invoices             # List invoices
GET    /api/invoices/:id         # Get invoice
POST   /api/invoices             # Create invoice
PATCH  /api/invoices/:id/status  # Update status
GET    /api/invoices/summary/recent          # Recent invoices
```

### POS Transactions

```
POST   /api/pos/transaction      # Create sale
GET    /api/pos/transaction/:id  # Get transaction
GET    /api/pos                  # List transactions (with date range)
GET    /api/pos/summary/dashboard            # Dashboard summary
```

### Prescriptions

```
GET    /api/prescriptions        # List all prescriptions
GET    /api/prescriptions/:id    # Get prescription
POST   /api/prescriptions        # Create prescription
PATCH  /api/prescriptions/:id/verify         # Verify prescription
GET    /api/prescriptions/pending/list       # Pending verifications
GET    /api/prescriptions/customer/:customerId  # Customer prescriptions
```

### Users

```
GET    /api/users                # List users (admin only)
GET    /api/users/:id            # Get user (admin only)
POST   /api/users                # Create user (admin only)
PUT    /api/users/:id            # Update user
POST   /api/users/:id/change-password        # Change password
POST   /api/users/:id/deactivate             # Deactivate user
POST   /api/users/:id/reactivate             # Reactivate user
```

## Database Schema

### Core Models

- **Tenant**: Pharmacy organization
- **User**: Staff members with roles
- **Medicine**: Medicine master data
- **Batch**: Stock batches with expiry tracking
- **Customer**: Pharmacy customers
- **Supplier**: Medicine suppliers
- **Invoice**: Supplier invoices for procurement
- **POSTransaction**: Sales transactions
- **Prescription**: Doctor prescriptions
- **AuditLog**: Complete action history

## Authentication Flow

1. User registers (creates tenant + user account)
2. User logs in with email/password
3. Backend validates credentials and returns JWT token
4. Frontend stores token and sends in `Authorization: Bearer <token>` header
5. Backend verifies JWT and extracts userId, tenantId, role
6. Request proceeds with tenant isolation

## Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT-based authentication
- ✅ Tenant data isolation at query level
- ✅ Role-based access control
- ✅ Audit logging for compliance
- ✅ Input validation with Zod
- ✅ CORS configured for frontend

## Building for Production

```bash
npm run build
npm start
```

## Database Management

```bash
# View database GUI
npm run prisma:studio

# Create new migration
npm run prisma:migrate

# Reset database (dev only)
npx prisma migrate reset
```

## Error Handling

API returns standard error responses:

```json
{
  "error": "Error message",
  "statusCode": 400
}
```

Common status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request / Validation Error
- `401`: Unauthorized
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Server Error

## Development Notes

- All routes are protected with authentication middleware
- All protected routes enforce tenant isolation
- Timestamps (createdAt, updatedAt) are auto-managed
- Soft deletes are not implemented (use isActive flag for users)
- Transactions are used for complex multi-step operations

## Connecting from Frontend

Update your frontend API client:

```typescript
const API_BASE = 'http://localhost:3000/api';

// Example auth call
const login = async (email: string, password: string) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

// Set token for future requests
const apiCall = (url: string, options = {}) => {
  const token = localStorage.getItem('token');
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });
};
```

## Deployment

### Docker Support (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment for Production

- Use strong `JWT_SECRET`
- Set `NODE_ENV=production`
- Configure database with SSL
- Use environment-specific `.env` files
- Enable rate limiting
- Configure proper CORS origins

## License

MIT
