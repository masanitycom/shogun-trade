// routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const router = express.Router();

// ユーザー登録
router.post('/register', async (req, res) => {
    try {
        const {
            name,
            username,
            email,
            password,
            phone,
            referrer_id,
            usdt_address,
            wallet_type
        } = req.body;

        // 必須フィールドの検証
        if (!name || !username || !email || !password || !phone || !referrer_id) {
            return res.status(400).json({ message: '必須フィールドが不足しています' });
        }

        // ユーザー名とメールの重複チェック
        const userCheck = await db.query(
            'SELECT * FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );

        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: 'ユーザー名またはメールアドレスはすでに使用されています' });
        }

        // 紹介者IDの存在確認
        if (referrer_id) {
            const referrerCheck = await db.query(
                'SELECT * FROM users WHERE id = $1',
                [referrer_id]
            );

            if (referrerCheck.rows.length === 0) {
                return res.status(400).json({ message: '指定された紹介者IDは存在しません' });
            }
        }

        // パスワードのハッシュ化
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // ユーザーの作成
        const newUser = await db.query(
            `INSERT INTO users (name, username, email, password, phone, referrer_id, usdt_address, wallet_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, username, email, name`,
            [name, username, email, hashedPassword, phone, referrer_id, usdt_address || null, wallet_type || 'other']
        );

        res.status(201).json({
            message: 'ユーザー登録が完了しました',
            user: newUser.rows[0]
        });
    } catch (err) {
        console.error('登録エラー:', err);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
});

// ログイン
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // ユーザー名またはメールでユーザーを検索
        const userResult = await db.query(
            'SELECT * FROM users WHERE username = $1 OR email = $1',
            [username]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: 'ユーザー名またはパスワードが正しくありません' });
        }

        const user = userResult.rows[0];

        // パスワードの検証
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'ユーザー名またはパスワードが正しくありません' });
        }

        // JWTトークンの生成
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // パスワードを除外したユーザー情報を返す
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            token,
            user: userWithoutPassword
        });
    } catch (err) {
        console.error('ログインエラー:', err);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
});

module.exports = router;
