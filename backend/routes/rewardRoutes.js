// routes/rewardRoutes.js
const express = require('express');
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// 認証ミドルウェアを適用
router.use(authMiddleware);

// ユーザーの報酬一覧取得
router.get('/', async (req, res) => {
    try {
        const rewardsResult = await db.query(
            `SELECT r.id, r.date, r.amount, r.daily_rate, r.status, un.id as user_nft_id, n.name as nft_name
       FROM rewards r
       JOIN user_nfts un ON r.user_nft_id = un.id
       JOIN nfts n ON un.nft_id = n.id
       WHERE un.user_id = $1
       ORDER BY r.date DESC`,
            [req.user.id]
        );

        res.json(rewardsResult.rows);
    } catch (err) {
        console.error('報酬取得エラー:', err);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
});

// 報酬申請（エアドロタスク）
router.post('/request', async (req, res) => {
    try {
        const { option, week } = req.body;

        if (!option || !week) {
            return res.status(400).json({ message: '必須パラメータが不足しています' });
        }

        // 週の開始日と終了日を解析
        const [weekStart, weekEnd] = week.split('_').map(date => new Date(date));

        if (!weekStart || !weekEnd) {
            return res.status(400).json({ message: '無効な週の指定です' });
        }

        // 指定された週の報酬を集計
        const rewardsResult = await db.query(
            `SELECT SUM(r.amount) as total_amount
       FROM rewards r
       JOIN user_nfts un ON r.user_nft_id = un.id
       WHERE un.user_id = $1 AND r.date BETWEEN $2 AND $3 AND r.status = 'calculated'`,
            [req.user.id, weekStart, weekEnd]
        );

        const totalAmount = rewardsResult.rows[0]?.total_amount || 0;

        if (totalAmount <= 0) {
            return res.status(400).json({ message: 'この週の報酬はありません' });
        }

        // 報酬申請を作成
        const requestResult = await db.query(
            `INSERT INTO reward_requests (user_id, week_start, week_end, total_amount, option, survey_completed, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
            [req.user.id, weekStart, weekEnd, totalAmount, option, option === 'compound' ? true : false]
        );

        // 報酬のステータスを更新
        await db.query(
            `UPDATE rewards r
       SET status = 'pending'
       FROM user_nfts un
       WHERE r.user_nft_id = un.id AND un.user_id = $1 AND r.date BETWEEN $2 AND $3 AND r.status = 'calculated'`,
            [req.user.id, weekStart, weekEnd]
        );

        // 複利運用の場合は、NFTの累計獲得報酬を更新
        if (option === 'compound') {
            await db.query(
                `UPDATE user_nfts
         SET total_earned = total_earned + $1
         WHERE user_id = $2`,
                [totalAmount, req.user.id]
            );
        }

        res.status(201).json({
            message: '報酬申請が完了しました',
            request: requestResult.rows[0]
        });
    } catch (err) {
        console.error('報酬申請エラー:', err);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
});

// 報酬申請一覧取得
router.get('/requests', async (req, res) => {
    try {
        const requestsResult = await db.query(
            `SELECT * FROM reward_requests
       WHERE user_id = $1
       ORDER BY created_at DESC`,
            [req.user.id]
        );

        res.json(requestsResult.rows);
    } catch (err) {
        console.error('報酬申請取得エラー:', err);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
});

// アンケート回答
router.post('/survey/:requestId', async (req, res) => {
    try {
        const { requestId } = req.params;
        const { answers } = req.body;

        if (!answers) {
            return res.status(400).json({ message: 'アンケート回答が必要です' });
        }

        // 報酬申請の存在確認
        const requestResult = await db.query(
            `SELECT * FROM reward_requests
       WHERE id = $1 AND user_id = $2`,
            [requestId, req.user.id]
        );

        if (requestResult.rows.length === 0) {
            return res.status(404).json({ message: '報酬申請が見つかりません' });
        }

        const request = requestResult.rows[0];

        if (request.option === 'compound') {
            return res.status(400).json({ message: '複利運用を選択した場合はアンケート回答は不要です' });
        }

        if (request.survey_completed) {
            return res.status(400).json({ message: 'すでにアンケートに回答済みです' });
        }

        // アンケート回答を保存（実際のアンケート回答テーブルがあれば使用）
        // ここではシンプルに報酬申請のsurvey_completedフラグを更新
        await db.query(
            `UPDATE reward_requests
       SET survey_completed = true
       WHERE id = $1`,
            [requestId]
        );

        res.json({
            message: 'アンケート回答が完了しました',
            requestId
        });
    } catch (err) {
        console.error('アンケート回答エラー:', err);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
});

module.exports = router;
