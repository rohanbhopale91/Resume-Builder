import type { ReactNode } from "react";
import type { Resume } from "@/lib/resume";

const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);
const range = (a: string, b: string) => [a, b].filter(Boolean).join(" – ");

export function ResumePreview({ resume: r }: { resume: Resume }) {
  const modern = r.template === "modern";
  const p = r.personal;
  const contact = [p.email, p.phone, p.location, p.website].filter(Boolean);

  const H = ({ children }: { children: ReactNode }) => (
    <h3 className={modern ? "mb-2 mt-5 text-xs font-bold uppercase tracking-[0.2em] text-primary" : "mb-2 mt-5 border-b border-foreground/30 pb-1 font-display text-base uppercase tracking-wider"}>
      {children}
    </h3>
  );

  return (
    <div className="print-area mx-auto aspect-[1/1.414] w-full max-w-[800px] overflow-auto bg-card p-10 text-[13px] leading-relaxed text-card-foreground shadow-lg print:aspect-auto print:shadow-none">
      <header className={modern ? "border-l-4 border-primary pl-4" : "text-center"}>
        <h1 className="font-display text-3xl">{p.name || "Your Name"}</h1>
        {p.headline && <p className="text-muted-foreground">{p.headline}</p>}
        {contact.length > 0 && <p className="mt-1 text-xs text-muted-foreground">{contact.join("  ·  ")}</p>}
      </header>

      {p.summary && (<><H>Summary</H><p>{p.summary}</p></>)}

      {r.experience.length > 0 && (
        <>
          <H>Experience</H>
          {r.experience.map((e) => (
            <div key={e.id} className="mb-3">
              <div className="flex justify-between gap-2">
                <strong>{e.role}{e.company && <span className="font-normal"> — {e.company}</span>}</strong>
                <span className="text-xs text-muted-foreground">{range(e.start, e.end)}</span>
              </div>
              <ul className="ml-4 list-disc">{lines(e.details).map((l, i) => <li key={i}>{l}</li>)}</ul>
            </div>
          ))}
        </>
      )}

      {r.education.length > 0 && (
        <>
          <H>Education</H>
          {r.education.map((e) => (
            <div key={e.id} className="mb-2">
              <div className="flex justify-between gap-2">
                <strong>{e.degree}{e.school && <span className="font-normal"> — {e.school}</span>}</strong>
                <span className="text-xs text-muted-foreground">{range(e.start, e.end)}</span>
              </div>
              {e.details && <p>{e.details}</p>}
            </div>
          ))}
        </>
      )}

      {r.skills.length > 0 && (<><H>Skills</H><p>{r.skills.join(" · ")}</p></>)}

      {r.projects.length > 0 && (
        <>
          <H>Projects</H>
          {r.projects.map((pr) => (
            <div key={pr.id} className="mb-2">
              <strong>{pr.name}</strong>
              {pr.link && <span className="ml-2 text-xs text-muted-foreground">{pr.link}</span>}
              {pr.details && <p>{pr.details}</p>}
            </div>
          ))}
        </>
      )}

      {r.certifications.length > 0 && (
        <>
          <H>Certifications</H>
          {r.certifications.map((c) => (
            <p key={c.id}><strong>{c.name}</strong>{c.issuer && ` — ${c.issuer}`}{c.date && <span className="text-muted-foreground"> ({c.date})</span>}</p>
          ))}
        </>
      )}
    </div>
  );
}
