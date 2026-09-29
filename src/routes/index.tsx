import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { blankResume, deleteResume, loadAll, saveResume, uid, type Resume } from "@/lib/resume";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Folio — Resume Builder" },
      { name: "description", content: "Build, save and export clean professional resumes with a live preview." },
      { property: "og:title", content: "Folio — Resume Builder" },
      { property: "og:description", content: "Build, save and export clean professional resumes with a live preview." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Home,
});

function Home() {
  const [list, setList] = useState<Resume[]>([]);
  const nav = useNavigate();
  useEffect(() => setList(loadAll()), []);

  const create = () => {
    const r = blankResume();
    saveResume(r);
    nav({ to: "/resume/$id", params: { id: r.id } });
  };
  const duplicate = (r: Resume) => {
    saveResume({ ...r, id: uid(), title: r.title + " (copy)" });
    setList(loadAll());
  };
  const remove = (id: string) => {
    if (!confirm("Delete this resume?")) return;
    deleteResume(id);
    setList(loadAll());
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Folio</p>
        <h1 className="mt-3 font-display text-5xl text-foreground md:text-6xl">Your resumes, set in type.</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Fill in your details, watch the page compose itself, and export a polished PDF. Everything is saved on this device automatically.
        </p>
        <button onClick={create} className="mt-8 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          + New resume
        </button>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.length === 0 && <p className="text-sm text-muted-foreground">No resumes yet — start your first one above.</p>}
          {list.map((r) => (
            <div key={r.id} className="rounded-lg border bg-card p-5 shadow-sm">
              <Link to="/resume/$id" params={{ id: r.id }} className="block">
                <h2 className="font-display text-xl text-card-foreground">{r.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{r.personal.name || "No name yet"}</p>
                <p className="mt-3 text-xs text-muted-foreground">Edited {new Date(r.updatedAt).toLocaleString()}</p>
              </Link>
              <div className="mt-4 flex gap-3 text-sm">
                <Link to="/resume/$id" params={{ id: r.id }} className="text-primary hover:underline">Edit</Link>
                <button onClick={() => duplicate(r)} className="text-muted-foreground hover:text-foreground">Duplicate</button>
                <button onClick={() => remove(r.id)} className="text-destructive hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
