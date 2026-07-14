-- 1. Utility Items
INSERT INTO weapon_template (name, type, side, energy_cost, damage, draw_weight, crit_chance, crit_multiplier, status_effect, rarity, image_url, description) VALUES
('HE Grenade', 'UTILITY', 'ALL', 2, 15, 50, 0.0, 1.0, 'NONE', 'BASE_GRADE', '/images/weapons/base/he_grenade.png', 'Direct damage.'),
('Flashbang', 'UTILITY', 'ALL', 1, 0, 60, 0.0, 1.0, 'BLIND_50', 'BASE_GRADE', '/images/weapons/base/flashbang_grenade.png', 'Next enemy weapon deals 50% dmg.'),
('Smoke Grenade', 'UTILITY', 'ALL', 2, 0, 40, 0.0, 1.0, 'SKIP_TURN', 'BASE_GRADE', '/images/weapons/base/smoke_grenade.png', 'Enemy hand discarded next turn.'),
('Molotov', 'UTILITY', 'ALL', 3, 10, 30, 0.0, 1.0, 'BURN_15', 'BASE_GRADE', '/images/weapons/base/molotov_grenade.png', 'Enemy takes 15 dmg at start of their next turn.');

-- 2. Pistols
INSERT INTO weapon_template (name, type, side, energy_cost, damage, draw_weight, crit_chance, crit_multiplier, status_effect, rarity, image_url, description) VALUES
('Glock-18', 'WEAPON', 'T', 2, 12, 80, 0.10, 1.5, 'NONE', 'BASE_GRADE', '/images/weapons/base/Glock-18.png', 'Highly common, low impact.'),
('USP-S', 'WEAPON', 'CT', 2, 15, 80, 0.15, 1.5, 'NONE', 'BASE_GRADE', '/images/weapons/base/USP-S.png', 'Slightly higher base damage and precision.'),
('Desert Eagle', 'WEAPON', 'ALL', 3, 25, 45, 0.25, 2.0, 'NONE', 'BASE_GRADE', '/images/weapons/base/Desert_Eagle.png', '25% chance to hit for 50 HP.');

-- 3. SMGs
INSERT INTO weapon_template (name, type, side, energy_cost, damage, draw_weight, crit_chance, crit_multiplier, status_effect, rarity, image_url, description) VALUES
('MAC-10', 'WEAPON', 'T', 2, 10, 90, 0.05, 1.5, 'NONE', 'BASE_GRADE', '/images/weapons/base/MAC-10.png', 'Most common draw in the game.'),
('MP9', 'WEAPON', 'CT', 2, 11, 85, 0.05, 1.5, 'NONE', 'BASE_GRADE', '/images/weapons/base/MP9.png', 'Slightly less common than MAC-10.'),
('MP7', 'WEAPON', 'ALL', 3, 14, 75, 0.10, 1.5, 'NONE', 'BASE_GRADE', '/images/weapons/base/MP7.png', 'Better stats, but competes with rifles.');

-- 4. Rifles
INSERT INTO weapon_template (name, type, side, energy_cost, damage, draw_weight, crit_chance, crit_multiplier, status_effect, rarity, image_url, description) VALUES
('Galil AR', 'WEAPON', 'T', 4, 24, 65, 0.10, 1.5, 'NONE', 'BASE_GRADE', '/images/weapons/base/Galil_AR.png', 'Cheap T-side rifle.'),
('FAMAS', 'WEAPON', 'CT', 4, 22, 65, 0.10, 1.5, 'NONE', 'BASE_GRADE', '/images/weapons/base/FAMAS.png', 'Cheap CT-side rifle.'),
('AK-47', 'WEAPON', 'T', 5, 35, 50, 0.20, 2.0, 'NONE', 'BASE_GRADE', '/images/weapons/base/AK-47.png', 'Highly lethal. A crit deals 70 HP.'),
('M4A4', 'WEAPON', 'CT', 5, 30, 60, 0.10, 1.5, 'NONE', 'BASE_GRADE', '/images/weapons/base/M4A4.png', 'Consistent damage.'),
('M4A1-S', 'WEAPON', 'CT', 5, 30, 50, 0.20, 1.5, 'NONE', 'BASE_GRADE', '/images/weapons/base/M4A1-S.png', 'Crits more often.');

