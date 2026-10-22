import { useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  CalendarPlus,
  Car,
  Check,
  ExternalLink,
  MapPin,
  Navigation,
} from "lucide-react";
import { calendarEvent, venue } from "../data/weddingConfig";

// ---------------------------------------------------------------------------
// Calendar helpers (pure client-side, no libraries)
// ---------------------------------------------------------------------------

/** "2026-12-19T16:00:00+05:30" -> "20261219T103000Z" */
const toICSDate = (iso: string): string =>
  new Date(iso)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

/** Escape special characters required by RFC 5545 */
const escapeICS = (text: string): string =>
  text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");

/** Lines longer than 75 characters must be folded onto the next line with a leading space */
const foldLine = (line: string): string => {
  if (line.length <= 75) return line;
  const parts: string[] = [line.slice(0, 75)];
  for (let i = 75; i < line.length; i += 74) {
    parts.push(` ${line.slice(i, i + 74)}`);
  }
  return parts.join("\r\n");
};

const buildICS = (): string => {
  const now = toICSDate(new Date().toISOString());

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wedding Invitation//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${now}-wedding-invitation@digital-invite`,
    `DTSTAMP:${now}`,
    `DTSTART:${toICSDate(calendarEvent.startISO)}`,
    `DTEND:${toICSDate(calendarEvent.endISO)}`,
    `SUMMARY:${escapeICS(calendarEvent.title)}`,
    `DESCRIPTION:${escapeICS(calendarEvent.description)}`,
    `LOCATION:${escapeICS(calendarEvent.location)}`,
    "STATUS:CONFIRMED",
    // Reminder one day before
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    "DESCRIPTION:Wedding celebration tomorrow",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.map(foldLine).join("\r\n");
};

