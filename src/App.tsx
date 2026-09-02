import { useEffect, useRef, useState } from "react";
import Landing from "./pages/Landing";
import StudentPortal from "./portals/StudentPortal";
import TeacherPortal from "./portals/TeacherPortal";
import AdminPortal from "./portals/AdminPortal";
import { Btn } from "./components/ui";
import { Notice, LargeTextToggle } from "./components/simple";
import { gsap, useRipple } from "./lib/gsap";
import { LogoMark, IconCap, IconTeacher, IconGrid, IconArrowRight, IconEye, IconPhone } from "./components/Icons";
import { SCHOOL, HELP, STUDENT_ACCOUNTS, TEACHER, ADMIN, findStudentByLogin } from "./data/mock";

export type Role = "student" | "teacher" | "admin";
type View = { kind: "landing" } | { kind: "gate"; role: Role } | { kind: "portal"; role: Role; studentId?: string };

export default function App() {
  const [view, setView] = useState<View>({ kind: "landing" });
  const viewKey = view.kind + ("role" in view ? view.role : "") + ("studentId" in view ? view.studentId ?? "" : "");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    gsap.fromTo("#app-root", { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power2.out" });
  }, [viewKey]);

  const goPortal = (r: Role, studentId?: string) => setView({ kind: "portal", role: r, studentId });
  const exit = () => setView({ kind: "landing" });

  return (
    <div id="app-root">
      {view.kind === "landing" && <Landing onEnter={(r) => setView({ kind: "gate", role: r })} />}

      {view.kind === "gate" && (
        <LoginGate role={view.role} onCancel={exit} onRole={(r) => setView({ kind: "gate", role: r })} onDone={(sid) => goPortal(view.role, sid)} />
      )}

      {view.kind === "portal" && view.role === "student" && (
        <StudentPortal studentId={view.studentId ?? STUDENT_ACCOUNTS[0].id} onExit={exit} onSwitch={goPortal} />
      )}
      {view.kind === "portal" && view.role === "teacher" && <TeacherPortal onExit={exit} onSwitch={goPortal} />}
      {view.kind === "portal" && view.role === "admin" && <AdminPortal onExit={exit} onSwitch={goPortal} />}
    </div>
  );
}

/* ==================================================================== */
/*                          LOGIN GATE                                  */
/* ==================================================================== */
type GateMeta = { title: string; idLabel: string; idHint: string; secretLabel: string; secretHint: string; icon: typeof IconCap; tone: string; numeric: boolean };

const GATE: Record<Role, GateMeta> = {
  student: {
    title: "Student login", idLabel: "Admission Number", idHint: "It is written on your school ID card and on your login slip.",
    secretLabel: "PIN (4 numbers)", secretHint: "The school gave your PIN to you and your parent or guardian.",
    icon: IconCap, tone: "#2563c9", numeric: true,
  },
  teacher: {
    title: "Teacher login", idLabel: "Staff ID", idHint: "Example: STF-0873",
    secretLabel: "Password", secretHint: "Given to you by the ICT office.",
    icon: IconTeacher, tone: "#7c3aed", numeric: false,
  },
  admin: {
    title: "School Admin login", idLabel: "Admin ID", idHint: "Example: ADM-0007",
    secretLabel: "Password", secretHint: "For administrators only.",
    icon: IconGrid, tone: "#b45309", numeric: false,
  },
};

function defaultsFor(role: Role) {
  if (role === "student") return { id: STUDENT_ACCOUNTS[0].admissionNo, secret: STUDENT_ACCOUNTS[0].pin };
  if (role === "teacher") return { id: TEACHER.id, secret: "demo1234" };
  return { id: ADMIN.id, secret: "demo1234" };
}

