-- ==========================================================
-- 1. SEED CASES
-- ==========================================================
INSERT INTO
  cases (title, image_url)
VALUES
  (
    'Kilowatt Case',
    '/images/cases/kilowatt-case.png'
  ),
  (
    'Revolution Case',
    '/images/cases/revolution-case.png'
  );

-- ==========================================================
-- 2. MAP WEAPON TEMPLATES TO KILOWATT CASE (case_id = 1)
-- ==========================================================
UPDATE weapon_template
SET
  case_id = 1
WHERE
  name IN (
    'AK-47 | Elite Build',
    'AK-47 | Slate',
    'AK-47 | Redline',
    'AK-47 | Gold Arabesque',
    'M4A1-S | VariCamo',
    'M4A1-S | Nitro',
    'M4A1-S | Hot Rod',
    'M4A1-S | Fade',
    'Glock-18 | Candy Apple',
    'Glock-18 | Fade',
    'Glock-18 | Water Elemental',
    'Glock-18 | Fully Tuned',
    'Desert Eagle | Oxide Blaze',
    'Desert Eagle | Blaze',
    'Desert Eagle | Hypnotic',
    'Desert Eagle | Code Red',
    'Galil AR | Tuxedo',
    'Galil AR | CAUTION!',
    'Galil AR | Eco',
    'Galil AR | Chatterbox'
  );

-- ==========================================================
-- 3. MAP WEAPON TEMPLATES TO REVOLUTION CASE (case_id = 2)
-- ==========================================================
UPDATE weapon_template
SET
  case_id = 2
WHERE
  name IN (
    'AWP | Capillary',
    'AWP | Atheris',
    'AWP | Crakow!',
    'AWP | Dragon Lore',
    'M4A4 | Radiation Hazard',
    'M4A4 | Spider Lily',
    'M4A4 | Cyber Security',
    'M4A4 | Temukau',
    'USP-S | Alpine Camo',
    'USP-S | Ticket to Hell',
    'USP-S | Jawbreaker',
    'USP-S | Printstream',
    'SSG 08 | Acid Fade',
    'SSG 08 | Rapid Transit',
    'SSG 08 | Turbo Peek',
    'SSG 08 | Blood in the Water',
    'FAMAS | Sundown',
    'FAMAS | Pulse',
    'FAMAS | Rapid Eye Movement',
    'FAMAS | Commemoration'
  );