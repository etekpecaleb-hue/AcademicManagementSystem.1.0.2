import { useEffect, useMemo, useState } from "react";
import { usePageEnter } from "../lib/gsap";
import PortalFrame, { type NavItem } from "../components/PortalFrame";
import { Btn, Panel, Badge, Modal, useToast } from "../components/ui";
import {
  IconGrid, IconUpload, IconUsers, IconCalendar, IconCheck, IconCheckCircle, IconAlert,
  IconTrophy, IconClock, IconArrowRight, IconSparkle, CheckBurst, IconPlus, IconLock,
} from "../components/Icons";
import {
  INITIAL_ASSIGNMENTS, INITIAL_SCORESHEETS, TEACHERS, type ClassAssignment, type ScoreSheet, type Teacher, SESSION,
} from "../data/mock";
import type { Role } from "../App";

/* demo teacher (the one that logs in with STF-0873) */
const DEMO_TEACHER: Teacher = { id: "STF-0873", name: "Mr. Tunde Bakare", subject: "Mathematics", initials: "TB", color: "linear-gradient(135deg,#7c3aed,#2563c9)", staffId: "STF-0873", email: "t.bakare@scholaris.edu.ng", phone: "0803 555 0873", joined: "2019" };
const STAFF_LOOKUP: Record<string, Teacher> = Object.fromEntries(TEACHERS.map(t => [t.id, t]));
const STAFF_LOOKUP_WITH_LOGIN: Record<string, Teacher> = { ...STAFF_LOOKUP, [DEMO_TEACHER.id]: DEMO_TEACHER };

export type AssignmentsApi = {
  assignments: ClassAssignment[];
  history: any[];
  scoreSheets: ScoreSheet[];
  assign: (a: ClassAssignment, h: any) => void;
  reassign: (assignmentId: string, newTeacherId: string, by: string, note?: string) => void;
  remove: (assignmentId: string, by: string, note?: string) => void;
  updateSheet: (sheetId: string, patch: Partial<ScoreSheet>) => void;
};

declare global { interface Window { __auraStore?: AssignmentsApi } }
let __historyCounter = 200;
function nextHistId() { return `H-${++__historyCounter}`; }
let __sheetCounter = 100;
function nextSheetId() { return `SS-${++__sheetCounter}`; }

export function getStore(): AssignmentsApi {
  if (typeof window === "undefined") return { assignments: INITIAL_ASSIGNMENTS, history: [], scoreSheets: INITIAL_SCORESHEETS, assign: () => {}, reassign: () => {}, remove: () => {}, updateSheet: () => {} };
  if (!window.__auraStore) {
    window.__auraStore = {
      assignments: [...INITIAL_ASSIGNMENTS],
      history: [],
      scoreSheets: [...INITIAL_SCORESHEETS],
      assign: (a, h) => {
        const s = getStore();
        s.assignments = [...s.assignments.filter(x => x.id !== a.id), a];
        s.history = [h, ...s.history];
        const id = nextSheetId();
        s.scoreSheets = [{ id, classArmId: a.classArmId, classLabel: prettyArm(a.classArmId) + " · " + a.subject, subject: a.subject, teacherId: a.teacherId, teacherName: STAFF_LOOKUP_WITH_LOGIN[a.teacherId]?.name ?? "—", term: "Second Term", students: 24, entered: 0, average: 0, state: "draft", lastUpdate: "— (not started)" }, ...s.scoreSheets];
      },
      reassign: (assignmentId, newTeacherId, by, note) => {
        const s = getStore();
        const cur = s.assignments.find(a => a.id === assignmentId);
        if (!cur) return;
        const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
        const from = STAFF_LOOKUP_WITH_LOGIN[cur.teacherId]?.name ?? cur.teacherId;
        const to = STAFF_LOOKUP_WITH_LOGIN[newTeacherId]?.name ?? newTeacherId;
        s.assignments = s.assignments.map(a => a.id === assignmentId ? { ...a, teacherId: newTeacherId, assignedBy: "Admin (in-app)", assignedAt: today } : a);
        const arm = prettyArm(cur.classArmId);
        s.history = [
          { id: nextHistId(), classArmId: cur.classArmId, classLabel: arm, subject: cur.subject, teacherId: cur.teacherId, teacherName: from, action: "reassigned_from", doneBy: by, date: today, note },
          { id: nextHistId(), classArmId: cur.classArmId, classLabel: arm, subject: cur.subject, teacherId: newTeacherId, teacherName: to, action: "reassigned_to", doneBy: by, date: today },
          ...s.history,
        ];
        s.scoreSheets = s.scoreSheets.map(sc => sc.classArmId === cur.classArmId && sc.subject === cur.subject ? { ...sc, teacherId: newTeacherId, teacherName: to } : sc);
      },
      remove: (assignmentId, by, note) => {
        const s = getStore();
        const cur = s.assignments.find(a => a.id === assignmentId);
        if (!cur) return;
        const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
        const from = STAFF_LOOKUP_WITH_LOGIN[cur.teacherId]?.name ?? cur.teacherId;
        s.history = [{ id: nextHistId(), classArmId: cur.classArmId, classLabel: prettyArm(cur.classArmId), subject: cur.subject, teacherId: cur.teacherId, teacherName: from, action: "removed", doneBy: by, date: today, note }, ...s.history];
        s.assignments = s.assignments.filter(a => a.id !== assignmentId);
        s.scoreSheets = s.scoreSheets.filter(sc => !(sc.classArmId === cur.classArmId && sc.subject === cur.subject));
      },
      updateSheet: (sheetId, patch) => {
        const s = getStore();
        s.scoreSheets = s.scoreSheets.map(sc => sc.id === sheetId ? { ...sc, ...patch } : sc);
      },
    };
  }
  return window.__auraStore;
}

