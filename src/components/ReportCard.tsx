import { useMemo } from "react";
import { Avatar, Badge, Btn } from "./ui";
import { ScoreRing } from "./charts";
import { IconPrinter, IconDownload, IconShield } from "./Icons";
import { getResult, GRADE_LEGEND, SESSION, type Ward, type Term } from "../data/mock";

/* ==========================================================================
   Plain-language report card — shared by the Student and Parent portals
   ========================================================================== */
export default function ReportCard({ ward, term, onDownload }: { ward: Ward; term: Term; onDownload: () => void }) {
  const result = useMemo(() => getResult(ward, term), [ward, term]);
  const verdict =
    result.average >= 75 ? "Excellent work!" :
    result.average >= 65 ? "Very good" :
    result.average >= 50 ? "Good — passed" : "Needs more effort";
  const ringTone = result.average >= 65 ? "#0d9488" : result.average >= 50 ? "#2563c9" : "#f59e0b";

  return (
    <div className="report-card">
      {/* header */}
      <div className="p-4 d-flex flex-wrap align-items-center justify-content-between gap-3" style={{ background: "linear-gradient(120deg,#0d1426,#1b2a4d 60%,#0b3b3a)" }}>
        <div className="d-flex align-items-center gap-3">
          <Avatar initials={ward.initials} color={ward.color} size={60} ring />
          <div className="lh-sm">
            <div className="display-font fw-800 text-white" style={{ fontSize: "1.3rem" }}>{ward.name}</div>
            <div style={{ color: "#b8c9e4" }}>{ward.className}{ward.arm} · Admission No. <span className="mono">{ward.admissionNo}</span></div>
            <div style={{ color: "#8fa6cd", fontSize: ".9rem" }}>{term} · {SESSION} session</div>
          </div>
        </div>
        <div className="text-white text-end">
          <div className="eyebrow" style={{ color: "#8fa6cd" }}>Scholaris International Academy</div>
          <div style={{ color: "#b8c9e4", fontSize: ".9rem" }}>Official termly report</div>
        </div>
      </div>

      {/* summary strip */}
      <div className="p-4 d-flex flex-wrap align-items-center gap-4" style={{ borderBottom: "1px solid var(--slate-200)" }}>
        <ScoreRing value={Math.round(result.average)} size={124} tone={ringTone} label="Average" />
        <div className="flex-grow-1">
          <div className="fs-8 text-muted-2">Overall</div>
          <div className="display-font fw-800" style={{ fontSize: "1.55rem", color: ringTone }}>{verdict}</div>
          <div className="row g-2 mt-1">
            {[
              ["Position in class", result.position],
              ["Total score", `${result.total} out of ${result.obtainable}`],
              ["Days present", `${ward.attendance}%`],
              ["Next term begins", ward.nextTermBegins],
            ].map(([k, v]) => (
              <div className="col-6 col-md-3" key={k}>
                <div className="p-2 px-3 rounded-3 h-100" style={{ background: "var(--slate-50)" }}>
                  <div className="fs-8 text-muted-2">{k}</div>
                  <div className="fw-800">{v}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* scores */}
      <div className="table-responsive">
        <table className="table-x">
          <thead>
            <tr>
              <th>Subject</th><th>Test (out of 40)</th><th>Exam (out of 60)</th><th>Total (out of 100)</th><th>Grade</th><th>What it means</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((r) => (
              <tr key={r.subject}>
                <td className="fw-bold text-ink">{r.subject}</td>
                <td className="mono">{r.ca}</td>
                <td className="mono">{r.exam}</td>
                <td className="mono fw-800 text-ink" style={{ fontSize: "1.05rem" }}>{r.total}</td>
                <td><Badge tone={r.tone}>{r.grade}</Badge></td>
                <td>{r.remark}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* remarks */}
      <div className="p-4 row g-3" style={{ borderTop: "1px solid var(--slate-200)" }}>
        <div className="col-md-6">
          <div className="p-3 rounded-4 h-100" style={{ background: "var(--slate-50)" }}>
            <div className="fw-800 mb-1">Class teacher says</div>
            <p className="mb-0">{result.formMasterRemark}</p>
          </div>
        </div>
        <div className="col-md-6">
          <div className="p-3 rounded-4 h-100" style={{ background: "var(--slate-50)" }}>
            <div className="fw-800 mb-1">Principal says</div>
            <p className="mb-0">{result.principalRemark}</p>
          </div>
        </div>
      </div>

      {/* legend */}
      <div className="px-4 pb-4">
        <div className="fw-800 mb-2">What the grades mean</div>
        <div className="d-flex flex-wrap gap-2">
          {GRADE_LEGEND.map((g) => (
            <span key={g.grade} className={`badge-x badge-x--${g.tone}`} style={{ fontSize: ".84rem", padding: ".45rem .85rem" }}>
              {g.grade} · {g.range} · {g.meaning}
            </span>
          ))}
        </div>
      </div>

      {/* actions */}
      <div className="p-4 d-flex flex-wrap gap-2 align-items-center justify-content-between no-print" style={{ borderTop: "1px solid var(--slate-200)", background: "var(--slate-50)" }}>
        <div className="d-flex align-items-center gap-2 fs-8 text-muted-2"><IconShield size={15} /> Official result · checked and released by the school</div>
        <div className="d-flex gap-2 flex-wrap">
          <Btn size="lg" variant="soft" onClick={onDownload}>
            <span className="d-inline-flex align-items-center gap-2"><IconDownload size={18} /> Save as PDF</span>
          </Btn>
          <Btn size="lg" onClick={() => window.print()}>
            <span className="d-inline-flex align-items-center gap-2"><IconPrinter size={18} /> Print</span>
          </Btn>
        </div>
      </div>
    </div>
  );
}
