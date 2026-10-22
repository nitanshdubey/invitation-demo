import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
  type Variants,
} from "framer-motion";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { gallery, story } from "../data/weddingConfig";

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
  show: { transition: { staggerChildren: 0.14 } },
};

const slide: Variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 90 : -90, opacity: 0, scale: 0.96 }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -90 : 90,
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.25, ease: "easeIn" },
  }),
};

// ---------------------------------------------------------------------------
// Lightbox (full-screen overlay, defined here instead of a separate file)
// ---------------------------------------------------------------------------
interface LightboxProps {
  startIndex: number;
  onClose: () => void;
}

const Lightbox = ({ startIndex, onClose }: LightboxProps) => {
  const [[index, direction], setPage] = useState<[number, number]>([startIndex, 0]);
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();
  const total = gallery.length;
  const image = gallery[index];

  const paginate = useCallback(
    (dir: number) => {
      setPage(([current]) => [(current + dir + total) % total, dir]);
    },
    [total]
  );

  // Lock page scroll, move focus into the dialog, and restore both on close
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, []);

  // Keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") paginate(1);
      if (e.key === "ArrowLeft") paginate(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, paginate]);

  // Preload the neighbouring photos so navigation feels instant
  useEffect(() => {
    [(index + 1) % total, (index - 1 + total) % total].forEach((i) => {
      const img = new Image();
      img.src = gallery[i].src;
    });
  }, [index, total]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -80 || info.velocity.x < -500) paginate(1);
    else if (info.offset.x > 80 || info.velocity.x > 500) paginate(-1);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-obsidian/95 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Photo gallery viewer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      {/* Close button */}
      <button
        ref={closeRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close photo viewer"
        className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-gold/50 bg-obsidian/60 text-ivory transition-colors hover:bg-gold hover:text-obsidian focus:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:right-8 sm:top-8"
      >
        <X size={20} strokeWidth={1.5} />
      </button>

      {/* Counter */}
      <p className="absolute left-1/2 top-5 z-20 -translate-x-1/2 text-[0.65rem] uppercase tracking-luxe text-gold sm:top-9">
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </p>

      {/* Previous */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          paginate(-1);
        }}
        aria-label="Previous photo"
        className="absolute left-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gold/50 bg-obsidian/60 text-ivory transition-colors hover:bg-gold hover:text-obsidian focus:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:left-8 sm:h-12 sm:w-12"
      >
        <ChevronLeft size={22} strokeWidth={1.5} />
      </button>

      {/* Next */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          paginate(1);
        }}
        aria-label="Next photo"
        className="absolute right-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gold/50 bg-obsidian/60 text-ivory transition-colors hover:bg-gold hover:text-obsidian focus:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:right-8 sm:h-12 sm:w-12"
      >
        <ChevronRight size={22} strokeWidth={1.5} />
      </button>

      {/* Photo stage */}
      <div
        className="relative flex h-full w-full items-center justify-center overflow-hidden px-14 pb-20 pt-20 sm:px-28"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.figure
            key={image.id}
            custom={direction}
            variants={slide}
            initial={reduce ? false : "enter"}
            animate="center"
            exit={reduce ? { opacity: 0 } : "exit"}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={handleDragEnd}
            className="flex max-h-full max-w-full cursor-grab flex-col items-center active:cursor-grabbing"
          >
            <img
              src={image.src}
              alt={image.alt}
              draggable={false}
              className="max-h-[70vh] max-w-full select-none rounded-lg border border-gold/30 object-contain shadow-2xl sm:max-h-[74vh]"
            />
            <figcaption className="mt-5 text-center font-display text-lg italic text-ivory/80 sm:text-xl">
              {image.alt}
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// Gallery section (story + masonry grid)
// ---------------------------------------------------------------------------
export default function Gallery() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const reduce = useReducedMotion();

  const closeLightbox = useCallback(() => setActiveIndex(null), []);

  return (
    <section
      id="story"
      className="relative overflow-hidden bg-gradient-to-b from-ivory via-taupe/40 to-ivory px-6 py-24 sm:py-32"
    >
      <div className="relative mx-auto max-w-5xl">
        {/* ------------------------------------------------------------ */}
        {/* STORY                                                         */}
        {/* ------------------------------------------------------------ */}
        <motion.div
          className="mx-auto max-w-2xl text-center"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.p variants={fadeUp} className="eyebrow">
            {story.eyebrow}
          </motion.p>
          <motion.h2 variants={fadeUp} className="section-title mt-4">
            {story.title}
          </motion.h2>
          <motion.div variants={fadeUp}>
            <div className="gold-divider" />
          </motion.div>

          <div className="space-y-6 text-left sm:text-center">
            {story.paragraphs.map((text, i) => (
              <motion.p
                key={i}
                variants={fadeUp}
                className={`font-display text-xl leading-relaxed text-obsidian/75 sm:text-2xl ${
                  i === 0
                    ? "first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-6xl first-letter:leading-[0.85] first-letter:text-gold-dark sm:first-letter:float-none sm:first-letter:mr-0 sm:first-letter:text-inherit"
                    : ""
                }`}
              >
                {text}
              </motion.p>
            ))}
          </div>
        </motion.div>

        {/* ------------------------------------------------------------ */}
        {/* GALLERY                                                       */}
        {/* ------------------------------------------------------------ */}
        <motion.div
          className="mt-24 text-center"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.p variants={fadeUp} className="eyebrow">
            Moments
          </motion.p>
          <motion.h2 variants={fadeUp} className="section-title mt-4">
            Captured In Time
          </motion.h2>
          <motion.div variants={fadeUp}>
            <div className="gold-divider" />
          </motion.div>
        </motion.div>

        <div className="masonry mt-10">
          {gallery.map((photo, i) => (
            <motion.button
              key={photo.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`Open photo: ${photo.alt}`}
              className="group relative block w-full overflow-hidden rounded-xl border border-gold/20 bg-taupe shadow-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
              style={{ aspectRatio: photo.ratio }}
              initial={{ opacity: 0, y: reduce ? 0 : 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.8,
                delay: (i % 3) * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                draggable={false}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />

              {/* Hover overlay */}
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gradient-to-t from-obsidian/60 via-obsidian/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold bg-obsidian/40 text-ivory backdrop-blur-sm">
                  <ZoomIn size={20} strokeWidth={1.4} />
                </span>
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {activeIndex !== null && (
          <Lightbox startIndex={activeIndex} onClose={closeLightbox} />
        )}
      </AnimatePresence>
    </section>
  );
}