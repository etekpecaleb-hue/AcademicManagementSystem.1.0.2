import { useEffect, useMemo, useRef, useState } from "react";
import { gsap, usePageEnter } from "../lib/gsap";
import PortalFrame, { type NavItem } from "../components/PortalFrame";
import { Btn, Panel, Avatar, Badge, Modal, useToast } from "../components/ui";
import { BarChart } from "../components/charts";
import { BigTile, Notice, Choice, StepHead, MessageList, NewsBoard } from "../components/simple";
import ReportCard from "../components/ReportCard";
import {
  IconGrid, IconClipboard, IconBell, IconCalendar, IconUser, IconTrophy, IconUsers, IconBook, IconClock, IconEye,
  IconWallet, IconCard, IconBank, IconMobile, IconPrinter, IconDownload, IconCheck, CheckBurst, IconArrowRight,
} from "../components/Icons";
import {
  TERMS, getResult, STUDENT_ACCOUNTS, STUDENT_MESSAGES, CLASS_TIMETABLE, CALENDAR_TERM_DATES, EVENTS,
  STUDENT_INVOICES, STUDENT_PAYMENTS, money, PAYMENT_METHODS, type Term, type Person,
  type StudentInvoice, type StudentPayment, type Ward,
} from "../data/mock";
import type { Role } from "../App";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

type Receipt = { ref: string; amount: number; term: string; method: string; date: string };

/* ==========================================================================
   STUDENT PORTAL — one pupil, one login, pays own fees
   ========================================================================== */
