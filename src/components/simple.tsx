import { useEffect, useState, type ReactNode } from "react";
import { Btn } from "./ui";
import {
  IconChevronRight, IconPhone, IconCheck, IconInfo, IconCheckCircle, IconAlert, IconFile, IconEye, IconClock,
} from "./Icons";
import { HELP, NEWS, NEWSLETTERS, type Message } from "../data/mock";

/* ==========================================================================
   Simple-mode building blocks: big, plain, obvious
   ========================================================================== */

/* ---------- Big action tile ---------- */
export function BigTile({
  icon, title, note, tone = "#2563c9", onClick, badge,
}: { icon: ReactNode; title: string; note?: string; tone?: string; onClick: () => void; badge?: string }) {
  return (
    <button type="button" data-click className="big-tile" onClick={onClick}>
      <span className="big-tile__icon" style={{ background: `${tone}1a`, color: tone }}>{icon}</span>
      <span style={{ minWidth: 0 }}>
        <span className="d-flex align-items-center gap-2 flex-wrap">
          <span className="big-tile__title">{title}</span>
          {badge && <span className="badge-x badge-x--amber">{badge}</span>}
        </span>
        {note && <span className="big-tile__note d-block">{note}</span>}
      </span>
      <span className="big-tile__arrow"><IconChevronRight size={24} /></span>
    </button>
  );
}

/* ---------- Selectable choice card ---------- */
export function Choice({
  selected, onClick, children, className = "",
}: { selected: boolean; onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button type="button" data-click onClick={onClick} aria-pressed={selected} className={`choice ${selected ? "is-on" : ""} ${className}`}>
      {selected && <span className="choice__tick"><IconCheck size={14} /></span>}
      {children}
    </button>
  );
}

/* ---------- Inline notice ---------- */
export function Notice({
  tone = "brand", title, children, action,
}: { tone?: "teal" | "amber" | "brand" | "rose"; title: string; children?: ReactNode; action?: ReactNode }) {
  const icon = tone === "teal" ? <IconCheckCircle size={20} /> : tone === "brand" ? <IconInfo size={20} /> : <IconAlert size={20} />;
  return (
    <div className={`notice notice--${tone}`} role="status">
      <span className="notice__icon">{icon}</span>
      <div>
        <div className="notice__title">{title}</div>
        {children && <div className="notice__body">{children}</div>}
      </div>
      {action && <div className="d-flex align-items-center" style={{ flex: "0 0 auto" }}>{action}</div>}
    </div>
  );
}

/* ---------- Step header ("Step 1 of 3") ---------- */
export function StepHead({ step, total, title, note }: { step: number; total: number; title: string; note?: string }) {
  return (
    <div className="step-head">
      <span className="step-head__num">{step}</span>
      <div className="flex-grow-1">
        <div className="eyebrow text-muted-2">Step {step} of {total}</div>
        <div className="fw-800" style={{ fontSize: "1.15rem" }}>{title}</div>
        {note && <div className="fs-8 text-muted-2">{note}</div>}
      </div>
      <div className="step-dots d-none d-sm-flex" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={i + 1 < step ? "done" : i + 1 === step ? "now" : ""} />
        ))}
      </div>
    </div>
  );
}

/* ---------- Help box ---------- */
export function HelpBox({ note }: { note?: string }) {
  return (
    <div className="help-box no-print">
      <span className="d-grid rounded-4 flex-shrink-0" style={{ width: 52, height: 52, placeItems: "center", background: "var(--brand-100)", color: "var(--brand-700)" }}>
        <IconPhone size={24} />
      </span>
      <div className="flex-grow-1">
        <div className="fw-800">Need help? Call the school office</div>
        <div className="fs-8 text-muted-2">{note ?? "We will guide you step by step on the phone."} · {HELP.hours}</div>
      </div>
      <a href={`tel:${HELP.phone.replace(/\s/g, "")}`} className="help-box__phone">{HELP.phone}</a>
    </div>
  );
}

