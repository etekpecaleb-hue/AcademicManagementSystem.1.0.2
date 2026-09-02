import { useEffect, useRef, useState } from "react";
import { gsap, useTypewriter, useScrollReveal, useRipple } from "../lib/gsap";
import { SCHOOL, NEWS, NEWSLETTERS, HELP } from "../data/mock";
import {
  LogoMark, IconCap, IconTeacher, IconGrid, IconArrowRight, IconWallet, IconClipboard, IconBell,
  IconCalendar, IconPhone, IconMail, IconPin, IconClock, IconShield, IconChevronRight,
  SvgFacebook, SvgX, SvgLinkedIn, SvgYouTube,
} from "../components/Icons";
// import retained for type export consistency
void 0;
import { Btn, SectionHead } from "../components/ui";
import { LargeTextToggle } from "../components/simple";
import type { Role } from "../App";

const ROLES: { role: Role; title: string; who: string; note: string; icon: typeof IconCap; tone: string; bg: string; cta: string }[] = [
  { role: "student", title: "Student", who: "For pupils", note: "See your results, pay school fees, read the newsletter and check your timetable.", icon: IconCap, tone: "#2563c9", bg: "#e4eeff", cta: "Log in as a Student" },
  { role: "teacher", title: "Teacher", who: "For staff", note: "Enter test and exam scores for the classes assigned to you by the office.", icon: IconTeacher, tone: "#7c3aed", bg: "#ede9fe", cta: "Log in as a Teacher" },
  { role: "admin", title: "School Admin", who: "For the office", note: "Assign classes to teachers, approve results, see finances and manage student logins.", icon: IconGrid, tone: "#b45309", bg: "#fef3d8", cta: "Log in as Admin" },
];

const STEPS = [
  { n: 1, t: "Get your login details", d: "Every pupil has an Admission Number and a 4-digit PIN. The school gave these to you on a printed login slip." },
  { n: 2, t: "Press 'Student' above", d: "Then type your Admission Number and your PIN in the two boxes. Press 'Show what I typed' if you want to check." },
  { n: 3, t: "Press 'Log in'", d: "That's it! You can see your results, pay school fees, read the newsletter and check your timetable. Press 'Log out' when you finish." },
];

/* ==========================================================================
   LANDING — one question: "Who are you?" — then the right login
   ========================================================================== */
