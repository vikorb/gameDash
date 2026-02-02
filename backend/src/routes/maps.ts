import { Router } from 'express';
import db from '@/database';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const maps = await db('maps').select('*').whereNull('deleted_at');
    res.json(maps);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des maps" });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, title, description, creator_id, status, moderation_status } = req.body;

    if (id) {
      const updatedRows = await db('maps')
        .where({ id })
        .update({
          title,
          description,
          creator_id,
          status: status || 'draft',
          moderation_status: moderation_status || 'visible',
          updated_at: db.fn.now()
        })
        .returning('*');

      if (updatedRows.length === 0) {
        return res.status(404).json({ error: "Map introuvable pour mise à jour" });
      }

      return res.json(updatedRows[0]);
    } else {
      const [newMap] = await db('maps')
        .insert({
          title,
          description,
          creator_id,
          status: status || 'draft',
          moderation_status: moderation_status || 'visible'
        })
        .returning('*');

      return res.status(201).json(newMap);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de l'enregistrement de la map" });
  }
});

export default router;