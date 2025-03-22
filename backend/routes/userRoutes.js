// routes/userRoutes.js
const express = require('express');
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// 認証ミドルウェアを適用
router.use(authMiddleware);

// ユーザープロフィール取得
router.get('/profile', async (req, res) => {
    try {
        const userResult = await db.query(
            'SELECT id, username, email, name, phone, referrer_id, usdt_address, wallet_type FROM users WHERE id = $1',
            [req.user.id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'ユーザーが見つかりません' });
        }

        res.json({ user: userResult.rows[0] });
    } catch (err) {
        console.error('プロフィール取得エラー:', err);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
});

// ユーザーのNFT一覧取得
router.get('/nfts', async (req, res) => {
    try {
        const userNFTsResult = await db.query(
            `SELECT un.id, un.purchase_date, un.operation_start_date, un.total_earned, un.status,
              n.id as nft_id, n.name, n.price, n.daily_rate, n.image_url, n.is_special
       FROM user_nfts un
       JOIN nfts n ON un.nft_id = n.id
       WHERE un.user_id = $1
       ORDER BY un.purchase_date DESC`,
            [req.user.id]
        );

        // 結果を整形
        const userNFTs = userNFTsResult.rows.map(row => ({
            id: row.id,
            purchase_date: row.purchase_date,
            operation_start_date: row.operation_start_date,
            total_earned: row.total_earned,
            status: row.status,
            nft: {
                id: row.nft_id,
                name: row.name,
                price: row.price,
                daily_rate: row.daily_rate,
                image_url: row.image_url,
                is_special: row.is_special
            }
        }));

        res.json(userNFTs);
    } catch (err) {
        console.error('ユーザーNFT取得エラー:', err);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
});

module.exports = router;
