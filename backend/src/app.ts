import express from 'express';
import cors from 'cors';
import type { Router } from 'express';

import mapsRoutes from '@/routes/maps';
import usersRoutes from '@/routes/users';
import mmrRoutes from '@/routes/mmr';
import ranksRoutes from '@/routes/ranks';
import gameModesRoutes from '@/routes/game-modes';
import matchesRoutes from '@/routes/matches';
import adminRoutes from '@/routes/admin';
import auditRoutes from '@/routes/audit';
import { asyncHandler } from '@/middlewares/asyncHandler';
import { notFound } from '@/middlewares/notFound';
import { errorHandler } from '@/middlewares/errorHandler';
import db from '@/database';

export const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/maps', mapsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/mmr', mmrRoutes);
app.use('/api/game-modes', gameModesRoutes);
app.use('/api/ranks', ranksRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/audit', auditRoutes as Router);

app.get(
  '/api/health',
  asyncHandler(async (_req, res) => {
    await db.raw('SELECT 1');
    res.status(200).json({ status: 'ok', database: 'connected' });
  })
);

app.use(notFound);
app.use(errorHandler);
