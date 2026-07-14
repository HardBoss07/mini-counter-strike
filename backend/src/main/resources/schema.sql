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
    case_id INTEGER REFERENCES cases(id)
);

ALTER TABLE weapon_template ADD COLUMN IF NOT EXISTS case_id INTEGER REFERENCES cases(id);

-- Users (Dynamic Data)
CREATE TABLE IF NOT EXISTS app_user (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    elo INTEGER DEFAULT 1000,
    credits INTEGER DEFAULT 100
);

-- User Weapon Instances (Ownership)
CREATE TABLE IF NOT EXISTS user_weapon_instance (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES app_user(id),
    template_id INTEGER REFERENCES weapon_template(id),
    skin_name VARCHAR(255) DEFAULT 'Default',
    damage_modifier INTEGER DEFAULT 0,
    cost_modifier INTEGER DEFAULT 0,
    draw_weight_modifier INTEGER DEFAULT 0
);

-- User Cases (Ownership)
CREATE TABLE IF NOT EXISTS user_cases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES app_user(id),
    case_id INTEGER REFERENCES cases(id)
);

-- Loadouts (Side Definitions)
CREATE TABLE IF NOT EXISTS loadout (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES app_user(id),
    side VARCHAR(10) NOT NULL, -- T, CT,
    CONSTRAINT unique_user_side UNIQUE(user_id, side)
);

-- Loadout Items (Junction Table for 3NF)
CREATE TABLE IF NOT EXISTS loadout_item (
    loadout_id INTEGER REFERENCES loadout(id),
    user_weapon_instance_id INTEGER REFERENCES user_weapon_instance(id),
    PRIMARY KEY (loadout_id, user_weapon_instance_id)
);

-- Match State
CREATE TABLE IF NOT EXISTS match_state (
    id SERIAL PRIMARY KEY,
    player_a_id INTEGER REFERENCES app_user(id),
    player_b_id INTEGER REFERENCES app_user(id),
    status VARCHAR(50) DEFAULT 'IN_PROGRESS',
    winner_id INTEGER REFERENCES app_user(id),
    logs_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
