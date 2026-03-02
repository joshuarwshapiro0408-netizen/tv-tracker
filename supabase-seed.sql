-- trakr sample seed data
-- Replace 'YOUR-USER-UUID' with your actual Supabase user ID
-- Find it at: Supabase Dashboard → Authentication → Users → copy the UUID

DO $$
DECLARE
  user_uuid uuid := 'YOUR-USER-UUID'::uuid;
  list1_id  uuid;
  list2_id  uuid;
  list3_id  uuid;
BEGIN

  -- List 1: Essential Crime TV
  INSERT INTO lists (user_id, title, description, is_public)
  VALUES (user_uuid, 'Essential Crime TV', 'The gold standard of crime television.', true)
  RETURNING id INTO list1_id;

  INSERT INTO list_items (list_id, tmdb_show_id, show_title, show_poster_path, position) VALUES
    (list1_id, 1396,  'Breaking Bad',  NULL, 1),
    (list1_id, 1438,  'The Wire',      NULL, 2),
    (list1_id, 1398,  'The Sopranos',  NULL, 3),
    (list1_id, 67744, 'Mindhunter',    NULL, 4),
    (list1_id, 69740, 'Ozark',         NULL, 5);

  -- List 2: Best Comedies Ever
  INSERT INTO lists (user_id, title, description, is_public)
  VALUES (user_uuid, 'Best Comedies Ever', 'Shows that made us laugh the hardest.', true)
  RETURNING id INTO list2_id;

  INSERT INTO list_items (list_id, tmdb_show_id, show_title, show_poster_path, position) VALUES
    (list2_id, 1400,  'Seinfeld',                  NULL, 1),
    (list2_id, 2316,  'The Office',                NULL, 2),
    (list2_id, 2589,  'Arrested Development',      NULL, 3),
    (list2_id, 67188, 'Schitt''s Creek',           NULL, 4),
    (list2_id, 71712, 'What We Do in the Shadows', NULL, 5);

  -- List 3: Can't Stop Watching
  INSERT INTO lists (user_id, title, description, is_public)
  VALUES (user_uuid, 'Can''t Stop Watching', 'Binge-worthy shows that consumed our lives.', true)
  RETURNING id INTO list3_id;

  INSERT INTO list_items (list_id, tmdb_show_id, show_title, show_poster_path, position) VALUES
    (list3_id, 63174,  'Succession',      NULL, 1),
    (list3_id, 136315, 'The Bear',        NULL, 2),
    (list3_id, 95396,  'Severance',       NULL, 3),
    (list3_id, 110316, 'The White Lotus', NULL, 4),
    (list3_id, 97546,  'Yellowjackets',   NULL, 5);

END $$;
