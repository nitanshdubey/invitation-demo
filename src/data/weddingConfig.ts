// ---------------------------------------------------------------------------
// weddingConfig.ts
// The single source of truth for the whole invitation.
// Edit the values below and every component updates automatically.
// ---------------------------------------------------------------------------

export type EventIcon = "ceremony" | "cocktail" | "reception";

export interface WeddingEvent {
  id: string;
  icon: EventIcon;
  title: string;
  time: string; // display string
  description: string;
}

export interface Swatch {
  name: string;
  hex: string;
}

export interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  /** Width / height ratio, which gives the masonry its varied rhythm */
  ratio: number;
}

export interface GiftDetail {
  label: string;
  value: string;
}

// ---------------------------------------------------------------------------
// Couple
// ---------------------------------------------------------------------------
export const couple = {
  partnerOne: "Aarav",
  partnerTwo: "Meera",
  get initials() {
    return `${this.partnerOne.charAt(0)} & ${this.partnerTwo.charAt(0)}`;
  },
  tagline: "Together with their families",
  inviteLine: "request the pleasure of your company at the celebration of their marriage",
} as const;

// ---------------------------------------------------------------------------
// Hero photo
// ---------------------------------------------------------------------------
export const heroImage = {
  // Direct link to your GitHub image. Same file as your link, just the raw address.
  src: "https://raw.githubusercontent.com/nitanshdubey/invitation-demo/main/couple1.jpg",
  alt: "Aarav and Meera together",
  /** Moves the crop focus so faces stay in frame (x y). Try "center 20%" if heads get cut. */
  position: "center 25%",
} as const;

// ---------------------------------------------------------------------------
// Date (ISO 8601 with timezone offset, used by the countdown + calendar)
// ---------------------------------------------------------------------------
export const weddingDate = {
  /** Start of the ceremony */
  startISO: "2026-12-19T16:00:00+05:30",
  /** End of the reception */
  endISO: "2026-12-19T23:30:00+05:30",
  /** Pretty strings for display */
  displayLong: "Saturday, 19th December 2026",
  displayShort: "19 . 12 . 2026",
  timezoneLabel: "IST",
} as const;

// ---------------------------------------------------------------------------
// Event schedule
// ---------------------------------------------------------------------------
export const events: WeddingEvent[] = [
  {
    id: "ceremony",
    icon: "ceremony",
    title: "Ring Ceremony",
    time: "4:00 PM",
    description:
      "Join us beneath the floral canopy as we exchange vows in the presence of our loved ones.",
  },
  {
    id: "cocktail",
    icon: "cocktail",
    title: "Haldi & Menhdi",
    time: "6:00 PM",
    description:
      "Get Your hands green, enjoy live acoustic music and Haldi in the garden terrace.",
  },
  {
    id: "reception",
    icon: "reception",
    title: "Grand Reception",
    time: "7:30 PM",
    description:
      "An evening of fine dining, heartfelt toasts and dancing under the stars.",
  },
];

// ---------------------------------------------------------------------------
// Dress code
// ---------------------------------------------------------------------------
export const dressCode = {
  title: "Black Tie & Festive Elegance",
  description:
    "We invite you to dress in formal evening attire. Rich jewel tones, soft neutrals and metallic accents will complement the evening beautifully.",
  swatches: [
    { name: "Champagne", hex: "#D4AF37" },
    { name: "Ivory", hex: "#FDFBF7" },
    { name: "Taupe", hex: "#C9BFAE" },
    { name: "Deep Emerald", hex: "#1F4D3F" },
    { name: "Obsidian", hex: "#0F0F0F" },
  ] as Swatch[],
  note: "We kindly ask guests to avoid pure white, which is reserved for the bride.",
} as const;

// ---------------------------------------------------------------------------
// Story
// ---------------------------------------------------------------------------
export const story = {
  eyebrow: "Our Story",
  title: "How It Began",
  paragraphs: [
    "We met on a rainy afternoon in a small bookshop, both reaching for the same worn copy of a poetry collection. Neither of us walked away with the book, but we both left with something far better.",
    "Years of long walks, shared playlists and quiet Sunday mornings later, a simple question under a sky full of lanterns turned into the easiest yes of our lives.",
    "Now we are ready to begin our greatest chapter, and we would be honoured to have you beside us as we do.",
  ],
} as const;

