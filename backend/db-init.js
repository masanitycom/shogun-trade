const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const initSql = fs.readFileSync(path.join(__dirname, 'migrations', 'init.sql'), 'utf8');

async function initDatabase() {
    try {
        console.log('データベース初期化を開始します...');
        await pool.query(initSql);
        console.log('データベース初期化が完了しました！');
    } catch (err) {
        console.error('データベース初期化中にエラーが発生しました:', err);
    } finally {
        pool.end();
    }
}

initDatabase();
