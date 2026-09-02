import type { ReactNode, SVGProps } from "react";

/* ==========================================================================
   Pure native SVG icon set — no icon library, hand-authored paths
   ========================================================================== */

type IconProps = {
  size?: number;
  className?: string;
  strokeWidth?: number;
  title?: string;
};

const S = ({
  size = 18,
  className = "",
  strokeWidth = 1.7,
  children,
  title,
}: IconProps & { children: ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    role={title ? "img" : "presentation"}
    aria-hidden={title ? undefined : true}
  >
    {title ? <title>{title}</title> : null}
    {children}
  </svg>
);

/* ---------------- Brand mark ---------------- */
export const LogoMark = ({ size = 40, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" className={className} role="img" aria-label="Scholaris logo">
    <defs>
      <linearGradient id="lgA" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#6ba3f0" />
        <stop offset="55%" stopColor="#2563c9" />
        <stop offset="100%" stopColor="#0d9488" />
      </linearGradient>
    </defs>
    <rect x="1.5" y="1.5" width="45" height="45" rx="13" fill="url(#lgA)" />
    <path d="M24 11.5 36 17.2 24 22.9 12 17.2 24 11.5Z" fill="#fff" fillOpacity=".95" />
    <path d="M16.6 21v6.4c0 2.6 3.3 4.6 7.4 4.6s7.4-2 7.4-4.6V21" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    <path d="M33.9 18.6v6.1" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    <circle cx="33.9" cy="26.4" r="1.5" fill="#fff" />
    <path d="M12 18.6v7.2" stroke="#fff" strokeOpacity=".55" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/* ---------------- Navigation & UI ---------------- */
export const IconGrid = (p: IconProps) => (
  <S {...p}><rect x="3" y="3" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="2" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" /></S>
);
export const IconMenu = (p: IconProps) => (<S {...p}><path d="M4 7h16M4 12h16M4 17h16" /></S>);
export const IconX = (p: IconProps) => (<S {...p}><path d="M6 6l12 12M18 6L6 18" /></S>);
export const IconChevronDown = (p: IconProps) => (<S {...p}><path d="M6 9.5l6 6 6-6" /></S>);
export const IconChevronRight = (p: IconProps) => (<S {...p}><path d="M9 6l6 6-6 6" /></S>);
export const IconArrowRight = (p: IconProps) => (<S {...p}><path d="M4 12h15M13 6l6 6-6 6" /></S>);
export const IconArrowUpRight = (p: IconProps) => (<S {...p}><path d="M7 17 17 7M9 7h8v8" /></S>);
export const IconSearch = (p: IconProps) => (<S {...p}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></S>);
export const IconFilter = (p: IconProps) => (<S {...p}><path d="M3 6h18M6 12h12M10 18h4" /></S>);
export const IconBell = (p: IconProps) => (<S {...p}><path d="M18 15V10a6 6 0 1 0-12 0v5l-1.6 2.4A.6.6 0 0 0 4.9 18h14.2a.6.6 0 0 0 .5-.6L18 15Z" /><path d="M10 21h4" /></S>);
export const IconLogout = (p: IconProps) => (<S {...p}><path d="M15 4h2.5A2.5 2.5 0 0 1 20 6.5v11A2.5 2.5 0 0 1 17.5 20H15" /><path d="M10 8l-4 4 4 4M6 12h9" /></S>);
export const IconSettings = (p: IconProps) => (<S {...p}><circle cx="12" cy="12" r="3" /><path d="M12 3v2.2M12 18.8V21M4.2 7.5l1.9 1.1M17.9 15.4l1.9 1.1M4.2 16.5l1.9-1.1M17.9 8.6l1.9-1.1" /></S>);
export const IconEye = (p: IconProps) => (<S {...p}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.8" /></S>);
export const IconPrinter = (p: IconProps) => (<S {...p}><path d="M7 9V4h10v5" /><rect x="3.5" y="9" width="17" height="7" rx="2" /><path d="M7 14h10v6H7z" /></S>);
export const IconDownload = (p: IconProps) => (<S {...p}><path d="M12 4v11M7.5 10.5 12 15l4.5-4.5" /><path d="M4.5 19.5h15" /></S>);
export const IconUpload = (p: IconProps) => (<S {...p}><path d="M12 16V5M7.5 9.5 12 5l4.5 4.5" /><path d="M4.5 19.5h15" /></S>);
export const IconPlus = (p: IconProps) => (<S {...p}><path d="M12 5v14M5 12h14" /></S>);
export const IconCheck = (p: IconProps) => (<S {...p}><path d="M5 13l4.5 4.5L19 7" /></S>);
export const IconCheckCircle = (p: IconProps) => (<S {...p}><circle cx="12" cy="12" r="8.5" /><path d="M8.2 12.4l2.7 2.7 5-5.3" /></S>);
export const IconAlert = (p: IconProps) => (<S {...p}><path d="M12 4.5 21 19.5H3L12 4.5Z" /><path d="M12 10v4M12 16.8v.2" /></S>);
export const IconInfo = (p: IconProps) => (<S {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.5M12 7.8v.2" /></S>);
export const IconClock = (p: IconProps) => (<S {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3.2 2" /></S>);
export const IconCalendar = (p: IconProps) => (<S {...p}><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 10h17M8 3.5V6M16 3.5V6" /></S>);
export const IconSparkle = (p: IconProps) => (<S {...p}><path d="M12 3.5 13.8 9l5.7 1.9-5.7 1.9L12 18.5 10.2 12.8 4.5 10.9 10.2 9 12 3.5Z" /><path d="M18.5 16.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z" /></S>);
export const IconLock = (p: IconProps) => (<S {...p}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /><path d="M12 15v2" /></S>);
export const IconUnlock = (p: IconProps) => (<S {...p}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 7.5-2" /><path d="M12 15v2" /></S>);

/* ---------------- Academic ---------------- */
export const IconCap = (p: IconProps) => (<S {...p}><path d="M2.5 9 12 4.8 21.5 9 12 13.2 2.5 9Z" /><path d="M6.5 11v4.6c0 1.6 2.5 2.9 5.5 2.9s5.5-1.3 5.5-2.9V11" /><path d="M20.5 9.6v5.2" /></S>);
export const IconBook = (p: IconProps) => (<S {...p}><path d="M4 5.5A2 2 0 0 1 6 3.5h4.5A2.5 2.5 0 0 1 13 6v14a2 2 0 0 0-2-2H6a2 2 0 0 1-2-2V5.5Z" /><path d="M20 5.5a2 2 0 0 0-2-2h-4.5A2.5 2.5 0 0 0 11 6v14a2 2 0 0 1 2-2h5a2 2 0 0 0 2-2V5.5Z" /></S>);
export const IconClipboard = (p: IconProps) => (<S {...p}><rect x="5" y="4" width="14" height="17" rx="2.5" /><path d="M9 4V2.8h6V4" /><path d="M9 10h6M9 14h6M9 17.5h3.5" /></S>);
export const IconTrophy = (p: IconProps) => (<S {...p}><path d="M8 4h8v4.5a4 4 0 0 1-8 0V4Z" /><path d="M8 5.5H5.5V7a3 3 0 0 0 3 3M16 5.5h2.5V7a3 3 0 0 1-3 3" /><path d="M12 12.5V16M9 20h6M10 16h4l.6 4h-5.2l.6-4Z" /></S>);
export const IconCertificate = (p: IconProps) => (<S {...p}><rect x="3.5" y="4" width="17" height="12" rx="2" /><path d="M7 8h6M7 11h4" /><circle cx="16.6" cy="17.4" r="3" /><path d="M14.9 19.9 14 22.5l2.6-1.2 2.6 1.2-.9-2.6" /></S>);

/* ---------------- People ---------------- */
export const IconUsers = (p: IconProps) => (<S {...p}><circle cx="9" cy="8" r="3.4" /><path d="M3 19.5c0-3.2 2.7-5.2 6-5.2s6 2 6 5.2" /><path d="M16 5.2a3.2 3.2 0 0 1 0 6.2M17.6 14.6c2 .7 3.4 2.4 3.4 4.9" /></S>);
export const IconUser = (p: IconProps) => (<S {...p}><circle cx="12" cy="8" r="3.6" /><path d="M5 20c0-3.6 3.1-5.8 7-5.8s7 2.2 7 5.8" /></S>);
export const IconTeacher = (p: IconProps) => (<S {...p}><circle cx="12" cy="7.5" r="3" /><path d="M6 20v-3.6c0-2 2.7-3.4 6-3.4s6 1.4 6 3.4V20" /><path d="M9.5 10.6 12 14l2.5-3.4" /></S>);
export const IconParent = (p: IconProps) => (<S {...p}><circle cx="8.5" cy="7.5" r="3" /><circle cx="16.5" cy="9.5" r="2.3" /><path d="M3 19.5c0-3 2.5-4.8 5.5-4.8S14 16.5 14 19.5" /><path d="M14.6 14.9c2.6.2 4.4 1.8 4.4 4.3" /></S>);

/* ---------------- Finance ---------------- */
export const IconWallet = (p: IconProps) => (<S {...p}><rect x="3" y="6" width="18" height="13" rx="3" /><path d="M3 10h18" /><circle cx="17" cy="14.5" r="1.4" /><path d="M6 6V4.8a1.3 1.3 0 0 1 1.6-1.3l9 2.1" /></S>);
export const IconCard = (p: IconProps) => (<S {...p}><rect x="2.5" y="5" width="19" height="14" rx="2.6" /><path d="M2.5 9.8h19M6 15h3" /></S>);
export const IconReceipt = (p: IconProps) => (<S {...p}><path d="M5.5 3.5h13v17l-2.2-1.6-2.1 1.6-2.2-1.6-2.2 1.6-2.1-1.6L5.5 20.5v-17Z" /><path d="M9 8h6M9 11.5h6M9 15h3.5" /></S>);
export const IconBank = (p: IconProps) => (<S {...p}><path d="M3.5 9.5 12 4.5l8.5 5" /><path d="M5.5 9.5V19M18.5 9.5V19M9.5 12.5V19M14.5 12.5V19M3 19.5h18" /></S>);
export const IconMobile = (p: IconProps) => (<S {...p}><rect x="7" y="2.5" width="10" height="19" rx="2.6" /><path d="M11 5.5h2M10.5 18.5h3" /></S>);
export const IconTrendUp = (p: IconProps) => (<S {...p}><path d="M3.5 16.5 9 11l3.5 3.5L20.5 7" /><path d="M15.5 7h5v5" /></S>);
export const IconTrendDown = (p: IconProps) => (<S {...p}><path d="M3.5 7.5 9 13l3.5-3.5L20.5 17" /><path d="M15.5 17h5v-5" /></S>);
export const IconShield = (p: IconProps) => (<S {...p}><path d="M12 3.5 19.5 6v6c0 4.4-3.1 7.6-7.5 8.5C7.6 19.6 4.5 16.4 4.5 12V6L12 3.5Z" /><path d="M9 12l2.2 2.2L15.4 10" /></S>);
export const IconPie = (p: IconProps) => (<S {...p}><path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5H12V3.5Z" /><path d="M14.5 3.2A8.5 8.5 0 0 1 20.8 9.5h-6.3V3.2Z" /></S>);
export const IconChart = (p: IconProps) => (<S {...p}><path d="M4 20V4M4 20h16" /><rect x="7" y="12" width="3" height="5" rx="1" /><rect x="12" y="8" width="3" height="9" rx="1" /><rect x="17" y="5" width="3" height="12" rx="1" /></S>);
export const IconFile = (p: IconProps) => (<S {...p}><path d="M6 3.5h7.5L19 9v11.5H6V3.5Z" /><path d="M13 3.5V9h6" /><path d="M9 13h7M9 16.5h5" /></S>);

/* ---------------- Contact ---------------- */
export const IconMail = (p: IconProps) => (<S {...p}><rect x="2.5" y="5" width="19" height="14" rx="2.5" /><path d="m3.5 7 8.5 6 8.5-6" /></S>);
export const IconPhone = (p: IconProps) => (<S {...p}><path d="M6.5 3.5h3l1.5 4-2 1.4a11.5 11.5 0 0 0 6.1 6.1l1.4-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z" /></S>);
export const IconPin = (p: IconProps) => (<S {...p}><path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.6" /></S>);
export const IconGlobe = (p: IconProps) => (<S {...p}><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.4 2.4 3.6 5.3 3.6 8.5S14.4 18.1 12 20.5c-2.4-2.4-3.6-5.3-3.6-8.5S9.6 5.9 12 3.5Z" /></S>);

/* ---------------- Filled social glyphs (native SVG paths) ---------------- */
const Filled = ({ size = 16, className = "", d, viewBox = "0 0 24 24" }: { size?: number; className?: string; d: string; viewBox?: string }) => (
  <svg width={size} height={size} viewBox={viewBox} className={className} fill="currentColor" aria-hidden="true"><path d={d} /></svg>
);
export const SvgFacebook = (p: { size?: number; className?: string }) => (
  <Filled {...p} d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.91h-2.33V22C18.34 21.24 22 17.08 22 12.06Z" />
);
export const SvgX = (p: { size?: number; className?: string }) => (
  <Filled {...p} d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z" />
);
export const SvgLinkedIn = (p: { size?: number; className?: string }) => (
  <Filled {...p} d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13Zm1.78 13.02H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
);
export const SvgYouTube = (p: { size?: number; className?: string }) => (
  <Filled {...p} d="M23.5 6.2a3 3 0 0 0-2.12-2.13C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.52A3 3 0 0 0 .5 6.2C0 8.08 0 12 0 12s0 3.92.5 5.8a3 3 0 0 0 2.12 2.13c1.88.52 9.38.52 9.38.52s7.5 0 9.38-.52a3 3 0 0 0 2.12-2.13C24 15.92 24 12 24 12s0-3.92-.5-5.8ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z" />
);

/* ---------------- Illustrative composites ---------------- */
export const IllustrationLock = ({ size = 54, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
    <rect x="6" y="26" width="52" height="34" rx="10" fill="url(#lgB)" />
    <path d="M21 26v-6a11 11 0 0 1 22 0v6" stroke="#0d1426" strokeWidth="4.5" strokeLinecap="round" />
    <circle cx="32" cy="42" r="5" fill="#fff" />
    <path d="M32 44v6" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
    <defs>
      <linearGradient id="lgB" x1="6" y1="26" x2="58" y2="60">
        <stop stopColor="#3b7ae4" /><stop offset="1" stopColor="#0d9488" />
      </linearGradient>
    </defs>
  </svg>
);

export const IllustrationPay = ({ size = 54, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
    <rect x="4" y="14" width="56" height="36" rx="7" fill="#0d1426" />
    <rect x="4" y="14" width="56" height="36" rx="7" stroke="#3b7ae4" strokeWidth="2" />
    <rect x="10" y="20" width="20" height="5" rx="2.5" fill="#6ba3f0" />
    <rect x="10" y="40" width="18" height="5" rx="2.5" fill="#14b8a6" />
    <circle cx="46" cy="30" r="8" fill="#f59e0b" fillOpacity=".22" />
    <path d="M42.5 30.5 45 33l5-5.5" stroke="#f59e0b" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IllustrationReport = ({ size = 54, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
    <rect x="12" y="4" width="40" height="52" rx="7" fill="#fff" stroke="#0d1426" strokeWidth="2.5" />
    <rect x="19" y="12" width="26" height="5" rx="2.5" fill="#3b7ae4" />
    <rect x="19" y="22" width="14" height="4" rx="2" fill="#cbd5e1" />
    <rect x="19" y="30" width="22" height="4" rx="2" fill="#cbd5e1" />
    <path d="M19 48V40M27 48V36M35 48V42M43 48V33" stroke="#14b8a6" strokeWidth="3.4" strokeLinecap="round" />
  </svg>
);

export const CheckBurst = ({ size = 74 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none" aria-hidden="true" className="draw-check">
    <circle cx="40" cy="40" r="34" stroke="#14b8a6" strokeWidth="3.5" />
    <path d="M25 41.5 35.5 52 56 29" stroke="#0d9488" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ---------------- Decorative pattern blocks ---------------- */
export const PatternDots = ({ className = "", id = "pd" }: { className?: string; id?: string } & SVGProps<SVGSVGElement>) => (
  <svg className={className} aria-hidden="true">
    <defs>
      <pattern id={id} width="18" height="18" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.6" fill="currentColor" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill={`url(#${id})`} />
  </svg>
);

export const WaveDivider = ({ className = "", flip = false }: { className?: string; flip?: boolean }) => (
  <svg className={className} viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true" style={flip ? { transform: "scaleY(-1)" } : undefined}>
    <path d="M0 60c180-56 360-56 540-14s360 58 540 22 300-64 360-78v130H0V60Z" fill="currentColor" />
  </svg>
);
