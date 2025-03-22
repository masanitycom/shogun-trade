// routes/adminRoutes.js
const express = require('express');
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// 管理者権限チェックミドルウェア
const adminMiddleware = async (req, res, next) => {
    try {
        // ユーザーが管理者かどうかを確認
        const adminCheck = await db.query(
            'SELECT is_admin FROM users WHERE id = $1',
            [req.user.id]
        );

        if (adminCheck.rows.length === 0 || !adminCheck.rows[0].is_admin) {
            return res.status(403).json({ message: '管理者権限が必要です' });
        }

        next();
    } catch (err) {
        console.error('管理者権限チェックエラー:', err);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
};

// 認証ミドルウェアと管理者権限チェックを適用
router.use(authMiddleware);
router.use(adminMiddleware);

// ユーザー一覧取得
router.get('/users', async (req, res) => {
    try {
        const usersResult = await db.query(
            `SELECT u.id, u.username, u.email, u.name, u.phone, u.referrer_id, u.usdt_address, u.wallet_type, u.created_at,
              (SELECT COUNT(*) FROM users WHERE referrer_id = u.id) as referrals_count,
              (SELECT SUM(n.price) FROM user_nfts un JOIN nfts n ON un.nft_id = n.id WHERE un.user_id = u.id) as total_investment
       FROM users u
       ORDER BY u.created_at DESC`
        );

        res.json(usersResult.rows);
    } catch (err) {
        console.error('ユーザー一覧取得エラー:', err);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
});

// ユーザー詳細取得
router.get('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const userResult = await db.query(
            `SELECT u.id, u.username, u.email, u.name, u.phone, u.referrer_id, u.usdt_address, u.wallet_type, u.created_at,
              (SELECT COUNT(*) FROM users WHERE referrer_id = u.id) as referrals_count
       FROM users u
       WHERE u.id = $1`,
            [id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'ユーザーが見つかりません' });
        }

        const user = userResult.rows[0];

        // ユーザーのNFT一覧を取得
        const userNFTsResult = await db.query(
            `SELECT un.id, un.purchase_date, un.operation_start_date, un.total_earned, un.status,
              n.id as nft_id, n.name, n.price, n.daily_rate, n.image_url, n.is_special
       FROM user_nfts un
       JOIN nfts n ON un.nft_id = n.id
       WHERE un.user_id = $1
       ORDER BY un.purchase_date DESC`,
            [id]
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

        res.json({
            user,
            nfts: userNFTs
        });
    } catch (err) {
        console.error('ユーザー詳細取得エラー:', err);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
});

// 特別NFTの付与
router.post('/assign-special-nft', async (req, res) => {
    try {
        const { userId, nftId } = req.body;

        if (!userId || !nftId) {
            return res.status(400).json({ message: '必須パラメータが不足しています' });
        }

        // ユーザーの存在確認
        const userCheck = await db.query(
            'SELECT * FROM users WHERE id = $1',
            [userId]
        );

        if (userCheck.rows.length === 0) {
            return res.status(404).json({ message: 'ユーザーが見つかりません' });
        }

        // NFTの存在確認と特別NFTかどうかのチェック
        const nftCheck = await db.query(
            'SELECT * FROM nfts WHERE id = $1 AND is_special = TRUE',
            [nftId]
        );

        if (nftCheck.rows.length === 0) {
            return res.status(400).json({ message: '指定されたNFTは特別NFTではないか、存在しません' });
        }

        const nft = nftCheck.rows[0];

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
            [userId, nftId, purchaseDate, operationStartDate]
        );

        // 取引履歴の記録
        await db.query(
            `INSERT INTO transactions (user_id, type, amount, description)
       VALUES ($1, 'special_nft', $2, $3)`,
            [userId, nft.price, `特別NFT付与: ${nft.name}`]
        );

        res.status(201).json({
            message: '特別NFTを付与しました',
            userNFT: newUserNFT.rows[0]
        });
    } catch (err) {
        console.error('特別NFT付与エラー:', err);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
});

