import {createPool} from 'mysql2/promise';
import {config} from '../config.js';

export const pool = createPool({
    host: config.TYPEORM_HOST,
    user: config.TYPEORM_USERNAME,
    password: config.TYPEORM_PASSWORD,
    database: config.TYPEORM_DATABASE,
    namedPlaceholders: true,
    // decimalNumbers: true,
});