/* ---------- Message list ---------- */
export function MessageList({ items }: { items: Message[] }) {
  return (
    <div className="d-flex flex-column gap-2">
      {items.map((m) => (
        <div key={m.id} className={`notice notice--${m.tone}`}>
          <span className="notice__icon">
            {m.tone === "teal" ? <IconCheckCircle size={20} /> : m.tone === "brand" ? <IconInfo size={20} /> : <IconAlert size={20} />}
          </span>
          <div>
            <div className="d-flex justify-content-between gap-2 flex-wrap">
              <span className="notice__title">{m.title}</span>
              <span className="fs-8" style={{ opacity: 0.75 }}>{m.date}</span>
            </div>
            <div className="notice__body">{m.body}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Newsletters + news (shared by student & parent) ---------- */
export function NewsBoard({ onOpen }: { onOpen: (title: string) => void }) {
  return (
    <>
      <h2 className="fs-5 fw-800 mb-3" data-stagger>School newsletters</h2>
      <div className="row g-3 mb-5" data-stagger>
        {NEWSLETTERS.map((n) => (
          <div className="col-md-6 col-xl-3" key={n.id}>
            <article className="card-x card-x--hover h-100 overflow-hidden d-flex flex-column">
              <div className="news-thumb" style={{ aspectRatio: "16/9" }}>
                <img src={n.cover} alt="" loading="lazy" />
                {n.isNew && <span className="position-absolute top-0 start-0 m-2 badge-x badge-x--teal">New</span>}
              </div>
              <div className="p-3 d-flex flex-column flex-grow-1">
                <div className="fs-8 text-muted-2 d-flex align-items-center gap-1"><IconFile size={13} /> {n.period} · {n.pages} pages</div>
                <h3 className="fs-6 fw-800 mt-1">{n.title}</h3>
                <p className="fs-8 text-muted-2 mb-3">{n.summary}</p>
                <Btn className="mt-auto" variant="soft" onClick={() => onOpen(n.title)}>
                  <span className="d-inline-flex align-items-center gap-2"><IconEye size={16} /> Read newsletter</span>
                </Btn>
              </div>
            </article>
          </div>
        ))}
      </div>

      <h2 className="fs-5 fw-800 mb-3" data-stagger>School news</h2>
      <div className="row g-3" data-stagger>
        {NEWS.map((n) => (
          <div className="col-md-6 col-xl-3" key={n.id}>
            <article className="news-card card-x card-x--hover h-100 overflow-hidden d-flex flex-column">
              <div className="news-thumb">
                <img src={n.image} alt="" loading="lazy" />
                <span className="position-absolute top-0 start-0 m-2 badge-x badge-x--dark">{n.category}</span>
              </div>
              <div className="p-3 d-flex flex-column flex-grow-1">
                <div className="fs-8 text-muted-2 d-flex align-items-center gap-1"><IconClock size={13} /> {n.date}</div>
                <h3 className="fs-6 fw-800 mt-1">{n.title}</h3>
                <p className="fs-8 text-muted-2 mb-3">{n.excerpt}</p>
                <Btn className="mt-auto" variant="soft" onClick={() => onOpen(n.title)}>Read more</Btn>
              </div>
            </article>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------- Bigger text toggle (accessibility) ---------- */
export function useLargeText() {
  const [large, setLarge] = useState(() => localStorage.getItem("sch-large-text") === "1");
  useEffect(() => {
    document.documentElement.classList.toggle("large-text", large);
    localStorage.setItem("sch-large-text", large ? "1" : "0");
  }, [large]);
  return { large, toggle: () => setLarge((v) => !v) };
}

export function LargeTextToggle({ dark = false }: { dark?: boolean }) {
  const { large, toggle } = useLargeText();
  return (
    <button
      type="button" data-click onClick={toggle} aria-pressed={large} title="Make the text bigger or smaller"
      className="btn btn-sm"
      style={{
        background: dark ? "rgba(255,255,255,.1)" : "var(--slate-100)",
        color: dark ? "#fff" : "var(--slate-700)",
        border: large ? "2px solid var(--brand-500)" : "2px solid transparent",
      }}
    >
      <span style={{ fontSize: ".8rem", fontWeight: 700 }}>A</span>
      <span style={{ fontSize: "1.15rem", fontWeight: 800, marginLeft: 2 }}>A</span>
      <span className="ms-2 d-none d-sm-inline">{large ? "Normal text" : "Bigger text"}</span>
    </button>
  );
}
