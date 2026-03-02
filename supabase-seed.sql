-- trakr editorial seed data
-- Run this AFTER running supabase-migration.sql
--
-- Steps:
--   1. Go to Supabase Dashboard → Authentication → Users
--   2. Copy your user UUID
--   3. Replace 'YOUR-USER-UUID' below with it
--   4. Paste the whole file into SQL Editor → Run

DO $$
DECLARE
  user_uuid uuid := 'YOUR-USER-UUID'::uuid;
  list1_id  uuid;
  list2_id  uuid;
  list3_id  uuid;
  list4_id  uuid;
  list5_id  uuid;
  list6_id  uuid;
  list7_id  uuid;
BEGIN

  -- ──────────────────────────────────────────────
  -- List 1: Essential Crime TV
  -- ──────────────────────────────────────────────
  INSERT INTO lists (user_id, title, description, is_public)
  VALUES (user_uuid, 'Essential Crime TV', 'The definitive crime television watchlist. Morally complex, brilliantly written, impossible to stop watching.', true)
  RETURNING id INTO list1_id;

  INSERT INTO list_items (list_id, tmdb_show_id, show_title, show_poster_path, position) VALUES
    (list1_id, 1396,  'Breaking Bad',   NULL, 1),
    (list1_id, 1438,  'The Wire',       NULL, 2),
    (list1_id, 1398,  'The Sopranos',   NULL, 3),
    (list1_id, 67744, 'Mindhunter',     NULL, 4),
    (list1_id, 69740, 'Ozark',          NULL, 5),
    (list1_id, 44778, 'True Detective', NULL, 6),
    (list1_id, 46648, 'The Americans',  NULL, 7);

  -- ──────────────────────────────────────────────
  -- List 2: Best Comedies Ever
  -- ──────────────────────────────────────────────
  INSERT INTO lists (user_id, title, description, is_public)
  VALUES (user_uuid, 'Best Comedies Ever', 'Shows that made us cry laughing. From dry British wit to absurdist American classics.', true)
  RETURNING id INTO list2_id;

  INSERT INTO list_items (list_id, tmdb_show_id, show_title, show_poster_path, position) VALUES
    (list2_id, 1400,  'Seinfeld',                  NULL, 1),
    (list2_id, 2316,  'The Office',                NULL, 2),
    (list2_id, 2589,  'Arrested Development',      NULL, 3),
    (list2_id, 67188, 'Schitt''s Creek',            NULL, 4),
    (list2_id, 71712, 'What We Do in the Shadows', NULL, 5),
    (list2_id, 67673, 'Fleabag',                   NULL, 6),
    (list2_id, 61240, 'Brooklyn Nine-Nine',         NULL, 7);

  -- ──────────────────────────────────────────────
  -- List 3: Can't Stop Watching
  -- ──────────────────────────────────────────────
  INSERT INTO lists (user_id, title, description, is_public)
  VALUES (user_uuid, 'Can''t Stop Watching', 'Binge-worthy shows that made us cancel plans, miss sleep, and ignore everyone we know.', true)
  RETURNING id INTO list3_id;

  INSERT INTO list_items (list_id, tmdb_show_id, show_title, show_poster_path, position) VALUES
    (list3_id, 63174,  'Succession',      NULL, 1),
    (list3_id, 136315, 'The Bear',        NULL, 2),
    (list3_id, 95396,  'Severance',       NULL, 3),
    (list3_id, 110316, 'The White Lotus', NULL, 4),
    (list3_id, 97546,  'Yellowjackets',   NULL, 5),
    (list3_id, 66732,  'Stranger Things', NULL, 6),
    (list3_id, 76331,  'Game of Thrones', NULL, 7);

  -- ──────────────────────────────────────────────
  -- List 4: Prestige Drama
  -- ──────────────────────────────────────────────
  INSERT INTO lists (user_id, title, description, is_public)
  VALUES (user_uuid, 'Prestige Drama', 'Slow-burn, cinematic television at its finest. Watch these and feel like a more thoughtful person.', true)
  RETURNING id INTO list4_id;

  INSERT INTO list_items (list_id, tmdb_show_id, show_title, show_poster_path, position) VALUES
    (list4_id, 1104,  'Mad Men',          NULL, 1),
    (list4_id, 37680, 'Downton Abbey',    NULL, 2),
    (list4_id, 65494, 'The Crown',        NULL, 3),
    (list4_id, 46648, 'The Americans',    NULL, 4),
    (list4_id, 17861, 'Boardwalk Empire', NULL, 5),
    (list4_id, 1426,  'Six Feet Under',   NULL, 6);

  -- ──────────────────────────────────────────────
  -- List 5: Sci-Fi Must-Sees
  -- ──────────────────────────────────────────────
  INSERT INTO lists (user_id, title, description, is_public)
  VALUES (user_uuid, 'Sci-Fi Must-Sees', 'From near-future tech horror to space opera. Essential viewing for anyone who wants to think harder about the world.', true)
  RETURNING id INTO list5_id;

  INSERT INTO list_items (list_id, tmdb_show_id, show_title, show_poster_path, position) VALUES
    (list5_id, 42009, 'Black Mirror',         NULL, 1),
    (list5_id, 63247, 'Westworld',            NULL, 2),
    (list5_id, 70523, 'Dark',                 NULL, 3),
    (list5_id, 1413,  'Battlestar Galactica', NULL, 4),
    (list5_id, 63639, 'The Expanse',          NULL, 5),
    (list5_id, 66732, 'Stranger Things',      NULL, 6),
    (list5_id, 95396, 'Severance',            NULL, 7);

  -- ──────────────────────────────────────────────
  -- List 6: Hidden Gems
  -- ──────────────────────────────────────────────
  INSERT INTO lists (user_id, title, description, is_public)
  VALUES (user_uuid, 'Hidden Gems', 'Criminally underseen. The shows that didn''t get the audience they deserved. Watch them. Tell your friends.', true)
  RETURNING id INTO list6_id;

  INSERT INTO list_items (list_id, tmdb_show_id, show_title, show_poster_path, position) VALUES
    (list6_id, 58695, 'Halt and Catch Fire', NULL, 1),
    (list6_id, 58811, 'The Leftovers',       NULL, 2),
    (list6_id, 44249, 'Enlightened',         NULL, 3),
    (list6_id, 73975, 'Barry',               NULL, 4),
    (list6_id, 61664, 'Detectorists',        NULL, 5),
    (list6_id, 67673, 'Fleabag',             NULL, 6);

  -- ──────────────────────────────────────────────
  -- List 7: Reality TV Guilty Pleasures
  -- ──────────────────────────────────────────────
  INSERT INTO lists (user_id, title, description, is_public)
  VALUES (user_uuid, 'Reality TV Guilty Pleasures', 'You said you wouldn''t watch it. You did. You have no regrets. Neither do we.', true)
  RETURNING id INTO list7_id;

  INSERT INTO list_items (list_id, tmdb_show_id, show_title, show_poster_path, position) VALUES
    (list7_id, 44217, 'The Great British Bake Off', NULL, 1),
    (list7_id, 37679, 'RuPaul''s Drag Race',        NULL, 2),
    (list7_id, 2861,  'Survivor',                   NULL, 3),
    (list7_id, 1116,  'The Amazing Race',           NULL, 4),
    (list7_id, 2741,  'Project Runway',             NULL, 5);

END $$;
