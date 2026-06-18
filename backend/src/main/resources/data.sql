-- 1. Utility Items
INSERT INTO weapon_template (name, type, side, energy_cost, damage, draw_weight, status_effect, image_url, description) VALUES
('HE Grenade', 'UTILITY', 'ALL', 2, 15, 50, 'NONE', '/images/he_grenade.png', 'Direct damage.'),
('Flashbang', 'UTILITY', 'ALL', 1, 0, 60, 'BLIND_50', '/images/flashbang_grenade.png', 'Next enemy weapon deals 50% dmg.'),
('Smoke Grenade', 'UTILITY', 'ALL', 2, 0, 40, 'SKIP_TURN', '/images/smoke_grenade.png', 'Enemy hand discarded next turn.'),
('Molotov', 'UTILITY', 'ALL', 3, 10, 30, 'BURN_15', '/images/molotov_grenade.png', 'Enemy takes 15 dmg at start of their next turn.');

-- 2. Pistols
INSERT INTO weapon_template (name, type, side, energy_cost, damage, draw_weight, crit_chance, crit_multiplier, image_url, description) VALUES
('Glock-18', 'WEAPON', 'T', 2, 12, 80, 0.10, 1.5, '/images/Glock-18.png', 'Highly common, low impact.'),
('USP-S', 'WEAPON', 'CT', 2, 15, 80, 0.15, 1.5, '/images/USP-S.png', 'Slightly higher base damage and precision.'),
('Desert Eagle', 'WEAPON', 'ALL', 3, 25, 45, 0.25, 2.0, '/images/Desert_Eagle.png', '25% chance to hit for 50 HP.');

-- 3. SMGs
INSERT INTO weapon_template (name, type, side, energy_cost, damage, draw_weight, crit_chance, crit_multiplier, image_url, description) VALUES
('MAC-10', 'WEAPON', 'T', 2, 10, 90, 0.05, 1.5, '/images/MAC-10.png', 'Most common draw in the game.'),
('MP9', 'WEAPON', 'CT', 2, 11, 85, 0.05, 1.5, '/images/MP9.png', 'Slightly less common than MAC-10.'),
('MP7', 'WEAPON', 'ALL', 3, 14, 75, 0.10, 1.5, '/images/MP7.png', 'Better stats, but competes with rifles.');

-- 4. Rifles
INSERT INTO weapon_template (name, type, side, energy_cost, damage, draw_weight, crit_chance, crit_multiplier, image_url, description) VALUES
('Galil AR', 'WEAPON', 'T', 4, 24, 65, 0.10, 1.5, '/images/Galil_AR.png', 'Cheap T-side rifle.'),
('FAMAS', 'WEAPON', 'CT', 4, 22, 65, 0.10, 1.5, '/images/FAMAS.png', 'Cheap CT-side rifle.'),
('AK-47', 'WEAPON', 'T', 5, 35, 50, 0.20, 2.0, '/images/AK-47.png', 'Highly lethal. A crit deals 70 HP.'),
('M4A4', 'WEAPON', 'CT', 5, 30, 60, 0.10, 1.5, '/images/M4A4.png', 'Consistent damage.'),
('M4A1-S', 'WEAPON', 'CT', 5, 30, 50, 0.20, 1.5, '/images/M4A1-S.png', 'Crits more often.');

-- 5. Snipers
INSERT INTO weapon_template (name, type, side, energy_cost, damage, draw_weight, crit_chance, crit_multiplier, image_url, description) VALUES
('SSG 08', 'WEAPON', 'ALL', 4, 20, 35, 0.40, 2.0, '/images/SSG_08.png', 'The Wildcard. 40% chance to hit for 40 HP.'),
('AWP', 'WEAPON', 'ALL', 8, 80, 15, 0.10, 1.5, '/images/AWP.png', 'Massive damage, rare draw.');

-- Users

INSERT INTO app_user (id, username, password_hash, elo, credits) 
VALUES
  (1, 'root', '$2a$10$BzZFDpO1nnDrCaiV90ds9eVEv08vnu1Cq2VujMCNkXRRH9DAhH4by', 1000, 0),
  (2, 'user1', '$2a$10$3MUdSYlWE9ZF1QHaZPfZU.9mgYFkQ60/Cna1pGiaJEAexGfuyOxfq', 1000, 0),
  (3, 'user2', '$2a$10$.fbPORQ00L/2LfsLRoqhLey/eASVISrhEd8gMMiD4PjQLpFiFUGeW', 1000, 0);