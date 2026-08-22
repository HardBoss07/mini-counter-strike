# Entity Relationship Diagram

```plaintext
                     +---------------------------+
                     |           cases           |
                     +---------------------------+
                     | PK  id         : SERIAL   |
                     |     title      : VARCHAR  |
                     |     image_url  : VARCHAR  |
                     +---------------------------+
                       |                       |
                       | (c)                   | (mc)
                       |                       |
                       | (mc)                  | (1)
                       v                       v
+---------------------------------+         +----------------------------------+
|         weapon_template         |         |            user_cases            |
+---------------------------------+         +----------------------------------+
| PK  id               : SERIAL   |         | PK  id        : SERIAL           |
|     name             : VARCHAR  |         | FK  user_id   : INT              |
|     type             : VARCHAR  |         | FK  case_id   : INT              |
|     side             : VARCHAR  |         |     is_opened : BOOLEAN          |
|     energy_cost      : INT      |         +----------------------------------+
|     damage           : INT      |                          ^
|     draw_weight      : INT      |                          | (mc)
|     crit_chance      : DOUBLE   |                          |
|     crit_multiplier  : DOUBLE   |                          | (1)
|     status_effect    : VARCHAR  |                          |
|     rarity           : VARCHAR  |                          |
|     image_url        : VARCHAR  |                          |
|     description      : TEXT     |                          |
| FK  case_id          : INT      |                          |
+---------------------------------+                          |
  |         |                                                |
  | (c)     | (mc)                                           |
  |         |                                                |
  | (mc)    | (1)                                            |
  v         v                                                |
+-----------------------------------------------+            |
|            user_stats_summary                 |            |
+-----------------------------------------------+            |
| PK,FK user_id                     : INT       |            |
|       matches_played              : INT       |            |
|       matches_won                 : INT       |            |
|       matches_lost                : INT       |            |
|       matches_drawn               : INT       |            |
|       total_kills                 : INT       |            |
|       total_deaths                : INT       |            |
|       total_damage_dealt          : BIGINT    |            |
|       total_damage_taken          : BIGINT    |            |
|       total_crits_landed          : INT       |            |
|       cases_opened                : INT       |            |
| FK    favorite_weapon_template_id : INT       |            |
|       updated_at                  : TIMESTAMP |            |
+-----------------------------------------------+            |
  ^                                                          |
  | (1)                                                      |
  |                                                          |
  | (1)                                                      |
+---------------------------------------+                    |
|         user_weapon_instance          |                    |
+---------------------------------------+                    |
| PK  id                   : SERIAL     |                    |
| FK  user_id              : INT        |                    |
| FK  template_id          : INT        |                    |
|     skin_name            : VARCHAR    |                    |
|     damage_modifier      : INT        |                    |
|     cost_modifier        : INT        |                    |
|     draw_weight_modifier : INT        |                    |
+---------------------------------------+                    |
  |             |                                            |
  | (1)         | (c)                                        |
  |             |                                            |
  | (mc)        | (mc)                                       |
  v             v                                            v
+---------------------------------------+    +----------------------------------------+
|             loadout_item              |    |            app_user                    |
+---------------------------------------+    +----------------------------------------+
| PK,FK loadout_id              : INT   |    | PK  id                     : INT       |
| PK,FK user_weapon_instance_id : INT   |    |     username               : STR       |
+---------------------------------------+    |     password_hash          : STR       |
                                             |     elo                    : INT       |
                                             |     credits                : INT       |
                                             |     next_case_available_at : TIMESTAMP |
                                             +----------------------------------------+
                                               |     |     |    |
                                           (1) |     | (1) | (1)| (1)
                                               |     |     |    |
                                           (mc)| (mc)| (mc)|    | (mc)
                                               |     |     |    v
                                               |     |     | +---------------------------+
                                               |     |     | |   match_state             |
                                               |     |     | +---------------------------+
                                               |     |     | | PK id       : INT         |
                                               |     |     | | FK player_a : INT         |
                                               |     |     | | FK player_b : INT         |
                                               |     |     | |    status   : STR         |
                                               |     |     | | FK winner_id : INT        |
                                               |     |     | |    logs_json : TEXT       |
                                               |     |     | |    created_at : TIMESTAMP |
                                               |     |     | +---------------------------+
                                               |     |     |   |     |     |
                                               |     |  (1)|   |(1)  |(1)  |(1)
                                               |     |     |   |     |     |
                                               v     | (mc)|   |(mc) |(mc) |(mc)
                                    +--------------+ |     v   v     v     v
                                    |   loadout    | |   +---------------------------+
                                    +--------------+ |   |     elo_history           |
                                    | PK id   :INT | |   +---------------------------+
                                    | FK user :INT | |   | PK  id         :INT       |
                                    |    side :STR | |   | FK  user_id    :INT       |
                                    +--------------+ |   | FK  match_id   :INT       |
                                          |          |   |     elo_before :INT       |
                                          | (1)      |   |     elo_after  :INT       |
                                          |          |   |     elo_change :INT       |
                                          | (mc)     |   |     recorded_at:TIMESTAMP |
                                          v          v   +---------------------------+
                                       +---------------------------------------+
                                       |          match_player_stats           |
                                       +---------------------------------------+
                                       | PK,FK match_id         : INT          |
                                       | PK,FK user_id          : INT          |
                                       |       side             : VARCHAR      |
                                       |       is_winner        : BOOLEAN      |
                                       |       is_draw          : BOOLEAN      |
                                       |       kills            : INT          |
                                       |       deaths           : INT          |
                                       |       damage_dealt     : INT          |
                                       |       damage_taken     : INT          |
                                       |       crits_landed     : INT          |
                                       |       rounds_won       : INT          |
                                       |       rounds_lost      : INT          |
                                       |       elo_change       : INT          |
                                       +---------------------------------------+
                                                         ^
                                                         | (1)
                                                         |
                                                         | (mc)
                                                         v
                                       +---------------------------------------+
                                       |          match_weapon_stats           |
                                       +---------------------------------------+
                                       | PK    id                      : INT   |
                                       | FK    match_id                : INT   |
                                       | FK    user_id                 : INT   |
                                       | FK    template_id             : INT   |
                                       | FK    user_weapon_instance_id : INT   |
                                       |       times_used              : INT   |
                                       |       damage_dealt            : INT   |
                                       |       kills                   : INT   |
                                       |       crits_landed            : INT   |
                                       +---------------------------------------+
```
