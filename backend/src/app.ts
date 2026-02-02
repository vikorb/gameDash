import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import type { Request, Response } from 'express'

await db.migrate.latest()

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' })
})

app.use('/maps', mapsRoutes)

app.listen(3000, () => {
  console.log('API running on http://localhost:3000')
})