export default function StudentPortal({ studentId, onExit, onSwitch }: { studentId: string; onExit: () => void; onSwitch: (r: Role) => void }) {
  const account = STUDENT_ACCOUNTS.find((a) => a.id === studentId) ?? STUDENT_ACCOUNTS[0];
  const firstName = account.name.split(" ")[0];

  const [tab, setTab] = useState("home");
  const [term, setTerm] = useState<Term>("Second Term");
  const [showPin, setShowPin] = useState(false);
  const [changingPin, setChangingPin] = useState(false);
  const [extraPaid, setExtraPaid] = useState<Record<string, number>>({});
  const [extraPayments, setExtraPayments] = useState<StudentPayment[]>([]);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const { toast, toastNode } = useToast();
  const pageRef = usePageEnter(tab);

  const person: Person = { id: `Admission No. ${account.admissionNo}`, name: account.name, role: "Student", initials: account.initials, color: account.color, email: "" };

  const [ward] = useState<Ward>({
    id: account.id, name: account.name, initials: account.initials, color: account.color,
    className: account.className.split(" ")[0], arm: account.className.split(" ")[1] ?? "",
    admissionNo: account.admissionNo, attendance: 96, position: 4, classSize: 32, nextTermBegins: "8 Jan 2026",
  });
  const result = useMemo(() => getResult(ward, term), [ward, term]);

  /* invoice / payment state */
  const myInvoices = useMemo<StudentInvoice[]>(() => STUDENT_INVOICES.filter((i) => i.studentId === account.id), [account.id]);
  const myPayments = useMemo<StudentPayment[]>(() => [...extraPayments, ...STUDENT_PAYMENTS.filter((p) => p.studentId === account.id)], [extraPayments, account.id]);

  const owedFor = (inv: StudentInvoice) => Math.max(0, inv.total - inv.paid - (extraPaid[inv.id] ?? 0));
  const totalOwed = myInvoices.reduce((a, i) => a + owedFor(i), 0);
  const invoice = myInvoices.find((i) => i.term === term) ?? myInvoices[0];

  const recordPayment = (inv: StudentInvoice, amount: number, methodLabel: string): Receipt => {
    const ref = `RCPT/2026/${Math.floor(10000 + Math.random() * 89999)}`;
    const date = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    setExtraPaid((p) => ({ ...p, [inv.id]: (p[inv.id] ?? 0) + amount }));
    setExtraPayments((p) => [{ id: `TXN-${Date.now()}`, date, studentId: account.id, term: inv.term, method: methodLabel, reference: ref, amount, status: "successful" }, ...p]);
    toast("Payment successful — your receipt is ready");
    return { ref, amount, term: inv.term, method: methodLabel, date };
  };

  const nav: NavItem[] = [
    { id: "home", label: "Home", icon: <IconGrid size={19} /> },
    { id: "results", label: "My Results", icon: <IconClipboard size={19} />, badge: "New" },
    { id: "fees", label: "Pay School Fees", icon: <IconWallet size={19} />, badge: totalOwed > 0 ? "Due" : undefined },
    { id: "payments", label: "My Receipts", icon: <IconArrowRight size={19} /> },
    { id: "news", label: "News & Newsletters", icon: <IconBell size={19} /> },
    { id: "timetable", label: "My Timetable", icon: <IconCalendar size={19} /> },
    { id: "me", label: "My Details", icon: <IconUser size={19} /> },
  ];

  const titles: Record<string, [string, string]> = {
    home: [`Hello, ${firstName}!`, "This is your own page. You can see your results, pay school fees and read school news."],
    results: ["My Results", "Choose a term to see your scores. You can print them too."],
    fees: ["Pay School Fees", "Three easy steps. You get a receipt at once."],
    payments: ["My Receipts", "Every payment you have made, with a receipt you can print again."],
    news: ["News & Newsletters", "The latest school news and the newsletter, all in one place."],
    timetable: ["My Timetable", `Your lessons for ${account.className}, and important dates this term.`],
    me: ["My Details", "Your class, your login details and your parent's contact."],
  };

  const feeNotice = totalOwed > 0 ? (
    <Notice tone="amber" title={`You have ${money(totalOwed)} of school fees to pay`}>
      Press "Pay school fees" on the left menu. You can pay in full or part of it. You get a receipt immediately.
    </Notice>
  ) : (
    <Notice tone="teal" title="Your school fees are fully paid — thank you!">You don't owe anything for this term.</Notice>
  );

  return (
    <PortalFrame
      person={person} role="student" nav={nav} active={tab} onNav={setTab} onExit={onExit} onSwitch={onSwitch}
      pageTitle={titles[tab][0]} pageNote={titles[tab][1]}
    >
      <div ref={pageRef}>
        {/* ============================ HOME ============================ */}
        {tab === "home" && (
          <>
            <div className="mb-4" data-stagger>
              <Notice tone="teal" title={`Your ${term} results are ready`} action={<Btn onClick={() => setTab("results")}>See my results</Btn>}>
                You have {result.rows.length} subjects and your average is <strong>{result.average}%</strong>. Well done, {firstName}!
              </Notice>
            </div>

            {totalOwed > 0 && (
              <div className="mb-4" data-stagger>
                <Notice tone="amber" title={`${money(totalOwed)} of school fees is still to be paid`} action={<Btn onClick={() => setTab("fees")}>Pay now</Btn>}>
                  Paying takes only 3 easy steps. You get a receipt straight away.
                </Notice>
              </div>
            )}

            <h2 className="fs-5 fw-800 mb-3" data-stagger>What would you like to do?</h2>
            <div className="row g-3 mb-4" data-stagger>
              <div className="col-md-6"><BigTile icon={<IconClipboard size={28} />} title="See my results" note="Scores, grades and teacher comments" tone="#0d9488" badge="New" onClick={() => setTab("results")} /></div>
              <div className="col-md-6"><BigTile icon={<IconWallet size={28} />} title="Pay school fees" note="By card, bank transfer or USSD" tone="#2563c9" badge={totalOwed > 0 ? "Due" : undefined} onClick={() => setTab("fees")} /></div>
              <div className="col-md-6"><BigTile icon={<IconArrowRight size={28} />} title="My receipts" note="Print any receipt again" tone="#b45309" onClick={() => setTab("payments")} /></div>
              <div className="col-md-6"><BigTile icon={<IconBell size={28} />} title="News & newsletters" note="What is happening in school" tone="#7c3aed" onClick={() => setTab("news")} /></div>
              <div className="col-md-6"><BigTile icon={<IconCalendar size={28} />} title="My timetable" note="Lessons and important dates" tone="#0f766e" onClick={() => setTab("timetable")} /></div>
              <div className="col-md-6"><BigTile icon={<IconUser size={28} />} title="My details" note="Class, login details and PIN" tone="#b91c37" onClick={() => setTab("me")} /></div>
            </div>

            <div className="row g-3 mb-4" data-stagger>
              {[
                { l: "My class", v: account.className, i: <IconBook size={20} />, t: "#2563c9" },
                { l: "My position", v: result.position, i: <IconTrophy size={20} />, t: "#f59e0b" },
                { l: "Days present", v: `${ward.attendance}%`, i: <IconUsers size={20} />, t: "#0d9488" },
                { l: "Next term begins", v: ward.nextTermBegins, i: <IconClock size={20} />, t: "#7c3aed" },
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

            <Panel title="Messages for you" subtitle="From your teachers and the school office">
              <MessageList items={STUDENT_MESSAGES} />
            </Panel>
          </>
        )}

        {/* ============================ RESULTS ============================ */}
        {tab === "results" && (
          <>
            <div className="card-x p-3 p-md-4 mb-4 no-print" data-stagger>
              <div className="fw-800 mb-2" style={{ fontSize: "1.05rem" }}>1. Choose a term</div>
              <div className="row g-2">
                {TERMS.map((t) => (
                  <div className="col-12 col-sm-4" key={t}>
                    <Choice selected={term === t} onClick={() => setTerm(t)}>
                      <div className="fw-800">{t}</div>
                      <div className="fs-8 text-muted-2">Average {Math.round(getResult(ward, t).average)}%</div>
                    </Choice>
                  </div>
                ))}
              </div>
            </div>

            <div className="fw-800 mb-2 no-print" style={{ fontSize: "1.05rem" }} data-stagger>2. Here are your results for {term}</div>
            <div data-stagger>
              <ReportCard ward={ward} term={term} onDownload={() => toast("Your results have been saved as a PDF", "brand")} />
            </div>

            <div className="row g-4 mt-1">
              <div className="col-lg-7">
                <Panel title="Your scores by subject" subtitle="A taller bar means a higher score">
                  <BarChart data={result.rows.map((r) => ({ label: r.subject.split(" ")[0].slice(0, 7), value: r.total }))} height={210} />
                </Panel>
              </div>
              <div className="col-lg-5">
                <Panel title="How you are doing each term" subtitle="Your average score">
                  <BarChart
                    data={TERMS.map((t) => ({ label: t.replace(" Term", ""), value: Math.round(getResult(ward, t).average) }))}
                    height={210} colorFrom="#14b8a6" colorTo="#2563c9" format={(n) => `${n}%`}
                  />
                </Panel>
              </div>
            </div>
          </>
        )}

        {/* ============================ PAY FEES ============================ */}
        {tab === "fees" && invoice && (
          <FeeWizard
            studentId={account.id} term={term} setTerm={setTerm} invoice={invoice} owedFor={owedFor} onPay={recordPayment} onShowReceipt={setReceipt} onBack={() => setTab("home")}
          />
        )}
        {tab === "fees" && !invoice && (
          <Notice tone="teal" title="Nothing to pay right now">You have no outstanding invoices. You can still see your receipts in "My Receipts".</Notice>
        )}

        {/* ============================ RECEIPTS ============================ */}
        {tab === "payments" && (
          <Panel title="My receipts" subtitle="Press the 'Receipt' button to see or print any receipt again">
            <div className="d-flex flex-column gap-2">
              {myPayments.length === 0 && <Notice tone="brand" title="No receipts yet">You haven't made any payments yet. Go to "Pay school fees" to begin.</Notice>}
              {myPayments.map((p) => (
                <div key={p.id} className="d-flex flex-wrap align-items-center gap-3 p-3 rounded-4" style={{ border: "1px solid var(--slate-200)" }}>
                  <span className="d-grid rounded-3 flex-shrink-0" style={{ width: 48, height: 48, placeItems: "center", background: "var(--teal-100)", color: "var(--teal-600)" }}>
                    <IconArrowRight size={22} />
                  </span>
                  <div className="flex-grow-1" style={{ minWidth: 220 }}>
                    <div className="fw-800" style={{ fontSize: "1.05rem" }}>{money(p.amount)} · {p.term}</div>
                    <div className="fs-8 text-muted-2">{p.date} · {p.method} · Receipt no. <span className="mono">{p.reference}</span></div>
                  </div>
                  <Badge tone="teal">Paid</Badge>
                  <Btn variant="soft" onClick={() => setReceipt({ ref: p.reference, amount: p.amount, term: p.term, method: p.method, date: p.date })}>
                    <span className="d-inline-flex align-items-center gap-2"><IconEye size={16} /> Receipt</span>
                  </Btn>
                </div>
              ))}
            </div>
          </Panel>
        )}

        {/* ============================ NEWS ============================ */}
        {tab === "news" && <NewsBoard onOpen={(t) => toast(`Opening "${t}"…`, "brand")} />}

        {/* ============================ TIMETABLE ============================ */}
        {tab === "timetable" && (
          <div className="row g-4">
            <div className="col-xl-8">
              <Panel title={`Lessons for ${account.className}`} subtitle="Monday to Friday">
                <div className="table-responsive">
                  <table className="table-x">
                    <thead><tr><th>Time</th>{DAYS.map((d) => <th key={d}>{d.slice(0, 3)}</th>)}</tr></thead>
                    <tbody>
                      {CLASS_TIMETABLE.map((row) => {
                        const isBreak = row.days[0] === "Break";
                        return (
                          <tr key={row.time} style={isBreak ? { background: "var(--amber-100)" } : undefined}>
                            <td className="mono fw-bold text-ink" style={{ whiteSpace: "nowrap" }}>{row.time}</td>
                            {isBreak
                              ? <td colSpan={5} className="fw-800 text-center">Break time</td>
                              : row.days.map((d, i) => <td key={i}>{d}</td>)}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>
            <div className="col-xl-4 d-flex flex-column gap-4">
              <Panel title="Important dates" subtitle="This term">
                {CALENDAR_TERM_DATES.map((c) => (
                  <div key={c.label} className="d-flex justify-content-between gap-3 py-2 border-bottom">
                    <span className="text-muted-2">{c.label}</span>
                    <span className="fw-800 text-end">{c.value}</span>
                  </div>
                ))}
              </Panel>
              <Panel title="Coming up" subtitle="School events">
                <div className="d-flex flex-column gap-3">
                  {EVENTS.map((e) => (
                    <div key={e.title} className="d-flex align-items-center gap-3">
                      <div className="text-center rounded-3 flex-shrink-0" style={{ width: 54, padding: "5px 0", background: "var(--slate-50)", border: "1px solid var(--slate-200)" }}>
                        <div className="display-font fw-800 text-brand" style={{ fontSize: "1.1rem", lineHeight: 1.1 }}>{e.day}</div>
                        <div className="eyebrow text-muted-2" style={{ fontSize: ".55rem" }}>{e.month}</div>
                      </div>
                      <div className="lh-sm">
                        <div className="fw-bold">{e.title}</div>
                        <div className="fs-8 text-muted-2">{e.meta}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        )}

        {/* ============================ MY DETAILS ============================ */}
        {tab === "me" && (
          <div className="row g-4">
            <div className="col-lg-6 d-flex flex-column gap-4">
              <Panel title="About me" subtitle="Your school record">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <Avatar initials={account.initials} color={account.color} size={64} ring />
                  <div>
                    <div className="fw-800" style={{ fontSize: "1.2rem" }}>{account.name}</div>
                    <div className="text-muted-2">{account.className}</div>
                    <Badge tone="teal">Active pupil</Badge>
                  </div>
                </div>
                {[
                  ["Admission number", account.admissionNo],
                  ["Class", account.className],
                  ["Days present this term", `${ward.attendance}%`],
                  ["Parent / Guardian", account.parentName],
                  ["Parent's phone", account.parentPhone],
                ].map(([k, v]) => (
                  <div key={k} className="d-flex justify-content-between gap-3 py-2 border-bottom">
                    <span className="text-muted-2">{k}</span>
                    <span className="fw-800 text-end">{v}</span>
                  </div>
                ))}
              </Panel>
              <Panel title="School fees" subtitle="Your invoice position this term">
                {feeNotice}
                {myInvoices.length > 0 && (
                  <table className="table-x mt-3">
                    <thead><tr><th>Term</th><th>Due</th><th>Status</th><th>Total</th><th>Outstanding</th></tr></thead>
                    <tbody>
                      {myInvoices.map((i) => (
                        <tr key={i.id}>
                          <td className="fw-bold">{i.term}</td>
                          <td className="fs-8">{i.due}</td>
                          <td><Badge tone={i.status === "paid" ? "teal" : i.status === "partial" ? "amber" : "rose"}>{i.status}</Badge></td>
                          <td className="mono">{money(i.total)}</td>
                          <td className="mono fw-bold" style={{ color: owedFor(i) > 0 ? "var(--rose-500)" : "var(--teal-600)" }}>{owedFor(i) > 0 ? money(owedFor(i)) : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Panel>
            </div>

            <div className="col-lg-6">
              <Panel title="My login details" subtitle="Only you should know your PIN">
                <div className="p-3 rounded-4 mb-3" style={{ background: "var(--slate-50)", border: "1px solid var(--slate-200)" }}>
                  <div className="fs-8 text-muted-2">Login ID (your Admission Number)</div>
                  <div className="display-font fw-800 mono" style={{ fontSize: "1.45rem" }}>{account.admissionNo}</div>
                </div>
                <div className="p-3 rounded-4 mb-3 d-flex align-items-center justify-content-between gap-3" style={{ background: "var(--slate-50)", border: "1px solid var(--slate-200)" }}>
                  <div>
                    <div className="fs-8 text-muted-2">My PIN</div>
                    <div className="display-font fw-800 mono" style={{ fontSize: "1.45rem", letterSpacing: ".3em" }}>{showPin ? account.pin : "••••"}</div>
                  </div>
                  <Btn variant="soft" onClick={() => setShowPin(!showPin)}>
                    <span className="d-inline-flex align-items-center gap-2"><IconEye size={16} /> {showPin ? "Hide" : "Show"}</span>
                  </Btn>
                </div>

                {!changingPin ? (
                  <Btn full size="lg" onClick={() => setChangingPin(true)}>Change my PIN</Btn>
                ) : (
                  <div className="p-3 rounded-4" style={{ border: "2px solid var(--brand-100)" }}>
                    <label className="form-label">New PIN (4 numbers)</label>
                    <input className="form-control form-control-lg pin-input" maxLength={4} inputMode="numeric" placeholder="••••" />
                    <label className="form-label mt-3">Type the new PIN again</label>
                    <input className="form-control form-control-lg pin-input" maxLength={4} inputMode="numeric" placeholder="••••" />
                    <div className="d-flex gap-2 mt-3">
                      <Btn variant="soft" full onClick={() => setChangingPin(false)}>Cancel</Btn>
                      <Btn full onClick={() => { setChangingPin(false); toast("Your PIN has been changed"); }}>Save new PIN</Btn>
                    </div>
                  </div>
                )}

                <div className="mt-3">
                  <Notice tone="brand" title="Keep your PIN secret">
                    Do not share it with friends. If you forget it, the school office can reset it for you.
                  </Notice>
                </div>
              </Panel>
            </div>
          </div>
        )}
      </div>

      {/* receipt */}
      <Modal open={!!receipt} onClose={() => setReceipt(null)} title="Your receipt">
        {receipt && (
          <div>
            <div className="text-center mb-3"><CheckBurst size={70} /></div>
            <div className="text-center mb-4">
              <div className="display-font fw-800" style={{ fontSize: "1.9rem" }}>{money(receipt.amount)}</div>
              <div className="text-muted-2">Paid on {receipt.date}</div>
            </div>
            <div className="d-flex flex-column mb-4">
              {[["Receipt number", receipt.ref], ["Paid for", `${account.name} · ${account.className}`], ["Term", receipt.term], ["Paid by", receipt.method], ["School", "Scholaris International Academy"]].map(([k, v]) => (
                <div key={k} className="d-flex justify-content-between gap-3 py-2 border-bottom">
                  <span className="text-muted-2">{k}</span><span className="fw-bold text-end">{v}</span>
                </div>
              ))}
            </div>
            <div className="d-flex gap-2">
              <Btn full variant="soft" onClick={() => window.print()}><span className="d-inline-flex align-items-center gap-2"><IconPrinter size={16} /> Print</span></Btn>
              <Btn full onClick={() => toast("Receipt saved to your phone", "brand")}><span className="d-inline-flex align-items-center gap-2"><IconDownload size={16} /> Save</span></Btn>
            </div>
          </div>
        )}
      </Modal>

      {toastNode}
    </PortalFrame>
  );
}

/* ==========================================================================
   FEE WIZARD — 3 steps: who & how much → how to pay → done
   ========================================================================== */
function FeeWizard({
  studentId, term, setTerm, invoice, owedFor, onPay, onShowReceipt, onBack,
}: {
  studentId: string; term: string; setTerm: (t: Term) => void; invoice: StudentInvoice;
  owedFor: (inv: StudentInvoice) => number;
  onPay: (inv: StudentInvoice, amount: number, methodLabel: string) => Receipt;
  onShowReceipt: (r: Receipt) => void; onBack: () => void;
}) {
  const [step, setStep] = useState(1);
  const [payAll, setPayAll] = useState(true);
  const [partAmount, setPartAmount] = useState(50000);
  const [method, setMethod] = useState<"card" | "transfer" | "ussd">("card");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState<Receipt | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const owed = owedFor(invoice);
  const amount = payAll ? owed : Math.min(owed, Math.max(0, partAmount));
  const methodMeta = PAYMENT_METHODS.find((m) => m.id === method)!;
  const payingNow = step === 3 && done ? done.amount : amount;
  const remaining = step === 3 ? owed : Math.max(0, owed - amount);

  useEffect(() => {
    if (boxRef.current) {
      gsap.fromTo(boxRef.current.children, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power3.out" });
    }
  }, [step]);

  const pay = () => {
    setProcessing(true);
    window.setTimeout(() => {
      const r = onPay(invoice, amount, methodMeta.label);
      setDone(r);
      setProcessing(false);
      setStep(3);
    }, 1800);
  };

  return (
    <div className="row g-4">
      <div className="col-lg-8">
        <div className="card-x p-3 p-md-4" data-stagger>
          <div ref={boxRef}>
            {/* -------- STEP 1 -------- */}
            {step === 1 && (
              <>
                <StepHead step={1} total={3} title="Which term and how much?" note="You can pay in full or pay part of it" />
                <div className="row g-2 mb-4">
                  {(["First Term", "Second Term", "Third Term"] as Term[]).map((t) => (
                    <div className="col-12 col-sm-4" key={t}>
                      <Choice selected={term === t} onClick={() => setTerm(t)}>
                        <div className="fw-800">{t}</div>
                        <div className="fs-8 text-muted-2">Due {STUDENT_INVOICES.find(i => i.studentId === studentId && i.term === t)?.due ?? "—"}</div>
                      </Choice>
                    </div>
                  ))}
                </div>

                {owed > 0 ? (
                  <>
                    <div className="fw-800 mb-2" style={{ fontSize: "1.05rem" }}>How much do you want to pay?</div>
                    <div className="row g-2 mb-3">
                      <div className="col-sm-6">
                        <Choice selected={payAll} onClick={() => setPayAll(true)}>
                          <div className="fw-800">Pay everything</div>
                          <div className="display-font fw-800 text-brand" style={{ fontSize: "1.4rem" }}>{money(owed)}</div>
                          <div className="fs-8 text-muted-2">{invoice.term} · {invoice.id}</div>
                        </Choice>
                      </div>
                      <div className="col-sm-6">
                        <Choice selected={!payAll} onClick={() => setPayAll(false)}>
                          <div className="fw-800">Pay part of it</div>
                          <div className="display-font fw-800 text-muted-2" style={{ fontSize: "1.4rem" }}>Any amount</div>
                          <div className="fs-8 text-muted-2">Pay some now and the rest later</div>
                        </Choice>
                      </div>
                    </div>

                    {!payAll && (
                      <div className="mb-3">
                        <label className="form-label" htmlFor="part-amount">Type the amount (₦)</label>
                        <input id="part-amount" type="number" className="form-control form-control-lg mono" value={partAmount} min={1000} max={owed} step={500}
                          onChange={(e) => setPartAmount(Number(e.target.value))} />
                        <div className="fs-8 text-muted-2 mt-1">You can pay between ₦1,000 and {money(owed)}.</div>
                      </div>
                    )}

                    <Btn size="lg" full onClick={() => setStep(2)} disabled={amount < 1000}>
                      <span className="d-inline-flex align-items-center gap-2">Next: choose how to pay <IconArrowRight size={18} /></span>
                    </Btn>
                  </>
                ) : (
                  <Notice tone="teal" title="Nothing to pay for this term">
                    Everything is paid. Press "Back" to choose another term, or go to "My Receipts".
                  </Notice>
                )}
              </>
            )}

            {/* -------- STEP 2 -------- */}
            {step === 2 && (
              <>
                <StepHead step={2} total={3} title="How do you want to pay?" note={`You are paying ${money(amount)} for ${invoice.term}`} />
                <div className="row g-2 mb-3">
                  {PAYMENT_METHODS.map((m) => {
                    const on = method === m.id;
                    return (
                      <div className="col-12" key={m.id}>
                        <Choice selected={on} onClick={() => setMethod(m.id)}>
                          <div className="d-flex align-items-center gap-3">
                            <span className="d-grid rounded-3 flex-shrink-0" style={{ width: 50, height: 50, placeItems: "center", background: on ? "var(--brand-600)" : "var(--slate-100)", color: on ? "#fff" : "var(--slate-700)" }}>
                              {m.icon === "card" ? <IconCard size={24} /> : m.icon === "bank" ? <IconBank size={24} /> : <IconMobile size={24} />}
                            </span>
                            <div>
                              <div className="fw-800" style={{ fontSize: "1.05rem" }}>{m.label}</div>
                              <div className="fs-8 text-muted-2">{m.desc}</div>
                            </div>
                            <span className="ms-auto badge-x badge-x--slate me-4">{m.badge}</span>
                          </div>
                        </Choice>
                      </div>
                    );
                  })}
                </div>

                {method === "card" && (
                  <div className="row g-3 mb-3">
                    <div className="col-12">
                      <label className="form-label">Card number (the 16 numbers on the front)</label>
                      <input className="form-control form-control-lg mono" defaultValue="4291 8871 0042 5518" inputMode="numeric" />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Expiry date (MM / YY)</label>
                      <input className="form-control form-control-lg mono" defaultValue="09 / 28" />
                    </div>
                    <div className="col-6">
                      <label className="form-label">CVV (3 numbers at the back)</label>
                      <input className="form-control form-control-lg mono" defaultValue="341" type="password" inputMode="numeric" />
                    </div>
                  </div>
                )}
                {method === "transfer" && (
                  <div className="p-3 rounded-4 mb-3" style={{ background: "var(--slate-50)", border: "1px solid var(--slate-200)" }}>
                    <div className="fw-800 mb-2">Send the money to this account</div>
                    <div className="display-font fw-800 mono" style={{ fontSize: "1.6rem" }}>1014 785 220</div>
                    <div>Zenith Bank · Scholaris International Academy</div>
                    <div className="fs-8 text-muted-2 mt-1">Use <strong>{invoice.id}</strong> as the reference, then press the green button below.</div>
                  </div>
                )}
                {method === "ussd" && (
                  <div className="p-3 rounded-4 mb-3" style={{ background: "var(--slate-50)", border: "1px solid var(--slate-200)" }}>
                    <label className="form-label">Which bank do you use?</label>
                    <select className="form-select form-select-lg mb-3" defaultValue="gtb">
                      <option value="gtb">GTBank</option><option value="zen">Zenith Bank</option><option value="uba">UBA</option><option value="acc">Access Bank</option><option value="fbn">First Bank</option>
                    </select>
                    <div className="fw-800 mb-1">Dial this on your phone</div>
                    <div className="display-font fw-800 mono" style={{ fontSize: "1.6rem" }}>*737*50*{Math.round(amount / 1000)}#</div>
                    <div className="fs-8 text-muted-2 mt-1">Follow the instructions on your phone, then press the green button below.</div>
                  </div>
                )}

                <Notice tone="brand" title="Your payment is safe">The school never sees your card details. You will get a receipt immediately.</Notice>

                <div className="d-flex gap-2 mt-3 flex-wrap">
                  <Btn variant="soft" size="lg" onClick={() => setStep(1)}>← Back</Btn>
                  <Btn variant="teal" size="lg" className="flex-grow-1" onClick={pay} disabled={processing}>
                    {processing
                      ? <span className="d-inline-flex align-items-center gap-2"><span className="spinner-border spinner-border-sm" /> Please wait…</span>
                      : <span className="d-inline-flex align-items-center gap-2">Pay {money(amount)} now <IconCheck size={18} /></span>}
                  </Btn>
                </div>
              </>
            )}

            {/* -------- STEP 3 -------- */}
            {step === 3 && done && (
              <div className="text-center py-3">
                <CheckBurst size={100} />
                <h3 className="display-font fw-800 mt-3" style={{ fontSize: "1.6rem" }}>Payment successful!</h3>
                <p className="text-muted-2">You paid <strong className="text-ink">{money(done.amount)}</strong> for <strong className="text-ink">{done.term}</strong>.</p>
                <div className="p-3 rounded-4 mx-auto mb-4" style={{ background: "var(--slate-50)", maxWidth: 420 }}>
                  <div className="fs-8 text-muted-2">Your receipt number</div>
                  <div className="display-font fw-800 mono" style={{ fontSize: "1.4rem" }}>{done.ref}</div>
                  <div className="fs-8 text-muted-2 mt-1">Keep it safe — you can print it again from "My Receipts".</div>
                </div>
                <div className="d-flex flex-column gap-2 mx-auto" style={{ maxWidth: 420 }}>
                  <Btn size="lg" onClick={() => onShowReceipt(done)}><span className="d-inline-flex align-items-center gap-2"><IconPrinter size={18} /> See / print my receipt</span></Btn>
                  <Btn size="lg" variant="soft" onClick={onBack}>Back to Home</Btn>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="col-lg-4 d-flex flex-column gap-4">
        <div className="card-x p-4" data-stagger>
          <div className="fw-800 mb-3">Summary</div>
          {[
            ["Term", invoice.term],
            ["Total for the term", money(invoice.total)],
            ["Already paid", money(invoice.total - owed)],
          ].map(([k, v]) => (
            <div key={k} className="d-flex justify-content-between gap-3 py-2 border-bottom"><span className="text-muted-2">{k}</span><span className="fw-bold">{v}</span></div>
          ))}
          <div className="d-flex justify-content-between gap-3 py-2 border-bottom">
            <span className="fw-800">{step === 3 ? "You paid" : "Paying now"}</span>
            <span className="display-font fw-800 text-brand" style={{ fontSize: "1.2rem" }}>{money(payingNow)}</span>
          </div>
          <div className="d-flex justify-content-between gap-3 py-2"><span className="text-muted-2">Left to pay after</span><span className="fw-bold">{money(remaining)}</span></div>
        </div>
        <div className="card-x p-4" data-stagger>
          <div className="fw-800 mb-2">3 easy steps</div>
          <ol className="mb-0 ps-3 d-flex flex-column gap-1">
            <li className={step === 1 ? "fw-800 text-brand" : ""}>Choose the term and amount</li>
            <li className={step === 2 ? "fw-800 text-brand" : ""}>Choose how to pay</li>
            <li className={step === 3 ? "fw-800 text-brand" : ""}>Get your receipt</li>
          </ol>
        </div>
        <Notice tone="brand" title="Safe and secure">
          Every payment gets a receipt number. Nothing is charged twice.
        </Notice>
      </div>
    </div>
  );
}