-- 5. Snipers
INSERT INTO weapon_template (name, type, side, energy_cost, damage, draw_weight, crit_chance, crit_multiplier, status_effect, rarity, image_url, description) VALUES
('SSG 08', 'WEAPON', 'ALL', 4, 20, 35, 0.40, 2.0, 'NONE', 'BASE_GRADE', '/images/weapons/base/SSG_08.png', 'The Wildcard. 40% chance to hit for 40 HP.'),
('AWP', 'WEAPON', 'ALL', 8, 80, 15, 0.10, 1.5, 'NONE', 'BASE_GRADE', '/images/weapons/base/AWP.png', 'Massive damage, rare draw.');

-- 6. Custom Skinned Weapons
INSERT INTO weapon_template (name, type, side, energy_cost, damage, draw_weight, crit_chance, crit_multiplier, status_effect, rarity, image_url, description) VALUES
('AK-47 | Safari Mesh', 'WEAPON', 'T', 5, 35, 52, 0.15, 1.5, 'NONE', 'INDUSTRIAL_GRADE', '/images/weapons/AK-47/Safari_Mesh.png', 'A reliable fallback spray-painted using mesh packaging as a stencil. Cheap and practical.'),
('AK-47 | Elite Build', 'WEAPON', 'T', 5, 35, 50, 0.18, 1.5, 'NONE', 'MIL_SPEC', '/images/weapons/AK-47/Elite_Build.png', 'Custom-painted with a sleek black and gold hydrographic design. Crafted for the tactical vanguard.'),
('AK-47 | Slate', 'WEAPON', 'T', 5, 35, 48, 0.20, 1.5, 'NONE', 'RESTRICTED', '/images/weapons/AK-47/Slate.png', 'Black on black. Unforgiving, exceptionally clean, and highly customizable.'),
('AK-47 | Redline', 'WEAPON', 'T', 5, 36, 45, 0.22, 2.0, 'NONE', 'CLASSIFIED', '/images/weapons/AK-47/Redline.png', 'Carbon fiber pattern accented with clean, striking red pinstripes. Lethal elegance.'),
('AK-47 | Gold Arabesque', 'WEAPON', 'T', 5, 38, 42, 0.25, 2.0, 'NONE', 'COVERT', '/images/weapons/AK-47/Gold_Arabesque.png', 'An opulent masterpiece entirely filigreed with gold plating. A breathtaking display of tactical luxury.');

-- 7. Additional Skinned Weapons
INSERT INTO weapon_template (name, type, side, energy_cost, damage, draw_weight, crit_chance, crit_multiplier, status_effect, rarity, image_url, description) VALUES
-- AWP Skins
('AWP | Sun in Leo', 'WEAPON', 'ALL', 8, 80, 15, 0.10, 1.5, 'NONE', 'INDUSTRIAL_GRADE', '/images/weapons/AWP/Sun_in_Leo.png', 'Celestial precision.'),
('AWP | Capillary', 'WEAPON', 'ALL', 8, 80, 15, 0.10, 1.5, 'NONE', 'MIL_SPEC', '/images/weapons/AWP/Capillary.png', 'Blood-red patterns.'),
('AWP | Atheris', 'WEAPON', 'ALL', 8, 80, 15, 0.10, 1.5, 'NONE', 'RESTRICTED', '/images/weapons/AWP/Atheris.png', 'Viper-inspired skin.'),
('AWP | Crakow!', 'WEAPON', 'ALL', 8, 80, 15, 0.10, 1.5, 'NONE', 'CLASSIFIED', '/images/weapons/AWP/Crakow!.png', 'Comic-book style strike.'),
('AWP | Dragon Lore', 'WEAPON', 'ALL', 8, 80, 15, 0.10, 1.5, 'NONE', 'COVERT', '/images/weapons/AWP/Dragon_Lore.png', 'The legendary sniper skin.'),

