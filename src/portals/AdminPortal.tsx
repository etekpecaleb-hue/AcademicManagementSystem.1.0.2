import { useMemo, useState } from "react";
import { usePageEnter } from "../lib/gsap";
import PortalFrame, { type NavItem } from "../components/PortalFrame";
import { Btn, Panel, Avatar, Badge, Modal, useToast } from "../components/ui";
import { Notice } from "../components/simple";
import { BigAction } from "./TeacherPortal";
import { IconGrid, IconUsers, IconCheckCircle, IconCheck, IconShield, IconPlus, IconLock, IconUnlock, IconArrowRight, IconAlert, IconX } from "../components/Icons";
import {
  ADMIN, TEACHERS, ALL_CLASS_ARMS, STUDENT_ACCOUNTS,
  type ClassAssignment, type AssignmentHistoryEntry, type Teacher, type ScoreSheet,
} from "../data/mock";
import { getStore } from "./TeacherPortal";
import type { Role } from "../App";

const STAFF_BY_ID: Record<string, Teacher> = Object.fromEntries(TEACHERS.map(t => [t.id, t]));

export default function AdminPortal({ onExit, onSwitch }: { onExit: () => void; onSwitch: (r: Role) => void }) {
  const [tab, setTab] = useState("overview");
  const [showPins, setShowPins] = useState(false);
  const [resetFor, setResetFor] = useState<typeof STUDENT_ACCOUNTS[number] | null>(null);
  const [newPin, setNewPin] = useState("");
  const [assignFor, setAssignFor] = useState<{ classArmId: string; subject: string } | null>(null);
  const [reassignFor, setReassignFor] = useState<ClassAssignment | null>(null);
  const [removeFor, setRemoveFor] = useState<ClassAssignment | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<string>(TEACHERS[0].id);
  const [note, setNote] = useState("");

  const { toast, toastNode } = useToast();
  const pageRef = usePageEnter(tab);
  const [refresh, setRefresh] = useState(0);

  const store = getStore();
  const assignments = useMemo(() => store.assignments, [store, refresh]);
  const history = useMemo(() => store.history, [store, refresh]);
  const sheets = useMemo(() => store.scoreSheets, [store, refresh]);

  const nav: NavItem[] = [
    { id: "overview", label: "Overview", icon: <IconGrid size={19} /> },
    { id: "classes", label: "Class Assignments", icon: <IconUsers size={19} />, badge: `${assignments.length}` },
    { id: "teachers", label: "Teachers", icon: <IconUsers size={19} /> },
    { id: "results", label: "Approve Results", icon: <IconCheckCircle size={19} />, badge: sheets.filter(s => s.state === "submitted").length > 0 ? `${sheets.filter(s => s.state === "submitted").length}` : undefined },
    { id: "logins", label: "Student Logins", icon: <IconShield size={19} />, badge: STUDENT_ACCOUNTS.filter(s => s.status === "new" || s.status === "locked").length > 0 ? `${STUDENT_ACCOUNTS.filter(s => s.status === "new" || s.status === "locked").length}` : undefined },
  ];

  const titles: Record<string, [string, string]> = {
    overview: ["School Dashboard", "See what's happening across the school — finances, classes and results."],
    classes: ["Class Assignments", "Assign a class and a subject to a teacher. Reassign or remove at any time. Every change is recorded in the history."],
    teachers: ["Teachers & Departments", "Every teacher, the classes they teach, and the score sheets they have produced."],
    results: ["Approve & Publish Results", "Review the score sheets teachers have sent and decide what the pupils can see."],
    logins: ["Student Logins", "Every pupil has a unique Admission Number and private PIN. Print, send and reset them here."],
  };

  const approved = (s: ScoreSheet) => {
    store.updateSheet(s.id, { state: "published", lastUpdate: new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) });
    setRefresh(r => r + 1);
    toast(`Published ${s.classLabel} · ${s.subject} — all pupils can now see it`);
  };
  const rejected = (s: ScoreSheet) => {
    store.updateSheet(s.id, { state: "rejected", lastUpdate: new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) });
    setRefresh(r => r + 1);
    toast("Score sheet sent back to the teacher with a request to fix it");
  };
  void approved; void rejected;

  const performAssign = (classArmId: string, subject: string, teacherId: string) => {
    const a: ClassAssignment = { id: `A-${Date.now()}`, classArmId, subject, teacherId, assignedBy: "Dr. I. Eze (Principal)", assignedAt: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }), status: "active" };
    const arm = (classArmId.match(/[A-Z][a-zA-Z]+/g) ?? []).join(" ");
    const t = STAFF_BY_ID[teacherId];
    const h: AssignmentHistoryEntry = { id: `H-${Date.now()}`, classArmId, classLabel: arm, subject, teacherId, teacherName: t?.name ?? teacherId, action: "assigned", doneBy: "Dr. I. Eze (Principal)", date: a.assignedAt };
    store.assign(a, h);
    setRefresh(r => r + 1);
    toast(`${t?.name} now teaches ${arm} · ${subject}`);
  };

  const performReassign = (assignment: ClassAssignment, newTeacherId: string) => {
    store.reassign(assignment.id, newTeacherId, "Dr. I. Eze (Principal)", note || undefined);
    setRefresh(r => r + 1);
    setNote("");
    toast("Class moved to the new teacher — the old teacher has been notified");
  };

  const performRemove = (assignment: ClassAssignment) => {
    store.remove(assignment.id, "Dr. I. Eze (Principal)", note || undefined);
    setRefresh(r => r + 1);
    setNote("");
    toast("Class removed from the teacher. The teacher can no longer enter scores for it.");
  };

  return (
    <PortalFrame
      person={ADMIN} role="admin" nav={nav} active={tab} onNav={setTab} onExit={onExit} onSwitch={onSwitch}
      pageTitle={titles[tab][0]} pageNote={titles[tab][1]}
    >
      <div ref={pageRef}>
        {tab === "overview" && <OverviewTab sheets={sheets} onGo={(t) => setTab(t)} />}
        {tab === "classes" && <ClassesTab assignments={assignments} history={history} sheets={sheets} onAssign={() => setAssignFor({ classArmId: "", subject: "" })} onReassign={(a) => { setReassignFor(a); setNote(""); }} onRemove={(a) => { setRemoveFor(a); setNote(""); }} />}
        {tab === "teachers" && <TeachersTab sheets={sheets} assignments={assignments} selectedTeacher={selectedTeacher} setSelectedTeacher={setSelectedTeacher} />}
        {tab === "results" && <ResultsTab sheets={sheets} onApprove={approved} onReject={rejected} />}
        {tab === "logins" && <LoginsTab showPins={showPins} setShowPins={setShowPins} onReset={(a) => { setResetFor(a); setNewPin(""); }} />}
      </div>

      {/* ASSIGN */}
      <Modal open={!!assignFor} onClose={() => setAssignFor(null)} title="Assign a class to a teacher" width={640}>
        {assignFor && (
          <AssignForm
            classArmId={assignFor.classArmId} setClassArmId={(v) => setAssignFor({ ...assignFor, classArmId: v })}
            subject={assignFor.subject} setSubject={(v) => setAssignFor({ ...assignFor, subject: v })}
            onCancel={() => setAssignFor(null)}
            onAssign={(cid, sub, tid) => { performAssign(cid, sub, tid); setAssignFor(null); }}
            assignments={assignments}
          />
        )}
      </Modal>

      {/* REASSIGN */}
      <Modal open={!!reassignFor} onClose={() => setReassignFor(null)} title="Move this class to another teacher" width={560}>
        {reassignFor && (
          <TransferForm
            mode="reassign"
            currentTeacherName={STAFF_BY_ID[reassignFor.teacherId]?.name ?? reassignFor.teacherId}
            classLabel={reassignFor.classArmId.replace("CLS-", "").replace(/[A-Z]/g, " $&").trim()}
            subject={reassignFor.subject}
            note={note} setNote={setNote}
            onCancel={() => setReassignFor(null)}
            onConfirm={(tid) => { performReassign(reassignFor, tid ?? ""); setReassignFor(null); }}
          />
        )}
      </Modal>

      {/* REMOVE */}
      <Modal open={!!removeFor} onClose={() => setRemoveFor(null)} title="Remove this class from a teacher" width={560}>
        {removeFor && (
          <TransferForm
            mode="remove"
            currentTeacherName={STAFF_BY_ID[removeFor.teacherId]?.name ?? removeFor.teacherId}
            classLabel={removeFor.classArmId.replace("CLS-", "").replace(/[A-Z]/g, " $&").trim()}
            subject={removeFor.subject}
            note={note} setNote={setNote}
            onCancel={() => setRemoveFor(null)}
            onConfirm={() => { performRemove(removeFor); setRemoveFor(null); }}
          />
        )}
      </Modal>

      {/* PIN RESET */}
      <Modal open={!!resetFor} onClose={() => setResetFor(null)} title={newPin ? "New PIN created" : "Reset student PIN"} width={520}>
        {resetFor && !newPin && (
          <>
            <p>Reset the PIN for <strong>{resetFor.name}</strong> ({resetFor.admissionNo})? The old PIN will stop working immediately and a new one will be created.</p>
            <div className="d-flex gap-2 mt-4">
              <Btn variant="soft" full onClick={() => setResetFor(null)}>Cancel</Btn>
              <Btn full onClick={() => { setNewPin(String(1000 + Math.floor(Math.random() * 9000))); toast(`PIN reset for ${resetFor.name}`); }}>Yes, reset the PIN</Btn>
            </div>
          </>
        )}
        {resetFor && newPin && (
          <div className="text-center">
            <div className="mb-3 d-flex justify-content-center"><IconCheckCircle size={70} /></div>
            <p className="mb-2">New PIN for <strong>{resetFor.name}</strong>:</p>
            <div className="display-font fw-800 mono mb-3" style={{ fontSize: "2.4rem", letterSpacing: ".35em" }}>{newPin}</div>
            <p className="fs-8 text-muted-2">Give this PIN to the pupil. It is not shown again after you close this box.</p>
            <div className="d-flex gap-2">
              <Btn variant="soft" full onClick={() => toast(`New PIN sent to ${resetFor.parentPhone} by SMS`, "brand")}>Send to parent by SMS</Btn>
              <Btn full onClick={() => setResetFor(null)}>Done</Btn>
            </div>
          </div>
        )}
      </Modal>

      {toastNode}
    </PortalFrame>
  );
}

