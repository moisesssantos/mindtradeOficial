import { VercelRequest, VercelResponse } from '@vercel/node'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const client = await pool.connect()
    const result = await client.query('SELECT NOW() as now')
    client.release()

    res.status(200).json({
      message: 'Conexão bem-sucedida!',
      timestamp: result.rows[0].now,
    })
  } catch (error: any) {
    res.status(500).json({
      message: 'Erro ao conectar no banco',
      error: error.message,
    })
  }
}