-- M4A1-S Skins
('M4A1-S | Wash me plz', 'WEAPON', 'CT', 5, 30, 50, 0.20, 1.5, 'NONE', 'INDUSTRIAL_GRADE', '/images/weapons/M4A1-S/Wash_me_plz.png', 'Gritty, combat-worn look.'),
('M4A1-S | VariCamo', 'WEAPON', 'CT', 5, 30, 50, 0.20, 1.5, 'NONE', 'MIL_SPEC', '/images/weapons/M4A1-S/VariCamo.png', 'Urban camouflage pattern.'),
('M4A1-S | Nitro', 'WEAPON', 'CT', 5, 30, 50, 0.20, 1.5, 'NONE', 'RESTRICTED', '/images/weapons/M4A1-S/Nitro.png', 'Sleek black with orange highlights.'),
('M4A1-S | Hot Rod', 'WEAPON', 'CT', 5, 30, 50, 0.20, 1.5, 'NONE', 'CLASSIFIED', '/images/weapons/M4A1-S/Hot_Rod.png', 'Striking fire-engine red.'),
('M4A1-S | Fade', 'WEAPON', 'CT', 5, 30, 50, 0.20, 1.5, 'NONE', 'COVERT', '/images/weapons/M4A1-S/Fade.png', 'A beautiful color gradient.'),

-- M4A4 Skins
('M4A4 | Tornado', 'WEAPON', 'CT', 5, 30, 60, 0.10, 1.5, 'NONE', 'INDUSTRIAL_GRADE', '/images/weapons/M4A4/Tornado.png', 'Stormy grey texture.'),
('M4A4 | Radiation Hazard', 'WEAPON', 'CT', 5, 30, 60, 0.10, 1.5, 'NONE', 'MIL_SPEC', '/images/weapons/M4A4/Radiation_Hazard.png', 'Warning: High hazard.'),
('M4A4 | Spider Lily', 'WEAPON', 'CT', 5, 30, 60, 0.10, 1.5, 'NONE', 'RESTRICTED', '/images/weapons/M4A4/Spider_Lily.png', 'Floral design.'),
('M4A4 | Cyber Security', 'WEAPON', 'CT', 5, 30, 60, 0.10, 1.5, 'NONE', 'CLASSIFIED', '/images/weapons/M4A4/Cyber_Security.png', 'Digital protection theme.'),
('M4A4 | Temukau', 'WEAPON', 'CT', 5, 30, 60, 0.10, 1.5, 'NONE', 'COVERT', '/images/weapons/M4A4/Temukau.png', 'Anime-inspired art.'),
('M4A4 | Howl', 'WEAPON', 'CT', 5, 30, 60, 0.20, 2.0, 'NONE', 'CONTRABAND', '/images/weapons/M4A4/Howl.png', 'A rare and legendary beast.'),

