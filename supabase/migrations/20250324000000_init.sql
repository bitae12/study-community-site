-- Rabbit Community schema

create type public.user_role as enum ('user', 'admin');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text not null,
  avatar_url text,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order int not null default 0
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete restrict,
  title text not null check (char_length(trim(title)) > 0),
  body text not null check (char_length(trim(body)) > 0),
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_category_id_idx on public.posts (category_id);
create index posts_author_id_idx on public.posts (author_id);
create index posts_pinned_created_idx on public.posts (is_pinned desc, created_at desc);

create or replace function public.set_posts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger posts_updated_at
before update on public.posts
for each row
execute function public.set_posts_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'full_name',
      split_part(coalesce(new.email, 'user'), '@', 1)
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.posts enable row level security;

-- profiles (email visible for community author labels; lock down in a later hardening pass if needed)
create policy "profiles_select_all"
on public.profiles for select
to anon, authenticated
using (true);

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (
  id = auth.uid()
  and role = (select p.role from public.profiles p where p.id = auth.uid())
);

create policy "profiles_update_admin"
on public.profiles for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- categories
create policy "categories_select_all"
on public.categories for select
to anon, authenticated
using (true);

create policy "categories_insert_admin"
on public.categories for insert
to authenticated
with check (public.is_admin());

create policy "categories_update_admin"
on public.categories for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "categories_delete_admin"
on public.categories for delete
to authenticated
using (public.is_admin());

-- posts
create policy "posts_select_all"
on public.posts for select
to anon, authenticated
using (true);

create policy "posts_insert_authenticated"
on public.posts for insert
to authenticated
with check (
  author_id = auth.uid()
  and (
    is_pinned = false
    or public.is_admin()
  )
);

create policy "posts_update_author_or_admin"
on public.posts for update
to authenticated
using (author_id = auth.uid() or public.is_admin())
with check (author_id = auth.uid() or public.is_admin());

create policy "posts_delete_author_or_admin"
on public.posts for delete
to authenticated
using (author_id = auth.uid() or public.is_admin());
