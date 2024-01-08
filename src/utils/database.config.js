import {createPool} from 'mysql2/promise';
import {config} from '../config.js';

const {TYPEORM_HOST, TYPEORM_USERNAME, TYPEORM_PASSWORD, TYPEORM_DATABASE} = config;

export const pool = createPool({
    host: TYPEORM_HOST,
    user: TYPEORM_USERNAME,
    password: TYPEORM_PASSWORD,
    database: TYPEORM_DATABASE,
    namedPlaceholders: true,
    // decimalNumbers: true,
});