// NFT一覧取得（特別NFTを含む全て）
router.get('/nfts', async (req, res) => {
    try {
        const nftsResult = await db.query(
            'SELECT * FROM nfts ORDER BY is_special, price ASC'
        );

        res.json(nftsResult.rows);
    } catch (err) {
        console.error('NFT一覧取得エラー:', err);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
});

// NFT編集
router.put('/nfts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, daily_rate, image_url } = req.body;

        if (!name || !price || !daily_rate) {
            return res.status(400).json({ message: '必須パラメータが不足しています' });
        }

        const updatedNFT = await db.query(
            `UPDATE nfts
       SET name = $1, price = $2, daily_rate = $3, image_url = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
            [name, price, daily_rate, image_url, id]
        );

        if (updatedNFT.rows.length === 0) {
            return res.status(404).json({ message: 'NFTが見つかりません' });
        }

        res.json({
            message: 'NFTを更新しました',
            nft: updatedNFT.rows[0]
        });
    } catch (err) {
        console.error('NFT編集エラー:', err);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
});

// 報酬申請一覧取得
router.get('/reward-requests', async (req, res) => {
    try {
        const requestsResult = await db.query(
            `SELECT rr.*, u.username, u.name
       FROM reward_requests rr
       JOIN users u ON rr.user_id = u.id
       ORDER BY rr.created_at DESC`
        );

        res.json(requestsResult.rows);
    } catch (err) {
        console.error('報酬申請一覧取得エラー:', err);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
});

// 報酬申請承認/拒否
router.put('/reward-requests/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: '無効なステータスです' });
        }

        // 報酬申請の存在確認
        const requestCheck = await db.query(
            'SELECT * FROM reward_requests WHERE id = $1',
            [id]
        );

        if (requestCheck.rows.length === 0) {
            return res.status(404).json({ message: '報酬申請が見つかりません' });
        }

        const request = requestCheck.rows[0];

        // トランザクション開始
        await db.query('BEGIN');

        try {
            // 報酬申請のステータスを更新
            const updatedRequest = await db.query(
                `UPDATE reward_requests
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
                [status, id]
            );

            // 関連する報酬のステータスも更新
            await db.query(
                `UPDATE rewards r
         SET status = $1
         FROM user_nfts un
         WHERE r.user_nft_id = un.id AND un.user_id = $2 AND r.date BETWEEN $3 AND $4 AND r.status = 'pending'`,
                [status === 'approved' ? 'paid' : 'calculated', request.user_id, request.week_start, request.week_end]
            );

            // 承認された場合、取引履歴に記録
            if (status === 'approved' && request.option === 'airdrop') {
                // 手数料を計算（EVOカードは5.5%、その他は8%）
                const userResult = await db.query(
                    'SELECT wallet_type FROM users WHERE id = $1',
                    [request.user_id]
                );

                const walletType = userResult.rows[0]?.wallet_type || 'other';
                const feeRate = walletType === 'evo' ? 0.055 : 0.08;
                const feeAmount = request.total_amount * feeRate;
                const netAmount = request.total_amount - feeAmount;

                await db.query(
                    `INSERT INTO transactions (user_id, type, amount, description)
           VALUES ($1, 'reward_payment', $2, $3)`,
                    [request.user_id, netAmount, `報酬支払い（手数料: ${feeAmount} USDT）`]
                );
            }

            await db.query('COMMIT');

            res.json({
                message: `報酬申請を${status === 'approved' ? '承認' : '拒否'}しました`,
                request: updatedRequest.rows[0]
            });
        } catch (err) {
            await db.query('ROLLBACK');
            throw err;
        }
    } catch (err) {
        console.error('報酬申請承認/拒否エラー:', err);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
});