// ---------------------------------------------------------------------------
// Gallery (placeholder photos: replace `src` with your own image URLs)
// ---------------------------------------------------------------------------
export const gallery: GalleryImage[] = [
  { id: 1, src: "https://picsum.photos/seed/vow-one/900/1200", alt: "A quiet moment together", ratio: 3 / 4 },
  { id: 2, src: "https://picsum.photos/seed/vow-two/1200/900", alt: "Laughing on a walk", ratio: 4 / 3 },
  { id: 3, src: "https://picsum.photos/seed/vow-three/900/900", alt: "Golden hour portrait", ratio: 1 },
  { id: 4, src: "https://picsum.photos/seed/vow-four/900/1300", alt: "Hands intertwined", ratio: 9 / 13 },
  { id: 5, src: "https://picsum.photos/seed/vow-five/1200/800", alt: "City lights at dusk", ratio: 3 / 2 },
  { id: 6, src: "https://picsum.photos/seed/vow-six/900/1100", alt: "The proposal", ratio: 9 / 11 },
  { id: 7, src: "https://picsum.photos/seed/vow-seven/1100/900", alt: "Dancing in the kitchen", ratio: 11 / 9 },
  { id: 8, src: "https://picsum.photos/seed/vow-eight/900/1200", alt: "Together by the sea", ratio: 3 / 4 },
  { id: 9, src: "https://picsum.photos/seed/vow-nine/1000/1000", alt: "Our favourite place", ratio: 1 },
];

// ---------------------------------------------------------------------------
// Venue
// ---------------------------------------------------------------------------
const venueName = "Moonlight Photography, Sagar";
const venueAddress =
  "Gopalganj, Kali Tiraha, beside Bandhan Bank, Gopal Ganj, Sagar, Madhya Pradesh 470001";
const venueSearch = encodeURIComponent(`${venueName}, ${venueAddress}`);

export const venue = {
  name: venueName,
  address: venueAddress,
  notes: "Valet parking is available at the main entrance. Doors open at 3:30 PM.",
  links: {
    // Your exact Google Maps link
    google:
    "https://www.google.com/maps/place/Moonlight+Photography+Sagar,+Gopalganj,+Kali+Tiraha,+beside+Bandhan+Bank,+Gopal+Ganj,+Sagar,+Madhya+Pradesh+470001/data=!4m2!3m1!1s0x3978d1ccb05f23d9:0x3231113911842606",
    // Apple Maps and Waze open by name + address
    apple: `https://maps.apple.com/?q=${venueSearch}`,
    waze: `https://waze.com/ul?q=${venueSearch}&navigate=yes`,
  },
} as const;

// ---------------------------------------------------------------------------
// Calendar (.ics export)
// ---------------------------------------------------------------------------
export const calendarEvent = {
  title: `${couple.partnerOne} & ${couple.partnerTwo}'s Wedding`,
  description: `Join us for the wedding celebration of ${couple.partnerOne} & ${couple.partnerTwo}. Ceremony at 4:00 PM, cocktail hour at 6:00 PM, grand reception at 7:30 PM.`,
  location: `${venueName}, ${venueAddress}`,
  startISO: weddingDate.startISO,
  endISO: weddingDate.endISO,
  fileName: "wedding-invitation.ics",
} as const;

// ---------------------------------------------------------------------------
// Music (placeholder track: replace with any royalty-free ambient mp3 URL)
// ---------------------------------------------------------------------------
export const music = {
  src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  /** Final volume after fade-in (0 to 1) */
  targetVolume: 0.5,
  /** Fade duration in milliseconds */
  fadeMs: 1800,
  title: "Our Song",
} as const;

// ---------------------------------------------------------------------------
// Gift fund
// ---------------------------------------------------------------------------
export const gift = {
  eyebrow: "With Gratitude",
  title: "Wedding Gift Fund",
  message:
    "Your presence is the greatest gift. Should you wish to honour us further, a contribution to our new home fund would be warmly appreciated.",
  /** Set to an image URL to show your real QR code. null shows a styled placeholder. */
  qrImage: null as string | null,
  qrCaption: "Scan to send a gift",
  details: [
    { label: "UPI ID", value: "aarav.meera@upi" },
    { label: "Account Name", value: "Aarav & Meera" },
  ] as GiftDetail[],
} as const;

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------
export const contact = {
  eyebrow: "Get in Touch",
  title: "We Would Love to Hear From You",
  message: "Questions about travel, stay or the schedule? Reach out and we will be happy to help.",
  /** Digits only, with country code and no + sign */
  whatsappNumber: "919876543210",
  whatsappMessage: "Hello! I would like to know more about the wedding.",
  email: "hello@aaravmeera.com",
  emailSubject: "Wedding Enquiry",
} as const;

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------
export const footer = {
  closingLine: "With love and gratitude",
  hashtag: "#AaravWedsMeera",
} as const;