import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import 'express-async-errors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import medicinesRoutes from './routes/medicines.js';
import batchesRoutes from './routes/batches.js';
import customersRoutes from './routes/customers.js';
import suppliersRoutes from './routes/suppliers.js';
import invoicesRoutes from './routes/invoices.js';
import posRoutes from './routes/pos.js';
import analyticsRoutes from './routes/analytics.js';
import branchesRoutes from './routes/branches.js';
import prescriptionsRoutes from './routes/prescriptions.js';
import usersRoutes from './routes/users.js';
import ocrRoutes from './routes/ocr.js';
import { seedDemoData } from './seed.js';

import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';
import { tenantMiddleware } from './middleware/tenant.js';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

const configuredOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

const allowedOrigins = new Set([...defaultAllowedOrigins, ...configuredOrigins]);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(
  cors({
    origin: (origin, callback) => {
      if ((process.env.NODE_ENV || 'development') !== 'production') {
        callback(null, true);
        return;
      }

      if (!origin) {
        callback(null, true);
        return;
      }

      const isLocalhostPort = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
      if (allowedOrigins.has(origin) || isLocalhostPort) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);

// Protected routes (require authentication)
app.use(authMiddleware);
app.use(tenantMiddleware);

app.use('/api/medicines', medicinesRoutes);
app.use('/api/batches', batchesRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/branches', branchesRoutes);
app.use('/api/prescriptions', prescriptionsRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/users', usersRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

async function start() {
  await seedDemoData();

  app.listen(PORT, () => {
    console.log(`🚀 PharmEZ Backend running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

void start();

export default app;
