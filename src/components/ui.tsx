import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap, useCountUp } from "../lib/gsap";
import { IconX } from "./Icons";

/* ==========================================================================
   Button with GSAP click ripple + press feedback
   ========================================================================== */
type BtnProps = {
  children: ReactNode;
  variant?: "brand" | "teal" | "ghost" | "outline" | "soft" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  full?: boolean;
};

export function Btn({
  children, variant = "brand", size = "md", className = "", onClick, disabled, type = "button", full,
}: BtnProps) {
  const map: Record<string, string> = {
    brand: "btn-brand", teal: "btn-teal", ghost: "btn-ghost",
    outline: "btn-outline-brand", soft: "btn-soft",
    danger: "btn text-white", 
  };
  const sizeCls = size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "";
  return (
    <button
      type={type}
      data-click
      onClick={onClick}
      disabled={disabled}
      className={`btn ${map[variant]} ${sizeCls} ${full ? "w-100" : ""} ${disabled ? "opacity-50" : ""} ${className}`}
      style={variant === "danger" ? { background: "linear-gradient(135deg,#e0344b,#b91c37)" } : undefined}
    >
      {children}
    </button>
  );
}

/* ==========================================================================
   Panel — card with optional header
   ========================================================================== */
export function Panel({
  title, subtitle, actions, children, className = "", pad = true, icon,
}: {
  title?: string; subtitle?: string; actions?: ReactNode; children: ReactNode; className?: string; pad?: boolean; icon?: ReactNode;
}) {
  return (
    <section className={`card-x ${className}`} data-stagger>
      {(title || actions) && (
        <header className="d-flex align-items-start justify-content-between gap-3 px-4 pt-4 pb-3 flex-wrap">
          <div className="d-flex align-items-start gap-3">
            {icon && <div className="flex-shrink-0">{icon}</div>}
            <div>
              {title && <h3 className="mb-0 fs-6 fw-800">{title}</h3>}
              {subtitle && <div className="fs-8 text-muted-2 mt-1">{subtitle}</div>}
            </div>
          </div>
          {actions && <div className="d-flex align-items-center gap-2 flex-wrap">{actions}</div>}
        </header>
      )}
      <div className={pad ? "px-4 pb-4" : "pb-0"}>{children}</div>
    </section>
  );
}

/* ==========================================================================
   Stat tile with animated counter
   ========================================================================== */
export function StatTile({
  label, value, decimals = 0, suffix = "", prefix = "", foot, tone = "#2563c9", icon, delta,
}: {
  label: string; value: number; decimals?: number; suffix?: string; prefix?: string; foot?: string;
  tone?: string; icon?: ReactNode; delta?: number;
}) {
  const numRef = useCountUp(value, decimals);
  return (
    <div className="stat" style={{ color: tone }} data-stagger>
      <div className="d-flex justify-content-between align-items-start mb-2">
        <span className="stat__label">{label}</span>
        {icon && (
          <span className="d-grid align-items-center justify-content-center rounded-3" style={{ width: 34, height: 34, background: `${tone}18`, color: tone }}>
            {icon}
          </span>
        )}
      </div>
      <div className="stat__value">
        {prefix}<span ref={numRef} />{suffix}
      </div>
      <div className="stat__foot d-flex align-items-center gap-2 mt-1">
        {typeof delta === "number" && (
          <span className="fw-bold" style={{ color: delta >= 0 ? "#0d9488" : "#e0344b" }}>
            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}%
          </span>
        )}
        {foot && <span>{foot}</span>}
      </div>
    </div>
  );
}

/* ==========================================================================
   Avatar (initials)
   ========================================================================== */
export function Avatar({ initials, color, size = 40, ring }: { initials: string; color: string; size?: number; ring?: boolean }) {
  return (
    <span
      className={`avatar ${ring ? "shadow" : ""}`}
      style={{
        width: size, height: size, background: color, fontSize: size * 0.36,
        boxShadow: ring ? "0 0 0 3px rgba(255,255,255,.9), 0 8px 18px -8px rgba(15,23,42,.4)" : undefined,
      }}
    >
      {initials}
    </span>
  );
}

/* ==========================================================================
   Badge
   ========================================================================== */
export function Badge({ children, tone = "slate" }: { children: ReactNode; tone?: "brand" | "teal" | "amber" | "rose" | "violet" | "slate" | "dark" }) {
  return <span className={`badge-x badge-x--${tone}`}>{children}</span>;
}

/* ==========================================================================
   Section heading (landing)
   ========================================================================== */
export function SectionHead({
  eyebrow, title, lead, light = false, center = true,
}: { eyebrow: string; title: ReactNode; lead?: string; light?: boolean; center?: boolean }) {
  return (
    <div className={`${center ? "text-center mx-auto" : ""} mb-5`} style={center ? { maxWidth: 720 } : undefined} data-reveal="up">
      <div className={`eyebrow mb-2 ${light ? "text-brand-400" : "text-brand"}`}>{eyebrow}</div>
      <h2 className={`display-font ${light ? "text-white" : ""}`} style={{ fontSize: "clamp(1.7rem,3.4vw,2.6rem)", lineHeight: 1.15 }}>
        {title}
      </h2>
      {lead && <p className={`mt-3 mb-0 ${light ? "text-white-50" : "text-muted-2"}`} style={{ fontSize: ".98rem" }}>{lead}</p>}
    </div>
  );
}