export default function Landing({ onEnter }: { onEnter: (r: Role) => void }) {
  useRipple();
  useScrollReveal();
  const typeRef = useTypewriter(
    ["see your results.", "pay school fees.", "read the school newsletter.", "check your timetable."],
    { speed: 48, pause: 1700 }
  );
  const heroRef = useRef<HTMLElement>(null);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .from("[data-hero='a']", { y: 20, opacity: 0, duration: 0.6 })
        .from("[data-hero='b'] span", { y: 40, opacity: 0, duration: 0.8, stagger: 0.1 }, "-=0.3")
        .from("[data-hero='c']", { y: 24, opacity: 0, duration: 0.6 }, "-=0.4")
        .from("[data-hero='d'] > *", { y: 20, opacity: 0, duration: 0.5, stagger: 0.1 }, "-=0.3")
        .from("[data-hero='e']", { y: 50, opacity: 0, scale: 0.96, duration: 1 }, "-=0.9");
    }, heroRef);
    const onScroll = () => setSolid(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => { ctx.revert(); window.removeEventListener("scroll", onScroll); };
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div>
      {/* ================= NAV ================= */}
      <nav className="position-fixed top-0 start-0 w-100" style={{ zIndex: 1030, transition: "background .35s ease", background: solid ? "rgba(8,13,28,.92)" : "transparent", backdropFilter: "blur(12px)", borderBottom: solid ? "1px solid rgba(255,255,255,.08)" : "1px solid transparent" }}>
        <div className="container-xl d-flex align-items-center justify-content-between py-2 gap-2">
          <a href="#top" className="d-flex align-items-center gap-2 text-white">
            <LogoMark size={40} />
            <span className="lh-1">
              <span className="display-font fw-800 d-block" style={{ fontSize: "1.1rem" }}>Scholaris</span>
              <span style={{ fontSize: ".7rem", color: "#9fb0cf" }}>School Portal</span>
            </span>
          </a>
          <div className="d-flex align-items-center gap-2">
            <a href={`tel:${HELP.phone.replace(/\s/g, "")}`} className="d-none d-md-inline-flex align-items-center gap-2 text-white fw-bold px-3" style={{ fontSize: ".95rem" }}>
              <IconPhone size={16} /> Help: {HELP.phone}
            </a>
            <LargeTextToggle dark />
            <Btn onClick={() => scrollTo("login")}>Log in</Btn>
          </div>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <header ref={heroRef} id="top" className="hero" style={{ minHeight: "auto", padding: "130px 0 80px" }}>
        <div className="hero__grid" />
        <div className="hero__glow" style={{ width: 480, height: 480, top: "-10%", right: "-6%", background: "rgba(59,122,228,.4)" }} />
        <div className="hero__glow" style={{ width: 420, height: 420, bottom: "-16%", left: "-8%", background: "rgba(20,184,166,.3)" }} />
        <div className="container-xl position-relative">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <div data-hero="a" className="chip-dark mb-4"><span className="dot dot--live" /> {SCHOOL.name}</div>
              <h1 data-hero="b" className="display-font text-white mb-3" style={{ fontSize: "clamp(2.2rem,5vw,3.8rem)", lineHeight: 1.06 }}>
                <span className="d-block">Welcome to your</span>
                <span className="d-block">school portal<span style={{ color: "#14b8a6" }}>.</span></span>
              </h1>
              <p data-hero="c" className="mb-4" style={{ color: "#c3d2ec", fontSize: "1.2rem", maxWidth: 560 }}>
                One simple place to <span className="text-white fw-bold"><span ref={typeRef} /><span className="type-caret" /></span>
                <br />Made easy for students, parents and teachers — no computer skills needed.
              </p>
              <div data-hero="d" className="d-flex flex-wrap gap-3">
                <Btn size="lg" onClick={() => scrollTo("login")}>
                  <span className="d-inline-flex align-items-center gap-2">Log in now <IconArrowRight size={18} /></span>
                </Btn>
                <Btn size="lg" variant="ghost" onClick={() => scrollTo("how")}>How do I log in?</Btn>
              </div>
            </div>
            <div className="col-lg-5">
              <div data-hero="e" className="glass p-4">
                <div className="eyebrow mb-3" style={{ color: "#8fa6cd" }}>Today at Scholaris</div>
                <div className="d-flex flex-column gap-3">
                  {[
                    { i: <IconClipboard size={20} />, t: "Second Term results are ready", d: "Students: log in to see your results", c: "#5eead4" },
                    { i: <IconWallet size={20} />, t: "School fees are due on 9 January", d: "Parents: pay in 3 easy steps", c: "#fcd34d" },
                    { i: <IconCalendar size={20} />, t: "Inter-House Sports — 14 February", d: "Everyone is welcome", c: "#93c5fd" },
                  ].map((x) => (
                    <div key={x.t} className="d-flex align-items-start gap-3 p-3 rounded-4" style={{ background: "rgba(255,255,255,.06)" }}>
                      <span className="d-grid rounded-3 flex-shrink-0" style={{ width: 42, height: 42, placeItems: "center", background: "rgba(255,255,255,.1)", color: x.c }}>{x.i}</span>
                      <div>
                        <div className="text-white fw-bold">{x.t}</div>
                        <div style={{ color: "#a9bcda", fontSize: ".9rem" }}>{x.d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ================= WHO ARE YOU ================= */}
      <section id="login" className="section-pad" style={{ background: "var(--slate-50)" }}>
        <div className="container-xl">
          <SectionHead
            eyebrow="Start here"
            title="Who are you? Press your button"
            lead="Every student, parent, teacher and admin has their own separate login. Choose yours below."
          />
          <div className="row g-4">
            {ROLES.map((r, i) => (
              <div className="col-md-6 col-xl-3" key={r.role} data-reveal="up" data-delay={i * 0.1}>
                <div className="role-card">
                  <span className="role-card__icon" style={{ background: r.bg, color: r.tone }}><r.icon size={40} /></span>
                  <div className="eyebrow text-muted-2">{r.who}</div>
                  <h3 className="fs-4 fw-800 mb-0">{r.title}</h3>
                  <p className="text-muted-2 mb-1" style={{ minHeight: 48 }}>{r.note}</p>
                  <Btn full size="lg" className="mt-auto" variant={r.role === "student" ? "brand" : "outline"} onClick={() => onEnter(r.role)}>{r.cta}</Btn>
                  {r.role === "student" && <div className="fs-8 text-muted-2">Demo: SIA/2019/0331 · PIN 4821</div>}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4" data-reveal="fade">
            <div className="notice notice--brand">
              <span className="notice__icon"><IconShield size={20} /></span>
              <div>
                <div className="notice__title">Every pupil has a personal login</div>
                <div className="notice__body">Each student gets a unique Admission Number and a private PIN. Only that student (and their parent or guardian) can see their results, newsletters and school information.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW TO ================= */}
      <section id="how" className="section-pad bg-white">
        <div className="container-xl">
          <SectionHead eyebrow="Easy as 1 · 2 · 3" title="How to log in as a student" lead="It takes less than a minute. Type your Admission Number and your PIN." />
          <div className="row g-4">
            {STEPS.map((s, i) => (
              <div className="col-md-4" key={s.n} data-reveal="up" data-delay={i * 0.12}>
                <div className="card-x h-100 p-4 text-center">
                  <span className="step-head__num mx-auto mb-3" style={{ width: 64, height: 64, fontSize: "1.6rem" }}>{s.n}</span>
                  <h3 className="fs-5 fw-800">{s.t}</h3>
                  <p className="text-muted-2 mb-0">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-4" data-reveal="fade">
            <Btn size="lg" onClick={() => onEnter("student")}>
              <span className="d-inline-flex align-items-center gap-2">Try the student login <IconArrowRight size={18} /></span>
            </Btn>
          </div>
        </div>
      </section>

      {/* ================= WHAT YOU CAN DO ================= */}
      <section className="section-pad" style={{ background: "var(--slate-50)" }}>
        <div className="container-xl">
          <SectionHead eyebrow="What you can do" title="Everything you need, in plain language" />
          <div className="row g-4">
            {[
              { i: <IconWallet size={30} />, t: "Pay school fees", d: "Students pay by card, bank transfer or USSD in 3 steps and get a receipt at once.", c: "#0d9488", who: "Students" },
              { i: <IconClipboard size={30} />, t: "See results", d: "Students see their own scores, grades and teacher comments the moment they are released.", c: "#2563c9", who: "Students" },
              { i: <IconBell size={30} />, t: "Read news & newsletters", d: "School news, the termly newsletter, holidays and important dates.", c: "#7c3aed", who: "Everyone" },
              { i: <IconTeacher size={30} />, t: "Enter class scores", d: "Teachers type test and exam scores for the classes the admin has assigned to them; grades are worked out automatically.", c: "#b45309", who: "Teachers" },
            ].map((f, i) => (
              <div className="col-md-6 col-xl-3" key={f.t} data-reveal="up" data-delay={i * 0.08}>
                <div className="card-x card-x--hover h-100 p-4">
                  <span className="d-grid rounded-4 mb-3" style={{ width: 64, height: 64, placeItems: "center", background: `${f.c}1a`, color: f.c }}>{f.i}</span>
                  <div className="eyebrow text-muted-2 mb-1">{f.who}</div>
                  <h3 className="fs-5 fw-800">{f.t}</h3>
                  <p className="text-muted-2 mb-0">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= NEWS ================= */}
      <section className="section-pad bg-white">
        <div className="container-xl">
          <SectionHead eyebrow="School news" title="Latest from the school" />
          <div className="row g-4">
            {NEWS.slice(0, 3).map((n, i) => (
              <div className="col-md-4" key={n.id} data-reveal="up" data-delay={i * 0.1}>
                <article className="news-card card-x card-x--hover h-100 overflow-hidden">
                  <div className="news-thumb">
                    <img src={n.image} alt="" loading="lazy" />
                    <span className="position-absolute top-0 start-0 m-2 badge-x badge-x--dark">{n.category}</span>
                  </div>
                  <div className="p-3">
                    <div className="fs-8 text-muted-2 d-flex align-items-center gap-1"><IconClock size={13} /> {n.date}</div>
                    <h3 className="fs-5 fw-800 mt-1">{n.title}</h3>
                    <p className="text-muted-2 mb-0">{n.excerpt}</p>
                  </div>
                </article>
              </div>
            ))}
          </div>
          <div className="row g-3 mt-2">
            {NEWSLETTERS.slice(0, 2).map((nl) => (
              <div className="col-md-6" key={nl.id} data-reveal="fade">
                <div className="card-x p-3 d-flex align-items-center gap-3 flex-wrap">
                  <img src={nl.cover} alt="" style={{ width: 70, height: 70, borderRadius: 14, objectFit: "cover" }} loading="lazy" />
                  <div className="flex-grow-1">
                    <div className="fw-800">{nl.title}</div>
                    <div className="fs-8 text-muted-2">{nl.period} · {nl.pages} pages · Log in to read it</div>
                  </div>
                  <Btn variant="soft" onClick={() => scrollTo("login")}>
                    <span className="d-inline-flex align-items-center gap-1">Log in <IconChevronRight size={16} /></span>
                  </Btn>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= HELP ================= */}
      <section id="contact" className="section-pad dark-panel">
        <div className="container-xl">
          <div className="row g-4 align-items-center">
            <div className="col-lg-5" data-reveal="left">
              <div className="eyebrow mb-2" style={{ color: "#5eead4" }}>We are here to help</div>
              <h2 className="display-font text-white mb-3" style={{ fontSize: "clamp(1.7rem,3vw,2.4rem)" }}>Stuck? Just call us.</h2>
              <p style={{ color: "#a9bcda", fontSize: "1.05rem" }}>Our front office will walk you through anything on the phone — logging in, paying fees or finding results.</p>
              <a href={`tel:${HELP.phone.replace(/\s/g, "")}`} className="display-font fw-800 text-white d-inline-flex align-items-center gap-3 mt-2" style={{ fontSize: "clamp(1.6rem,3.5vw,2.4rem)" }}>
                <IconPhone size={30} /> {HELP.phone}
              </a>
              <div style={{ color: "#8fa6cd" }}>{HELP.hours}</div>
            </div>
            <div className="col-lg-7">
              <div className="row g-3">
                {[
                  { i: <IconPin size={22} />, t: "Visit us", d: `${SCHOOL.address}, ${SCHOOL.city}` },
                  { i: <IconMail size={22} />, t: "Email us", d: HELP.email },
                  { i: <IconClock size={22} />, t: "Office hours", d: HELP.hours },
                  { i: <IconShield size={22} />, t: "Your data is safe", d: "Only you can see your own information." },
                ].map((c, i) => (
                  <div className="col-sm-6" key={c.t} data-reveal="scale" data-delay={i * 0.08}>
                    <div className="glass p-4 h-100">
                      <span className="d-grid rounded-3 mb-3" style={{ width: 46, height: 46, placeItems: "center", background: "rgba(255,255,255,.1)", color: "#5eead4" }}>{c.i}</span>
                      <div className="text-white fw-800">{c.t}</div>
                      <div style={{ color: "#a9bcda" }}>{c.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer style={{ background: "#060a17", color: "#93a6c7", padding: "36px 0 24px" }}>
        <div className="container-xl d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-2">
            <LogoMark size={34} /><span className="display-font fw-800 text-white">Scholaris</span>
            <span className="fs-8">· {SCHOOL.motto}</span>
          </div>
          <div className="d-flex gap-2">
            {[SvgFacebook, SvgX, SvgLinkedIn, SvgYouTube].map((I, i) => (
              <a key={i} href="#top" className="d-grid rounded-3" style={{ width: 40, height: 40, placeItems: "center", background: "rgba(255,255,255,.07)", color: "#c9d7ee" }}><I size={16} /></a>
            ))}
          </div>
          <div className="fs-8">© {new Date().getFullYear()} {SCHOOL.name} · Demo with sample data</div>
        </div>
      </footer>
    </div>
  );
}
