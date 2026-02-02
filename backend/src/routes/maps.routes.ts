import { Router } from 'express'
import { getMaps, saveMap } from '@/services/maps.service'

const router = Router()

router.get('/', async (_req, res) => {
  const maps = await getMaps()
  res.json(maps)
})

router.post('/', async (req, res) => {
  try {
    const map = await saveMap(req.body)
    res.status(req.body.id ? 200 : 201).json(map)
  } catch (e) {
    if ((e as Error).message === 'MAP_NOT_FOUND') {
      return res.status(404).json({ error: 'map not found' })
    }
    res.status(500).json({ error: 'internal error' })
  }
})

export default router
