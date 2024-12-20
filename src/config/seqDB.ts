import { Sequelize } from 'sequelize-typescript';
import * as dotenv from 'dotenv';
import { aes256gcm } from '../authorization/secret';

const cipher = aes256gcm(Buffer.alloc(32));
dotenv.config();

export const sequelizeConfig = new Sequelize({
  dialect: 'postgres',
  host: cipher.decrypt(process.env.DB_HOST as string),
  username: cipher.decrypt(process.env.DB_USERNAME as string),
  password: cipher.decrypt(process.env.DB_PASSWORD as string),
  database: cipher.decrypt(process.env.DB_DEV_NAME as string),
});
