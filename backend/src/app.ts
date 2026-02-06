import express from 'express';
import cors from 'cors';

import mapsRoutes from '@/routes/maps';
import usersRoutes from '@/routes/users';
import { asyncHandler } from '@/middlewares/asyncHandler';
import { notFound } from '@/middlewares/notFound';
import { errorHandler } from '@/middlewares/errorHandler';
import db from '@/database';

export const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/maps', mapsRoutes);
app.use('/api/users', usersRoutes);

app.get(
  '/api/health',
  asyncHandler(async (_req, res) => {
    await db.raw('SELECT 1');
    res.status(200).json({ status: 'ok', database: 'connected' });
  })
);

app.use(notFound);
app.use(errorHandler);