const downloadICS = () => {
  const blob = new Blob([buildICS()], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = calendarEvent.fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const googleCalendarUrl = (): string => {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: calendarEvent.title,
    dates: `${toICSDate(calendarEvent.startISO)}/${toICSDate(calendarEvent.endISO)}`,
    details: calendarEvent.description,
    location: calendarEvent.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
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
// Stylised map illustration (pure SVG, no map library or API key)
// ---------------------------------------------------------------------------
const MapIllustration = () => (
  <svg
    viewBox="0 0 400 300"
    className="absolute inset-0 h-full w-full"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    <rect width="400" height="300" fill="#F1ECE0" />

    {/* Parks */}
    <rect x="228" y="118" width="116" height="84" rx="10" fill="#DDE3CE" />
    <rect x="30" y="40" width="82" height="56" rx="8" fill="#DDE3CE" />

    {/* River */}
    <path
      d="M -10 232 C 70 205, 130 262, 205 238 S 330 205, 410 238 L 410 276 C 330 246, 270 288, 205 272 S 70 246, -10 276 Z"
      fill="#D6E0E3"
    />

    {/* City blocks */}
    <g fill="#E8E3D9">
      <rect x="30" y="118" width="62" height="42" rx="3" />
      <rect x="108" y="118" width="62" height="42" rx="3" />
      <rect x="30" y="176" width="62" height="36" rx="3" />
      <rect x="108" y="176" width="62" height="36" rx="3" />
      <rect x="140" y="40" width="70" height="56" rx="3" />
      <rect x="228" y="30" width="116" height="66" rx="3" />
      <rect x="352" y="118" width="40" height="84" rx="3" />
    </g>

    {/* Minor streets */}
    <g stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" fill="none">
      <path d="M 0 106 H 400" />
      <path d="M 0 168 H 400" />
      <path d="M 100 0 V 300" />
      <path d="M 218 0 V 300" />
      <path d="M 348 0 V 300" />
    </g>

    {/* Main avenue */}
    <path
      d="M -10 214 C 90 186, 170 190, 232 156 S 330 108, 410 100"
      stroke="#FFFFFF"
      strokeWidth="11"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M -10 214 C 90 186, 170 190, 232 156 S 330 108, 410 100"
      stroke="rgba(212,175,55,0.5)"
      strokeWidth="1.4"
      strokeDasharray="7 7"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Venue() {
  const [saved, setSaved] = useState(false);
  const reduce = useReducedMotion();

  const handleDownload = () => {
    downloadICS();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 3000);
  };

  const mapLinks = [
    { label: "Google Maps", href: venue.links.google, Icon: MapPin },
    { label: "Apple Maps", href: venue.links.apple, Icon: Navigation },
    { label: "Waze", href: venue.links.waze, Icon: Car },
  ];

  return (
    <section
      id="venue"
      className="relative overflow-hidden bg-ivory px-6 py-24 sm:py-32"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(232,227,217,0.7),transparent_60%)]" />

      <div className="relative mx-auto max-w-5xl">
        {/* Heading */}
        <motion.div
          className="text-center"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.p variants={fadeUp} className="eyebrow">
            The Venue
          </motion.p>
          <motion.h2 variants={fadeUp} className="section-title mt-4">
            Find Your Way
          </motion.h2>
          <motion.div variants={fadeUp}>
            <div className="gold-divider" />
          </motion.div>
        </motion.div>

        <div className="mt-12 grid items-stretch gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-10">
          {/* -------------------------------------------------------- */}
          {/* MAP VISUAL                                                */}
          {/* -------------------------------------------------------- */}
          <motion.a
            href={venue.links.google}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${venue.name} in Google Maps`}
            className="group relative block min-h-[320px] overflow-hidden rounded-3xl border border-gold/40 shadow-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ivory lg:min-h-[440px]"
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <MapIllustration />

            {/* Pin (positioned over the end of the main avenue) */}
            <div className="absolute left-[58%] top-[46%] -translate-x-1/2 -translate-y-full">
              {/* Ground pulse */}
              {!reduce && (
                <motion.span
                  className="absolute -bottom-1 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-gold/50"
                  animate={{ scale: [1, 3.2], opacity: [0.7, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                />
              )}

              <motion.div
                className="relative flex flex-col items-center"
                initial={{ y: reduce ? 0 : -70, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  type: "spring",
                  stiffness: 220,
                  damping: 12,
                  delay: 0.6,
                }}
              >
                {/* Label chip */}
                <span className="mb-2 whitespace-nowrap rounded-full border border-gold/50 bg-ivory px-3 py-1 text-[0.6rem] font-medium uppercase tracking-[0.2em] text-obsidian shadow-soft">
                  {venue.name}
                </span>

                {/* Pin body */}
                <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gold-gradient shadow-gold">
                  <MapPin size={20} strokeWidth={1.8} className="text-obsidian" />
                </span>
                <span className="-mt-1 h-3 w-3 rotate-45 bg-gold-dark" />
              </motion.div>
            </div>

            {/* Hover hint */}
            <span className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full border border-gold/40 bg-ivory/90 px-4 py-2 text-[0.6rem] font-medium uppercase tracking-[0.2em] text-obsidian opacity-100 backdrop-blur-sm transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
              Open in Maps
              <ExternalLink size={12} strokeWidth={1.8} />
            </span>

            {/* Coordinates */}
            <span className="absolute bottom-4 left-4 text-[0.55rem] uppercase tracking-[0.25em] text-obsidian/50">
              {venue.lat.toFixed(4)}° N · {venue.lng.toFixed(4)}° E
            </span>
          </motion.a>

          {/* -------------------------------------------------------- */}
          {/* INFO + ACTIONS                                            */}
          {/* -------------------------------------------------------- */}
          <motion.div
            className="luxe-card flex flex-col justify-center p-8 text-center sm:p-10 lg:text-left"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.p variants={fadeUp} className="eyebrow">
              Location
            </motion.p>
            <motion.h3
              variants={fadeUp}
              className="mt-3 font-display text-3xl font-light italic text-obsidian sm:text-4xl"
            >
              {venue.name}
            </motion.h3>
            <motion.p
              variants={fadeUp}
              className="mt-4 text-sm leading-relaxed text-obsidian/65"
            >
              {venue.address}
            </motion.p>
            <motion.p
              variants={fadeUp}
              className="mt-3 font-display text-base italic text-gold-dark"
            >
              {venue.notes}
            </motion.p>

            {/* Map buttons */}
            <motion.div
              variants={fadeUp}
              className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3"
            >
              {mapLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline !px-4 !tracking-[0.15em]"
                >
                  <Icon size={14} strokeWidth={1.6} />
                  {label}
                </a>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="gold-divider lg:!mx-0 lg:!my-8" />

            {/* Calendar */}
            <motion.div variants={fadeUp}>
              <p className="eyebrow mb-4">Save The Date</p>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="btn-gold flex-1"
                  aria-live="polite"
                >
                  {saved ? (
                    <>
                      <Check size={16} strokeWidth={2} />
                      Downloaded
                    </>
                  ) : (
                    <>
                      <CalendarPlus size={16} strokeWidth={1.8} />
                      Apple / Outlook
                    </>
                  )}
                </button>

                <a
                  href={googleCalendarUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline flex-1"
                >
                  <CalendarPlus size={16} strokeWidth={1.6} />
                  Google Calendar
                </a>
              </div>
              <p className="mt-3 text-[0.65rem] leading-relaxed text-obsidian/50">
                The calendar file includes a reminder one day before.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}