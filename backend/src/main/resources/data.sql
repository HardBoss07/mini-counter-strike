-- 1. Utility Items
INSERT INTO weapon_template (name, type, side, energy_cost, damage, draw_weight, crit_chance, crit_multiplier, status_effect, rarity, image_url, description) VALUES
('HE Grenade', 'UTILITY', 'ALL', 2, 15, 50, 0.0, 1.0, 'NONE', 'BASE_GRADE', '/images/he_grenade.png', 'Direct damage.'),
('Flashbang', 'UTILITY', 'ALL', 1, 0, 60, 0.0, 1.0, 'BLIND_50', 'BASE_GRADE', '/images/flashbang_grenade.png', 'Next enemy weapon deals 50% dmg.'),
('Smoke Grenade', 'UTILITY', 'ALL', 2, 0, 40, 0.0, 1.0, 'SKIP_TURN', 'BASE_GRADE', '/images/smoke_grenade.png', 'Enemy hand discarded next turn.'),
('Molotov', 'UTILITY', 'ALL', 3, 10, 30, 0.0, 1.0, 'BURN_15', 'BASE_GRADE', '/images/molotov_grenade.png', 'Enemy takes 15 dmg at start of their next turn.');

-- 2. Pistols
INSERT INTO weapon_template (name, type, side, energy_cost, damage, draw_weight, crit_chance, crit_multiplier, status_effect, rarity, image_url, description) VALUES
('Glock-18', 'WEAPON', 'T', 2, 12, 80, 0.10, 1.5, 'NONE', 'BASE_GRADE', '/images/Glock-18.png', 'Highly common, low impact.'),
('USP-S', 'WEAPON', 'CT', 2, 15, 80, 0.15, 1.5, 'NONE', 'BASE_GRADE', '/images/USP-S.png', 'Slightly higher base damage and precision.'),
('Desert Eagle', 'WEAPON', 'ALL', 3, 25, 45, 0.25, 2.0, 'NONE', 'BASE_GRADE', '/images/Desert_Eagle.png', '25% chance to hit for 50 HP.');

-- 3. SMGs
INSERT INTO weapon_template (name, type, side, energy_cost, damage, draw_weight, crit_chance, crit_multiplier, status_effect, rarity, image_url, description) VALUES
('MAC-10', 'WEAPON', 'T', 2, 10, 90, 0.05, 1.5, 'NONE', 'BASE_GRADE', '/images/MAC-10.png', 'Most common draw in the game.'),
('MP9', 'WEAPON', 'CT', 2, 11, 85, 0.05, 1.5, 'NONE', 'BASE_GRADE', '/images/MP9.png', 'Slightly less common than MAC-10.'),
('MP7', 'WEAPON', 'ALL', 3, 14, 75, 0.10, 1.5, 'NONE', 'BASE_GRADE', '/images/MP7.png', 'Better stats, but competes with rifles.');

-- 4. Rifles
INSERT INTO weapon_template (name, type, side, energy_cost, damage, draw_weight, crit_chance, crit_multiplier, status_effect, rarity, image_url, description) VALUES
('Galil AR', 'WEAPON', 'T', 4, 24, 65, 0.10, 1.5, 'NONE', 'BASE_GRADE', '/images/Galil_AR.png', 'Cheap T-side rifle.'),
('FAMAS', 'WEAPON', 'CT', 4, 22, 65, 0.10, 1.5, 'NONE', 'BASE_GRADE', '/images/FAMAS.png', 'Cheap CT-side rifle.'),
('AK-47', 'WEAPON', 'T', 5, 35, 50, 0.20, 2.0, 'NONE', 'BASE_GRADE', '/images/AK-47.png', 'Highly lethal. A crit deals 70 HP.'),
('M4A4', 'WEAPON', 'CT', 5, 30, 60, 0.10, 1.5, 'NONE', 'BASE_GRADE', '/images/M4A4.png', 'Consistent damage.'),
('M4A1-S', 'WEAPON', 'CT', 5, 30, 50, 0.20, 1.5, 'NONE', 'BASE_GRADE', '/images/M4A1-S.png', 'Crits more often.');

-- 5. Snipers
INSERT INTO weapon_template (name, type, side, energy_cost, damage, draw_weight, crit_chance, crit_multiplier, status_effect, rarity, image_url, description) VALUES
('SSG 08', 'WEAPON', 'ALL', 4, 20, 35, 0.40, 2.0, 'NONE', 'BASE_GRADE', '/images/SSG_08.png', 'The Wildcard. 40% chance to hit for 40 HP.'),
('AWP', 'WEAPON', 'ALL', 8, 80, 15, 0.10, 1.5, 'NONE', 'BASE_GRADE', '/images/AWP.png', 'Massive damage, rare draw.');

-- Users
INSERT INTO app_user (username, password_hash, elo, credits) 
VALUES
  ('root', '$2a$10$BzZFDpO1nnDrCaiV90ds9eVEv08vnu1Cq2VujMCNkXRRH9DAhH4by', 1000, 0),
  ('user1', '$2a$10$3MUdSYlWE9ZF1QHaZPfZU.9mgYFkQ60/Cna1pGiaJEAexGfuyOxfq', 1000, 0),
  ('user2', '$2a$10$.fbPORQ00L/2LfsLRoqhLey/eASVISrhEd8gMMiD4PjQLpFiFUGeW', 1000, 0);

-- Weapons for users (Instance mapping)
-- Replicating AuthServiceImpl logic: Each user gets ALL weapons
INSERT INTO user_weapon_instance (user_id, template_id)
SELECT u.id, t.id FROM app_user u, weapon_template t;

-- Starter Loadouts
INSERT INTO loadout (user_id, side)
SELECT u.id, s.side FROM app_user u, (SELECT 'T' as side UNION SELECT 'CT') s;

-- Add starter items to loadouts (T-side)
INSERT INTO loadout_item (loadout_id, user_weapon_instance_id)
SELECT l.id, uwi.id
FROM loadout l
JOIN app_user u ON l.user_id = u.id
JOIN user_weapon_instance uwi ON u.id = uwi.user_id
JOIN weapon_template wt ON uwi.template_id = wt.id
WHERE l.side = 'T'
AND wt.name IN ('Glock-18', 'MAC-10', 'Galil AR', 'Flashbang', 'Smoke Grenade');

-- Add starter items to loadouts (CT-side)
INSERT INTO loadout_item (loadout_id, user_weapon_instance_id)
SELECT l.id, uwi.id
FROM loadout l
JOIN app_user u ON l.user_id = u.id
JOIN user_weapon_instance uwi ON u.id = uwi.user_id
JOIN weapon_template wt ON uwi.template_id = wt.id
WHERE l.side = 'CT'
AND wt.name IN ('USP-S', 'MP9', 'FAMAS', 'HE Grenade', 'Flashbang');
