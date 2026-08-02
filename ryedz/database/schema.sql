-- =========================================================
-- Ryedz.id — Skema Database (MySQL 8 / kompatibel Supabase-Postgres dgn penyesuaian tipe)
-- =========================================================
SET NAMES utf8mb4;

CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,           -- admin, moderator, premium, user
  level INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(80) UNIQUE NOT NULL,           -- prompt.approve, user.ban, ...
  description VARCHAR(255)
);

CREATE TABLE role_permissions (
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  provider ENUM('local','google','github','discord') DEFAULT 'local',
  provider_id VARCHAR(120),
  avatar_url VARCHAR(255),
  banner_url VARCHAR(255),
  bio TEXT,
  website VARCHAR(255),
  social JSON,
  role_id INT DEFAULT 4,
  level INT DEFAULT 1,
  reputation INT DEFAULT 0,
  is_verified TINYINT(1) DEFAULT 0,
  is_premium TINYINT(1) DEFAULT 0,
  premium_until DATE NULL,
  status ENUM('active','suspended','banned') DEFAULT 'active',
  total_views BIGINT DEFAULT 0,
  total_likes BIGINT DEFAULT 0,
  total_copies BIGINT DEFAULT 0,
  followers_count INT DEFAULT 0,
  following_count INT DEFAULT 0,
  two_factor_enabled TINYINT(1) DEFAULT 0,
  last_login_ip VARCHAR(45),
  last_login_device VARCHAR(150),
  last_login_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE follows (
  follower_id BIGINT NOT NULL,
  following_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, following_id),
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  slug VARCHAR(80) UNIQUE NOT NULL,
  icon VARCHAR(60),
  color VARCHAR(20),
  sort_order INT DEFAULT 0
);

CREATE TABLE ai_models (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) UNIQUE NOT NULL,
  slug VARCHAR(80) UNIQUE NOT NULL,
  vendor VARCHAR(80),
  icon VARCHAR(60),
  is_active TINYINT(1) DEFAULT 1
);

CREATE TABLE prompts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  category_id INT,
  ai_model_id INT,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(220) UNIQUE,
  description TEXT,
  body LONGTEXT NOT NULL,
  thumbnail_url VARCHAR(255),
  screenshot_url VARCHAR(255),
  tags JSON,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  reject_reason VARCHAR(255),
  is_featured TINYINT(1) DEFAULT 0,
  is_trending TINYINT(1) DEFAULT 0,
  is_pinned TINYINT(1) DEFAULT 0,
  is_hidden TINYINT(1) DEFAULT 0,
  publish_at DATETIME NULL,
  views BIGINT DEFAULT 0,
  likes BIGINT DEFAULT 0,
  copies BIGINT DEFAULT 0,
  rating_avg DECIMAL(3,2) DEFAULT 0,
  rating_count INT DEFAULT 0,
  version VARCHAR(10) DEFAULT '1.0',
  deleted_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (ai_model_id) REFERENCES ai_models(id),
  INDEX idx_status_date (status, created_at),
  FULLTEXT KEY ft_search (title, description)
);

CREATE TABLE prompt_versions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  prompt_id BIGINT NOT NULL,
  version VARCHAR(10),
  body LONGTEXT,
  note VARCHAR(255),
  edited_by BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE
);

CREATE TABLE comments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  prompt_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  parent_id BIGINT NULL,
  body TEXT NOT NULL,
  likes INT DEFAULT 0,
  is_hidden TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

CREATE TABLE likes (
  user_id BIGINT NOT NULL,
  prompt_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, prompt_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE
);

CREATE TABLE favorites (
  user_id BIGINT NOT NULL,
  prompt_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, prompt_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE
);

CREATE TABLE ratings (
  user_id BIGINT NOT NULL,
  prompt_id BIGINT NOT NULL,
  score TINYINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, prompt_id)
);

