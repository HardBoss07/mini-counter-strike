-- ==========================================
-- 1. BASE CATALOG & CONFIGURATION
-- ==========================================

-- Cases Table
CREATE TABLE IF NOT EXISTS cases (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_url VARCHAR(255)
);

-- Weapon Templates (Static Catalog)
CREATE TABLE IF NOT EXISTS weapon_template (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- WEAPON, UTILITY
    side VARCHAR(10) NOT NULL, -- T, CT, ALL
    energy_cost INTEGER NOT NULL,
    damage INTEGER NOT NULL,
    draw_weight INTEGER NOT NULL,
    crit_chance DECIMAL(5,2) DEFAULT 0,
    crit_multiplier DECIMAL(5,2) DEFAULT 1.0,
    status_effect VARCHAR(50) DEFAULT 'NONE',
    rarity VARCHAR(50) DEFAULT 'BASE_GRADE' NOT NULL,
    image_url VARCHAR(255),
    description TEXT,
    case_id INTEGER REFERENCES cases(id) ON DELETE SET NULL
);

-- ==========================================
-- 2. USER & INVENTORY DATA
-- ==========================================

-- Users (Dynamic Data)
CREATE TABLE IF NOT EXISTS app_user (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    elo INTEGER DEFAULT 1000,
    credits INTEGER DEFAULT 100,
    next_case_available_at TIMESTAMP
);

-- User Weapon Instances (Ownership)
CREATE TABLE IF NOT EXISTS user_weapon_instance (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES app_user(id) ON DELETE CASCADE,
    template_id INTEGER REFERENCES weapon_template(id) ON DELETE CASCADE,
    skin_name VARCHAR(255) DEFAULT 'Default',
    damage_modifier INTEGER DEFAULT 0,
    cost_modifier INTEGER DEFAULT 0,
    draw_weight_modifier INTEGER DEFAULT 0
);

-- User Cases (Ownership)
CREATE TABLE IF NOT EXISTS user_cases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES app_user(id) ON DELETE CASCADE,
    case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
    is_opened BOOLEAN DEFAULT FALSE
);

-- Loadouts (Side Definitions)
CREATE TABLE IF NOT EXISTS loadout (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES app_user(id) ON DELETE CASCADE,
    side VARCHAR(10) NOT NULL, -- T, CT
    CONSTRAINT unique_user_side UNIQUE(user_id, side)
);

-- Loadout Items (Junction Table)
CREATE TABLE IF NOT EXISTS loadout_item (
    loadout_id INTEGER REFERENCES loadout(id) ON DELETE CASCADE,
    user_weapon_instance_id INTEGER REFERENCES user_weapon_instance(id) ON DELETE CASCADE,
    PRIMARY KEY (loadout_id, user_weapon_instance_id)
);

-- ==========================================
-- 3. MATCH STATE
-- ==========================================

-- Match State
CREATE TABLE IF NOT EXISTS match_state (
    id SERIAL PRIMARY KEY,
    player_a_id INTEGER REFERENCES app_user(id) ON DELETE SET NULL,
    player_b_id INTEGER REFERENCES app_user(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, COMPLETED, ABANDONED, DRAW
    winner_id INTEGER REFERENCES app_user(id) ON DELETE SET NULL,
    logs_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 4. PLAYER STATISTICS & ANALYTICS
-- ==========================================

-- Lifetime Summary (1-to-1 with app_user for instantly loading profile stats)
CREATE TABLE IF NOT EXISTS user_stats_summary (
    user_id INTEGER PRIMARY KEY REFERENCES app_user(id) ON DELETE CASCADE,
    matches_played INTEGER DEFAULT 0,
    matches_won INTEGER DEFAULT 0,
    matches_lost INTEGER DEFAULT 0,
    matches_drawn INTEGER DEFAULT 0,
    total_kills INTEGER DEFAULT 0,
    total_deaths INTEGER DEFAULT 0,
    total_damage_dealt BIGINT DEFAULT 0,
    total_damage_taken BIGINT DEFAULT 0,
    total_crits_landed INTEGER DEFAULT 0,
    cases_opened INTEGER DEFAULT 0,
    favorite_weapon_template_id INTEGER REFERENCES weapon_template(id) ON DELETE SET NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Elo Tracking (Time-series for plotting graphs with pagination by date or matches)
CREATE TABLE IF NOT EXISTS elo_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    match_id INTEGER REFERENCES match_state(id) ON DELETE SET NULL,
    elo_before INTEGER NOT NULL,
    elo_after INTEGER NOT NULL,
    elo_change INTEGER NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Granular Per-Match Player Performance (Detailed match breakdowns)
CREATE TABLE IF NOT EXISTS match_player_stats (
    match_id INTEGER NOT NULL REFERENCES match_state(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    side VARCHAR(10) NOT NULL, -- T, CT
    is_winner BOOLEAN DEFAULT FALSE,
    is_draw BOOLEAN DEFAULT FALSE,
    kills INTEGER DEFAULT 0,
    deaths INTEGER DEFAULT 0,
    damage_dealt INTEGER DEFAULT 0,
    damage_taken INTEGER DEFAULT 0,
    crits_landed INTEGER DEFAULT 0,
    rounds_won INTEGER DEFAULT 0,
    rounds_lost INTEGER DEFAULT 0,
    elo_change INTEGER DEFAULT 0,
    PRIMARY KEY (match_id, user_id)
);

-- Weapon Usage & Performance Tracking (To determine most used gun, best K/D per gun, etc.)
CREATE TABLE IF NOT EXISTS match_weapon_stats (
    id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL REFERENCES match_state(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    template_id INTEGER NOT NULL REFERENCES weapon_template(id) ON DELETE CASCADE,
    user_weapon_instance_id INTEGER REFERENCES user_weapon_instance(id) ON DELETE SET NULL,
    times_used INTEGER DEFAULT 0,
    damage_dealt INTEGER DEFAULT 0,
    kills INTEGER DEFAULT 0,
    crits_landed INTEGER DEFAULT 0,
    CONSTRAINT unique_match_user_weapon UNIQUE(match_id, user_id, template_id, user_weapon_instance_id)
);

-- ==========================================
-- 5. INDEXES FOR FAST GRAPHING & QUERIES
-- ==========================================

-- Optimizes Elo graph queries (e.g. SELECT * FROM elo_history WHERE user_id = X ORDER BY recorded_at DESC LIMIT 30)
CREATE INDEX IF NOT EXISTS idx_elo_history_user_date ON elo_history(user_id, recorded_at DESC);

-- Optimizes filtering Elo graph by match count
CREATE INDEX IF NOT EXISTS idx_elo_history_user_match ON elo_history(user_id, match_id DESC);

-- Optimizes player match history pagination
CREATE INDEX IF NOT EXISTS idx_match_player_stats_user ON match_player_stats(user_id);

-- Optimizes "Most Used / Deadliest Gun" aggregate queries
CREATE INDEX IF NOT EXISTS idx_match_weapon_stats_user_template ON match_weapon_stats(user_id, template_id);

-- Optimizes match list timelines
CREATE INDEX IF NOT EXISTS idx_match_state_created_at ON match_state(created_at DESC);
