// routes/mlmRoutes.js
const express = require('express');
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// 認証ミドルウェアを適用
router.use(authMiddleware);

// MLMランク一覧取得
router.get('/ranks', async (req, res) => {
    try {
        const ranksResult = await db.query(
            'SELECT * FROM mlm_ranks ORDER BY min_investment ASC'
        );

        res.json(ranksResult.rows);
    } catch (err) {
        console.error('MLMランク取得エラー:', err);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
});

// ユーザーの現在のランク取得
router.get('/my-rank', async (req, res) => {
    try {
        const userRankResult = await db.query(
            `SELECT ur.id, ur.effective_date, mr.*
       FROM user_ranks ur
       JOIN mlm_ranks mr ON ur.rank_id = mr.id
       WHERE ur.user_id = $1
       ORDER BY ur.effective_date DESC
       LIMIT 1`,
            [req.user.id]
        );

        if (userRankResult.rows.length === 0) {
            return res.json({ message: 'ランクはまだ設定されていません' });
        }

        res.json(userRankResult.rows[0]);
    } catch (err) {
        console.error('ユーザーランク取得エラー:', err);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
});

// ユーザーの組織構造取得
router.get('/organization', async (req, res) => {
    try {
        // 直接の紹介者を取得
        const directReferralsResult = await db.query(
            `SELECT u.id, u.username, u.name,
              (SELECT SUM(n.price) FROM user_nfts un JOIN nfts n ON un.nft_id = n.id WHERE un.user_id = u.id) as total_investment
       FROM users u
       WHERE u.referrer_id = $1`,
            [req.user.id]
        );

        // 各紹介者の下の組織を取得
        const organization = [];

        for (const referral of directReferralsResult.rows) {
            // 各紹介者の下の組織の総投資額を計算
            const lineInvestmentResult = await db.query(
                `WITH RECURSIVE referral_tree AS (
           SELECT id, referrer_id
           FROM users
           WHERE id = $1
           UNION
           SELECT u.id, u.referrer_id
           FROM users u
           JOIN referral_tree rt ON u.referrer_id = rt.id
         )
         SELECT SUM(n.price) as line_total
         FROM user_nfts un
         JOIN nfts n ON un.nft_id = n.id
         WHERE un.user_id IN (SELECT id FROM referral_tree)`,
                [referral.id]
            );

            organization.push({
                ...referral,
                line_total: lineInvestmentResult.rows[0]?.line_total || 0
            });
        }

        // 最大系列と他系列の合計を計算
        let maxLine = 0;
        let otherLinesTotal = 0;

        if (organization.length > 0) {
            // 投資額でソート
            organization.sort((a, b) => b.line_total - a.line_total);

            // 最大系列
            maxLine = organization[0].line_total;

            // 他系列の合計
            otherLinesTotal = organization.slice(1).reduce((sum, line) => sum + line.line_total, 0);
        }

        res.json({
            organization,
            stats: {
                max_line: maxLine,
                other_lines_total: otherLinesTotal,
                direct_referrals: organization.length
            }
        });
    } catch (err) {
        console.error('組織構造取得エラー:', err);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
});

module.exports = router;
