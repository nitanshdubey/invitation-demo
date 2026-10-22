import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowUp, Heart, Mail, MessageCircle } from "lucide-react";
import { contact, couple, footer, weddingDate } from "../data/weddingConfig";

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
// Links built from weddingConfig.ts
// ---------------------------------------------------------------------------
const whatsappHref = `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(
  contact.whatsappMessage
)}`;

const emailHref = `mailto:${contact.email}?subject=${encodeURIComponent(
  contact.emailSubject
)}`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Contact() {
  const reduce = useReducedMotion();

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* CONTACT                                                             */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="contact"
        className="relative overflow-hidden bg-ivory px-6 py-24 sm:py-32"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.10),transparent_60%)]" />

        <motion.div
          className="relative mx-auto max-w-3xl"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <div className="relative overflow-hidden rounded-3xl border border-gold/40 bg-white/60 p-8 text-center shadow-soft backdrop-blur-sm sm:p-14">
            {/* Corner ornaments */}
            <span className="pointer-events-none absolute left-4 top-4 h-8 w-8 border-l border-t border-gold/60" />
            <span className="pointer-events-none absolute right-4 top-4 h-8 w-8 border-r border-t border-gold/60" />
            <span className="pointer-events-none absolute bottom-4 left-4 h-8 w-8 border-b border-l border-gold/60" />
            <span className="pointer-events-none absolute bottom-4 right-4 h-8 w-8 border-b border-r border-gold/60" />

            <motion.p variants={fadeUp} className="eyebrow">
              {contact.eyebrow}
            </motion.p>
            <motion.h2 variants={fadeUp} className="section-title mt-4">
              {contact.title}
            </motion.h2>
            <motion.div variants={fadeUp}>
              <div className="gold-divider" />
            </motion.div>
            <motion.p
              variants={fadeUp}
              className="mx-auto max-w-md font-display text-xl italic leading-relaxed text-obsidian/70"
            >
              {contact.message}
            </motion.p>

            {/* Action buttons */}
            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row"
            >
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold"
              >
                <MessageCircle size={16} strokeWidth={1.8} />
                WhatsApp Us
              </a>
              <a href={emailHref} className="btn-outline">
                <Mail size={16} strokeWidth={1.6} />
                Send An Email
              </a>
            </motion.div>

            <motion.p
              variants={fadeUp}
              className="mt-6 text-[0.7rem] tracking-[0.2em] text-obsidian/50"
            >
              {contact.email}
            </motion.p>
          </div>
        </motion.div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FOOTER                                                              */}
      {/* ------------------------------------------------------------------ */}
      <footer className="relative overflow-hidden bg-obsidian px-6 py-20 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.16),transparent_65%)]" />

        <motion.div
          className="relative mx-auto flex max-w-xl flex-col items-center"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
        >
          <motion.span
            variants={fadeUp}
            className="text-gold-shimmer font-display text-5xl italic"
          >
            {couple.initials}
          </motion.span>

          <motion.div variants={fadeUp}>
            <div className="gold-divider" />
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="flex items-center gap-2 font-display text-xl italic text-ivory/80"
          >
            {footer.closingLine}
            <Heart size={14} strokeWidth={1.5} className="text-gold" fill="currentColor" />
          </motion.p>

          <motion.p
            variants={fadeUp}
            className="mt-6 font-display text-2xl tracking-[0.3em] text-ivory"
          >
            {weddingDate.displayShort}
          </motion.p>

          <motion.p
            variants={fadeUp}
            className="mt-4 text-[0.7rem] uppercase tracking-luxe text-gold"
          >
            {footer.hashtag}
          </motion.p>

          <motion.button
            variants={fadeUp}
            type="button"
            onClick={() =>
              window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })
            }
            whileHover={reduce ? undefined : { y: -4 }}
            aria-label="Back to top"
            className="mt-12 flex h-11 w-11 items-center justify-center rounded-full border border-gold/60 text-gold transition-colors hover:bg-gold hover:text-obsidian focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <ArrowUp size={18} strokeWidth={1.5} />
          </motion.button>
        </motion.div>
      </footer>
    </>
  );
}