// システム設定取得
router.get('/settings', async (req, res) => {
    try {
        const settingsResult = await db.query('SELECT * FROM system_settings');

        // 設定がない場合はデフォルト値を返す
        if (settingsResult.rows.length === 0) {
            return res.json({
                maintenance_mode: false,
                company_profit_percentage: 20
            });
        }

        res.json(settingsResult.rows[0]);
    } catch (err) {
        console.error('システム設定取得エラー:', err);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
});

// システム設定更新
router.put('/settings', async (req, res) => {
    try {
        const { maintenance_mode, company_profit_percentage } = req.body;

        // system_settingsテーブルが存在するか確認
        const tableCheck = await db.query(
            `SELECT EXISTS (
         SELECT FROM information_schema.tables 
         WHERE table_name = 'system_settings'
       )`
        );

        if (!tableCheck.rows[0].exists) {
            // テーブルが存在しない場合は作成
            await db.query(
                `CREATE TABLE system_settings (
           id SERIAL PRIMARY KEY,
           maintenance_mode BOOLEAN DEFAULT FALSE,
           company_profit_percentage INTEGER DEFAULT 20,
           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
           updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
         )`
            );
        }

        // 設定を更新または挿入
        const settingsCheck = await db.query('SELECT * FROM system_settings');

        if (settingsCheck.rows.length === 0) {
            // 設定がない場合は新規作成
            const newSettings = await db.query(
                `INSERT INTO system_settings (maintenance_mode, company_profit_percentage)
         VALUES ($1, $2)
         RETURNING *`,
                [maintenance_mode, company_profit_percentage]
            );

            res.json({
                message: 'システム設定を作成しました',
                settings: newSettings.rows[0]
            });
        } else {
            // 設定がある場合は更新
            const updatedSettings = await db.query(
                `UPDATE system_settings
         SET maintenance_mode = $1, company_profit_percentage = $2, updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
                [maintenance_mode, company_profit_percentage]
            );

            res.json({
                message: 'システム設定を更新しました',
                settings: updatedSettings.rows[0]
            });
        }
    } catch (err) {
        console.error('システム設定更新エラー:', err);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
});

// CSVユーザーインポート
router.post('/import-users', async (req, res) => {
    try {
        const { users } = req.body;

        if (!users || !Array.isArray(users) || users.length === 0) {
            return res.status(400).json({ message: 'インポートするユーザーデータが必要です' });
        }

        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        // トランザクション開始
        await db.query('BEGIN');

        try {
            for (const userData of users) {
                try {
                    const { name, username, email, password, phone, referrer_id, usdt_address, wallet_type } = userData;

                    // 必須フィールドの検証
                    if (!name || !username || !email || !password || !phone) {
                        throw new Error('必須フィールドが不足しています');
                    }

                    // ユーザー名とメールの重複チェック
                    const userCheck = await db.query(
                        'SELECT * FROM users WHERE username = $1 OR email = $2',
                        [username, email]
                    );

                    if (userCheck.rows.length > 0) {
                        throw new Error('ユーザー名またはメールアドレスはすでに使用されています');
                    }

                    // 紹介者IDの存在確認（指定されている場合）
                    if (referrer_id) {
                        const referrerCheck = await db.query(
                            'SELECT * FROM users WHERE id = $1',
                            [referrer_id]
                        );

                        if (referrerCheck.rows.length === 0) {
                            throw new Error('指定された紹介者IDは存在しません');
                        }
                    }

                    // パスワードのハッシュ化
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(password, salt);

                    // ユーザーの作成
                    await db.query(
                        `INSERT INTO users (name, username, email, password, phone, referrer_id, usdt_address, wallet_type)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                        [name, username, email, hashedPassword, phone, referrer_id || null, usdt_address || null, wallet_type || 'other']
                    );

                    results.success++;
                } catch (err) {
                    results.failed++;
                    results.errors.push({
                        user: userData.username || userData.email,
                        error: err.message
                    });
                }
            }

            await db.query('COMMIT');

            res.json({
                message: `${results.success}人のユーザーをインポートしました（失敗: ${results.failed}人）`,
                results
            });
        } catch (err) {
            await db.query('ROLLBACK');
            throw err;
        }
    } catch (err) {
        console.error('ユーザーインポートエラー:', err);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
});

module.exports = router;
