-- ==========================================================
-- 1. APP USERS
-- ==========================================================
INSERT INTO
  app_user (username, password_hash, elo, credits)
VALUES
  (
    'root',
    '$2a$10$BzZFDpO1nnDrCaiV90ds9eVEv08vnu1Cq2VujMCNkXRRH9DAhH4by',
    1000,
    100
  ),
  (
    'user1',
    '$2a$10$3MUdSYlWE9ZF1QHaZPfZU.9mgYFkQ60/Cna1pGiaJEAexGfuyOxfq',
    1000,
    100
  ),
  (
    'user2',
    '$2a$10$.fbPORQ00L/2LfsLRoqhLey/eASVISrhEd8gMMiD4PjQLpFiFUGeW',
    1000,
    100
  );

-- ==========================================================
-- 2. USER WEAPON INSTANCES (GRANT ALL WEAPONS TO USERS)
-- ==========================================================
INSERT INTO
  user_weapon_instance (user_id, template_id)
SELECT
  u.id,
  t.id
FROM
  app_user u,
  weapon_template t;

-- ==========================================================
-- 3. STARTER LOADOUT CONTAINERS
-- ==========================================================
INSERT INTO
  loadout (user_id, side)
SELECT
  u.id,
  s.side
FROM
  app_user u,
  (
    SELECT
      'T' as side
    UNION
    SELECT
      'CT'
  ) s;

-- ==========================================================
-- 4. STARTER ITEMS (T-SIDE LOADOUTS)
-- ==========================================================
INSERT INTO
  loadout_item (loadout_id, user_weapon_instance_id)
SELECT
  l.id,
  uwi.id
FROM
  loadout l
  JOIN app_user u ON l.user_id = u.id
  JOIN user_weapon_instance uwi ON u.id = uwi.user_id
  JOIN weapon_template wt ON uwi.template_id = wt.id
WHERE
  l.side = 'T'
  AND wt.name IN (
    'Glock-18',
    'MAC-10',
    'Galil AR',
    'Molotov',
    'Smoke Grenade'
  );

-- ==========================================================
-- 5. STARTER ITEMS (CT-SIDE LOADOUTS)
-- ==========================================================
INSERT INTO
  loadout_item (loadout_id, user_weapon_instance_id)
SELECT
  l.id,
  uwi.id
FROM
  loadout l
  JOIN app_user u ON l.user_id = u.id
  JOIN user_weapon_instance uwi ON u.id = uwi.user_id
  JOIN weapon_template wt ON uwi.template_id = wt.id
WHERE
  l.side = 'CT'
  AND wt.name IN (
    'USP-S',
    'MP9',
    'FAMAS',
    'HE Grenade',
    'Flashbang'
  );

-- ==========================================================
-- 6. SAMPLE TEST CASES FOR USERS
-- ==========================================================
INSERT INTO
  user_cases (user_id, case_id)
VALUES
  -- User 1
  (1, 1),
  (1, 1),
  (1, 2),
  (1, 2),
  -- User 2
  (2, 1),
  (2, 1),
  (2, 2),
  (2, 2),
  -- User 3
  (3, 1),
  (3, 1),
  (3, 2),
  (3, 2);

-- ==========================================================
-- 7. USER STATS SUMMARY
-- ==========================================================
INSERT INTO
  user_stats_summary (
    user_id,
    matches_played,
    matches_won,
    matches_lost,
    matches_drawn,
    total_kills,
    total_deaths,
    total_damage_dealt,
    total_damage_taken,
    total_crits_landed,
    cases_opened,
    updated_at
  )
SELECT
  id,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  NOW ()
FROM
  app_user
WHERE
  id NOT IN (
    SELECT
      user_id
    FROM
      user_stats_summary
  );