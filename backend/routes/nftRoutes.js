// routes/nftRoutes.js
const express = require('express');
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// 全NFT取得（認証不要）
router.get('/', async (req, res) => {
    try {
        const nftsResult = await db.query(
            'SELECT * FROM nfts WHERE is_special = FALSE ORDER BY price ASC'
        );

        res.json(nftsResult.rows);
    } catch (err) {
        console.error('NFT取得エラー:', err);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
});

// NFT購入（認証必要）
router.post('/:id/purchase', authMiddleware, async (req, res) => {
    try {
        const nftId = req.params.id;

        // NFTの存在確認
        const nftResult = await db.query(
            'SELECT * FROM nfts WHERE id = $1',
            [nftId]
        );

        if (nftResult.rows.length === 0) {
            return res.status(404).json({ message: 'NFTが見つかりません' });
        }

        const nft = nftResult.rows[0];

        // 特別NFTは購入不可
        if (nft.is_special) {
            return res.status(403).json({ message: 'このNFTは購入できません' });
        }

        // 現在の日付
        const purchaseDate = new Date();

        // 運用開始日（1週間後）
        const operationStartDate = new Date(purchaseDate);
        operationStartDate.setDate(operationStartDate.getDate() + 7);

        // ユーザーNFTの作成
        const newUserNFT = await db.query(
            `INSERT INTO user_nfts (user_id, nft_id, purchase_date, operation_start_date, status)
       VALUES ($1, $2, $3, $4, 'waiting')
       RETURNING *`,
            [req.user.id, nftId, purchaseDate, operationStartDate]
        );

        // 取引履歴の記録
        await db.query(
            `INSERT INTO transactions (user_id, type, amount, description)
       VALUES ($1, 'purchase', $2, $3)`,
            [req.user.id, nft.price, `購入: ${nft.name}`]
        );

        res.status(201).json({
            message: 'NFTを購入しました',
            userNFT: newUserNFT.rows[0]
        });
    } catch (err) {
        console.error('NFT購入エラー:', err);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
});

module.exports = router;
