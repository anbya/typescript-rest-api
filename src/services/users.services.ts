import pool from '../config/db';

export const getServices = async () => {
    try {
        const result = await pool.query('SELECT * FROM tb_user');
        return { 
            result: result.rows,
            message: 'Success'
        }
    } catch (err) {
        throw(err)
    }
};

export const addServices = async (name:string, email:string) => {
    try {
        const result = await pool.query(
            'INSERT INTO tb_user (name, email) VALUES ($1, $2) RETURNING *',
            [name, email]
        );
        
        return { 
            result: result.rows[0],
            message: 'Success'
        }
    } catch (err) {
        throw(err)
    }
};

export const updateServices = async (id:string, name:string, email:string) => {
    try {
        const result = await pool.query(
            'UPDATE tb_user SET name=$2, email=$3 WHERE id=$1 RETURNING *',
            [id, name, email]
        );
        
        return { 
            result: result.rows[0],
            message: 'Success'
        }
    } catch (err) {
        throw(err)
    }
};

export const deleteServices = async (id:string) => {
    try {
        const result = await pool.query(
            'DELETE FROM tb_user WHERE id=$1 RETURNING *',
            [id]
        );
        
        return { 
            result: result.rows[0],
            message: 'Success'
        }
    } catch (err) {
        throw(err)
    }
};