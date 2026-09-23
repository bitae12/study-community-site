-- Allow signed-in users to create their own profile if the auth trigger did not run
create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (id = auth.uid());
