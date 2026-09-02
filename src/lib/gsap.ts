import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
export { gsap, ScrollTrigger };

/* ==========================================================================
   Typewriter effect (pure DOM text mutation — no re-render per keystroke)
   ========================================================================== */
export function useTypewriter(
  phrases: string[],
  opts: { speed?: number; pause?: number; startDelay?: number } = {}
) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || phrases.length === 0) return;
    const speed = opts.speed ?? 52;
    const pause = opts.pause ?? 1700;
    let phrase = 0;
    let char = 0;
    let deleting = false;
    let timer = 0;

    const tick = () => {
      const word = phrases[phrase % phrases.length];
      if (!deleting) {
        char += 1;
        el.textContent = word.slice(0, char);
        if (char === word.length) {
          deleting = true;
          timer = window.setTimeout(tick, pause);
          return;
        }
        timer = window.setTimeout(tick, speed);
      } else {
        char -= 1;
        el.textContent = word.slice(0, char);
        if (char === 0) {
          deleting = false;
          phrase += 1;
          timer = window.setTimeout(tick, 380);
          return;
        }
        timer = window.setTimeout(tick, speed / 2.3);
      }
    };

    timer = window.setTimeout(tick, opts.startDelay ?? 700);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}

/* ==========================================================================
   Scroll reveal — any element with [data-reveal] animates in on scroll
   data-reveal="up|down|left|right|scale|fade"  |  data-delay="0.2"
   ========================================================================== */
export function useScrollReveal(scope?: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useEffect(() => {
    const ctx = gsap.context(() => {
      const nodes = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      nodes.forEach((el) => {
        const dir = el.dataset.reveal || "up";
        const delay = parseFloat(el.dataset.delay || "0");
        const distance = parseFloat(el.dataset.distance || "44");

        const vars: gsap.TweenVars = { opacity: 0, duration: 0.95, ease: "power3.out", delay };
        if (dir === "up") vars.y = distance;
        if (dir === "down") vars.y = -distance;
        if (dir === "left") vars.x = -distance;
        if (dir === "right") vars.x = distance;
        if (dir === "scale") { vars.scale = 0.9; vars.y = distance * 0.5; }
        if (dir === "fade") vars.y = 12;

        gsap.from(el, {
          ...vars,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      // parallax layers
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const amount = parseFloat(el.dataset.parallax || "80");
        gsap.to(el, {
          y: amount,
          ease: "none",
          scrollTrigger: { trigger: el.closest("[data-parallax-root]") || el, start: "top bottom", end: "bottom top", scrub: 1 },
        });
      });
    }, scope);

    ScrollTrigger.refresh();
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/* ==========================================================================
   Number count-up
   ========================================================================== */
export function useCountUp(target: number, decimals = 0, duration = 1.7) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obj = { v: 0 };
    const format = (v: number) =>
      v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

    el.textContent = format(0);
    const tween = gsap.to(obj, {
      v: target,
      duration,
      ease: "power2.out",
      onUpdate: () => { el.textContent = format(obj.v); },
    });
    return () => { tween.kill(); };
  }, [target, decimals, duration]);

  return ref;
}

/* ==========================================================================
   Stagger-in for freshly mounted panels / route changes
   ========================================================================== */
export function usePageEnter(dep: unknown) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const anim = gsap.fromTo(
      el.querySelectorAll("[data-stagger]"),
      { opacity: 0, y: 22 },
      { opacity: 1, y: 0, duration: 0.55, stagger: 0.07, ease: "power3.out", clearProps: "all" }
    );
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 320);
    return () => { anim.kill(); window.clearTimeout(t); };
  }, [dep]);
  return ref;
}

/* ==========================================================================
   Click ripple (delegated) — attaches to everything with [data-click]
   ========================================================================== */
export function useRipple(scope?: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = scope?.current ?? document.body;
    const handler = (e: Event) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>("[data-click]");
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const span = document.createElement("span");
      span.className = "ripple-ink";
      span.style.width = span.style.height = `${size}px`;
      span.style.left = `${(e as MouseEvent).clientX - rect.left - size / 2}px`;
      span.style.top = `${(e as MouseEvent).clientY - rect.top - size / 2}px`;
      target.appendChild(span);
      gsap.fromTo(span, { scale: 0, opacity: 0.6 }, { scale: 3.1, opacity: 0, duration: 0.65, ease: "power2.out", onComplete: () => span.remove() });

      // press feedback
      gsap.fromTo(target, { scale: 0.97 }, { scale: 1, duration: 0.42, ease: "elastic.out(1, 0.55)" });
    };
    root.addEventListener("click", handler);
    return () => root.removeEventListener("click", handler);
  }, [scope]);
}

/* ==========================================================================
   Hover magnetic / lift effect
   ========================================================================== */
export function useMagnetic<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) / r.width;
      const y = (e.clientY - r.top - r.height / 2) / r.height;
      gsap.to(el, { x: x * 12, y: y * 10, duration: 0.5, ease: "power3.out" });
    };
    const leave = () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    return () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", leave);
    };
  }, []);
  return ref;
}

/* ==========================================================================
   Float loop for decorative SVG elements
   ========================================================================== */
export function useFloatLoop(dep?: unknown) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const tween = gsap.to(el, { y: -16, duration: 3.6, repeat: -1, yoyo: true, ease: "sine.inOut" });
    return () => { tween.kill(); };
  }, [dep]);
  return ref;
}
