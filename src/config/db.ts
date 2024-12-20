import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { aes256gcm } from '../authorization/secret';

const cipher = aes256gcm(Buffer.alloc(32));
dotenv.config();

const pool = new Pool({
  user: cipher.decrypt(process.env.DB_USERNAME as string),
  host: cipher.decrypt(process.env.DB_HOST as string),
  database: cipher.decrypt(process.env.DB_DEV_NAME as string),
  password: cipher.decrypt(process.env.DB_PASSWORD as string),
  port: 5432,
});

export default pool;
