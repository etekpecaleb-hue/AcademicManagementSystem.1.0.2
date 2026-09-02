import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap";

/* ==========================================================================
   Pure native SVG charts (no chart library) with GSAP draw-in animations
   ========================================================================== */

/* ---------- Vertical bar chart ---------- */
export function BarChart({
  data, height = 190, format, colorFrom = "#3b7ae4", colorTo = "#0d9488",
}: { data: { label: string; value: number }[]; height?: number; format?: (n: number) => string; colorFrom?: string; colorTo?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const max = Math.max(...data.map((d) => d.value)) * 1.12;

  useEffect(() => {
    if (!wrap.current) return;
    const bars = wrap.current.querySelectorAll<SVGRectElement>("[data-bar]");
    const labels = wrap.current.querySelectorAll<SVGGElement>("[data-barlabel]");
    const anim = gsap.timeline();
    anim.from(bars, { scaleY: 0, transformOrigin: "bottom", duration: 0.85, stagger: 0.07, ease: "power3.out" })
      .from(labels, { opacity: 0, y: 8, duration: 0.4, stagger: 0.05 }, "-=0.5");
    return () => { anim.kill(); };
  }, [data]);

  const uid = `bc${Math.round(max)}`;

  return (
    <div ref={wrap}>
      <svg viewBox={`0 0 ${data.length * 44} ${height}`} width="100%" height={height} role="img" aria-label="Bar chart">
        <defs>
          <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colorFrom} />
            <stop offset="100%" stopColor={colorTo} />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <line key={t} x1="0" x2={data.length * 44} y1={height - 26 - (height - 46) * t} y2={height - 26 - (height - 46) * t} stroke="#e2e8f0" strokeDasharray="3 4" strokeWidth="1" />
        ))}
        {data.map((d, i) => {
          const h = ((d.value / max) * (height - 46)) || 2;
          const x = i * 44 + 12;
          return (
            <g key={d.label}>
              <rect data-bar x={x} y={height - 26 - h} width="20" height={h} rx="6" fill={`url(#${uid})`} />
              <g data-barlabel>
                <text x={x + 10} y={height - 27 - h} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#334155">
                  {format ? format(d.value) : d.value}
                </text>
                <text x={x + 10} y={height - 10} textAnchor="middle" fontSize="9" fill="#64748b">{d.label}</text>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ---------- Smooth area line chart ---------- */
export function AreaChart({
  data, height = 200, stroke = "#2563c9", fill = "#3b7ae4",
}: { data: { label: string; value: number }[]; height?: number; stroke?: string; fill?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const W = 640;
  const pad = { l: 8, r: 8, t: 18, b: 26 };
  const max = Math.max(...data.map((d) => d.value)) * 1.08;
  const min = Math.min(...data.map((d) => d.value)) * 0.88;
  const pts = data.map((d, i) => {
    const x = pad.l + (i * (W - pad.l - pad.r)) / (data.length - 1);
    const y = pad.t + (1 - (d.value - min) / (max - min || 1)) * (height - pad.t - pad.b);
    return { x, y, ...d };
  });

  const path = pts.reduce((acc, p, i, arr) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = arr[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
  }, "");
  const area = `${path} L ${pts[pts.length - 1].x} ${height - pad.b} L ${pts[0].x} ${height - pad.b} Z`;

  useEffect(() => {
    if (!wrap.current) return;
    const tl = gsap.timeline();
    tl.from(wrap.current.querySelectorAll("[data-dot]"), { scale: 0, opacity: 0, transformOrigin: "center", stagger: 0.06, duration: 0.4, ease: "back.out(2)" })
      .from(wrap.current.querySelectorAll("[data-lbl]"), { opacity: 0, y: 6, stagger: 0.05, duration: 0.35 }, "-=0.3");
    const line = wrap.current.querySelector<SVGPathElement>("[data-line]");
    const ar = wrap.current.querySelector<SVGPathElement>("[data-area]");
    if (line) {
      const len = line.getTotalLength();
      gsap.fromTo(line, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.7, ease: "power2.inOut" });
    }
    if (ar) gsap.fromTo(ar, { opacity: 0 }, { opacity: 1, duration: 1.1, delay: 0.5 });
    return () => { tl.kill(); };
  }, [data]);

  const uid = `ac${Math.round(max)}`;

  return (
    <div ref={wrap}>
      <svg viewBox={`0 0 ${W} ${height}`} width="100%" height={height} role="img" aria-label="Trend chart">
        <defs>
          <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fill} stopOpacity="0.32" />
            <stop offset="100%" stopColor={fill} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {[0, 0.33, 0.66, 1].map((t) => (
          <line key={t} x1="0" x2={W} y1={pad.t + t * (height - pad.t - pad.b)} y2={pad.t + t * (height - pad.t - pad.b)} stroke="#eef2f7" strokeWidth="1" />
        ))}
        <path data-area d={area} fill={`url(#${uid})`} />
        <path data-line d={path} fill="none" stroke={stroke} strokeWidth="2.6" strokeLinecap="round" />
        {pts.map((p) => (
          <g key={p.label}>
            <circle data-dot cx={p.x} cy={p.y} r="4.6" fill="#fff" stroke={stroke} strokeWidth="2.4" />
            <text data-lbl x={p.x} y={height - 7} textAnchor="middle" fontSize="9.5" fill="#64748b">{p.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ---------- Donut chart ---------- */
export function Donut({
  segments, size = 190, thickness = 22, center,
}: { segments: { label: string; value: number; tone: string }[]; size?: number; thickness?: number; center?: { top: string; sub: string } }) {
  const wrap = useRef<HTMLDivElement>(null);
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  useEffect(() => {
    if (!wrap.current) return;
    const rings = wrap.current.querySelectorAll<SVGCircleElement>("[data-ring]");
    const anim = gsap.fromTo(rings, { strokeDasharray: `0 ${c}` }, { strokeDasharray: (i: number) => {
      const seg = segments[i];
      const len = (seg.value / total) * c;
      return `${len} ${c - len}`;
    }, duration: 1.2, stagger: 0.14, ease: "power3.out" });
    return () => { anim.kill(); };
  }, [segments, c, total]);

  return (
    <div ref={wrap} className="d-flex align-items-center gap-4 flex-wrap">
      <div className="position-relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Donut chart" style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={thickness} />
          {segments.map((s) => {
            const len = (s.value / total) * c;
            const dash = `${len} ${c - len}`;
            const el = (
              <circle
                key={s.label}
                data-ring
                cx={size / 2} cy={size / 2} r={r}
                fill="none" stroke={s.tone} strokeWidth={thickness} strokeLinecap="round"
                strokeDasharray={dash} strokeDashoffset={-offset}
                style={{ filter: "drop-shadow(0 4px 10px rgba(15,23,42,.10))" }}
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        {center && (
          <div className="position-absolute top-50 start-50 translate-middle text-center">
            <div className="display-font fw-800" style={{ fontSize: "1.55rem", lineHeight: 1 }}>{center.top}</div>
            <div className="eyebrow text-muted-2 mt-1" style={{ fontSize: ".58rem" }}>{center.sub}</div>
          </div>
        )}
      </div>
      <ul className="list-unstyled mb-0">
        {segments.map((s) => (
          <li key={s.label} className="d-flex align-items-center gap-2 mb-2">
            <span style={{ width: 10, height: 10, borderRadius: 3, background: s.tone, display: "inline-block" }} />
            <span className="fs-8 fw-bold text-muted-2 text-uppercase" style={{ letterSpacing: ".08em" }}>{s.label}</span>
            <span className="fw-800 fs-7 ms-auto ps-3">{s.value.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Radial score ring ---------- */
export function ScoreRing({ value, size = 132, label = "Average", tone = "#0d9488" }: { value: number; size?: number; label?: string; tone?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const r = (size - 14) / 2;
  const c = 2 * Math.PI * r;

  useEffect(() => {
    const ring = wrap.current?.querySelector<SVGCircleElement>("[data-scorering]");
    if (!ring) return;
    const len = (value / 100) * c;
    const t = gsap.fromTo(ring, { strokeDasharray: `0 ${c}` }, { strokeDasharray: `${len} ${c - len}`, duration: 1.5, ease: "power3.out" });
    return () => { t.kill(); };
  }, [value, c]);

  return (
    <div ref={wrap} className="position-relative d-inline-flex align-items-center justify-content-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef2f7" strokeWidth="10" />
        <circle data-scorering cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone} strokeWidth="10" strokeLinecap="round" />
      </svg>
      <div className="position-absolute text-center">
        <div className="display-font fw-800" style={{ fontSize: size * 0.24, lineHeight: 1 }}>{value}%</div>
        <div className="eyebrow text-muted-2" style={{ fontSize: ".55rem" }}>{label}</div>
      </div>
    </div>
  );
}

/* ---------- Mini sparkline ---------- */
export function Sparkline({ values, stroke = "#14b8a6", w = 90, h = 28 }: { values: number[]; stroke?: string; w?: number; h?: number }) {
  const max = Math.max(...values), min = Math.min(...values);
  const pts = values.map((v, i) => `${(i * w) / (values.length - 1)},${h - ((v - min) / (max - min || 1)) * (h - 4) - 2}`).join(" ");
  return (
    <svg width={w} height={h} aria-hidden="true">
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------- Horizontal comparison bars ---------- */
export function HBars({ data, format, tone = "#2563c9" }: { data: { label: string; value: number }[]; format?: (n: number) => string; tone?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const max = Math.max(...data.map((d) => d.value));
  useEffect(() => {
    if (!wrap.current) return;
    const a = gsap.from(wrap.current.querySelectorAll("[data-hbar]"), { width: 0, duration: 1, stagger: 0.06, ease: "power3.out" });
    return () => { a.kill(); };
  }, [data]);
  return (
    <div ref={wrap} className="d-flex flex-column gap-3">
      {data.map((d) => (
        <div key={d.label}>
          <div className="d-flex justify-content-between fs-8 mb-1">
            <span className="fw-bold text-muted-2">{d.label}</span>
            <span className="fw-800 text-ink">{format ? format(d.value) : d.value}</span>
          </div>
          <div className="prog" style={{ height: 7 }}>
            <div data-hbar className="prog__bar" style={{ width: `${(d.value / max) * 100}%`, background: `linear-gradient(90deg,${tone},#14b8a6)` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
