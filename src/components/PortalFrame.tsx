import { useState, type ReactNode } from "react";
import { useRipple } from "../lib/gsap";
import { LogoMark, IconMenu, IconLogout, IconX } from "./Icons";
import { SCHOOL, type Person } from "../data/mock";
import { Avatar } from "./ui";
import { LargeTextToggle, HelpBox } from "./simple";
import type { Role } from "../App";

export type NavItem = { id: string; label: string; icon: ReactNode; badge?: string };

const ROLE_LABEL: Record<Role, string> = {
  student: "Student", teacher: "Teacher", admin: "School Admin",
};

/* ==========================================================================
   Portal shell — one big menu, one obvious Log out, help on every page
   ========================================================================== */
export default function PortalFrame({
  person, role, nav, active, onNav, onExit, onSwitch, pageTitle, pageNote, children,
}: {
  person: Person; role: Role; nav: NavItem[]; active: string; onNav: (id: string) => void;
  onExit: () => void; onSwitch?: (r: Role) => void; pageTitle: string; pageNote: string; children: ReactNode;
}) {
  useRipple();
  const [open, setOpen] = useState(false);

  const go = (id: string) => {
    onNav(id);
    setOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="portal-shell">
      {/* ---------------- sidebar / menu ---------------- */}
      <aside className={`portal-side no-print ${open ? "is-open" : ""}`} aria-label="Main menu">
        <div className="d-flex align-items-center gap-2 px-1 mb-4">
          <LogoMark size={36} />
          <div className="lh-1">
            <div className="display-font fw-800 text-white" style={{ fontSize: "1rem" }}>Scholaris</div>
            <div style={{ fontSize: ".72rem", color: "#9fb0cf", marginTop: 3 }}>{ROLE_LABEL[role]} portal</div>
          </div>
          <button className="btn btn-ghost btn-sm ms-auto d-lg-none" data-click onClick={() => setOpen(false)} aria-label="Close menu">
            <IconX size={16} />
          </button>
        </div>

        <div className="eyebrow px-2 mb-2" style={{ color: "#7f95bb" }}>Menu</div>
        <nav className="d-flex flex-column gap-1">
          {nav.map((n) => (
            <button
              key={n.id}
              data-click
              className={`portal-side__link ${active === n.id ? "is-active" : ""}`}
              onClick={() => go(n.id)}
              aria-current={active === n.id ? "page" : undefined}
            >
              <span className="d-inline-flex" style={{ width: 22 }}>{n.icon}</span>
              <span>{n.label}</span>
              {n.badge && <span className="ms-auto badge-x badge-x--amber">{n.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-4 d-flex flex-column gap-3" style={{ borderTop: "1px solid rgba(255,255,255,.1)" }}>
          <div className="d-flex align-items-center gap-3 px-1">
            <Avatar initials={person.initials} color={person.color} size={42} />
            <div className="lh-sm overflow-hidden">
              <div className="text-white fw-bold text-truncate">{person.name}</div>
              <div className="text-truncate" style={{ color: "#9fb0cf", fontSize: ".78rem" }}>{person.id}</div>
            </div>
          </div>
          <button className="btn btn-ghost w-100" data-click onClick={onExit}>
            <span className="d-inline-flex align-items-center gap-2"><IconLogout size={18} /> Log out</span>
          </button>

          {onSwitch && (
            <div className="p-3 rounded-4" style={{ background: "rgba(255,255,255,.05)" }}>
              <div className="eyebrow mb-2" style={{ fontSize: ".55rem", color: "#7f95bb" }}>Demo · try another portal</div>
              <div className="d-flex flex-wrap gap-1">
                {(["student", "teacher", "admin"] as Role[]).filter((r) => r !== role).map((r) => (
                  <button
                    key={r} data-click onClick={() => onSwitch(r)}
                    className="btn btn-sm text-capitalize"
                    style={{ background: "rgba(255,255,255,.1)", color: "#fff", minHeight: 34, padding: ".3rem .7rem", fontSize: ".8rem" }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ---------------- main ---------------- */}
      <div className="portal-main">
        <div className="portal-topbar no-print d-flex align-items-center gap-2">
          <button className="btn btn-soft d-lg-none" data-click onClick={() => setOpen(true)} aria-label="Open menu">
            <span className="d-inline-flex align-items-center gap-2"><IconMenu size={20} /> <span className="d-none d-sm-inline">Menu</span></span>
          </button>
          <div className="d-none d-lg-block fs-8 text-muted-2">{SCHOOL.name} · {SCHOOL.session} session · Second Term</div>
          <div className="ms-auto d-flex align-items-center gap-2">
            <LargeTextToggle />
            <button className="btn btn-soft" data-click onClick={onExit}>
              <span className="d-inline-flex align-items-center gap-2"><IconLogout size={18} /> <span className="d-none d-sm-inline">Log out</span></span>
            </button>
          </div>
        </div>

        <div className="portal-body">
          <div className="mb-4 no-print d-flex flex-wrap align-items-end justify-content-between gap-3">
            <div>
              <h1 className="display-font mb-1" style={{ fontSize: "clamp(1.5rem,2.8vw,2.1rem)" }}>{pageTitle}</h1>
              <p className="text-muted-2 mb-0">{pageNote}</p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Avatar initials={person.initials} color={person.color} size={40} />
              <div className="lh-sm">
                <div className="fw-bold">{person.name}</div>
                <div className="fs-8 text-muted-2">{ROLE_LABEL[role]}</div>
              </div>
            </div>
          </div>

          {children}

          <div className="mt-5"><HelpBox /></div>
        </div>
      </div>

      {open && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-lg-none" style={{ background: "rgba(8,13,28,.5)", zIndex: 19 }} onClick={() => setOpen(false)} />
      )}
    </div>
  );
}