function LoginGate({ role, onCancel, onDone, onRole }: {
  role: Role; onCancel: () => void; onDone: (studentId?: string) => void; onRole: (r: Role) => void;
}) {
  useRipple();
  const g = GATE[role];
  const Icon = g.icon;
  const [id, setId] = useState(() => defaultsFor(role).id);
  const [secret, setSecret] = useState(() => defaultsFor(role).secret);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const d = defaultsFor(role);
    setId(d.id); setSecret(d.secret); setError(""); setLoading(false);
    if (cardRef.current) gsap.fromTo(cardRef.current, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: "power3.out" });
  }, [role]);

  const fail = (msg: string) => {
    setError(msg);
    if (cardRef.current) gsap.fromTo(cardRef.current, { x: -10 }, { x: 0, duration: 0.6, ease: "elastic.out(1,.3)" });
  };

  const submit = () => {
    setError("");
    if (!id.trim() || !secret.trim()) return fail("Please fill in both boxes before pressing Log in.");
    let studentId: string | undefined;
    if (role === "student") {
      const acc = findStudentByLogin(id, secret);
      if (!acc) return fail("We could not find a student with that Admission Number and PIN. Please check the numbers and try again.");
      if (acc.status === "locked") return fail("This login is locked because the PIN was typed wrongly 3 times. Please call the school office to unlock it.");
      studentId = acc.id;
    } else if (secret.trim() !== "demo1234") {
      return fail("That password is not correct. Please try again, or call the school office.");
    }
    setLoading(true);
    window.setTimeout(() => onDone(studentId), 1100);
  };

  const pick = (i: number) => { setId(STUDENT_ACCOUNTS[i].admissionNo); setSecret(STUDENT_ACCOUNTS[i].pin); setError(""); };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: "linear-gradient(160deg,#060a17,#0d1426 45%,#0b1c2e)" }}>
      <div className="container-xl d-flex align-items-center justify-content-between py-3 gap-2">
        <button className="btn btn-ghost" data-click onClick={onCancel}>← Back to the main page</button>
        <LargeTextToggle dark />
      </div>

      <div className="flex-grow-1 d-flex align-items-center justify-content-center px-3 pb-5">
        <div className="w-100" style={{ maxWidth: 560 }}>
          <div className="text-center mb-4 text-white">
            <LogoMark size={54} />
            <div className="display-font fw-800 mt-2" style={{ fontSize: "1.1rem" }}>{SCHOOL.name}</div>
          </div>

          <div ref={cardRef} className="login-card">
            <div className="d-flex align-items-center gap-3 mb-4">
              <span className="d-grid rounded-4 flex-shrink-0" style={{ width: 60, height: 60, placeItems: "center", background: `${g.tone}1a`, color: g.tone }}>
                <Icon size={30} />
              </span>
              <div>
                <h1 className="fw-800 mb-0" style={{ fontSize: "1.45rem" }}>{g.title}</h1>
                <div className="text-muted-2">Type your details, then press the big blue button.</div>
              </div>
            </div>

            {role === "student" && (
              <div className="mb-4 p-3 rounded-4" style={{ background: "var(--brand-50)", border: "1px dashed var(--brand-400)" }}>
                <div className="fw-800 fs-8 text-brand mb-2">Demo — press a pupil to fill in their login</div>
                <div className="d-flex flex-wrap gap-2">
                  {[0, 1, 3].map((i) => (
                    <button key={i} data-click className="btn btn-sm" onClick={() => pick(i)}
                      style={{ background: id === STUDENT_ACCOUNTS[i].admissionNo ? "var(--brand-600)" : "#fff", color: id === STUDENT_ACCOUNTS[i].admissionNo ? "#fff" : "var(--brand-700)", border: "1.5px solid var(--brand-400)" }}>
                      {STUDENT_ACCOUNTS[i].name} · {STUDENT_ACCOUNTS[i].className}
                    </button>
                  ))}
                  <button data-click className="btn btn-sm" onClick={() => pick(7)} style={{ background: "#fff", color: "var(--rose-500)", border: "1.5px solid #f7b4bd" }}>
                    Locked account (see the message)
                  </button>
                </div>
              </div>
            )}

            <div className="mb-3">
              <label className="form-label" htmlFor="login-id">{g.idLabel}</label>
              <input id="login-id" className="form-control form-control-lg mono" value={id} onChange={(e) => setId(e.target.value)} autoComplete="off" />
              <div className="fs-8 text-muted-2 mt-1">{g.idHint}</div>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="login-secret">{g.secretLabel}</label>
              <input id="login-secret" type={show ? "text" : "password"} inputMode={g.numeric ? "numeric" : undefined} maxLength={g.numeric ? 4 : undefined}
                className={`form-control form-control-lg ${g.numeric ? "pin-input" : ""}`} value={secret}
                onChange={(e) => setSecret(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
              <label className="d-flex align-items-center gap-2 mt-2 text-muted-2" style={{ cursor: "pointer" }}>
                <input type="checkbox" className="form-check-input mt-0" checked={show} onChange={(e) => setShow(e.target.checked)} style={{ width: 22, height: 22 }} />
                <IconEye size={16} /> Show what I typed
              </label>
              <div className="fs-8 text-muted-2 mt-1">{g.secretHint}</div>
            </div>

            {error && <div className="mb-3"><Notice tone="rose" title="Something is not right">{error}</Notice></div>}

            <Btn full size="lg" onClick={submit} disabled={loading}>
              {loading ? <span className="d-inline-flex align-items-center gap-2"><span className="spinner-border spinner-border-sm" /> Please wait…</span>
                : <span className="d-inline-flex align-items-center gap-2">Log in <IconArrowRight size={18} /></span>}
            </Btn>

            <div className="d-flex align-items-center gap-2 fs-8 text-muted-2 mt-3 justify-content-center text-center">
              <IconPhone size={14} /> Forgot your details? Call {HELP.phone} ({HELP.hours})
            </div>
          </div>

          <div className="mt-4 text-center">
            <div className="fs-8 mb-2" style={{ color: "#8fa6cd" }}>Not a {role}? Choose the right login:</div>
            <div className="d-flex flex-wrap justify-content-center gap-2">
              {(Object.keys(GATE) as Role[]).filter((r) => r !== role).map((r) => (
                <button key={r} data-click onClick={() => onRole(r)} className="btn btn-ghost btn-sm">{GATE[r].title.replace(" login", "")}</button>
              ))}
            </div>
          </div>

          <p className="text-center fs-8 mt-3 mb-0" style={{ color: "#6f86ad" }}>
            Demo environment — details are pre-filled for you. No real payment is taken.
          </p>
        </div>
      </div>
    </div>
  );
}
