-- Read-only production verification for the client portal.
-- Run against the actual Supabase database before release.

SELECT
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default
FROM information_schema.columns c
WHERE c.table_schema = 'public'
  AND c.table_name = 'projects'
ORDER BY c.ordinal_position;

SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS force_rls
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('projects', 'client_profiles', 'client_projects', 'project_milestones', 'user_roles')
ORDER BY c.relname;

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('projects', 'client_profiles', 'client_projects', 'project_milestones', 'user_roles')
ORDER BY tablename, policyname;

SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('projects', 'client_profiles', 'client_projects', 'project_milestones', 'user_roles')
ORDER BY tablename, indexname;
