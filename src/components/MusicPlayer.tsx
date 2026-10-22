import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
  } from "react";
  import { AnimatePresence, motion } from "framer-motion";
  import { Pause, Play } from "lucide-react";
  import { music } from "../data/weddingConfig";
  
  // ---------------------------------------------------------------------------
  // Types
  // ---------------------------------------------------------------------------
  export interface MusicPlayerHandle {
    /** Starts playback with a fade-in. Safe to call from a user gesture (e.g. the seal tap). */
    start: () => void;
  }
  
  interface MusicPlayerProps {
    /** Controls when the floating button appears. Hidden until the invitation is opened. */
    visible?: boolean;
  }
  
  const BAR_COUNT = 4;
  const BAR_DELAYS = [0, 0.25, 0.5, 0.15];
  
  // ---------------------------------------------------------------------------
  // Component
  // ---------------------------------------------------------------------------
  const MusicPlayer = forwardRef<MusicPlayerHandle, MusicPlayerProps>(
    ({ visible = true }, ref) => {
      const audioRef = useRef<HTMLAudioElement>(null);
      const rafRef = useRef<number>(0);
      const isPlayingRef = useRef(false);
      const resumeAfterHideRef = useRef(false);
  
      const [isPlaying, setIsPlaying] = useState(false);
      const [hasError, setHasError] = useState(false);
  
      // -------------------------------------------------------------------
      // Smooth volume ramp (requestAnimationFrame based)
      // Note: iOS Safari ignores programmatic volume, so playback still
      // works there but the fade is simply skipped.
      // -------------------------------------------------------------------
      const fadeTo = useCallback((target: number, ms: number, done?: () => void) => {
        const audio = audioRef.current;
        if (!audio) return;
  
        cancelAnimationFrame(rafRef.current);
        const from = audio.volume;
        const startTime = performance.now();
  
        const step = (now: number) => {
          const progress = Math.min(1, (now - startTime) / ms);
          // Ease-in-out so the fade feels natural
          const eased =
            progress < 0.5
              ? 2 * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 2) / 2;
          const next = from + (target - from) * eased;
          audio.volume = Math.min(1, Math.max(0, next));
  
          if (progress < 1) {
            rafRef.current = requestAnimationFrame(step);
          } else {
            done?.();
          }
        };
  
        rafRef.current = requestAnimationFrame(step);
      }, []);
  
      // -------------------------------------------------------------------
      // Play / pause
      // -------------------------------------------------------------------
      const play = useCallback(async () => {
        const audio = audioRef.current;
        if (!audio) return;
  
        try {
          if (audio.paused) audio.volume = 0;
          await audio.play();
          isPlayingRef.current = true;
          setIsPlaying(true);
          setHasError(false);
          fadeTo(music.targetVolume, music.fadeMs);
        } catch {
          // Autoplay blocked or the source failed to load
          isPlayingRef.current = false;
          setIsPlaying(false);
        }
      }, [fadeTo]);
  
      const pause = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
  
        isPlayingRef.current = false;
        setIsPlaying(false);
        fadeTo(0, 700, () => audio.pause());
      }, [fadeTo]);
  
      const toggle = useCallback(() => {
        if (isPlayingRef.current) {
          pause();
        } else {
          void play();
        }
      }, [pause, play]);
  
      // Expose start() so App can trigger playback from the seal tap
      useImperativeHandle(
        ref,
        () => ({
          start: () => {
            if (!isPlayingRef.current) void play();
          },
        }),
        [play]
      );
  
      // -------------------------------------------------------------------
      // Pause when the tab is hidden, resume with a fade when it returns
      // -------------------------------------------------------------------
      useEffect(() => {
        const onVisibility = () => {
          const audio = audioRef.current;
          if (!audio) return;
  
          if (document.hidden) {
            if (isPlayingRef.current) {
              cancelAnimationFrame(rafRef.current);
              audio.pause();
              resumeAfterHideRef.current = true;
            }
          } else if (resumeAfterHideRef.current) {
            resumeAfterHideRef.current = false;
            audio.volume = 0;
            audio
              .play()
              .then(() => fadeTo(music.targetVolume, music.fadeMs))
              .catch(() => {
                isPlayingRef.current = false;
                setIsPlaying(false);
              });
          }
        };
  
        document.addEventListener("visibilitychange", onVisibility);
        return () => document.removeEventListener("visibilitychange", onVisibility);
      }, [fadeTo]);
  
      // Cleanup on unmount
      useEffect(() => {
        const audio = audioRef.current;
        return () => {
          cancelAnimationFrame(rafRef.current);
          audio?.pause();
        };
      }, []);
  
      // -------------------------------------------------------------------
      // Render
      // -------------------------------------------------------------------
      return (
        <>
          <audio
            ref={audioRef}
            src={music.src}
            loop
            preload="auto"
            onError={() => {
              setHasError(true);
              isPlayingRef.current = false;
              setIsPlaying(false);
            }}
          />
  
          <motion.div
            className="fixed bottom-5 right-5 z-50 sm:bottom-8 sm:right-8"
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={
              visible
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 0, y: 24, scale: 0.9 }
            }
            transition={{ duration: 0.8, delay: visible ? 0.6 : 0, ease: [0.22, 1, 0.36, 1] }}
            style={{ pointerEvents: visible ? "auto" : "none" }}
          >
            <div className="flex items-center gap-3 rounded-full border border-gold/50 bg-ivory/80 py-1.5 pl-1.5 pr-4 shadow-gold backdrop-blur-md">
              {/* Play / pause button */}
              <motion.button
                type="button"
                onClick={toggle}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                aria-label={isPlaying ? "Pause background music" : "Play background music"}
                aria-pressed={isPlaying}
                className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-gradient text-obsidian focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
              >
                {/* Soft pulse while music is playing */}
                {isPlaying && (
                  <motion.span
                    className="pointer-events-none absolute inset-0 rounded-full border border-gold"
                    animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
  
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={isPlaying ? "pause" : "play"}
                    initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                    transition={{ duration: 0.18 }}
                    className="flex"
                  >
                    {isPlaying ? (
                      <Pause size={18} strokeWidth={1.8} fill="currentColor" />
                    ) : (
                      <Play size={18} strokeWidth={1.8} fill="currentColor" className="ml-0.5" />
                    )}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
  
              {/* Animated audio wave */}
              <div
                className="flex h-5 items-center gap-[3px]"
                aria-hidden="true"
              >
                {Array.from({ length: BAR_COUNT }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-full w-[3px] origin-center rounded-full bg-gold-dark ${
                      isPlaying ? "animate-wave" : ""
                    }`}
                    style={{
                      animationDelay: `${BAR_DELAYS[i]}s`,
                      transform: isPlaying ? undefined : "scaleY(0.3)",
                      transition: "transform 0.4s ease",
                    }}
                  />
                ))}
              </div>
  
              {/* Track label (hidden on very small screens) */}
              <span className="hidden text-[0.6rem] uppercase tracking-[0.25em] text-obsidian/70 sm:block">
                {hasError ? "Audio unavailable" : music.title}
              </span>
            </div>
          </motion.div>
        </>
      );
    }
  );
  
  MusicPlayer.displayName = "MusicPlayer";
  
  export default MusicPlayer;