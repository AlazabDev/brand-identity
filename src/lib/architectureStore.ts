import { architectureProjects as seedProjects, type ArchitectureProject } from "@/data/architectureProjects";

const STORAGE_KEY = "architecture_projects_v1";

const readStorage = (): ArchitectureProject[] | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ArchitectureProject[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const writeStorage = (items: ArchitectureProject[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const getAllProjects = (): ArchitectureProject[] => {
  const stored = readStorage();
  if (stored) return stored;
  writeStorage(seedProjects);
  return seedProjects;
};

export const getProjectById = (id: string): ArchitectureProject | undefined =>
  getAllProjects().find((p) => p.id === id);

export const upsertProject = (project: ArchitectureProject): ArchitectureProject[] => {
  const items = getAllProjects();
  const idx = items.findIndex((p) => p.id === project.id);
  const next = idx >= 0 ? items.map((p, i) => (i === idx ? project : p)) : [project, ...items];
  writeStorage(next);
  return next;
};

export const deleteProject = (id: string): ArchitectureProject[] => {
  const next = getAllProjects().filter((p) => p.id !== id);
  writeStorage(next);
  return next;
};

export const resetToSeed = (): ArchitectureProject[] => {
  writeStorage(seedProjects);
  return seedProjects;
};

export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .slice(0, 60) || `proj-${Date.now()}`;