/* ==========================================================================
   Tabs
   ========================================================================== */
export function Tabs<T extends string>({
  items, active, onChange, className = "",
}: { items: { id: T; label: string; icon?: ReactNode }[]; active: T; onChange: (id: T) => void; className?: string }) {
  return (
    <div className={`navx ${className}`} role="tablist">
      {items.map((it) => (
        <button
          key={it.id}
          role="tab"
          aria-selected={active === it.id}
          data-click
          className={`navx__item ${active === it.id ? "is-active" : ""}`}
          onClick={() => onChange(it.id)}
        >
          {it.icon && <span className="me-1 d-inline-flex align-items-center" style={{ verticalAlign: "-2px" }}>{it.icon}</span>}
          {it.label}
        </button>
      ))}
    </div>
  );
}

/* ==========================================================================
   Modal (no Bootstrap JS — GSAP driven)
   ========================================================================== */
export function Modal({
  open, onClose, title, children, width = 560,
}: { open: boolean; onClose: () => void; title: string; children: ReactNode; width?: number }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    gsap.fromTo(backRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 });
    gsap.fromTo(boxRef.current, { y: 34, scale: 0.96, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.5)" });
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", esc);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3" style={{ zIndex: 1080 }}>
      <div ref={backRef} onClick={onClose} className="position-absolute top-0 start-0 w-100 h-100" style={{ background: "rgba(8,13,28,.62)", backdropFilter: "blur(6px)" }} />
      <div ref={boxRef} className="position-relative bg-white rounded-4 shadow-lg w-100" style={{ maxWidth: width, overflow: "hidden" }}>
        <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom">
          <h3 className="fs-6 fw-800 mb-0">{title}</h3>
          <button className="btn btn-soft btn-sm" data-click onClick={onClose} aria-label="Close"><IconX size={15} /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

/* ==========================================================================
   Toast
   ========================================================================== */
export function useToast() {
  const [toast, setToast] = useState<{ msg: string; tone: "teal" | "rose" | "brand" } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!toast) return;
    gsap.fromTo(ref.current, { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.55, ease: "back.out(1.6)" });
    const t = window.setTimeout(() => {
      gsap.to(ref.current, { x: 60, opacity: 0, duration: 0.35, onComplete: () => setToast(null) });
    }, 3600);
    return () => window.clearTimeout(t);
  }, [toast]);

  const node = toast ? (
    <div ref={ref} className="position-fixed no-print" style={{ right: 22, bottom: 22, zIndex: 1090 }}>
      <div className="d-flex align-items-center gap-3 px-3 py-3 rounded-4 shadow-lg" style={{ background: "#0d1426", border: "1px solid rgba(255,255,255,.12)", minWidth: 268 }}>
        <span className="d-grid place-items-center rounded-circle" style={{ width: 30, height: 30, background: toast.tone === "rose" ? "#e0344b" : toast.tone === "brand" ? "#2563c9" : "#14b8a6", color: "#fff", display: "grid", placeItems: "center" }}>✓</span>
        <div>
          <div className="text-white fw-bold" style={{ fontSize: ".85rem" }}>{toast.msg}</div>
          <div className="text-white-50" style={{ fontSize: ".72rem" }}>Scholaris Portal · just now</div>
        </div>
      </div>
    </div>
  ) : null;

  return { toast: (msg: string, tone: "teal" | "rose" | "brand" = "teal") => setToast({ msg, tone }), toastNode: node };
}

/* ==========================================================================
   Empty state
   ========================================================================== */
export function Empty({ icon, title, note }: { icon: ReactNode; title: string; note?: string }) {
  return (
    <div className="empty">
      <div className="d-inline-flex align-items-center justify-content-center rounded-4 mb-3" style={{ width: 54, height: 54, background: "var(--brand-100)", color: "var(--brand-700)" }}>{icon}</div>
      <h4 className="fs-6 fw-800 mb-1">{title}</h4>
      {note && <p className="text-muted-2 mb-0 fs-8">{note}</p>}
    </div>
  );
}

/* ==========================================================================
   Progress bar
   ========================================================================== */
export function Progress({ value, tone = "brand" }: { value: number; tone?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current, { width: 0 }, { width: `${Math.min(100, Math.max(0, value))}%`, duration: 1.2, ease: "power3.out" });
  }, [value]);
  const bg = tone === "teal" ? "linear-gradient(90deg,#14b8a6,#0d9488)" : tone === "amber" ? "linear-gradient(90deg,#fbbf24,#f59e0b)" : tone === "rose" ? "linear-gradient(90deg,#f87171,#e0344b)" : "linear-gradient(90deg,#3b7ae4,#2563c9)";
  return (
    <div className="prog">
      <div ref={ref} className="prog__bar" style={{ background: bg }} />
    </div>
  );
}