/* ---------------- OVERVIEW ---------------- */
function OverviewTab({ sheets, onGo }: { sheets: ScoreSheet[]; onGo: (t: string) => void }) {
  const drafts = sheets.filter((s) => s.state === "draft").length;
  const submitted = sheets.filter((s) => s.state === "submitted").length;
  const approved = sheets.filter((s) => s.state === "approved" || s.state === "published").length;
  return (
    <>
      <h2 className="fs-5 fw-800 mb-3">What would you like to do?</h2>
      <div className="row g-3 mb-4">
        <div className="col-md-6"><BigAction icon={<IconUsers size={28} />} title="Class assignments" note="Assign, reassign or remove classes for any teacher" tone="#7c3aed" onClick={() => onGo("classes")} /></div>
        <div className="col-md-6"><BigAction icon={<IconCheckCircle size={28} />} title="Approve & publish results" note={`${submitted} score sheet(s) waiting for you to check and publish`} tone="#0d9488" badge={submitted > 0 ? `${submitted} waiting` : undefined} onClick={() => onGo("results")} /></div>
        <div className="col-md-6"><BigAction icon={<IconUsers size={28} />} title="Teachers" note="See every teacher and the classes they manage" tone="#2563c9" onClick={() => onGo("teachers")} /></div>
        <div className="col-md-6"><BigAction icon={<IconShield size={28} />} title="Student logins" note="Print slips, send to parents, reset PINs" tone="#b45309" onClick={() => onGo("logins")} /></div>
      </div>

      <div className="row g-3 mb-4">
        {[
          { l: "Classes assigned", v: String(sheets.length), i: <IconUsers size={20} />, t: "#2563c9" },
          { l: "Score sheets waiting", v: String(submitted), i: <IconAlert size={20} />, t: "#f59e0b" },
          { l: "Score sheets approved", v: String(approved), i: <IconCheckCircle size={20} />, t: "#0d9488" },
          { l: "Score sheets still in draft", v: String(drafts), i: <IconLock size={20} />, t: "#7c3aed" },
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

      <Panel title="What was done recently" subtitle="Every change you make is recorded">
        <RecentActivity onGo={onGo} />
      </Panel>
    </>
  );
}

function RecentActivity({ onGo }: { onGo: (t: string) => void }) {
  const store = getStore();
  const items = [
    ...store.history.slice(0, 6).map((h: any) => ({
      type: h.action,
      label: h.action === "assigned" ? `Assigned ${h.classLabel} · ${h.subject} to ${h.teacherName}` :
        h.action === "removed" ? `Removed ${h.classLabel} · ${h.subject} from ${h.teacherName}` :
        h.action === "reassigned_to" ? `Moved ${h.classLabel} · ${h.subject} to ${h.teacherName}` :
        `Took ${h.classLabel} · ${h.subject} from ${h.teacherName}`,
      who: h.doneBy, time: h.date, goTo: "classes",
    })),
    ...store.scoreSheets.filter(s => s.state === "published" || s.state === "submitted").slice(0, 4).map((s: ScoreSheet) => ({
      type: s.state === "published" ? "published" : "submitted",
      label: s.state === "published"
        ? `Published ${s.classLabel} · ${s.subject} (average ${s.average}%)`
        : `Teacher ${s.teacherName} sent scores for ${s.classLabel} · ${s.subject}`,
      who: s.teacherName, time: s.lastUpdate, goTo: "results",
    })),
  ];
  return (
    <div className="d-flex flex-column gap-2">
      {items.length === 0 ? <div className="text-muted-2">No recent activity yet.</div> : items.slice(0, 6).map((it, i) => (
        <div key={i} className="d-flex align-items-start gap-3 p-3 rounded-4" style={{ background: "var(--slate-50)" }}>
          <span className="d-grid rounded-3 flex-shrink-0" style={{ width: 36, height: 36, placeItems: "center", background: it.type === "removed" ? "var(--rose-100)" : it.type === "published" ? "var(--teal-100)" : "var(--brand-100)", color: it.type === "removed" ? "var(--rose-500)" : it.type === "published" ? "var(--teal-600)" : "var(--brand-700)" }}>
            {it.type === "removed" ? <IconX size={16} /> : it.type === "published" ? <IconCheck size={16} /> : it.type === "submitted" ? <IconArrowRight size={16} /> : <IconCheck size={16} />}
          </span>
          <div className="lh-sm flex-grow-1">
            <span className="fs-8">{it.label}</span>
            <div className="fs-8 text-muted-2">{it.who} · {it.time}</div>
          </div>
          <Btn size="sm" variant="soft" onClick={() => onGo(it.goTo)}>View</Btn>
        </div>
      ))}
    </div>
  );
}

/* ---------------- CLASS ASSIGNMENTS ---------------- */
function ClassesTab({ assignments, history, sheets, onAssign, onReassign, onRemove }: {
  assignments: ClassAssignment[]; history: any[]; sheets: ScoreSheet[];
  onAssign: () => void; onReassign: (a: ClassAssignment) => void; onRemove: (a: ClassAssignment) => void;
}) {
  return (
    <>
      <div className="notice notice--brand mb-4">
        <span className="notice__icon"><IconUsers size={20} /></span>
        <div>
          <div className="notice__title">Only classes you assign here appear in a teacher's portal</div>
          <div className="notice__body">You can give any class to any teacher, move it to a different teacher at any time, or take it back. Every change is automatically recorded in the history below.</div>
        </div>
        <Btn onClick={onAssign}><span className="d-inline-flex align-items-center gap-2"><IconPlus size={16} /> Assign a class to a teacher</span></Btn>
      </div>

      <Panel title="Current class assignments" subtitle={`${assignments.length} active`} actions={<Btn onClick={onAssign}><span className="d-inline-flex align-items-center gap-2"><IconPlus size={16} /> Assign</span></Btn>}>
        <div className="table-responsive">
          <table className="table-x">
            <thead>
              <tr><th>Class arm</th><th>Subject</th><th>Teacher</th><th>Score sheet</th><th>Assigned</th><th>By</th><th className="text-end">Actions</th></tr>
            </thead>
            <tbody>
              {assignments.length === 0 && <tr><td colSpan={7} className="text-muted-2">No classes assigned yet. Press "Assign" above to start.</td></tr>}
              {assignments.map((a) => {
                const t = STAFF_BY_ID[a.teacherId];
                const sheet = sheets.find((s) => s.classArmId === a.classArmId && s.subject === a.subject);
                return (
                  <tr key={a.id}>
                    <td className="fw-bold text-ink">{a.classArmId.replace("CLS-", "").replace(/[A-Z]/g, " $&").trim()}</td>
                    <td>{a.subject}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Avatar initials={t?.initials ?? "??"} color={t?.color ?? "linear-gradient(135deg,#475569,#0f172a)"} size={28} />
                        <div className="lh-sm">
                          <div className="fw-bold">{t?.name ?? a.teacherId}</div>
                          <div className="fs-8 text-muted-2">{t?.staffId} · {t?.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {sheet ? <Badge tone={sheet.state === "published" ? "teal" : sheet.state === "approved" ? "brand" : sheet.state === "submitted" ? "amber" : "slate"}>{sheet.state} · {sheet.entered}/{sheet.students}</Badge> : <span className="text-muted-2">—</span>}
                    </td>
                    <td className="fs-8">{a.assignedAt}</td>
                    <td className="fs-8">{a.assignedBy}</td>
                    <td>
                      <div className="d-flex gap-1 justify-content-end flex-wrap">
                        <Btn size="sm" variant="soft" onClick={() => onReassign(a)}><span className="d-inline-flex align-items-center gap-1"><IconArrowRight size={14} /> Move to another teacher</span></Btn>
                        <Btn size="sm" variant="soft" onClick={() => onRemove(a)}><span className="d-inline-flex align-items-center gap-1"><IconUnlock size={14} /> Remove</span></Btn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Full assignment history" subtitle="All time — assigned, moved or removed" className="mt-4">
        {history.length === 0 ? <div className="text-muted-2">Nothing has been added, moved or removed yet.</div> : (
          <div className="table-responsive">
            <table className="table-x">
              <thead><tr><th>Date</th><th>Class</th><th>Subject</th><th>Action</th><th>Teacher</th><th>By</th><th>Note</th></tr></thead>
              <tbody>
                {history.map((h: any) => (
                  <tr key={h.id}>
                    <td className="fs-8">{h.date}</td>
                    <td className="fw-bold text-ink">{h.classLabel}</td>
                    <td className="fs-8">{h.subject}</td>
                    <td>
                      {h.action === "assigned" && <Badge tone="brand">Assigned</Badge>}
                      {h.action === "removed" && <Badge tone="rose">Removed</Badge>}
                      {h.action === "reassigned_to" && <Badge tone="teal">Moved to</Badge>}
                      {h.action === "reassigned_from" && <Badge tone="amber">Moved away</Badge>}
                    </td>
                    <td className="fw-bold text-ink">{h.teacherName}</td>
                    <td className="fs-8">{h.doneBy}</td>
                    <td className="fs-8 text-muted-2">{h.note ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}

/* ---------------- TEACHERS ---------------- */
function TeachersTab({ sheets, assignments, selectedTeacher, setSelectedTeacher }: {
  sheets: ScoreSheet[]; assignments: ClassAssignment[];
  selectedTeacher: string; setSelectedTeacher: (s: string) => void;
}) {
  const t = STAFF_BY_ID[selectedTeacher];
  const myAssignments = assignments.filter((a) => a.teacherId === selectedTeacher);
  const mySheets = sheets.filter((s) => s.teacherId === selectedTeacher);
  return (
    <div className="row g-4">
      <div className="col-lg-4">
        <Panel title="Teachers" subtitle={`${TEACHERS.length} on staff`}>
          <div className="d-flex flex-column gap-2">
            {TEACHERS.map((teacher) => (
              <button key={teacher.id} data-click onClick={() => setSelectedTeacher(teacher.id)}
                className="text-start p-3 rounded-4 d-flex align-items-center gap-3"
                style={{ background: selectedTeacher === teacher.id ? "var(--brand-50)" : "#fff", border: "1.5px solid " + (selectedTeacher === teacher.id ? "var(--brand-500)" : "var(--slate-200)") }}>
                <Avatar initials={teacher.initials} color={teacher.color} size={40} />
                <div className="flex-grow-1 lh-sm">
                  <div className="fw-bold">{teacher.name}</div>
                  <div className="fs-8 text-muted-2">{teacher.subject} · {teacher.staffId}</div>
                </div>
                {selectedTeacher === teacher.id && <IconCheck size={18} className="text-brand" />}
              </button>
            ))}
          </div>
        </Panel>
      </div>

      <div className="col-lg-8 d-flex flex-column gap-4">
        {t && (
          <>
            <Panel title={`${t.name} — ${t.subject}`} subtitle={`${t.staffId} · ${t.email} · ${t.phone}`}>
              <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                <Avatar initials={t.initials} color={t.color} size={56} ring />
                <div className="lh-sm">
                  <div className="fw-800" style={{ fontSize: "1.2rem" }}>{t.name}</div>
                  <div className="text-muted-2">Joined the school in {t.joined}</div>
                </div>
                <div className="ms-auto d-flex gap-2 flex-wrap">
                  <Badge tone="brand">{myAssignments.length} classes</Badge>
                  <Badge tone="teal">{mySheets.filter(s => s.state === "published" || s.state === "approved").length} done</Badge>
                  <Badge tone="amber">{mySheets.filter(s => s.state === "submitted").length} pending</Badge>
                </div>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <div className="p-3 rounded-4" style={{ background: "var(--slate-50)" }}><div className="fs-8 text-muted-2">Email</div><div className="fw-bold">{t.email}</div></div>
                <div className="p-3 rounded-4" style={{ background: "var(--slate-50)" }}><div className="fs-8 text-muted-2">Phone</div><div className="fw-bold">{t.phone}</div></div>
                <div className="p-3 rounded-4" style={{ background: "var(--slate-50)" }}><div className="fs-8 text-muted-2">Subject</div><div className="fw-bold">{t.subject}</div></div>
              </div>
            </Panel>

            <Panel title="Classes this teacher is managing" subtitle="Assigned to them by the office">
              {myAssignments.length === 0 ? <div className="text-muted-2">No classes assigned yet.</div> : (
                <table className="table-x">
                  <thead><tr><th>Class arm</th><th>Subject</th><th>Score sheet</th><th>Last update</th></tr></thead>
                  <tbody>
                    {myAssignments.map((a) => {
                      const sheet = sheets.find((s) => s.classArmId === a.classArmId && s.subject === a.subject);
                      return (
                        <tr key={a.id}>
                          <td className="fw-bold text-ink">{a.classArmId.replace("CLS-", "").replace(/[A-Z]/g, " $&").trim()}</td>
                          <td>{a.subject}</td>
                          <td>{sheet ? <Badge tone={sheet.state === "published" ? "teal" : sheet.state === "approved" ? "brand" : sheet.state === "submitted" ? "amber" : "slate"}>{sheet.state} · {sheet.entered}/{sheet.students}</Badge> : "—"}</td>
                          <td className="fs-8">{sheet?.lastUpdate ?? "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </Panel>

            <Panel title="Score sheets this teacher has produced" subtitle="A complete record for this session">
              {mySheets.length === 0 ? <div className="text-muted-2">No score sheets yet.</div> : (
                <table className="table-x">
                  <thead><tr><th>Class</th><th>Subject</th><th>Pupils</th><th>Average</th><th>Status</th><th>Last update</th></tr></thead>
                  <tbody>
                    {mySheets.map((s) => (
                      <tr key={s.id}>
                        <td className="fw-bold text-ink">{s.classLabel}</td>
                        <td>{s.subject}</td>
                        <td className="mono">{s.students}</td>
                        <td className="mono fw-bold">{s.average}%</td>
                        <td><Badge tone={s.state === "published" ? "teal" : s.state === "approved" ? "brand" : s.state === "submitted" ? "amber" : s.state === "rejected" ? "rose" : "slate"}>{s.state}</Badge></td>
                        <td className="fs-8">{s.lastUpdate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- RESULTS ---------------- */
function ResultsTab({ sheets, onApprove, onReject }: { sheets: ScoreSheet[]; onApprove: (s: ScoreSheet) => void; onReject: (s: ScoreSheet) => void }) {
  const submitted = sheets.filter(s => s.state === "submitted");
  const others = sheets.filter(s => s.state !== "submitted");
  return (
    <>
      <div className="notice notice--brand mb-4">
        <span className="notice__icon"><IconCheckCircle size={20} /></span>
        <div>
          <div className="notice__title">Approving makes results visible to pupils</div>
          <div className="notice__body">When you approve a score sheet, it goes live in the pupil's portal. Send it back to the teacher if something needs to be fixed first.</div>
        </div>
      </div>

      {submitted.length === 0
        ? <div className="notice notice--teal"><span className="notice__icon"><IconCheckCircle size={20} /></span><div><div className="notice__title">No score sheets are waiting for you</div><div className="notice__body">Every score sheet has been approved or is still being worked on by the teacher.</div></div></div>
        : (
          <Panel title={`${submitted.length} score sheet(s) waiting to be approved`} subtitle="When you approve, the result becomes visible to the pupils">
            <div className="d-flex flex-column gap-3">
              {submitted.map((s) => (
                <div key={s.id} className="p-3 rounded-4 d-flex flex-wrap align-items-center gap-3" style={{ background: "var(--slate-50)", border: "1px solid var(--slate-200)" }}>
                  <div className="flex-grow-1">
                    <div className="fw-800">{s.classLabel} · {s.subject}</div>
                    <div className="fs-8 text-muted-2">{s.teacherName} · {s.students} pupils · average {s.average}% · sent {s.lastUpdate}</div>
                  </div>
                  <div className="d-flex gap-2">
                    <Btn size="sm" variant="soft" onClick={() => onReject(s)}><span className="d-inline-flex align-items-center gap-1"><IconX size={14} /> Send back</span></Btn>
                    <Btn size="sm" variant="teal" onClick={() => onApprove(s)}><span className="d-inline-flex align-items-center gap-1"><IconCheckCircle size={14} /> Approve & publish</span></Btn>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        )}

      <Panel title="All score sheets" subtitle={`${others.length} not waiting`} className="mt-4">
        <table className="table-x">
          <thead><tr><th>Class</th><th>Subject</th><th>Teacher</th><th>Status</th><th>Last update</th></tr></thead>
          <tbody>
            {others.length === 0 ? <tr><td colSpan={5} className="text-muted-2">No other score sheets yet.</td></tr> : others.map((s) => (
              <tr key={s.id}>
                <td className="fw-bold text-ink">{s.classLabel}</td>
                <td>{s.subject}</td>
                <td className="fs-8">{s.teacherName}</td>
                <td><Badge tone={s.state === "published" ? "teal" : s.state === "approved" ? "brand" : s.state === "rejected" ? "rose" : "slate"}>{s.state}</Badge></td>
                <td className="fs-8">{s.lastUpdate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
}

/* ---------------- LOGINS ---------------- */
function LoginsTab({ showPins, setShowPins, onReset }: { showPins: boolean; setShowPins: (b: boolean) => void; onReset: (a: typeof STUDENT_ACCOUNTS[number]) => void }) {
  return (
    <>
      <div className="notice notice--brand mb-4">
        <span className="notice__icon"><IconShield size={20} /></span>
        <div>
          <div className="notice__title">Every pupil has a unique login</div>
          <div className="notice__body">Each student signs in with their own Admission Number and a private 4-digit PIN to see results, pay school fees, read the newsletter and check their timetable.</div>
        </div>
      </div>

      <Panel
        title="Student login accounts"
        subtitle="The Admission Number is the login ID. The PIN is private to each pupil."
        actions={
          <div className="d-flex gap-2 flex-wrap">
            <Btn size="sm" variant="soft" onClick={() => setShowPins(!showPins)}><span className="d-inline-flex align-items-center gap-1"><IconLock size={14} /> {showPins ? "Hide PINs" : "Show PINs"}</span></Btn>
            <Btn size="sm" onClick={() => addToast("Login slips for JSS 3A sent to the printer")}>Print login slips</Btn>
          </div>
        }
      >
        <div className="table-responsive">
          <table className="table-x">
            <thead>
              <tr><th>Student</th><th>Admission No.</th><th>Class</th><th>PIN</th><th>Parent / Guardian</th><th>Last login</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {STUDENT_ACCOUNTS.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <Avatar initials={a.initials} color={a.color} size={30} />
                      <span className="fw-bold text-ink">{a.name}</span>
                    </div>
                  </td>
                  <td className="mono fw-bold">{a.admissionNo}</td>
                  <td>{a.className}</td>
                  <td className="mono fw-800" style={{ letterSpacing: ".15em" }}>{showPins ? a.pin : "••••"}</td>
                  <td><div className="lh-sm">{a.parentName}<div className="fs-8 text-muted-2">{a.parentPhone}</div></div></td>
                  <td className="fs-8">{a.lastLogin}</td>
                  <td><Badge tone={a.status === "active" ? "teal" : a.status === "new" ? "amber" : "rose"}>{a.status === "active" ? "Active" : a.status === "new" ? "Not yet used" : "Locked"}</Badge></td>
                  <td><Btn size="sm" variant="soft" onClick={() => onReset(a)}>{a.status === "locked" ? "Unlock & reset PIN" : "Reset PIN"}</Btn></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

function addToast(_: string) { /* placeholder for logins shortcuts */ }

/* ---------------- ASSIGN / REASSIGN / REMOVE FORMS ---------------- */
function AssignForm({ classArmId, setClassArmId, subject, setSubject, onCancel, onAssign, assignments }: {
  classArmId: string; setClassArmId: (v: string) => void;
  subject: string; setSubject: (v: string) => void;
  onCancel: () => void; onAssign: (cid: string, sub: string, tid: string) => void;
  assignments: ClassAssignment[];
}) {
  const [teacherId, setTeacherId] = useState(TEACHERS[0].id);
  const usedKeys = new Set(assignments.map((a) => `${a.classArmId}::${a.subject}`));
  const subjects = ["Mathematics", "English Language", "Basic Science", "Social Studies", "Computer Studies", "Civic Education", "Creative Arts", "Agricultural Science"];
  const availableArms = ALL_CLASS_ARMS;

  return (
    <>
      <p className="text-muted-2">Pick a class arm, a subject, and the teacher you want to handle it. The new score sheet is created automatically.</p>
      <div className="row g-3 mt-2">
        <div className="col-12">
          <label className="form-label">Class arm</label>
          <select className="form-select form-select-lg" value={classArmId} onChange={(e) => setClassArmId(e.target.value)}>
            <option value="">Choose a class…</option>
            {availableArms.map((a) => <option key={a.id} value={a.id}>{a.name} {a.arm}</option>)}
          </select>
        </div>
        <div className="col-12">
          <label className="form-label">Subject</label>
          <select className="form-select form-select-lg" value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option value="">Choose a subject…</option>
            {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="col-12">
          <label className="form-label">Assign to</label>
          <select className="form-select form-select-lg" value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
            {TEACHERS.map((t) => <option key={t.id} value={t.id}>{t.name} — {t.subject}</option>)}
          </select>
        </div>
      </div>

      {classArmId && subject && usedKeys.has(`${classArmId}::${subject}`) && (
        <div className="mt-3">
          <Notice tone="rose" title="Already assigned">This class + subject is already assigned to a teacher. You can move it from the "Move to another teacher" button instead.</Notice>
        </div>
      )}

      <div className="d-flex gap-2 mt-4">
        <Btn variant="soft" full onClick={onCancel}>Cancel</Btn>
        <Btn full disabled={!classArmId || !subject || usedKeys.has(`${classArmId}::${subject}`)} onClick={() => onAssign(classArmId, subject, teacherId)}>
          <span className="d-inline-flex align-items-center gap-2"><IconCheck size={16} /> Assign this class</span>
        </Btn>
      </div>
    </>
  );
}

function TransferForm({ mode, currentTeacherName, classLabel, subject, note, setNote, onCancel, onConfirm }: {
  mode: "reassign" | "remove";
  currentTeacherName: string; classLabel: string; subject: string;
  note: string; setNote: (s: string) => void;
  onCancel: () => void; onConfirm: (teacherId?: string) => void;
}) {
  const [newTeacherId, setNewTeacherId] = useState(TEACHERS[0].id);
  return (
    <>
      <Notice tone="amber" title={mode === "reassign" ? "Move class" : "Remove class"}>
        {mode === "reassign"
          ? `Move ${classLabel} · ${subject} from ${currentTeacherName} to another teacher. The old teacher will no longer be able to enter scores for this class.`
          : `Take ${classLabel} · ${subject} away from ${currentTeacherName}. The teacher can no longer enter scores for it.`}
      </Notice>

      {mode === "reassign" && (
        <div className="mt-3">
          <label className="form-label">Move to which teacher?</label>
          <select className="form-select form-select-lg" value={newTeacherId} onChange={(e) => setNewTeacherId(e.target.value)}>
            {TEACHERS.map((t) => <option key={t.id} value={t.id}>{t.name} — {t.subject}</option>)}
          </select>
        </div>
      )}

      <div className="mt-3">
        <label className="form-label">Note (optional)</label>
        <input className="form-control" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Mr. A is on leave; please cover the class" />
      </div>

      <div className="d-flex gap-2 mt-4">
        <Btn variant="soft" full onClick={onCancel}>Cancel</Btn>
        <Btn variant="teal" full onClick={() => onConfirm(newTeacherId)}>
          <span className="d-inline-flex align-items-center gap-2">
            {mode === "reassign" ? <><IconArrowRight size={16} /> Move the class</> : <><IconUnlock size={16} /> Remove the class</>}
          </span>
        </Btn>
      </div>
    </>
  );
}