CREATE TABLE reports (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  reporter_id BIGINT NOT NULL,
  target_type ENUM('prompt','comment','user') NOT NULL,
  target_id BIGINT NOT NULL,
  reason ENUM('spam','berbahaya','ilegal','penipuan','pornografi','malware','phishing','kebencian','plagiarisme','lainnya') NOT NULL,
  detail TEXT,
  status ENUM('open','reviewing','resolved','rejected') DEFAULT 'open',
  handled_by BIGINT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bans (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  type ENUM('warning','suspend','permanent') NOT NULL,
  reason VARCHAR(255),
  expires_at DATETIME NULL,
  issued_by BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE badges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(40) UNIQUE NOT NULL,   -- verified, premium, engineer, top, rising, trending, moderator, admin, founder, early, contributor
  label VARCHAR(80) NOT NULL,
  icon VARCHAR(60),
  color VARCHAR(20),
  description VARCHAR(255)
);

CREATE TABLE user_badges (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  badge_id INT NOT NULL,
  granted_by BIGINT NULL,
  expires_at DATE NULL,
  revoked_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
);

CREATE TABLE achievements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(100),
  description VARCHAR(255),
  icon VARCHAR(60),
  reputation_reward INT DEFAULT 0
);

CREATE TABLE user_achievements (
  user_id BIGINT NOT NULL,
  achievement_id INT NOT NULL,
  achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, achievement_id)
);

CREATE TABLE reputation_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  delta INT NOT NULL,
  reason VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NULL,               -- NULL = broadcast
  title VARCHAR(150),
  body TEXT,
  icon VARCHAR(60),
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE activity_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NULL,
  action VARCHAR(150),
  meta JSON,
  ip VARCHAR(45),
  user_agent VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE analytics (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  visitors INT DEFAULT 0,
  pageviews INT DEFAULT 0,
  unique_users INT DEFAULT 0,
  new_users INT DEFAULT 0,
  prompts_created INT DEFAULT 0,
  copies INT DEFAULT 0,
  country VARCHAR(60),
  browser VARCHAR(60),
  device VARCHAR(40),
  referral VARCHAR(150),
  bounce_rate DECIMAL(5,2),
  UNIQUE KEY uq_day (date, country, browser, device, referral)
);

CREATE TABLE sessions (
  id VARCHAR(128) PRIMARY KEY,
  user_id BIGINT,
  ip VARCHAR(45),
  device VARCHAR(150),
  payload TEXT,
  last_activity DATETIME
);

CREATE TABLE blacklist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('ip','domain','word','email') NOT NULL,
  value VARCHAR(190) NOT NULL,
  reason VARCHAR(190),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE whitelist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('ip','domain','email') NOT NULL,
  value VARCHAR(190) NOT NULL,
  note VARCHAR(190)
);

CREATE TABLE settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(100) UNIQUE NOT NULL,
  `value` TEXT,
  `group` VARCHAR(50) DEFAULT 'general'
);

-- Seed dasar ---------------------------------------------------------------
INSERT INTO roles (id,name,level) VALUES (1,'admin',100),(2,'moderator',70),(3,'premium',30),(4,'user',10);

INSERT INTO badges (code,label,icon,color,description) VALUES
 ('verified','Verified','fa-circle-check','#3b82f6','Pengguna terverifikasi admin'),
 ('premium','Premium','fa-crown','#f59e0b','Akun premium dengan fitur eksklusif'),
 ('engineer','Prompt Engineer','fa-brain','#a855f7','Ahli membuat prompt berkualitas'),
 ('top','Top Creator','fa-trophy','#22d3ee','View, like, copy terbanyak'),
 ('rising','Rising Creator','fa-star','#ec4899','Naik daun 30 hari terakhir'),
 ('trending','Trending Author','fa-fire','#f97316','Prompt sedang viral'),
 ('moderator','Moderator','fa-shield-halved','#22c55e','Tim moderasi'),
 ('admin','Admin','fa-gear','#ef4444','Administrator Ryedz.id'),
 ('founder','Founder','fa-gem','#67e8f9','Pemilik Ryedz.id'),
 ('early','Early Supporter','fa-rocket','#8b5cf6','Bergabung sejak awal'),
 ('contributor','Contributor','fa-medal','#94a3b8','Aktif membantu komunitas');

INSERT INTO settings (`key`,`value`,`group`) VALUES
 ('site_name','Ryedz.id','general'),
 ('site_slogan','Ryedz Pengen Famous','general'),
 ('require_review','1','moderation'),
 ('registration_open','1','general'),
 ('maintenance_mode','0','system');
