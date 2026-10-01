import { DataSource } from 'typeorm';
import { validateEnv } from '../config/env.js';
import { createDataSourceOptions } from './database.options.js';

const env = validateEnv(process.env);

export default new DataSource(createDataSourceOptions(env.DATABASE_URL));
