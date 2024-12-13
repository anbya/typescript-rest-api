import { Router } from 'express';
import {
    CustomWebRequest,
    CustomAppRequest
} from '../middleware/token';
import pool from '../config/db';

const router: Router = Router();

router.get('/', async (req, res) => {
    const customAppReq = req as CustomAppRequest
    try {
      const result = await pool.query('SELECT * FROM tb_user');
      res.json(result.rows);
    } catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ message: 'Database error', error: err.message });
        } else {
            res.status(500).json({ message: 'Unknown error', error: String(err) });
        }
    }
});

router.post('/', async (req, res) => {
    const customAppReq = req as CustomAppRequest
    const { name, email } = customAppReq.body;
    try {
      const result = await pool.query(
        'INSERT INTO tb_user (name, email) VALUES ($1, $2) RETURNING *',
        [name, email]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ message: 'Database error', error: err.message });
        } else {
            res.status(500).json({ message: 'Unknown error', error: String(err) });
        }
    }
});

router.put('/:id', async (req, res) => {
    const customAppReq = req as CustomAppRequest
    const { name, email } = customAppReq.body;
    const { id } = customAppReq.params;
    try {
      const result = await pool.query(
        'UPDATE tb_user SET name=$2, email=$3 WHERE id=$1 RETURNING *',
        [id, name, email]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ message: 'Database error', error: err.message });
        } else {
            res.status(500).json({ message: 'Unknown error', error: String(err) });
        }
    }
});

router.delete('/:id', async (req, res) => {
    const customAppReq = req as CustomAppRequest
    const { id } = customAppReq.params;
    try {
      const result = await pool.query(
        'DELETE FROM tb_user WHERE id=$1 RETURNING *',
        [id]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ message: 'Database error', error: err.message });
        } else {
            res.status(500).json({ message: 'Unknown error', error: String(err) });
        }
    }
});

export default router;