-- Galil AR Skins
('Galil AR | Grey Smoke', 'WEAPON', 'T', 4, 24, 65, 0.10, 1.5, 'NONE', 'CONSUMER_GRADE', '/images/weapons/Galil_AR/Grey_Smoke.png', 'Hazy, monochromatic finish.'),
('Galil AR | Winter Forest', 'WEAPON', 'T', 4, 24, 65, 0.10, 1.5, 'NONE', 'INDUSTRIAL_GRADE', '/images/weapons/Galil_AR/Winter_Forest.png', 'Arctic foliage camo.'),
('Galil AR | Tuxedo', 'WEAPON', 'T', 4, 24, 65, 0.10, 1.5, 'NONE', 'MIL_SPEC', '/images/weapons/Galil_AR/Tuxedo.png', 'Formal black and white.'),
('Galil AR | CAUTION!', 'WEAPON', 'T', 4, 24, 65, 0.10, 1.5, 'NONE', 'RESTRICTED', '/images/weapons/Galil_AR/CAUTION!.png', 'Hazard-tape aesthetics.'),
('Galil AR | Eco', 'WEAPON', 'T', 4, 24, 65, 0.10, 1.5, 'NONE', 'CLASSIFIED', '/images/weapons/Galil_AR/Eco.png', 'Minimalist green theme.'),
('Galil AR | Chatterbox', 'WEAPON', 'T', 4, 24, 65, 0.10, 1.5, 'NONE', 'COVERT', '/images/weapons/Galil_AR/Chatterbox.png', 'Rustic, weathered look.'),

-- FAMAS Skins
('FAMAS | Colony', 'WEAPON', 'CT', 4, 22, 65, 0.10, 1.5, 'NONE', 'CONSUMER_GRADE', '/images/weapons/FAMAS/Colony.png', 'Standard issue colors.'),
('FAMAS | Vendetta', 'WEAPON', 'CT', 4, 22, 65, 0.10, 1.5, 'NONE', 'INDUSTRIAL_GRADE', '/images/weapons/FAMAS/Vendetta.png', 'Dark and brooding.'),
('FAMAS | Sundown', 'WEAPON', 'CT', 4, 22, 65, 0.10, 1.5, 'NONE', 'MIL_SPEC', '/images/weapons/FAMAS/Sundown.png', 'Sunset gradient.'),
('FAMAS | Pulse', 'WEAPON', 'CT', 4, 22, 65, 0.10, 1.5, 'NONE', 'RESTRICTED', '/images/weapons/FAMAS/Pulse.png', 'Electric heartbeat pattern.'),
('FAMAS | Rapid Eye Movement', 'WEAPON', 'CT', 4, 22, 65, 0.10, 1.5, 'NONE', 'CLASSIFIED', '/images/weapons/FAMAS/Rapid_Eye_Movement.png', 'Surrealist artwork.'),
('FAMAS | Commemoration', 'WEAPON', 'CT', 4, 22, 65, 0.10, 1.5, 'NONE', 'COVERT', '/images/weapons/FAMAS/Commemoration.png', 'Golden honor skin.'),

-- SSG 08 Skins
('SSG 08 | Sand Dune', 'WEAPON', 'ALL', 4, 20, 35, 0.40, 2.0, 'NONE', 'CONSUMER_GRADE', '/images/weapons/SSG_08/Sand_Dune.png', 'Desert-worn.'),
('SSG 08 | Calligrafaux', 'WEAPON', 'ALL', 4, 20, 35, 0.40, 2.0, 'NONE', 'INDUSTRIAL_GRADE', '/images/weapons/SSG_08/Calligrafaux.png', 'Elegant brushstrokes.'),
('SSG 08 | Acid Fade', 'WEAPON', 'ALL', 4, 20, 35, 0.40, 2.0, 'NONE', 'MIL_SPEC', '/images/weapons/SSG_08/Acid_Fade.png', 'Chemical aesthetic.'),
('SSG 08 | Rapid Transit', 'WEAPON', 'ALL', 4, 20, 35, 0.40, 2.0, 'NONE', 'RESTRICTED', '/images/weapons/SSG_08/Rapid_Transit.png', 'Fast-paced graphic.'),
('SSG 08 | Turbo Peek', 'WEAPON', 'ALL', 4, 20, 35, 0.40, 2.0, 'NONE', 'CLASSIFIED', '/images/weapons/SSG_08/Turbo_Peek.png', 'High-velocity design.'),
('SSG 08 | Blood in the Water', 'WEAPON', 'ALL', 4, 20, 35, 0.40, 2.0, 'NONE', 'COVERT', '/images/weapons/SSG_08/Blood_in_the_Water.png', 'Shark-inspired predator.'),

