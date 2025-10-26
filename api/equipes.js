import { Pool } from 'pg'

// Configura o pool de conexão com o NeonDB
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

// Função principal
export default async function handler(req, res) {
  const { method } = req

  try {
    const client = await pool.connect()

    // 📋 LISTAR EQUIPES
    if (method === 'GET') {
      const result = await client.query('SELECT * FROM equipes ORDER BY id ASC')
      client.release()
      return res.status(200).json(result.rows)
    }

    // ➕ INSERIR EQUIPE
    if (method === 'POST') {
      const { nome } = req.body
      if (!nome) {
        client.release()
        return res.status(400).json({ error: 'Campo "nome" é obrigatório.' })
      }
      const result = await client.query(
        'INSERT INTO equipes (nome) VALUES ($1) RETURNING *',
        [nome]
      )
      client.release()
      return res.status(201).json(result.rows[0])
    }

    // ❌ DELETAR EQUIPE
    if (method === 'DELETE') {
      const { id } = req.query
      if (!id) {
        client.release()
        return res.status(400).json({ error: 'Informe o ID da equipe para exclusão.' })
      }
      await client.query('DELETE FROM equipes WHERE id = $1', [id])
      client.release()
      return res.status(200).json({ message: 'Equipe removida com sucesso.' })
    }

    client.release()
    return res.status(405).json({ error: 'Método não permitido.' })
  } catch (error) {
    console.error('Erro na rota /api/equipes:', error)
    return res.status(500).json({
      message: 'Erro interno do servidor.',
      error: error.message,
    })
  }
}
