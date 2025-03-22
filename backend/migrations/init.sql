-- ユーザーテーブル
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  referrer_id INTEGER REFERENCES users(id),
  usdt_address VARCHAR(255),
  wallet_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NFTテーブル
CREATE TABLE nfts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(15, 2) NOT NULL,
  daily_rate DECIMAL(5, 2) NOT NULL,
  is_special BOOLEAN DEFAULT FALSE,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ユーザーNFTテーブル
CREATE TABLE user_nfts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  nft_id INTEGER REFERENCES nfts(id) NOT NULL,
  purchase_date DATE NOT NULL,
  operation_start_date DATE,
  total_earned DECIMAL(15, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'waiting',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 報酬テーブル
CREATE TABLE rewards (
  id SERIAL PRIMARY KEY,
  user_nft_id INTEGER REFERENCES user_nfts(id) NOT NULL,
  date DATE NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  daily_rate DECIMAL(5, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'calculated',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 報酬申請テーブル
CREATE TABLE reward_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  total_amount DECIMAL(15, 2) NOT NULL,
  option VARCHAR(50) NOT NULL,
  survey_completed BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MLMランクテーブル
CREATE TABLE mlm_ranks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  min_investment DECIMAL(15, 2) NOT NULL,
  max_line_requirement DECIMAL(15, 2) NOT NULL,
  other_lines_requirement DECIMAL(15, 2) NOT NULL,
  distribution_rate DECIMAL(5, 2) NOT NULL,
  bonus_rate DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ユーザーランクテーブル
CREATE TABLE user_ranks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  rank_id INTEGER REFERENCES mlm_ranks(id) NOT NULL,
  effective_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 取引履歴テーブル
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 初期データ: MLMランク
INSERT INTO mlm_ranks (name, min_investment, max_line_requirement, other_lines_requirement, distribution_rate, bonus_rate) VALUES
('足軽', 1000, 1000, 0, 45, 0),
('武将', 1000, 3000, 1500, 25, 0),
('代官', 1000, 5000, 2500, 10, 0),
('奉行', 1000, 10000, 5000, 6, 0),
('老中', 1000, 50000, 25000, 5, 0),
('大老', 1000, 100000, 50000, 4, 22),
('大名', 1000, 300000, 150000, 3, 25),
('将軍', 1000, 600000, 500000, 2, 30);

-- 初期データ: 通常NFT
INSERT INTO nfts (name, price, daily_rate, is_special, image_url) VALUES
('SHOGUN NFT 300', 300, 0.5, FALSE, '/images/nft/300.jpg'),
('SHOGUN NFT 500', 500, 0.5, FALSE, '/images/nft/500.jpg'),
('SHOGUN NFT 1,000', 1000, 1.0, FALSE, '/images/nft/1000.jpg'),
('SHOGUN NFT 3,000', 3000, 1.0, FALSE, '/images/nft/3000.jpg'),
('SHOGUN NFT 5,000', 5000, 1.0, FALSE, '/images/nft/5000.jpg'),
('SHOGUN NFT 10,000', 10000, 1.25, FALSE, '/images/nft/10000.jpg'),
('SHOGUN NFT 30,000', 30000, 1.5, FALSE, '/images/nft/30000.jpg'),
('SHOGUN NFT 100,000', 100000, 2.0, FALSE, '/images/nft/100000.jpg');

-- 初期データ: 特別NFT
INSERT INTO nfts (name, price, daily_rate, is_special, image_url) VALUES
('SHOGUN NFT 100', 100, 0.5, TRUE, '/images/nft/special/100.jpg'),
('SHOGUN NFT 200', 200, 0.5, TRUE, '/images/nft/special/200.jpg'),
('SHOGUN NFT 600', 600, 0.5, TRUE, '/images/nft/special/600.jpg'),
('SHOGUN NFT 1,100', 1100, 1.0, TRUE, '/images/nft/special/1100.jpg'),
('SHOGUN NFT 1,177', 1177, 1.0, TRUE, '/images/nft/special/1177.jpg'),
('SHOGUN NFT 1,217', 1217, 1.0, TRUE, '/images/nft/special/1217.jpg'),
('SHOGUN NFT 1,227', 1227, 1.0, TRUE, '/images/nft/special/1227.jpg'),
('SHOGUN NFT 1,300', 1300, 1.0, TRUE, '/images/nft/special/1300.jpg'),
('SHOGUN NFT 1,350', 1350, 1.0, TRUE, '/images/nft/special/1350.jpg'),
('SHOGUN NFT 1,500', 1500, 1.0, TRUE, '/images/nft/special/1500.jpg'),
('SHOGUN NFT 1,600', 1600, 1.0, TRUE, '/images/nft/special/1600.jpg'),
('SHOGUN NFT 1,836', 1836, 1.0, TRUE, '/images/nft/special/1836.jpg'),
('SHOGUN NFT 2,000', 2000, 1.0, TRUE, '/images/nft/special/2000.jpg'),
('SHOGUN NFT 2,100', 2100, 1.0, TRUE, '/images/nft/special/2100.jpg'),
('SHOGUN NFT 3,175', 3175, 1.0, TRUE, '/images/nft/special/3175.jpg'),
('SHOGUN NFT 4,000', 4000, 1.0, TRUE, '/images/nft/special/4000.jpg'),
('SHOGUN NFT 6,600', 6600, 1.0, TRUE, '/images/nft/special/6600.jpg'),
('SHOGUN NFT 8,000', 8000, 1.0, TRUE, '/images/nft/special/8000.jpg');
