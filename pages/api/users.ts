import type { NextApiRequest, NextApiResponse } from 'next';
import turso from '../../lib/turso';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return await handleGet(req, res);

    case 'POST':
      return await handlePost(req, res);

    case 'PUT':
      return await handlePut(req, res);

    case 'DELETE':
      return await handleDelete(req, res);

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  try {
    if (id) {
      const idStr = Array.isArray(id) ? id[0] : id;
      if (!idStr) {
        return res.status(400).json({ error: 'Invalid ID' });
      }
      const { rows } = await turso.execute({
        sql: 'SELECT * FROM users WHERE id = ?',
        args: [idStr]
      });
      if (rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json(rows[0]);
    } else {
      const { rows } = await turso.execute({
        sql: 'SELECT * FROM users',
        args: []
      });
      return res.status(200).json(rows);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { email, name, username, phone, avatar_url, password } = req.body;
  try {
    const { rows } = await turso.execute({
      sql: 'INSERT INTO users (id, email, name, username, phone, avatar_url, password) VALUES (uuid_generate_v4(), ?, ?, ?, ?, ?, ?) RETURNING *',
      args: [email, name, username, phone, avatar_url, password]
    });
    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const { email, name, username, phone, avatar_url, password } = req.body;
  try {
    const idStr = Array.isArray(id) ? id[0] : id;
    if (!idStr) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    const { rows } = await turso.execute({
      sql: 'UPDATE users SET email = ?, name = ?, username = ?, phone = ?, avatar_url = ?, password = ? WHERE id = ? RETURNING *',
      args: [email, name, username, phone, avatar_url, password, idStr]
    });
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  try {
    const idStr = Array.isArray(id) ? id[0] : id;
    if (!idStr) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    const { rows } = await turso.execute({
      sql: 'DELETE FROM users WHERE id = ?',
      args: [idStr]
    });
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(204).end();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
