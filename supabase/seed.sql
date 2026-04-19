-- Seed data for development/testing

-- Create test users (UUIDs are deterministic for reproducibility)
-- Using the minimal approach that respects Supabase auth.users constraints
INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES 
  ('11111111-1111-1111-1111-111111111111'::uuid, 'authenticated', 'authenticated', 'user1@example.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'authenticated', 'authenticated', 'user2@example.com', crypt('password456', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb);

-- Create categories for user 1
INSERT INTO public.categories (id, user_id, name, created_at, updated_at) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'Food & Dining', now(), now()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'Transportation', now(), now()),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'Salary', now(), now());

-- Create categories for user 2
INSERT INTO public.categories (id, user_id, name, created_at, updated_at) VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'Entertainment', now(), now()),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'Utilities', now(), now()),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'Income', now(), now());

-- Create transactions for user 1
INSERT INTO public.transactions (id, user_id, category_id, type, amount, date, description, created_at, updated_at) VALUES
  ('10000000-0000-0000-0000-000000000000'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, 'income', 5000.00, '2026-04-01', 'Monthly Salary', now(), now()),
  ('10000000-0000-0000-0000-000000000001'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'expense', 45.50, '2026-04-05', 'Lunch at cafe', now(), now()),
  ('10000000-0000-0000-0000-000000000002'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'expense', 30.00, '2026-04-08', 'Gas for car', now(), now()),
  ('10000000-0000-0000-0000-000000000003'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'expense', 120.75, '2026-04-12', 'Dinner with friends', now(), now()),
  ('10000000-0000-0000-0000-000000000004'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'expense', 15.99, '2026-04-18', 'Bus ticket', now(), now());

-- Create transactions for user 2
INSERT INTO public.transactions (id, user_id, category_id, type, amount, date, description, created_at, updated_at) VALUES
  ('20000000-0000-0000-0000-000000000000'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid, 'income', 6000.00, '2026-04-01', 'Monthly Paycheck', now(), now()),
  ('20000000-0000-0000-0000-000000000001'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, 'expense', 25.00, '2026-04-06', 'Movie ticket', now(), now()),
  ('20000000-0000-0000-0000-000000000002'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'expense', 85.50, '2026-04-10', 'Electric bill', now(), now()),
  ('20000000-0000-0000-0000-000000000003'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, 'expense', 50.00, '2026-04-14', 'Concert tickets', now(), now()),
  ('20000000-0000-0000-0000-000000000004'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'expense', 42.00, '2026-04-19', 'Internet bill', now(), now());