-- Desert Eagle Skins
('Desert Eagle | Midnight Storm', 'WEAPON', 'ALL', 3, 25, 45, 0.25, 2.0, 'NONE', 'INDUSTRIAL_GRADE', '/images/weapons/Desert_Eagle/Midnight_Storm.png', 'Stormy night sky.'),
('Desert Eagle | Oxide Blaze', 'WEAPON', 'ALL', 3, 25, 45, 0.25, 2.0, 'NONE', 'MIL_SPEC', '/images/weapons/Desert_Eagle/Oxide_Blaze.png', 'Rustic, heat-treated steel.'),
('Desert Eagle | Blaze', 'WEAPON', 'ALL', 3, 25, 45, 0.25, 2.0, 'NONE', 'RESTRICTED', '/images/weapons/Desert_Eagle/Blaze.png', 'Classic flame design.'),
('Desert Eagle | Hypnotic', 'WEAPON', 'ALL', 3, 25, 45, 0.25, 2.0, 'NONE', 'CLASSIFIED', '/images/weapons/Desert_Eagle/Hypnotic.png', 'Vortex pattern.'),
('Desert Eagle | Code Red', 'WEAPON', 'ALL', 3, 25, 45, 0.25, 2.0, 'NONE', 'COVERT', '/images/weapons/Desert_Eagle/Code_Red.png', 'Striking red alert.'),

-- Glock-18 Skins
('Glock-18 | High Beam', 'WEAPON', 'T', 2, 12, 80, 0.10, 1.5, 'NONE', 'INDUSTRIAL_GRADE', '/images/weapons/Glock-18/High_Beam.png', 'Flashy blue finish.'),
('Glock-18 | Candy Apple', 'WEAPON', 'T', 2, 12, 80, 0.10, 1.5, 'NONE', 'MIL_SPEC', '/images/weapons/Glock-18/Candy_Apple.png', 'Glossy red finish.'),
('Glock-18 | Fade', 'WEAPON', 'T', 2, 12, 80, 0.10, 1.5, 'NONE', 'RESTRICTED', '/images/weapons/Glock-18/Fade.png', 'Classic multicolored fade.'),
('Glock-18 | Water Elemental', 'WEAPON', 'T', 2, 12, 80, 0.10, 1.5, 'NONE', 'CLASSIFIED', '/images/weapons/Glock-18/Water_Elemental.png', 'Aquatic creature theme.'),
('Glock-18 | Fully Tuned', 'WEAPON', 'T', 2, 12, 80, 0.10, 1.5, 'NONE', 'COVERT', '/images/weapons/Glock-18/Fully_Tuned.png', 'Optimized appearance.'),

-- USP-S Skins
('USP-S | Desert Tactical', 'WEAPON', 'CT', 2, 15, 80, 0.15, 1.5, 'NONE', 'INDUSTRIAL_GRADE', '/images/weapons/USP-S/Desert_Tactical.png', 'Arid combat finish.'),
('USP-S | Alpine Camo', 'WEAPON', 'CT', 2, 15, 80, 0.15, 1.5, 'NONE', 'MIL_SPEC', '/images/weapons/USP-S/Alpine_Camo.png', 'Mountain camo.'),
('USP-S | Ticket to Hell', 'WEAPON', 'CT', 2, 15, 80, 0.15, 1.5, 'NONE', 'RESTRICTED', '/images/weapons/USP-S/Ticket_to_Hell.png', 'Dark thematic art.'),
('USP-S | Jawbreaker', 'WEAPON', 'CT', 2, 15, 80, 0.15, 1.5, 'NONE', 'CLASSIFIED', '/images/weapons/USP-S/Jawbreaker.png', 'Hard-hitting visual.'),
('USP-S | Printstream', 'WEAPON', 'CT', 2, 15, 80, 0.15, 1.5, 'NONE', 'COVERT', '/images/weapons/USP-S/Printstream.png', 'Futuristic iridescent look.');

