import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { getResume, saveResume, uid, type Resume } from "@/lib/resume";
import { ResumePreview } from "@/components/ResumePreview";

export const Route = createFileRoute("/resume/$id")({
  head: () => ({
    meta: [
      { title: "Edit resume — Folio" },
      { name: "description", content: "Edit your resume details with a real-time preview and PDF export." },
      { property: "og:title", content: "Edit resume — Folio" },
      { property: "og:description", content: "Edit your resume details with a real-time preview and PDF export." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Editor,
});

const input = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

function Field({ label, value, onChange, area }: { label: string; value: string; onChange: (v: string) => void; area?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {area ? (
        <textarea rows={3} className={input} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={input} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

function Section({ title, children, onAdd }: { title: string; children: ReactNode; onAdd?: () => void }) {
  return (
    <section className="rounded-lg border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg text-card-foreground">{title}</h2>
        {onAdd && (
          <button onClick={onAdd} className="text-sm text-primary hover:underline">+ Add</button>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Entry({ onRemove, children }: { onRemove: () => void; children: ReactNode }) {
  return (
    <div className="relative grid gap-3 rounded-md border border-dashed p-4 sm:grid-cols-2">
      {children}
      <button onClick={onRemove} className="text-left text-xs text-destructive hover:underline sm:col-span-2">Remove</button>
    </div>
  );
}

function Editor() {
  const { id } = Route.useParams();
  const [r, setR] = useState<Resume | null>(null);
  const [missing, setMissing] = useState(false);
  const [skillDraft, setSkillDraft] = useState("");

  useEffect(() => {
    const found = getResume(id);
    if (found) setR(found);
    else setMissing(true);
  }, [id]);

  useEffect(() => {
    if (r) saveResume(r);
  }, [r]);

  if (missing)
    return (
      <div className="p-10 text-center">
        <p className="text-muted-foreground">Resume not found.</p>
        <Link to="/" className="text-primary underline">Back to resumes</Link>
      </div>
    );
  if (!r) return null;

  const set = (patch: Partial<Resume>) => setR({ ...r, ...patch });
  const setP = (k: keyof Resume["personal"], v: string) => set({ personal: { ...r.personal, [k]: v } });

  type ListKey = "education" | "experience" | "projects" | "certifications";
  const upd = <K extends ListKey>(key: K, i: number, patch: Partial<Resume[K][number]>) => {
    const arr = [...r[key]] as Resume[K][number][];
    arr[i] = { ...arr[i], ...patch } as Resume[K][number];
    set({ [key]: arr } as Partial<Resume>);
  };
  const rm = (key: ListKey, i: number) => set({ [key]: r[key].filter((_, j) => j !== i) } as Partial<Resume>);

  const addSkill = () => {
    const s = skillDraft.trim();
    if (!s || s.length > 60) return;
    set({ skills: [...r.skills, s] });
    setSkillDraft("");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="no-print sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b bg-background/90 px-6 py-3 backdrop-blur">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Resumes</Link>
        <input className="flex-1 bg-transparent font-display text-lg focus:outline-none" value={r.title} onChange={(e) => set({ title: e.target.value })} />
        <select className={input + " w-auto"} value={r.template} onChange={(e) => set({ template: e.target.value as Resume["template"] })}>
          <option value="classic">Classic</option>
          <option value="modern">Modern</option>
        </select>
        <span className="text-xs text-muted-foreground">Saved</span>
        <button onClick={() => window.print()} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Export PDF
        </button>
      </header>

      <div className="grid gap-6 p-6 lg:grid-cols-2">
        <div className="no-print space-y-5">
          <Section title="Personal details">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Full name" value={r.personal.name} onChange={(v) => setP("name", v)} />
              <Field label="Headline" value={r.personal.headline} onChange={(v) => setP("headline", v)} />
              <Field label="Email" value={r.personal.email} onChange={(v) => setP("email", v)} />
              <Field label="Phone" value={r.personal.phone} onChange={(v) => setP("phone", v)} />
              <Field label="Location" value={r.personal.location} onChange={(v) => setP("location", v)} />
              <Field label="Website" value={r.personal.website} onChange={(v) => setP("website", v)} />
            </div>
            <Field area label="Summary" value={r.personal.summary} onChange={(v) => setP("summary", v)} />
          </Section>

          <Section title="Work experience" onAdd={() => set({ experience: [...r.experience, { id: uid(), company: "", role: "", start: "", end: "", details: "" }] })}>
            {r.experience.map((e, i) => (
              <Entry key={e.id} onRemove={() => rm("experience", i)}>
                <Field label="Role" value={e.role} onChange={(v) => upd("experience", i, { role: v })} />
                <Field label="Company" value={e.company} onChange={(v) => upd("experience", i, { company: v })} />
                <Field label="Start" value={e.start} onChange={(v) => upd("experience", i, { start: v })} />
                <Field label="End" value={e.end} onChange={(v) => upd("experience", i, { end: v })} />
                <div className="sm:col-span-2"><Field area label="Highlights (one per line)" value={e.details} onChange={(v) => upd("experience", i, { details: v })} /></div>
              </Entry>
            ))}
          </Section>

          <Section title="Education" onAdd={() => set({ education: [...r.education, { id: uid(), school: "", degree: "", start: "", end: "", details: "" }] })}>
            {r.education.map((e, i) => (
              <Entry key={e.id} onRemove={() => rm("education", i)}>
                <Field label="School" value={e.school} onChange={(v) => upd("education", i, { school: v })} />
                <Field label="Degree" value={e.degree} onChange={(v) => upd("education", i, { degree: v })} />
                <Field label="Start" value={e.start} onChange={(v) => upd("education", i, { start: v })} />
                <Field label="End" value={e.end} onChange={(v) => upd("education", i, { end: v })} />
                <div className="sm:col-span-2"><Field area label="Details" value={e.details} onChange={(v) => upd("education", i, { details: v })} /></div>
              </Entry>
            ))}
          </Section>

          <Section title="Skills">
            <div className="flex gap-2">
              <input className={input} placeholder="e.g. TypeScript" value={skillDraft} onChange={(e) => setSkillDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSkill()} />
              <button onClick={addSkill} className="rounded-md border px-3 text-sm">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {r.skills.map((s, i) => (
                <span key={i} className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                  {s}
                  <button onClick={() => set({ skills: r.skills.filter((_, j) => j !== i) })} aria-label={`Remove ${s}`}>×</button>
                </span>
              ))}
            </div>
          </Section>

          <Section title="Projects" onAdd={() => set({ projects: [...r.projects, { id: uid(), name: "", link: "", details: "" }] })}>
            {r.projects.map((p, i) => (
              <Entry key={p.id} onRemove={() => rm("projects", i)}>
                <Field label="Name" value={p.name} onChange={(v) => upd("projects", i, { name: v })} />
                <Field label="Link" value={p.link} onChange={(v) => upd("projects", i, { link: v })} />
                <div className="sm:col-span-2"><Field area label="Description" value={p.details} onChange={(v) => upd("projects", i, { details: v })} /></div>
              </Entry>
            ))}
          </Section>

          <Section title="Certifications" onAdd={() => set({ certifications: [...r.certifications, { id: uid(), name: "", issuer: "", date: "" }] })}>
            {r.certifications.map((c, i) => (
              <Entry key={c.id} onRemove={() => rm("certifications", i)}>
                <Field label="Name" value={c.name} onChange={(v) => upd("certifications", i, { name: v })} />
                <Field label="Issuer" value={c.issuer} onChange={(v) => upd("certifications", i, { issuer: v })} />
                <Field label="Date" value={c.date} onChange={(v) => upd("certifications", i, { date: v })} />
              </Entry>
            ))}
          </Section>
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <ResumePreview resume={r} />
        </div>
      </div>
    </div>
  );
}
