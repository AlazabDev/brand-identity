BEGIN;

-- Daftra: the project entity is Work Order, not Client.
ALTER TABLE public.projects
  DROP COLUMN IF EXISTS daftra_client_id;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS daftra_work_order_id bigint;

-- Magicplan: portal projects map to Magicplan projects.
-- magicplan_plan_id is intentionally retained because a Magicplan project can expose a plan.
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS magicplan_project_id uuid;

-- Progress is always a percentage.
ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_progress_check;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_progress_check
  CHECK (progress >= 0 AND progress <= 100);

-- Client records must follow the Auth user lifecycle.
ALTER TABLE public.client_profiles
  DROP CONSTRAINT IF EXISTS client_profiles_user_id_fkey;

ALTER TABLE public.client_profiles
  ADD CONSTRAINT client_profiles_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

ALTER TABLE public.client_projects
  DROP CONSTRAINT IF EXISTS client_projects_user_id_fkey;

ALTER TABLE public.client_projects
  ADD CONSTRAINT client_projects_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- The public portfolio policy from the original site must not grant access to portal projects.
DROP POLICY IF EXISTS "Anyone can view projects" ON public.projects;

-- Relationship and external mapping indexes.
CREATE INDEX IF NOT EXISTS idx_client_projects_project_id
  ON public.client_projects(project_id);

CREATE INDEX IF NOT EXISTS idx_client_projects_user_id
  ON public.client_projects(user_id);

CREATE INDEX IF NOT EXISTS idx_project_milestones_project_id
  ON public.project_milestones(project_id);

CREATE INDEX IF NOT EXISTS idx_projects_daftra_work_order_id
  ON public.projects(daftra_work_order_id);

CREATE INDEX IF NOT EXISTS idx_projects_magicplan_project_id
  ON public.projects(magicplan_project_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_projects_daftra_work_order_id
  ON public.projects(daftra_work_order_id)
  WHERE daftra_work_order_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_projects_magicplan_project_id
  ON public.projects(magicplan_project_id)
  WHERE magicplan_project_id IS NOT NULL;

COMMIT;
