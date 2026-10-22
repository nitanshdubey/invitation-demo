import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { Heart, Sparkles, Wine, type LucideIcon } from "lucide-react";
import {
  dressCode,
  events,
  weddingDate,
  type EventIcon,
} from "../data/weddingConfig";

// ---------------------------------------------------------------------------
// Countdown logic (kept in this file instead of a separate hook)
// ---------------------------------------------------------------------------
interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

const TARGET_MS = new Date(weddingDate.startISO).getTime();

const calcTimeLeft = (): TimeLeft => {
  const diff = Math.max(0, TARGET_MS - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    done: diff === 0,
  };
};

const useCountdown = (): TimeLeft => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calcTimeLeft);

  useEffect(() => {
    const id = window.setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return timeLeft;
};

const pad = (n: number) => String(n).padStart(2, "0");

// ---------------------------------------------------------------------------
// Icon map for the timeline
// ---------------------------------------------------------------------------
const ICONS: Record<EventIcon, LucideIcon> = {
  ceremony: Heart,
  cocktail: Wine,
  reception: Sparkles,
};

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

// ---------------------------------------------------------------------------
// Countdown tile with a slide transition on each tick
// ---------------------------------------------------------------------------
const CountdownTile = ({
  value,
  label,
  animate,
}: {
  value: number;
  label: string;
  animate: boolean;
}) => (
  <div className="flex flex-col items-center">
    <div className="luxe-card relative flex h-20 w-[4.25rem] items-center justify-center overflow-hidden sm:h-28 sm:w-24 md:h-32 md:w-28">
      {/* Center split line, like a flip clock */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-gold/25" />

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          className="font-display text-4xl font-light text-obsidian sm:text-6xl md:text-7xl"
          initial={animate ? { y: "-60%", opacity: 0 } : false}
          animate={{ y: 0, opacity: 1 }}
          exit={animate ? { y: "60%", opacity: 0 } : { opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {pad(value)}
        </motion.span>
      </AnimatePresence>
    </div>
    <span className="mt-3 text-[0.6rem] font-medium uppercase tracking-[0.3em] text-gold-dark sm:text-[0.65rem]">
      {label}
    </span>
  </div>
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function EventDetails() {
  const time = useCountdown();
  const reduce = useReducedMotion();

  const tiles: { value: number; label: string }[] = [
    { value: time.days, label: "Days" },
    { value: time.hours, label: "Hours" },
    { value: time.minutes, label: "Minutes" },
    { value: time.seconds, label: "Seconds" },
  ];

  return (
    <section
      id="details"
      className="relative overflow-hidden bg-ivory px-6 py-24 sm:py-32"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.08),transparent_55%)]" />

      <div className="relative mx-auto max-w-5xl">
        {/* ------------------------------------------------------------ */}
        {/* COUNTDOWN                                                     */}
        {/* ------------------------------------------------------------ */}
        <motion.div
          className="text-center"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.p variants={fadeUp} className="eyebrow">
            Save The Date
          </motion.p>
          <motion.h2 variants={fadeUp} className="section-title mt-4">
            {time.done ? "The Celebration Has Begun" : "Counting Down To Forever"}
          </motion.h2>
          <motion.div variants={fadeUp}>
            <div className="gold-divider" />
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex justify-center gap-2.5 sm:gap-6"
            role="timer"
            aria-label={`${time.days} days, ${time.hours} hours, ${time.minutes} minutes and ${time.seconds} seconds until the wedding`}
          >
            {tiles.map((t) => (
              <CountdownTile
                key={t.label}
                value={t.value}
                label={t.label}
                animate={!reduce}
              />
            ))}
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="mt-8 font-display text-xl italic text-obsidian/70"
          >
            {weddingDate.displayLong}
          </motion.p>
        </motion.div>

        {/* ------------------------------------------------------------ */}
        {/* EVENT TIMELINE                                                */}
        {/* ------------------------------------------------------------ */}
        <div className="mt-28 sm:mt-36">
          <motion.div
            className="text-center"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.p variants={fadeUp} className="eyebrow">
              The Celebration
            </motion.p>
            <motion.h2 variants={fadeUp} className="section-title mt-4">
              Order Of The Day
            </motion.h2>
            <motion.div variants={fadeUp}>
              <div className="gold-divider" />
            </motion.div>
          </motion.div>

          <div className="relative mt-16">
            {/* Vertical gold line (left on mobile, centered on desktop) */}
            <motion.div
              className="absolute bottom-0 left-5 top-0 w-px origin-top bg-gradient-to-b from-gold/0 via-gold/60 to-gold/0 md:left-1/2 md:-translate-x-1/2"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, ease: "easeInOut" }}
            />

            <div className="space-y-14 md:space-y-20">
              {events.map((event, index) => {
                const Icon = ICONS[event.icon];
                const isLeft = index % 2 === 0;

                return (
                  <motion.div
                    key={event.id}
                    className="relative grid grid-cols-[2.5rem_1fr] items-center gap-x-5 md:grid-cols-[1fr_3rem_1fr] md:gap-x-8"
                    initial={{ opacity: 0, x: reduce ? 0 : isLeft ? -40 : 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {/* Node: first on mobile, centered on desktop */}
                    <div className="relative z-10 flex h-10 w-10 items-center justify-center self-start rounded-full border border-gold bg-ivory shadow-gold md:order-2 md:mx-auto md:h-12 md:w-12 md:self-center">
                      <Icon size={18} strokeWidth={1.4} className="text-gold-dark" />
                    </div>

                    {/* Card */}
                    <div
                      className={`luxe-card p-6 sm:p-8 ${
                        isLeft
                          ? "md:order-1 md:text-right"
                          : "md:order-3 md:text-left"
                      }`}
                    >
                      <p className="text-[0.65rem] font-medium uppercase tracking-luxe text-gold-dark">
                        {event.time}
                      </p>
                      <h3 className="mt-2 font-display text-3xl font-light text-obsidian">
                        {event.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-obsidian/65">
                        {event.description}
                      </p>
                    </div>

                    {/* Empty spacer keeps the desktop grid balanced */}
                    <div
                      className={`hidden md:block ${
                        isLeft ? "md:order-3" : "md:order-1"
                      }`}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* DRESS CODE                                                    */}
        {/* ------------------------------------------------------------ */}
        <motion.div
          className="mx-auto mt-28 max-w-3xl sm:mt-36"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <div className="relative overflow-hidden rounded-3xl border border-gold/40 bg-white/60 p-8 text-center shadow-soft backdrop-blur-sm sm:p-12">
            {/* Corner ornaments */}
            <span className="pointer-events-none absolute left-4 top-4 h-8 w-8 border-l border-t border-gold/60" />
            <span className="pointer-events-none absolute right-4 top-4 h-8 w-8 border-r border-t border-gold/60" />
            <span className="pointer-events-none absolute bottom-4 left-4 h-8 w-8 border-b border-l border-gold/60" />
            <span className="pointer-events-none absolute bottom-4 right-4 h-8 w-8 border-b border-r border-gold/60" />

            <motion.p variants={fadeUp} className="eyebrow">
              Dress Code
            </motion.p>
            <motion.h3
              variants={fadeUp}
              className="mt-4 font-display text-3xl font-light italic text-obsidian sm:text-4xl"
            >
              {dressCode.title}
            </motion.h3>
            <motion.div variants={fadeUp}>
              <div className="gold-divider" />
            </motion.div>
            <motion.p
              variants={fadeUp}
              className="mx-auto max-w-xl text-sm leading-relaxed text-obsidian/65"
            >
              {dressCode.description}
            </motion.p>

            {/* Colour swatches */}
            <motion.div
              variants={stagger}
              className="mt-10 flex flex-wrap justify-center gap-6 sm:gap-8"
            >
              {dressCode.swatches.map((swatch) => (
                <motion.div
                  key={swatch.name}
                  variants={fadeUp}
                  whileHover={reduce ? undefined : { y: -6 }}
                  className="flex flex-col items-center gap-3"
                >
                  <span
                    className="h-14 w-14 rounded-full border border-obsidian/10 shadow-soft sm:h-16 sm:w-16"
                    style={{ backgroundColor: swatch.hex }}
                    role="img"
                    aria-label={`${swatch.name} colour swatch`}
                  />
                  <span className="text-[0.6rem] uppercase tracking-[0.25em] text-obsidian/60">
                    {swatch.name}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            <motion.p
              variants={fadeUp}
              className="mt-10 font-display text-base italic text-obsidian/60"
            >
              {dressCode.note}
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}