function prettyArm(id: string) {
  return id.replace("CLS-", "").replace(/[A-Z]/g, (m) => " " + m).trim();
}

export default function TeacherPortal({ onExit, onSwitch, staffId }: { onExit: () => void; onSwitch: (r: Role) => void; staffId?: string }) {
  const me = STAFF_LOOKUP_WITH_LOGIN[staffId ?? DEMO_TEACHER.id] ?? DEMO_TEACHER;
  const person = { id: me.staffId, name: me.name, role: `Teacher · ${me.subject}`, initials: me.initials, color: me.color, email: me.email };

  const [tab, setTab] = useState("home");
  const [refresh, setRefresh] = useState(0);
  useEffect(() => { const t = window.setInterval(() => setRefresh((r) => r + 1), 2000); return () => window.clearInterval(t); }, []);
  void refresh;

  const store = getStore();
  const myAssignments = useMemo(() => store.assignments.filter((a) => a.teacherId === me.id), [store, me.id, refresh]);
  const mySheets = useMemo(() => store.scoreSheets.filter((s) => s.teacherId === me.id), [store, me.id, refresh]);
  const myHistory = useMemo(() => store.history.filter((h: any) => h.teacherId === me.id || h.previousTeacherId === me.id), [store, me.id, refresh]);

  const [activeClassId, setActiveClassId] = useState<string | null>(myAssignments[0]?.classArmId ?? null);
  useEffect(() => { if (!activeClassId && myAssignments[0]) setActiveClassId(myAssignments[0].classArmId); }, [myAssignments, activeClassId]);

  const nav: NavItem[] = [
    { id: "home", label: "Home", icon: <IconGrid size={19} /> },
    { id: "scores", label: "Enter Scores", icon: <IconUpload size={19} />, badge: mySheets.filter((s) => s.state !== "published" && s.state !== "approved").length > 0 ? `${mySheets.filter((s) => s.state !== "published" && s.state !== "approved").length} to do` : undefined },
    { id: "classes", label: "My Classes", icon: <IconUsers size={19} />, badge: `${myAssignments.length}` },
    { id: "history", label: "My History", icon: <IconClock size={19} /> },
    { id: "timetable", label: "My Timetable", icon: <IconCalendar size={19} /> },
  ];

  const titles: Record<string, [string, string]> = {
    home: [`Welcome, ${me.name}`, `You teach ${me.subject}. Here are the classes the office has assigned to you.`],
    scores: ["Enter Scores", "Choose a class, type each pupil's test and exam scores, then send them to the Exam Office."],
    classes: ["My Classes", "The classes you teach, with their size and score-sheet status."],
    history: ["My Assignment History", "Every time a class was added, removed or moved to a different teacher."],
    timetable: ["My Timetable", "Your lessons for this week."],
  };

  const activeSheet = mySheets.find((s) => s.classArmId === activeClassId) ?? mySheets[0];

  return (
    <PortalFrame
      person={person} role="teacher" nav={nav} active={tab} onNav={setTab} onExit={onExit} onSwitch={onSwitch}
      pageTitle={titles[tab][0]} pageNote={titles[tab][1]}
    >
      <div ref={usePageEnter(tab)}>
        {tab === "home" && <HomeView me={me} assignments={myAssignments} sheets={mySheets} history={myHistory} onGo={(t) => setTab(t)} />}
        {tab === "scores" && (activeSheet ? <ScoresView sheet={activeSheet} onUpdate={(p) => { store.updateSheet(activeSheet.id, p); setRefresh((r) => r + 1); }} onSwitchClass={(cid) => setActiveClassId(cid)} all={mySheets} /> : <NoClasses onGoHome={() => setTab("home")} />)}
        {tab === "classes" && <ClassesView assignments={myAssignments} sheets={mySheets} onOpen={(cid) => { setActiveClassId(cid); setTab("scores"); }} />}
        {tab === "history" && <HistoryView me={me} allHistory={store.history} />}
        {tab === "timetable" && <TimetableView me={me} />}
      </div>
    </PortalFrame>
  );
}

