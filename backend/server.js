const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');

// 環境変数の読み込み
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ルート
app.get('/', (req, res) => {
    res.send('SHOGUN TRADE API is running');
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
