# SHOGUN TRADE データベース設計

## 主要テーブル

### 1. users（ユーザー）
- id: 主キー
- username: ユーザーID（一意）
- email: メールアドレス（一意）
- password: ハッシュ化されたパスワード
- name: 名前（カタカナ）
- phone: 電話番号
- referrer_id: 紹介者ID（外部キー -> users.id）
- usdt_address: USDTアドレス（BEP20）
- wallet_type: ウォレットタイプ（EVOカード/その他）
- created_at: 作成日時
- updated_at: 更新日時

### 2. nfts（NFT）
- id: 主キー
- name: NFT名
- price: 価格（USDT）
- daily_rate: 日利上限（%）
- is_special: 特別NFTフラグ
- image_url: 画像URL
- created_at: 作成日時
- updated_at: 更新日時

### 3. user_nfts（ユーザーNFT）
- id: 主キー
- user_id: ユーザーID（外部キー -> users.id）
- nft_id: NFT ID（外部キー -> nfts.id）
- purchase_date: 購入日
- operation_start_date: 運用開始日
- total_earned: 累計獲得報酬
- status: ステータス（待機中/運用中/終了）
- created_at: 作成日時
- updated_at: 更新日時

### 4. rewards（報酬）
- id: 主キー
- user_nft_id: ユーザーNFT ID（外部キー -> user_nfts.id）
- date: 報酬日
- amount: 報酬額
- daily_rate: 適用された日利
- status: ステータス（計算済/申請中/支払済）
- created_at: 作成日時
- updated_at: 更新日時

### 5. reward_requests（報酬申請）
- id: 主キー
- user_id: ユーザーID（外部キー -> users.id）
- week_start: 週開始日
- week_end: 週終了日
- total_amount: 合計報酬額
- option: オプション（エアドロップ/複利運用）
- survey_completed: アンケート完了フラグ
- status: ステータス（申請中/承認済/拒否）
- created_at: 作成日時
- updated_at: 更新日時

### 6. mlm_ranks（MLMランク）
- id: 主キー
- name: ランク名
- min_investment: 最低投資額
- max_line_requirement: 最大系列要件
- other_lines_requirement: 他系列要件
- distribution_rate: 分配率
- bonus_rate: ボーナス率
- created_at: 作成日時
- updated_at: 更新日時

### 7. user_ranks（ユーザーランク）
- id: 主キー
- user_id: ユーザーID（外部キー -> users.id）
- rank_id: ランクID（外部キー -> mlm_ranks.id）
- effective_date: 有効日
- created_at: 作成日時
- updated_at: 更新日時

### 8. transactions（取引履歴）
- id: 主キー
- user_id: ユーザーID（外部キー -> users.id）
- type: 取引タイプ（購入/報酬/分配）
- amount: 金額
- description: 説明
- created_at: 作成日時
- updated_at: 更新日時
