insert into public.categories (name, slug, sort_order)
values
  ('공지', 'notice', 0),
  ('자유', 'free', 1),
  ('스터디', 'study', 2),
  ('질문', 'qna', 3)
on conflict (slug) do nothing;

-- After first admin signs up, promote by email:
-- update public.profiles set role = 'admin' where email = 'admin@example.com';