-- Users
INSERT INTO app_user (username, password_hash, elo, credits) 
VALUES
  ('root', '$2a$10$BzZFDpO1nnDrCaiV90ds9eVEv08vnu1Cq2VujMCNkXRRH9DAhH4by', 1000, 100),
  ('user1', '$2a$10$3MUdSYlWE9ZF1QHaZPfZU.9mgYFkQ60/Cna1pGiaJEAexGfuyOxfq', 1000, 100),
  ('user2', '$2a$10$.fbPORQ00L/2LfsLRoqhLey/eASVISrhEd8gMMiD4PjQLpFiFUGeW', 1000, 100);

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
AND wt.name IN ('Glock-18', 'MAC-10', 'Galil AR', 'Molotov', 'Smoke Grenade');

-- Add starter items to loadouts (CT-side)
INSERT INTO loadout_item (loadout_id, user_weapon_instance_id)
SELECT l.id, uwi.id
FROM loadout l
JOIN app_user u ON l.user_id = u.id
JOIN user_weapon_instance uwi ON u.id = uwi.user_id
JOIN weapon_template wt ON uwi.template_id = wt.id
WHERE l.side = 'CT'
AND wt.name IN ('USP-S', 'MP9', 'FAMAS', 'HE Grenade', 'Flashbang');

-- Seed Cases
INSERT INTO cases (title, image_url) VALUES 
  ('Kilowatt Case', '/images/cases/kilowatt-case.png'),
  ('Revolution Case', '/images/cases/revolution-case.png');

-- Update Weapon Templates for Kilowatt Case (case_id = 1)
UPDATE weapon_template SET case_id = 1 WHERE name IN (
    'AK-47 | Elite Build', 'AK-47 | Slate', 'AK-47 | Redline', 'AK-47 | Gold Arabesque',
    'M4A1-S | VariCamo', 'M4A1-S | Nitro', 'M4A1-S | Hot Rod', 'M4A1-S | Fade',
    'Glock-18 | Candy Apple', 'Glock-18 | Fade', 'Glock-18 | Water Elemental', 'Glock-18 | Fully Tuned',
    'Desert Eagle | Oxide Blaze', 'Desert Eagle | Blaze', 'Desert Eagle | Hypnotic', 'Desert Eagle | Code Red',
    'Galil AR | Tuxedo', 'Galil AR | CAUTION!', 'Galil AR | Eco', 'Galil AR | Chatterbox'
);

-- Update Weapon Templates for Revolution Case (case_id = 2)
UPDATE weapon_template SET case_id = 2 WHERE name IN (
    'AWP | Capillary', 'AWP | Atheris', 'AWP | Crakow!', 'AWP | Dragon Lore',
    'M4A4 | Radiation Hazard', 'M4A4 | Spider Lily', 'M4A4 | Cyber Security', 'M4A4 | Temukau',
    'USP-S | Alpine Camo', 'USP-S | Ticket to Hell', 'USP-S | Jawbreaker', 'USP-S | Printstream',
    'SSG 08 | Acid Fade', 'SSG 08 | Rapid Transit', 'SSG 08 | Turbo Peek', 'SSG 08 | Blood in the Water',
    'FAMAS | Sundown', 'FAMAS | Pulse', 'FAMAS | Rapid Eye Movement', 'FAMAS | Commemoration'
);

-- Seed sample cases for testing
INSERT INTO user_cases (user_id, case_id) VALUES
-- User 1
(1, 1), (1, 1), (1, 2), (1, 2),
-- User 2
(2, 1), (2, 1), (2, 2), (2, 2),
-- User 3
(3, 1), (3, 1), (3, 2), (3, 2);
