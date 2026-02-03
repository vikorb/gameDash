import { Router } from 'express';
import db from '@/database';
import { asyncHandler } from '@/middlewares/asyncHandler';
import { notFound, badRequest } from '@/utils/httpError';
import { parsePositiveInt, parseString } from '@/utils/validators';

const router = Router();

type MapPayload = {
  id?: unknown;
  title?: unknown;
  description?: unknown;
  creator_id?: unknown;
  status?: unknown;
  moderation_status?: unknown;
};

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const maps = await db('maps')
      .select('*')
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc');

    res.status(200).json(maps);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = parsePositiveInt(req.params.id, 'id');

    const map = await db('maps')
      .where({ id })
      .whereNull('deleted_at')
      .first();

    if (!map) throw notFound('Map introuvable', 'MAP_NOT_FOUND');

    res.status(200).json(map);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = (req.body ?? {}) as MapPayload;

    const hasId = body.id != null && body.id !== '';
    const status = body.status !== undefined ? parseString(body.status, 'status', { max: 32, optional: true }) : undefined;
    const moderation_status =
      body.moderation_status !== undefined
        ? parseString(body.moderation_status, 'moderation_status', { max: 32, optional: true })
        : undefined;

    if (hasId) {
      const id = parsePositiveInt(body.id, 'id');

      const title = body.title !== undefined ? parseString(body.title, 'title', { min: 2, max: 120, optional: true }) : undefined;
      const description =
        body.description !== undefined ? parseString(body.description, 'description', { min: 0, max: 2000, optional: true }) : undefined;

      const patch: Record<string, unknown> = { updated_at: db.fn.now() };

      if (title !== undefined) patch.title = title;
      if (description !== undefined) patch.description = description;
      if (body.creator_id !== undefined) patch.creator_id = parsePositiveInt(body.creator_id, 'creator_id');
      if (status !== undefined) patch.status = status;
      if (moderation_status !== undefined) patch.moderation_status = moderation_status;

      if (Object.keys(patch).length === 1) {
        throw badRequest(
          "Aucun champ à mettre à jour (title/description/creator_id/status/moderation_status)",
          'VALIDATION_ERROR'
        );
      }

      const updatedRows = await db('maps')
        .where({ id })
        .whereNull('deleted_at')
        .update(patch)
        .returning('*');

      if (!updatedRows?.length) throw notFound('Map introuvable pour mise à jour', 'MAP_NOT_FOUND');

      return res.status(200).json(updatedRows[0]);
    }

    const title = parseString(body.title, 'title', { min: 2, max: 120 })!;
    const creator_id = parsePositiveInt(body.creator_id, 'creator_id');
    const description =
      body.description !== undefined ? parseString(body.description, 'description', { min: 0, max: 2000, optional: true }) : undefined;

    const [newMap] = await db('maps')
      .insert({
        title,
        description: description ?? null,
        creator_id,
        status: status ?? 'draft',
        moderation_status: moderation_status ?? 'visible',
      })
      .returning('*');

    return res.status(201).json(newMap);
  })
);

export default router;