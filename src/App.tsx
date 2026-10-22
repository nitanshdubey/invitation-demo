import { useEffect, useRef, useState } from "react";
import WaxSealHero from "./components/WaxSealHero";
import MusicPlayer, { type MusicPlayerHandle } from "./components/MusicPlayer";
import EventDetails from "./components/EventDetails";
import Gallery from "./components/Gallery";
import Venue from "./components/Venue";
import Contact from "./components/Contact";

export default function App() {
  const musicRef = useRef<MusicPlayerHandle>(null);
  const timerRef = useRef<number>(0);
  const [showPlayer, setShowPlayer] = useState(false);

  // Clear the pending reveal timer if the app unmounts
  useEffect(() => {
    return () => window.clearTimeout(timerRef.current);
  }, []);

  // Fired by the seal tap. This is a real user gesture, so browsers allow audio to start here.
  const handleOpen = () => {
    musicRef.current?.start();

    // Reveal the floating player once the envelope has finished fading away
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setShowPlayer(true), 2400);
  };

  return (
    <main className="relative min-h-screen bg-ivory">
      <WaxSealHero onOpen={handleOpen} />
      <EventDetails />
      <Gallery />
      <Venue />
      <Contact />

      <MusicPlayer ref={musicRef} visible={showPlayer} />
    </main>
  );
}