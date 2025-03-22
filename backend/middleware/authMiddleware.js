// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const db = require('../config/db');

module.exports = async (req, res, next) => {
    try {
        // ヘッダーからトークンを取得
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: '認証が必要です' });
        }

        const token = authHeader.split(' ')[1];

        // トークンの検証
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ユーザーの存在確認
        const userResult = await db.query(
            'SELECT id, username FROM users WHERE id = $1',
            [decoded.id]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: 'ユーザーが見つかりません' });
        }

        // リクエストオブジェクトにユーザー情報を追加
        req.user = userResult.rows[0];
        next();
    } catch (err) {
        console.error('認証エラー:', err);
        res.status(401).json({ message: '無効なトークンです' });
    }
};
