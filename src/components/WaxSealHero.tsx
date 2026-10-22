import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import confetti from "canvas-confetti";
import { ChevronDown } from "lucide-react";
import { couple, heroImage, venue, weddingDate } from "../data/weddingConfig";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Phase = "closed" | "opening" | "open";

interface WaxSealHeroProps {
  /** Called the moment the seal is tapped (a user gesture, so audio can start here) */
  onOpen?: () => void;
}

// ---------------------------------------------------------------------------
// Static helpers (computed once, deterministic so no hydration/jitter issues)
// ---------------------------------------------------------------------------

/** Organic wax-blob outline built from a smooth closed curve */
const WAX_RADII = [47, 44.5, 48, 45.5, 48.5, 44.5, 47.5, 46, 48.5, 45, 47, 46.5];

const buildBlobPath = (radii: number[]): string => {
  const n = radii.length;
  const pts = radii.map((r, i) => {
    const a = (i / n) * Math.PI * 2;
    return [50 + r * Math.cos(a), 50 + r * Math.sin(a)] as const;
  });
  const mid = (a: readonly [number, number], b: readonly [number, number]) =>
    [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] as const;

  const start = mid(pts[n - 1], pts[0]);
  let d = `M ${start[0].toFixed(2)} ${start[1].toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const m = mid(p, pts[(i + 1) % n]);
    d += ` Q ${p[0].toFixed(2)} ${p[1].toFixed(2)} ${m[0].toFixed(2)} ${m[1].toFixed(2)}`;
  }
  return `${d} Z`;
};

const WAX_PATH = buildBlobPath(WAX_RADII);

/** Little wax fragments that fly off when the seal breaks */
const SHARDS = Array.from({ length: 10 }, (_, i) => {
  const angle = (i / 10) * Math.PI * 2 + 0.3;
  const dist = 60 + (i % 3) * 22;
  return {
    id: i,
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist + 18,
    size: 5 + (i % 4) * 2,
    rotate: (i % 2 === 0 ? 1 : -1) * (90 + i * 25),
  };
});

/** Floating gold dust in the hero */
const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  left: (i * 61) % 100,
  size: 3 + (i % 4) * 2,
  duration: 14 + (i % 5) * 3,
  delay: (i % 7) * 1.3,
  drift: (i % 2 === 0 ? 1 : -1) * (10 + (i % 3) * 8),
}));

const fireConfetti = () => {
  const defaults = {
    colors: ["#D4AF37", "#E6C964", "#FDFBF7", "#B8942A"],
    zIndex: 100,
    disableForReducedMotion: true,
  };

  confetti({
    ...defaults,
    particleCount: 70,
    spread: 80,
    startVelocity: 38,
    scalar: 0.9,
    origin: { x: 0.5, y: 0.5 },
  });

  window.setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 50,
      angle: 60,
      spread: 60,
      origin: { x: 0, y: 0.7 },
    });
    confetti({
      ...defaults,
      particleCount: 50,
      angle: 120,
      spread: 60,
      origin: { x: 1, y: 0.7 },
    });
  }, 300);
};

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------
const sealVariants: Variants = {
  idle: {
    scale: [1, 1.05, 1],
    rotate: 0,
    opacity: 1,
    transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
  },
  break: {
    scale: [1, 1.18, 0.9, 0],
    rotate: [0, -8, 10, 24],
    opacity: [1, 1, 1, 0],
    transition: { duration: 0.75, times: [0, 0.25, 0.55, 1], ease: "easeInOut" },
  },
};

const heroContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18, delayChildren: 0.5 } },
};

const heroItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: [0.22, 1, 0.36, 1] },
  },
};

// ---------------------------------------------------------------------------
// Wax seal artwork
// ---------------------------------------------------------------------------
const WaxSealGraphic = ({ first, second }: { first: string; second: string }) => (
  <svg
    viewBox="0 0 100 100"
    className="h-full w-full drop-shadow-[0_6px_10px_rgba(90,70,10,0.45)]"
    aria-hidden="true"
  >
    <defs>
      <radialGradient id="waxGrad" cx="35%" cy="30%" r="80%">
        <stop offset="0%" stopColor="#F3DE8E" />
        <stop offset="45%" stopColor="#D4AF37" />
        <stop offset="100%" stopColor="#8F7016" />
      </radialGradient>
    </defs>

    <path d={WAX_PATH} fill="url(#waxGrad)" />

    {/* Embossed ring */}
    <circle
      cx="50"
      cy="50"
      r="35.2"
      fill="none"
      stroke="rgba(255,255,255,0.35)"
      strokeWidth="0.8"
    />
    <circle
      cx="50"
      cy="50"
      r="34"
      fill="none"
      stroke="rgba(15,15,15,0.28)"
      strokeWidth="1.2"
    />

    {/* Monogram: highlight layer then main layer for an engraved look */}
    <g
      fontFamily='"Cormorant Garamond", Georgia, serif'
      fontWeight="600"
      textAnchor="middle"
    >
      <text x="50" y="60.6" fontSize="26" fill="rgba(255,255,255,0.45)">
        {first}
        <tspan fontSize="15" fontStyle="italic" dx="1.5">
          &amp;
        </tspan>
        <tspan dx="1.5">{second}</tspan>
      </text>
      <text x="50" y="59.8" fontSize="26" fill="#7A5F12">
        {first}
        <tspan fontSize="15" fontStyle="italic" dx="1.5">
          &amp;
        </tspan>
        <tspan dx="1.5">{second}</tspan>
      </text>
    </g>
  </svg>
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function WaxSealHero({ onOpen }: WaxSealHeroProps) {
  const [phase, setPhase] = useState<Phase>("closed");
  const [flapBehind, setFlapBehind] = useState(false);
  const reduce = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const timers = useRef<number[]>([]);

  const first = couple.partnerOne.charAt(0);
  const second = couple.partnerTwo.charAt(0);
  const opened = phase === "open";

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  // Clear pending timers on unmount
  useEffect(() => {
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  // Lock page scroll until the envelope has been opened
  useEffect(() => {
    document.body.classList.toggle("invitation-locked", phase !== "open");
    return () => {
      document.body.classList.remove("invitation-locked");
    };
  }, [phase]);

  const handleOpen = () => {
    if (phase !== "closed") return;

    setPhase("opening");
    onOpen?.();
    fireConfetti();

    // The flap passes the edge-on point, so drop it behind the card
    later(() => setFlapBehind(true), 800);

    // Envelope fades away and the hero is revealed
    later(
      () => {
        window.scrollTo(0, 0);
        setPhase("open");
      },
      reduce ? 500 : 2500
    );
  };

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* ENVELOPE OVERLAY                                                    */}
      {/* ------------------------------------------------------------------ */}
      <AnimatePresence>
        {phase !== "open" && (
          <motion.div
            key="envelope-overlay"
            className="grain fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,#FFFFFF_0%,#FDFBF7_55%,#F1ECE0_100%)]"
            exit={{ opacity: 0, transition: { duration: 0.9, ease: "easeInOut" } }}
          >
            {/* Thin gold frame */}
            <div className="pointer-events-none absolute inset-4 border border-gold/30 sm:inset-8" />

            <motion.div
              className="relative z-10 flex flex-col items-center px-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ scale: 1.12, y: -20, transition: { duration: 0.9, ease: "easeInOut" } }}
              transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
            >
              <p className="eyebrow mb-10 text-center">A Wedding Invitation</p>

              {/* ---------------- Envelope ---------------- */}
              <div
                className="relative aspect-[3/2] w-[min(88vw,460px)]"
                style={{ perspective: 1200 }}
              >
                {/* Back of envelope (visible inside when open) */}
                <div className="absolute inset-0 rounded-[4px] border border-gold/40 bg-gradient-to-b from-[#DDD5C4] to-[#E8E3D9] shadow-soft" />

                {/* Invitation card that rises out of the envelope */}
                <motion.div
                  className="absolute inset-x-[6%] bottom-[12%] top-[8%] z-10 flex flex-col items-center justify-center rounded-[3px] border border-gold/40 bg-ivory shadow-soft"
                  animate={{ y: phase === "closed" ? "0%" : "-58%" }}
                  transition={{ delay: 1.1, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="eyebrow text-[0.55rem]">You are invited</p>
                  <p className="mt-1 font-display text-2xl italic text-obsidian sm:text-3xl">
                    {couple.partnerOne} &amp; {couple.partnerTwo}
                  </p>
                  <div className="mt-2 h-px w-12 bg-gradient-to-r from-transparent via-gold to-transparent" />
                  <p className="mt-2 text-[0.55rem] uppercase tracking-[0.3em] text-obsidian/60">
                    {weddingDate.displayShort}
                  </p>
                </motion.div>

                {/* Front pocket (left, right and bottom folds) */}
                <svg
                  viewBox="0 0 300 200"
                  preserveAspectRatio="none"
                  className="absolute inset-0 z-20 h-full w-full"
                  aria-hidden="true"
                >
                  <polygon
                    points="0,0 150,108 0,200"
                    fill="#E3DDD0"
                    stroke="rgba(212,175,55,0.45)"
                    strokeWidth="0.8"
                    vectorEffect="non-scaling-stroke"
                  />
                  <polygon
                    points="300,0 150,108 300,200"
                    fill="#E3DDD0"
                    stroke="rgba(212,175,55,0.45)"
                    strokeWidth="0.8"
                    vectorEffect="non-scaling-stroke"
                  />
                  <polygon
                    points="0,200 150,108 300,200"
                    fill="#EDE8DD"
                    stroke="rgba(212,175,55,0.45)"
                    strokeWidth="0.8"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>

                {/* Addressee line on the front */}
                <div className="pointer-events-none absolute inset-x-0 bottom-[9%] z-[25] text-center">
                  <p className="font-display text-lg italic text-obsidian/60 sm:text-xl">
                    For our dearest guest
                  </p>
                </div>

                {/* Top flap */}
                <motion.div
                  className={`absolute left-0 top-0 h-[54%] w-full ${
                    flapBehind ? "z-[5]" : "z-30"
                  }`}
                  style={{ transformOrigin: "top center" }}
                  animate={{ rotateX: phase === "closed" ? 0 : 180 }}
                  transition={{ delay: 0.35, duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
                >
                  <svg
                    viewBox="0 0 300 108"
                    preserveAspectRatio="none"
                    className="h-full w-full"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient id="flapGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F3EEE3" />
                        <stop offset="100%" stopColor="#DDD5C4" />
                      </linearGradient>
                    </defs>
                    <polygon
                      points="0,0 300,0 150,108"
                      fill="url(#flapGrad)"
                      stroke="rgba(212,175,55,0.55)"
                      strokeWidth="0.9"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </motion.div>

                {/* Wax seal (plain wrapper handles centering, motion child handles animation) */}
                <div className="absolute left-1/2 top-[54%] z-40 h-[84px] w-[84px] -translate-x-1/2 -translate-y-1/2 sm:h-24 sm:w-24">
                  {/* Soft ripple ring while waiting */}
                  {phase === "closed" && (
                    <motion.span
                      className="pointer-events-none absolute inset-0 rounded-full border border-gold"
                      animate={{ scale: [1, 1.7], opacity: [0.6, 0] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
                    />
                  )}

                  {/* Wax fragments */}
                  {phase !== "closed" &&
                    SHARDS.map((s) => (
                      <motion.span
                        key={s.id}
                        className="pointer-events-none absolute left-1/2 top-1/2 rounded-[2px] bg-gold-gradient"
                        style={{
                          width: s.size,
                          height: s.size,
                          marginLeft: -s.size / 2,
                          marginTop: -s.size / 2,
                        }}
                        initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
                        animate={{ x: s.x, y: s.y, opacity: 0, scale: 0.6, rotate: s.rotate }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                      />
                    ))}

                  <motion.button
                    type="button"
                    onClick={handleOpen}
                    aria-label="Open the wedding invitation"
                    className="h-full w-full cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
                    variants={sealVariants}
                    initial="idle"
                    animate={phase === "closed" ? "idle" : "break"}
                    whileHover={phase === "closed" ? { scale: 1.1 } : undefined}
                    whileTap={phase === "closed" ? { scale: 0.94 } : undefined}
                  >
                    <WaxSealGraphic first={first} second={second} />
                  </motion.button>
                </div>
              </div>

              {/* Hint */}
              <motion.p
                className="mt-12 text-center text-[0.7rem] uppercase tracking-[0.35em] text-obsidian/55"
                animate={
                  phase === "closed" ? { opacity: [0.35, 1, 0.35] } : { opacity: 0 }
                }
                transition={
                  phase === "closed"
                    ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.3 }
                }
              >
                Tap the seal to open
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------------ */}
      {/* HERO (monogram header, revealed after the seal is broken)           */}
      {/* ------------------------------------------------------------------ */}
      <section
      ref={heroRef}
        id="top"
        className="grain relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ivory px-6 py-24 text-center"
      >
        {/* Soft gold glows */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.14),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(232,227,217,0.9),transparent_65%)]" />

        {/* Floating gold dust */}
        {!reduce &&
          opened &&
          PARTICLES.map((p) => (
            <motion.span
              key={p.id}
              className="pointer-events-none absolute bottom-0 rounded-full bg-gold/70"
              style={{ left: `${p.left}%`, width: p.size, height: p.size }}
              initial={{ y: "0vh", opacity: 0 }}
              animate={{ y: "-105vh", x: [0, p.drift, 0], opacity: [0, 0.8, 0.8, 0] }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}

        <motion.div
          className="relative z-10 flex flex-col items-center"
          variants={heroContainer}
          initial="hidden"
          animate={opened ? "show" : "hidden"}
        >
          <motion.p variants={heroItem} className="eyebrow">
            {couple.tagline}
          </motion.p>

          {/* Monogram with a self-drawing gold ring */}
                    {/* Couple photo: arched frame */}
                    <motion.div variants={heroItem} className="relative mb-12 mt-8">
            {/* Soft gold glow behind the frame */}
            <div className="pointer-events-none absolute -inset-8 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.35),transparent_65%)] blur-2xl" />

            {/* Outer thin outline, offset from the frame */}
            <motion.div
              className="pointer-events-none absolute -inset-3 rounded-t-full rounded-b-[1.6rem] border border-gold/50"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: opened ? 1 : 0, scale: opened ? 1 : 0.94 }}
              transition={{ duration: 1.4, delay: 1.2, ease: "easeOut" }}
            />

            {/* Gold frame + photo, revealed from the bottom up */}
            <motion.div
              className="relative h-[23rem] w-[16.5rem] rounded-t-full rounded-b-[1.3rem] bg-gold-gradient p-[5px] shadow-gold sm:h-[28rem] sm:w-[20rem]"
              initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
              animate={{
                clipPath: opened ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)",
              }}
              transition={{ duration: 1.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative h-full w-full overflow-hidden rounded-t-full rounded-b-[1.1rem] bg-taupe">
                <motion.img
                  src={heroImage.src}
                  alt={heroImage.alt}
                  draggable={false}
                  className="absolute inset-x-0 -top-[8%] h-[116%] w-full select-none object-cover"
                  style={{
                    objectPosition: heroImage.position,
                    y: reduce ? 0 : imgY,
                  }}
                  initial={{ scale: reduce ? 1 : 1.3 }}
                  animate={{ scale: opened && !reduce ? 1.04 : reduce ? 1 : 1.3 }}
                  transition={{ duration: 3.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />

                {/* Gentle darkening at the bottom for depth */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian/35 via-transparent to-transparent" />

                {/* One-time light sweep across the photo */}
                {!reduce && opened && (
                  <motion.span
                    className="pointer-events-none absolute inset-y-0 left-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    initial={{ x: "-120%" }}
                    animate={{ x: "450%" }}
                    transition={{ duration: 1.6, delay: 2.4, ease: "easeInOut" }}
                  />
                )}
              </div>
            </motion.div>

            {/* Monogram badge overlapping the bottom edge */}
            <motion.div
              className="absolute -bottom-7 left-1/2 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full border border-gold bg-ivory shadow-gold sm:h-[4.5rem] sm:w-[4.5rem]"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: opened ? 1 : 0, scale: opened ? 1 : 0.6 }}
              transition={{ type: "spring", stiffness: 180, damping: 14, delay: 1.9 }}
            >
              <span className="text-gold-shimmer font-display text-xl italic sm:text-2xl">
                {couple.initials}
              </span>
            </motion.div>
          </motion.div>

          <motion.h1
            variants={heroItem}
            className="font-display text-5xl font-light italic leading-tight text-obsidian sm:text-7xl md:text-8xl"
          >
            {couple.partnerOne}{" "}
            <span className="text-gold-shimmer inline-block not-italic">&amp;</span>{" "}
            {couple.partnerTwo}
          </motion.h1>

          <motion.p
            variants={heroItem}
            className="mt-6 max-w-md font-display text-lg italic text-obsidian/70 sm:text-xl"
          >
            {couple.inviteLine}
          </motion.p>

          <motion.div variants={heroItem} className="w-full">
            <div className="gold-divider" />
          </motion.div>

          <motion.p
            variants={heroItem}
            className="font-display text-3xl tracking-[0.3em] text-obsidian sm:text-4xl"
          >
            {weddingDate.displayShort}
          </motion.p>
          <motion.p
            variants={heroItem}
            className="mt-3 text-xs uppercase tracking-[0.25em] text-obsidian/60"
          >
            {weddingDate.displayLong}
          </motion.p>
          <motion.p
            variants={heroItem}
            className="mt-1 text-xs uppercase tracking-[0.25em] text-gold-dark"
          >
            {venue.name}
          </motion.p>

          <motion.button
            variants={heroItem}
            type="button"
            onClick={() =>
              window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
            }
            aria-label="Scroll down"
            className="mt-14 flex flex-col items-center gap-1 text-gold-dark"
          >
            <span className="text-[0.6rem] uppercase tracking-luxe">Scroll</span>
            <motion.span
              className="block"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDown size={28} strokeWidth={1.2} />
            </motion.span>
          </motion.button>
        </motion.div>
      </section>
    </>
  );
}