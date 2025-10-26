import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

// Conexão com o banco Neon usando variável da Vercel
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export const config = {
  runtime: 'edge',
}

export default async function handler(req: NextRequest) {
  try {
    const client = await pool.connect()
    const result = await client.query('SELECT NOW() as now')
    client.release()
    return NextResponse.json({
      message: 'Conexão bem-sucedida!',
      timestamp: result.rows[0].now,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, message: 'Erro de conexão com o banco' },
      { status: 500 }
    )
  }
}