function HomeView({ me, assignments, sheets, history, onGo }: { me: Teacher; assignments: ClassAssignment[]; sheets: ScoreSheet[]; history: any[]; onGo: (t: string) => void }) {
  void me;
  const drafts = sheets.filter((s) => s.state === "draft" || s.state === "submitted");
  const totalStudents = sheets.reduce((a, s) => a + s.students, 0);
  return (
    <>
      <div className="notice notice--brand mb-4">
        <span className="notice__icon"><IconLock size={20} /></span>
        <div>
          <div className="notice__title">You only see classes the school office has assigned to you</div>
          <div className="notice__body">If you need to teach an extra class, the admin must add you to it from the dashboard. Any score sheets you previously typed remain on your record.</div>
        </div>
      </div>

      {drafts.length > 0 && (
        <div className="mb-4">
          <div className="notice notice--amber">
            <span className="notice__icon"><IconAlert size={20} /></span>
            <div>
              <div className="notice__title">{drafts.length} class{drafts.length > 1 ? "es" : ""} still need scores</div>
              <div className="notice__body">{drafts.map((d) => d.classLabel + " · " + d.subject).join(" · ")}</div>
            </div>
            <Btn onClick={() => onGo("scores")}><span className="d-inline-flex align-items-center gap-1">Enter scores <IconArrowRight size={14} /></span></Btn>
          </div>
        </div>
      )}

      <h2 className="fs-5 fw-800 mb-3">What would you like to do?</h2>
      <div className="row g-3 mb-4">
        <div className="col-md-6"><BigAction icon={<IconUpload size={28} />} title="Enter scores" note="Type test and exam scores for the classes you teach" tone="#7c3aed" onClick={() => onGo("scores")} /></div>
        <div className="col-md-6"><BigAction icon={<IconUsers size={28} />} title="My classes" note={`${assignments.length} class${assignments.length > 1 ? "es" : ""} · ${totalStudents} pupils in total`} tone="#2563c9" onClick={() => onGo("classes")} /></div>
        <div className="col-md-6"><BigAction icon={<IconClock size={28} />} title="My assignment history" note="Every time a class was added, removed or moved to a new teacher" tone="#0d9488" onClick={() => onGo("history")} /></div>
        <div className="col-md-6"><BigAction icon={<IconCalendar size={28} />} title="My timetable" note="Your lessons for this week" tone="#b45309" onClick={() => onGo("timetable")} /></div>
      </div>

      <div className="row g-3 mb-4">
        {[
          { l: "Classes I teach", v: String(assignments.length), i: <IconUsers size={20} />, t: "#2563c9" },
          { l: "Total pupils", v: String(totalStudents), i: <IconTrophy size={20} />, t: "#0d9488" },
          { l: "Score sheets done", v: String(sheets.filter((s) => s.state === "published" || s.state === "approved").length), i: <IconCheckCircle size={20} />, t: "#7c3aed" },
          { l: "Still to do", v: String(drafts.length), i: <IconAlert size={20} />, t: "#f59e0b" },
        ].map((f) => (
          <div className="col-6 col-lg-3" key={f.l}>
            <div className="card-x p-3 h-100 d-flex align-items-center gap-3">
              <span className="d-grid rounded-3 flex-shrink-0" style={{ width: 46, height: 46, placeItems: "center", background: `${f.t}1a`, color: f.t }}>{f.i}</span>
              <div className="lh-sm">
                <div className="fs-8 text-muted-2">{f.l}</div>
                <div className="fw-800" style={{ fontSize: "1.1rem" }}>{f.v}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Panel title="My recent assignments" subtitle="What was added, removed or moved to another teacher">
        {history.length === 0 ? <div className="text-muted-2">Nothing yet — your classes have not changed this session.</div> : (
          <div className="d-flex flex-column gap-2">
            {history.slice(0, 4).map((h: any) => (
              <div key={h.id} className="d-flex align-items-start gap-3 p-3 rounded-4" style={{ background: "var(--slate-50)" }}>
                <span className="d-grid rounded-3 flex-shrink-0" style={{ width: 36, height: 36, placeItems: "center", background: h.action === "assigned" ? "var(--teal-100)" : h.action === "removed" ? "var(--rose-100)" : "var(--brand-100)", color: h.action === "assigned" ? "var(--teal-600)" : h.action === "removed" ? "var(--rose-500)" : "var(--brand-700)" }}>
                  {h.action === "assigned" ? <IconPlus size={16} /> : h.action === "removed" ? <IconLock size={16} /> : <IconArrowRight size={16} />}
                </span>
                <div className="lh-sm">
                  <div className="fw-bold">
                    {h.action === "assigned" && `You were given ${h.classLabel} · ${h.subject}`}
                    {h.action === "removed" && `${h.classLabel} · ${h.subject} was taken from you`}
                    {h.action === "reassigned_to" && `You took over ${h.classLabel} · ${h.subject}`}
                    {h.action === "reassigned_from" && `${h.classLabel} · ${h.subject} was given to another teacher`}
                  </div>
                  <div className="fs-8 text-muted-2">By {h.doneBy} · {h.date}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}

function NoClasses({ onGoHome }: { onGoHome: () => void }) {
  return (
    <div className="notice notice--amber">
      <span className="notice__icon"><IconLock size={20} /></span>
      <div>
        <div className="notice__title">You do not have any classes assigned to you yet</div>
        <div className="notice__body">Once the school office assigns you to a class on the dashboard, you can enter scores here.</div>
      </div>
      <Btn onClick={onGoHome}>Back to Home</Btn>
    </div>
  );
}

export function BigAction({ icon, title, note, tone = "#2563c9", onClick, badge }: { icon: React.ReactNode; title: string; note?: string; tone?: string; onClick: () => void; badge?: string }) {
  return (
    <button type="button" data-click className="big-tile" onClick={onClick}>
      <span className="big-tile__icon" style={{ background: `${tone}1a`, color: tone }}>{icon}</span>
      <span style={{ minWidth: 0 }}>
        <span className="big-tile__title d-flex align-items-center gap-2">{title}{badge && <span className="badge-x badge-x--amber">{badge}</span>}</span>
        {note && <span className="big-tile__note d-block">{note}</span>}
      </span>
      <span className="big-tile__arrow"><IconArrowRight size={24} /></span>
    </button>
  );
}

function ScoresView({ sheet, onUpdate, onSwitchClass, all }: { sheet: ScoreSheet; onUpdate: (p: Partial<ScoreSheet>) => void; onSwitchClass: (cid: string) => void; all: ScoreSheet[] }) {
  const { toast, toastNode } = useToast();
  const [confirm, setConfirm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [demoEntries, setDemoEntries] = useState<Record<number, { ca: number; exam: number }>>({});

  const firstNames = ["Aisha", "Daniel", "Chiamaka", "Emeka", "Funmi", "Grace", "Halima", "Ifeanyi", "Jasmine", "Kelechi", "Lola", "Musa", "Ngozi", "Oluwaseun", "Precious", "Quadri", "Ruth", "Samuel", "Tari", "Uche", "Victor", "Wale", "Zainab", "Tunde", "Sade", "Musa A.", "Eki", "Tope", "Bisi", "Dayo"];
  const lastNames = ["Bello", "Okafor", "Okonkwo", "Nwosu", "Lawal", "Mbah", "Sani", "Okonkwo", "Uche", "Obi", "Adegoke", "Danjuma", "Eze", "Ajayi", "Ihuoma", "Bello", "Alabi", "Effiong", "Ebi", "Nnamdi", "Igwe", "Ogundipe", "Idris", "Akin", "Ilesanmi", "Abdullahi", "Ayo", "Olalekan", "Lawal", "Babatunde"];
  const rows = Array.from({ length: sheet.students }, (_, _i) => {
    const fn = firstNames[_i % firstNames.length];
    const ln = lastNames[(_i * 3) % lastNames.length];
    const has = sheet.entered > _i;
    return {
      id: `${sheet.id}-${_i}`,
      name: `${fn} ${ln}`,
      admissionNo: `SIA/2024/${String((_i + 1) * 107).padStart(4, "0")}`,
      ca: has ? 20 + (_i * 3) % 18 : 0,
      exam: has ? 30 + (_i * 7) % 26 : 0,
    };
  });

  const setScore = (i: number, k: "ca" | "exam", v: number) => setDemoEntries((p) => ({ ...p, [i]: { ca: p[i]?.ca ?? rows[i].ca, exam: p[i]?.exam ?? rows[i].exam, [k]: Math.max(0, Math.min(k === "ca" ? 40 : 60, v)) } }));

  const fillSample = () => {
    setDemoEntries(Object.fromEntries(rows.map((_, i) => [i, { ca: 18 + ((i * 7) % 18), exam: 30 + ((i * 5) % 26) }])));
    toast("Sample scores filled in (you can change them)");
  };

  const send = () => {
    setConfirm(false);
    const avg = Math.round((rows.reduce((a, r, i) => a + ((demoEntries[i]?.ca ?? r.ca) + (demoEntries[i]?.exam ?? r.exam)), 0) / sheet.students) * 10) / 10;
    onUpdate({ state: "submitted", entered: sheet.students, average: avg, lastUpdate: new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) });
    setEditing(false);
    toast("Scores sent to the Exam Office");
  };

  return (
    <>
      <div className="notice notice--brand mb-4">
        <span className="notice__icon"><IconUpload size={20} /></span>
        <div>
          <div className="notice__title">How to enter scores — 3 easy steps</div>
          <div className="notice__body">
            <strong>1.</strong> Press the class you want below. &nbsp;
            <strong>2.</strong> Type each pupil's <strong>Test score (out of 40)</strong> and <strong>Exam score (out of 60)</strong> — the total and grade appear by themselves. &nbsp;
            <strong>3.</strong> When every pupil has scores, press <strong>"Send to Exam Office"</strong>.
          </div>
        </div>
      </div>

      <div className="card-x p-3 p-md-4 mb-4 no-print">
        <div className="fw-800 mb-2" style={{ fontSize: "1.05rem" }}>1. Which class?</div>
        <div className="d-flex flex-wrap gap-2">
          {all.map((s) => {
            const on = s.id === sheet.id;
            return (
              <button key={s.id} data-click onClick={() => onSwitchClass(s.classArmId)} className="btn btn-sm"
                style={{ background: on ? "var(--brand-600)" : "#fff", color: on ? "#fff" : "var(--brand-700)", border: "1.5px solid var(--brand-400)" }}>
                {s.classLabel} · {s.subject} <span className="ms-1" style={{ opacity: 0.8, fontSize: ".8rem" }}>({s.students} pupils)</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="card-x p-3 p-md-4 mb-4">
        <div className="d-flex flex-wrap justify-content-between gap-3 mb-3">
          <div>
            <div className="fw-800" style={{ fontSize: "1.1rem" }}>2. Scores for {sheet.classLabel} · {sheet.subject}</div>
            <div className="fs-8 text-muted-2">{SESSION} · {sheet.entered}/{sheet.students} already entered</div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <Btn variant="soft" onClick={fillSample}><span className="d-inline-flex align-items-center gap-1"><IconSparkle size={14} /> Fill sample scores</span></Btn>
            {!editing ? (
              <Btn variant="soft" onClick={() => setEditing(true)}><span className="d-inline-flex align-items-center gap-1"><IconUpload size={14} /> Edit scores</span></Btn>
            ) : (
              <Btn variant="teal" onClick={() => setConfirm(true)} disabled={sheet.state === "submitted" || sheet.state === "published"}><span className="d-inline-flex align-items-center gap-1"><IconCheck size={14} /> Send to Exam Office</span></Btn>
            )}
          </div>
        </div>

        {(sheet.state === "submitted" || sheet.state === "approved" || sheet.state === "published") && <div className="notice notice--teal mb-3"><span className="notice__icon"><IconCheckCircle size={20} /></span><div><div className="notice__title">Scores {sheet.state} ({sheet.lastUpdate})</div><div className="notice__body">You cannot change them now. The Exam Office will approve and publish them.</div></div></div>}

        <div className="table-responsive">
          <table className="table-x">
            <thead>
              <tr><th>#</th><th>Pupil</th><th>Admission No.</th><th>Test (out of 40)</th><th>Exam (out of 60)</th><th>Total</th><th>Grade</th></tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const ca = demoEntries[i]?.ca ?? r.ca;
                const exam = demoEntries[i]?.exam ?? r.exam;
                const total = ca + exam;
                const grade = total >= 75 ? "A1" : total >= 70 ? "B2" : total >= 65 ? "B3" : total >= 60 ? "C4" : total >= 55 ? "C5" : total >= 50 ? "C6" : total >= 45 ? "D7" : total >= 40 ? "E8" : "F9";
                const locked = !editing || sheet.state === "submitted" || sheet.state === "approved" || sheet.state === "published";
                return (
                  <tr key={r.id}>
                    <td className="mono text-muted-2">{i + 1}</td>
                    <td className="fw-bold text-ink">{r.name}</td>
                    <td className="mono fs-8">{r.admissionNo}</td>
                    <td><input type="number" className="form-control form-control-sm mono" value={ca || ""} disabled={locked} onChange={(e) => setScore(i, "ca", Number(e.target.value))} style={{ maxWidth: 90 }} /></td>
                    <td><input type="number" className="form-control form-control-sm mono" value={exam || ""} disabled={locked} onChange={(e) => setScore(i, "exam", Number(e.target.value))} style={{ maxWidth: 90 }} /></td>
                    <td className="mono fw-800 text-ink">{total || "—"}</td>
                    <td><Badge tone={total === 0 ? "slate" : total >= 60 ? "teal" : total >= 45 ? "amber" : "rose"}>{total === 0 ? "—" : grade}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={confirm} onClose={() => setConfirm(false)} title="Send scores to the Exam Office">
        <div className="text-center mb-4">
          <div className="mb-2"><CheckBurst size={64} /></div>
          <h4 className="fs-6 fw-800 mb-1">Send scores for {sheet.classLabel} · {sheet.subject}?</h4>
          <p className="fs-8 text-muted-2 mb-0">After you send them, the sheet is locked. The Exam Office checks the scores before pupils can see them.</p>
        </div>
        <div className="d-flex gap-2">
          <Btn variant="soft" full onClick={() => setConfirm(false)}>Cancel</Btn>
          <Btn variant="teal" full onClick={send}>Yes, send them</Btn>
        </div>
      </Modal>
      {toastNode}
    </>
  );
}

function ClassesView({ assignments, sheets, onOpen }: { assignments: ClassAssignment[]; sheets: ScoreSheet[]; onOpen: (cid: string) => void }) {
  return (
    <Panel title="My classes" subtitle="Only classes the school office has assigned to you appear here">
      <div className="row g-3">
        {assignments.length === 0 && <div className="text-muted-2">You have not been assigned to any class yet.</div>}
        {assignments.map((a) => {
          const sheet = sheets.find((s) => s.classArmId === a.classArmId && s.subject === a.subject);
          return (
            <div className="col-md-6" key={a.id}>
              <div className="card-x card-x--hover h-100 p-4">
                <div className="d-flex align-items-start justify-content-between mb-2">
                  <div>
                    <h3 className="fs-5 fw-800 mb-1">{prettyArm(a.classArmId)} · {a.subject}</h3>
                    <div className="fs-8 text-muted-2">Assigned {a.assignedAt} by {a.assignedBy}</div>
                  </div>
                  <Badge tone={sheet?.state === "published" ? "teal" : sheet?.state === "approved" ? "brand" : sheet?.state === "submitted" ? "amber" : "slate"}>{sheet?.state ?? "no sheet"}</Badge>
                </div>
                <div className="row g-2 mb-3">
                  <div className="col-4"><div className="p-2 rounded-3 text-center" style={{ background: "var(--slate-50)" }}><div className="display-font fw-800" style={{ fontSize: "1.1rem" }}>{sheet?.students ?? 0}</div><div className="eyebrow text-muted-2" style={{ fontSize: ".48rem" }}>Pupils</div></div></div>
                  <div className="col-4"><div className="p-2 rounded-3 text-center" style={{ background: "var(--slate-50)" }}><div className="display-font fw-800" style={{ fontSize: "1.1rem" }}>{sheet?.entered ?? 0}</div><div className="eyebrow text-muted-2" style={{ fontSize: ".48rem" }}>Entered</div></div></div>
                  <div className="col-4"><div className="p-2 rounded-3 text-center" style={{ background: "var(--slate-50)" }}><div className="display-font fw-800" style={{ fontSize: "1.1rem" }}>{sheet?.average ?? 0}%</div><div className="eyebrow text-muted-2" style={{ fontSize: ".48rem" }}>Average</div></div></div>
                </div>
                <Btn full onClick={() => onOpen(a.classArmId)}><span className="d-inline-flex align-items-center gap-2">Open score sheet <IconArrowRight size={16} /></span></Btn>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function HistoryView({ me, allHistory }: { me: Teacher; allHistory: any[] }) {
  const mine = allHistory.filter((h: any) => h.teacherId === me.id || h.previousTeacherId === me.id);
  return (
    <Panel title="My assignment history" subtitle={`${mine.length} record(s) for ${me.name}`}>
      {mine.length === 0 ? <div className="text-muted-2">Nothing has been added, removed or moved yet.</div> : (
        <table className="table-x">
          <thead><tr><th>Date</th><th>Class</th><th>Subject</th><th>What happened</th><th>By</th><th>Note</th></tr></thead>
          <tbody>
            {mine.map((h: any) => (
              <tr key={h.id}>
                <td className="fs-8">{h.date}</td>
                <td className="fw-bold text-ink">{h.classLabel}</td>
                <td className="fs-8">{h.subject}</td>
                <td>
                  {h.action === "assigned" && <Badge tone="teal">Added to you</Badge>}
                  {h.action === "removed" && <Badge tone="rose">Taken from you</Badge>}
                  {h.action === "reassigned_to" && <Badge tone="brand">Moved to you</Badge>}
                  {h.action === "reassigned_from" && <Badge tone="amber">Moved away</Badge>}
                </td>
                <td className="fs-8">{h.doneBy}</td>
                <td className="fs-8 text-muted-2">{h.note ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Panel>
  );
}

function TimetableView({ me }: { me: Teacher }) {
  return (
    <Panel title="My timetable" subtitle={`${me.name} · ${me.subject} · ${SESSION}`}>
      <div className="table-responsive">
        <table className="table-x">
          <thead><tr><th>Time</th><th>Monday</th><th>Tuesday</th><th>Wednesday</th><th>Thursday</th><th>Friday</th></tr></thead>
          <tbody>
            {[
              ["08:00 – 08:45", [`${me.subject} · JSS 3A`, "Prep", `${me.subject} · SS 1S`, `${me.subject} · JSS 3A`, `${me.subject} · JSS 3B`]],
              ["08:45 – 09:30", [`${me.subject} · SS 1S`, `${me.subject} · JSS 3B`, `${me.subject} · JSS 3A`, `${me.subject} · SS 1S`, `${me.subject} · JSS 3A`]],
              ["10:15 – 11:00", ["Marking", "Lab prep", "Marking", "Marking", "Lesson plan"]],
              ["12:30 – 13:15", [`${me.subject} · JSS 3B`, "Free", `${me.subject} · SS 1S`, `${me.subject} · JSS 3B`, "Remedial · Lab 2"]],
            ].map(([time, cells]) => (
              <tr key={time as string}>
                <td className="mono fs-8 fw-bold text-ink">{time as string}</td>
                {(cells as string[]).map((cell, i) => (
                  <td key={i}>
                    {cell === "Free" ? <span className="fs-8 text-muted-2">—</span> :
                      cell === "Marking" || cell === "Lab prep" || cell === "Lesson plan" ? <span className="fs-8 text-muted-2">{cell}</span> :
                        <span className="badge-x badge-x--brand" style={{ whiteSpace: "normal", lineHeight: 1.3 }}>{cell}</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
