export type Education = { id: string; school: string; degree: string; start: string; end: string; details: string };
export type Experience = { id: string; company: string; role: string; start: string; end: string; details: string };
export type Project = { id: string; name: string; link: string; details: string };
export type Certification = { id: string; name: string; issuer: string; date: string };

export type Resume = {
  id: string;
  title: string;
  template: "classic" | "modern";
  updatedAt: number;
  personal: { name: string; headline: string; email: string; phone: string; location: string; website: string; summary: string };
  education: Education[];
  experience: Experience[];
  skills: string[];
  projects: Project[];
  certifications: Certification[];
};

const KEY = "resume-builder:v1";

export const uid = () => Math.random().toString(36).slice(2, 10);

export function blankResume(): Resume {
  return {
    id: uid(),
    title: "Untitled resume",
    template: "classic",
    updatedAt: Date.now(),
    personal: { name: "", headline: "", email: "", phone: "", location: "", website: "", summary: "" },
    education: [],
    experience: [],
    skills: [],
    projects: [],
    certifications: [],
  };
}

export function loadAll(): Resume[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function saveAll(list: Resume[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function getResume(id: string) {
  return loadAll().find((r) => r.id === id);
}

export function saveResume(r: Resume) {
  const list = loadAll();
  const next = { ...r, updatedAt: Date.now() };
  const i = list.findIndex((x) => x.id === r.id);
  if (i >= 0) list[i] = next;
  else list.unshift(next);
  saveAll(list);
}

export function deleteResume(id: string) {
  saveAll(loadAll().filter((r) => r.id !== id));
}
