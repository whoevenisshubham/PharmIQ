# what exactlyis PharmIQ++

PharmIQ++ is a full-stack pharmacy management platform built for Indian retail pharmacy operations. It combines inventory control, point-of-sale workflows, branch-level stock visibility, customer and supplier management, prescription compliance, and analytics in a single web application.

## Current Project Status

The project is currently in a working integrated state:

- Frontend is running with React + TypeScript.
- Backend API is running with Node.js, Express, and Prisma.
- PostgreSQL is connected and seeded with demo data.
- Containerized local setup is available through Docker Compose.
- Authentication, medicine listing, and dashboard workflows are operational.

## Implemented Modules

- Authentication and role-based access (tenant-scoped users)
- Dashboard and analytics views
- POS transaction flows
- Medicines and batch inventory management
- Branch stock and transfer support
- Supplier and procurement workflows
- Invoice processing and OCR endpoints
- Customer and prescription management
- Compliance and audit-log data model support

## Architecture Overview

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- Recharts

### Backend

- Node.js
- Express
- Prisma ORM
- PostgreSQL
- JWT authentication

### Deployment Model (Local)

- `pharmez-backend` container (API on port `3000`)
- `pharmez-postgres` container (Database on port `5432`)

## Repository Structure

```text
PharmEZ/
  src/                    # Frontend application
  backend/
    src/                  # Backend API routes, middleware, services
    prisma/
      schema.prisma       # Database schema
  docker-compose.yml      # Local orchestration for backend + postgres
```

## Database Schema (High Level)

The schema in `backend/prisma/schema.prisma` is organized around these domains:

- Tenant and user management
- Branches and branch stock
- Medicines and batches
- Customers and suppliers
- Invoices and procurement
- Prescriptions and verification
- POS transactions and line items
- Audit logging

This design supports multi-tenant isolation and branch-aware inventory tracking.

## Local Setup

### Prerequisites

- Node.js 18+
- Docker Desktop

### Option 1: Run Backend and Database with Docker

```bash
cd PharmEZ
docker-compose up -d
```

Backend health check:

```bash
curl http://localhost:3000/health
```

### Option 2: Run Frontend Locally

```bash
cd PharmEZ
npm install
npm run dev -- --host
```

Frontend URL:

- `http://localhost:5173/PharmIQ/`

## Default Demo Credentials

The seed script provisions a demo admin user as following:

- Email: `admin@pharmez.in`
- Password: `Admin@123`

## Key API Endpoints

- `GET /health`
- `POST /api/auth/login`
- `GET /api/medicines` (authenticated)
- `GET /api/analytics/*` (authenticated)
- `POST /api/pos/*` (authenticated)

Lessgo!