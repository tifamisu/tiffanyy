/* ─────────────────────────────────────────────────────────────
   PIXEL HOME — content
   Everything Tif's rooms say lives here. Edit copy, links and
   image paths freely; the engine reads it all at mount time.
   Image paths point at /public in your Next.js project.
   ───────────────────────────────────────────────────────────── */

export const PROFILE = {
  name: "Tiffany Yin",
  tagline: "product-minded designer · I research it, design it, and get people excited about it",
  resume: "/resume.pdf",
  news: [
    { tag: "NOW", text: "Google Student Ambassador · 1 of 100 from 35,000+", room: "pm", obj: "badge" },
    { tag: "SUMMER '26", text: "BeReal · Product Innovation Extern", room: "pm", obj: "phone" },
  ],
};

/* room order = left → right through the doors */
export const ORDER = ["ux", "mkt", "pm"];

export const ROOMS = {
  /* ── UI/UX: white + pastel, spontaneous ───────────────── */
  ux: {
    tab: "UI/UX",
    title: "UI/UX STUDIO",
    icon: "✦",
    hash: "uiux",
    pickSub: "twin tails · pastel studio",
    intro: "Interfaces, motion and game art. AIsle0, tidalBYTE, Apple Collapse, illustration and Roblox plushies.",
    greet: "welcome to my ui/ux studio ✦ the walls are an 8pt grid. walk up to anything, or click it!",
    theme: {
      bg: "#f6f3ff", paper: "#ffffff", ink: "#4a4566", accent: "#8f73ff",
      accent2: "#4fbf9a", soft: "#efe9ff", shadow: "#d6cbff",
    },
  },
  /* ── Marketing: pink, frilly, lace ────────────────────── */
  mkt: {
    tab: "MARKETING",
    title: "MARKETING BOUTIQUE",
    icon: "♡",
    hash: "marketing",
    pickSub: "wolf cut · lace boutique",
    intro: "Brand, campaigns, social and merch. TIDAL's hackathon sites, Soothe Beginnings, social cards and Mochi Bunny.",
    greet: "welcome to the boutique ♡ campaigns, brand work and merch are on the shelves!",
    theme: {
      bg: "#fff0f6", paper: "#fffafc", ink: "#5a2a44", accent: "#ff4fa0",
      accent2: "#ff8fbf", soft: "#ffe0ec", shadow: "#ffb3d1",
    },
  },
  /* ── PM: pastel cyber control room ───────────────────── */
  pm: {
    tab: "PRODUCT MANAGEMENT",
    title: "PRODUCT MANAGEMENT ROOM",
    icon: "♪",
    hash: "pm",
    pickSub: "space buns · pastel control room",
    intro: "Research, roadmaps and launches. BeReal, Google, NomNom, Steal A BlindBox and consulting.",
    greet: "welcome to the PM control room ♪ research, roadmaps and rhythm. try the record player!",
    theme: {
      bg: "#eef0ff", paper: "#ffffff", ink: "#3d3b74", accent: "#ff6fc0",
      accent2: "#5fd6d6", soft: "#e3e6ff", shadow: "#a9e9f2",
    },
  },
};

/* Cards. key = "<room>.<object id>" (object ids are set in engine.js) */
export const ITEMS = {
  /* ═════════ UI/UX ═════════ */
  "ux.monitor": {
    label: "AIsle0 · TAMUHack",
    file: "aisle0_final.fig",
    kicker: "TAMUHACK 2026 · UI/UX DESIGNER",
    title: "AIsle0",
    stats: ["1ST PLACE · AMERICAN AIRLINES TRACK", "~800 HACKERS"],
    blurb:
      "A real-time web + mobile platform that connects airline ground and flight crews by flight number, so everyone sees the same turnaround tasks.",
    bullets: [
      "Designed the interface, interaction flows and motion system",
      "Turned a complex operations problem into illustrations and animated walkthroughs that non-expert judges could follow",
      "Worked with engineers on React + Supabase so every UI state matched live data",
    ],
    imgs: ["/aisle0-hero.png"],
    links: [{ label: "DEVPOST →", href: "https://devpost.com/software/idk-yet-8ba2hz" }],
  },
  "ux.byte": {
    label: "tidalBYTE '26 website",
    file: "tidalbyte_f26.fig",
    kicker: "TIDAL @ TAMU · WEB DESIGN · FALL 2026",
    title: "tidalBYTE '26 website",
    stats: ["HELPED LAND ADOBE AS A SPONSOR", "Y2K THEME"],
    blurb:
      "The site for tidalBYTE, TIDAL's Y2K-themed, beginner-friendly hackathon for freshmen and sophomores. It helped us land Adobe as a sponsor.",
    bullets: [
      "Built the look around a pixel city skyline, chunky pixel type and the TIDAL penguin",
      "Date, room and length sit right under the title, with one register button",
    ],
    imgs: ["/tidalbyte-site.png"],
    // site screenshots open the live site instead of the image viewer
    imgLinks: { "/tidalbyte-site.png": "https://f26.tidaltamu.com/" },
    links: [{ label: "VIEW SITE →", href: "https://f26.tidaltamu.com/" }],
  },
  "ux.arcade": {
    label: "Apple Collapse · indie game",
    file: "apple_collapse.exe",
    kicker: "INDIE GAME · SENIOR YEAR",
    title: "Apple Collapse",
    stats: ["SHIPPED A PLAYABLE DEMO", "SPRITES + ANIMATION"],
    blurb:
      "A school-apocalypse RPG I made with friends. I drove a lot of the ideation and drew almost all of the character sprites and animations, taking it from sketchbook to something people can actually play.",
    bullets: [
      "Turned rough sketches into a consistent sprite + animation system",
      "Shipped a public demo with a small team",
    ],
    imgs: [],
    comingSoon: true,
    links: [{ label: "PLAY THE DEMO →", href: "https://nataliecullen.itch.io/apple-collapse-demo" }],
  },
  "ux.easel": {
    label: "Character art & pixel portraits",
    file: "character_art.png",
    kicker: "ILLUSTRATION",
    title: "Character art & pixel portraits",
    stats: ["ORIGINAL CHARACTERS", "CLIENT: ASIAN TEXANS FOR JUSTICE"],
    blurb:
      "Original character illustrations, plus a set of pixel portraits I made for Asian Texans for Justice during a high school internship. They wanted them for their website.",
    bullets: [],
    imgs: ["/art-1.png", "/art-2.png", "/art-3.png", "/art-4.png", "/art-5.png", "/art-6.png", "/pixel-portraits.png"],
    links: [],
  },
  "ux.claw": {
    label: "Steal From Plushies · Roblox",
    file: "plushie_models.png",
    kicker: "ROBLOX · PLUSHIE CHARACTER DESIGN",
    title: "Steal From Plushies",
    stats: ["5.8M+ VISITS", "PLUSHIE MODELS"],
    blurb:
      "I drew the plushie models for this Roblox game, which has passed 5.8 million visits. Here are a few of my plushie designs, redrawn as pixel art.",
    bullets: [],
    sprites: [
      { id: "deer", label: "pudo" },
      { id: "teacup", label: "lilaki" },
      { id: "angel", label: "bandaid bunny" },
    ],
    imgs: ["/roblox-ingame.png", "/pudo-3d.png", "/lilaki-3d.png", "/bandaidbunny-3d.png"],
    links: [{ label: "PLAY ON ROBLOX →", href: "https://www.roblox.com/games/102678267868609/Steal-From-Plushies" }],
  },

  /* ═════════ MARKETING ═════════ */
  "mkt.poster": {
    label: "TIDAL hackathon websites",
    file: "tidal_sites.psd",
    kicker: "TIDAL @ TAMU · VISUAL DESIGN",
    title: "TIDAL hackathon websites",
    stats: ["ADOBE SPONSORSHIP", "1,000+ REGISTRATIONS", "+120% ATTENDANCE"],
    blurb:
      "Two seasons of TIDAL's hackathon sites. I designed the mascots, illustrations and branding, then worked side by side with the web devs to bring them to life.",
    bullets: [
      "tidalBYTE '26: the site helped us land Adobe as a sponsor",
      "TIDALHack '26: 1,000+ registrations and +120% attendance",
    ],
    imgs: ["/tidalbyte-site.png", "/tidal-site.png", "/tidal1.webp", "/tidal2.webp", "/tidal3.webp", "/tidal4.webp", "/tidal5.webp", "/tidal6.webp", "/tidal7.webp"],
    imgLinks: { "/tidalbyte-site.png": "https://f26.tidaltamu.com/", "/tidal-site.png": "https://s26.tidaltamu.com/" },
    links: [
      { label: "TIDALBYTE '26 →", href: "https://f26.tidaltamu.com/" },
      { label: "TIDALHACK '26 →", href: "https://s26.tidaltamu.com/" },
    ],
  },
  "mkt.shelf": {
    label: "Soothe Beginnings campaign",
    file: "soothe_beginnings.canva",
    kicker: "BUSINESS ANALYTICS INTERNSHIP",
    title: "Soothe Beginnings",
    stats: ["BRANDED CAMPAIGN GRAPHICS"],
    blurb:
      "Branded marketing graphics I designed for Soothe Beginnings during a business analytics internship.",
    bullets: [],
    imgs: [],
    links: [],
  },
  "mkt.vanity": {
    label: "Social cards · @tidaltamu @tamuproduct",
    file: "social_cards.png",
    kicker: "PRODUCT@TAMU · MARKETING DIRECTOR & LEAD DESIGNER",
    title: "Social media cards",
    stats: ["@TIDALTAMU", "@TAMUPRODUCT"],
    blurb:
      "Social content for two student orgs. As Marketing Director and Lead Designer at Product@TAMU, I own how the org looks and sounds online.",
    bullets: [],
    imgs: [],
    links: [
      { label: "@TIDALTAMU →", href: "https://www.instagram.com/tidaltamu/" },
      { label: "@TAMUPRODUCT →", href: "https://www.instagram.com/tamuproduct/" },
    ],
  },
  "mkt.bunny": {
    label: "Mochi Bunny stickers",
    file: "mochi_bunny.pack",
    kicker: "PRODUCT LAB",
    title: "Mochi Bunny stickers",
    stats: ["8 STICKERS", "LINE · KAKAOTALK · IMESSAGE"],
    blurb:
      "A sticker pack built from my own character art: eight expressive bunnies (love, mad, sleep, huh?, cry, ahh!, loading, what) for chat apps.",
    bullets: [],
    imgs: ["/sticker-love.gif", "/sticker-mad.png", "/sticker-sleep.png", "/sticker-huh.png", "/sticker-cry.png", "/sticker-ahh.png", "/sticker-loading.png", "/sticker-what.png"],
    grid: true,
    links: [],
    labels: ["love", "mad", "sleep", "huh?", "cry", "ahh!", "loading", "what"],
  },

  /* ═════════ PM ═════════ */
  "pm.phone": {
    label: "BeReal · Product Innovation Extern",
    file: "bereal_extern.notes",
    notif: "⚠ Time to BeReal. ⚠",
    kicker: "BEREAL × EXTERN · SUMMER 2026",
    title: "Product Innovation Extern",
    stats: ["200+ PIECES OF USER FEEDBACK", "GOAL: GROW MAU"],
    blurb:
      "Concurrent activity on BeReal was slipping. I dug into why, then pitched a feature to bring people back.",
    bullets: [
      "Analyzed 200+ pieces of user feedback to find the pain points behind declining concurrent activity",
      "Proposed Be(e)Real, an opt-in bee add-on to grow monthly active users: post on time to grow your garden, and friends send honey",
      "Validated it with competitive analysis and user journey mapping",
      "Built a clickable prototype of the feature",
    ],
    imgs: ["/bereal-preview.png"],
    imgLinks: { "/bereal-preview.png": "https://tif-bereal-prototype.vercel.app/" },
    coverLink: { href: "https://tif-bereal-prototype.vercel.app/", label: "TRY THE PROTOTYPE ↗" },
    links: [{ label: "TRY THE PROTOTYPE →", href: "https://tif-bereal-prototype.vercel.app/" }],
  },
  "pm.badge": {
    label: "Google Student Ambassador",
    file: "ambassador_badge.png",
    kicker: "GOOGLE · AUG 2026 – PRESENT",
    title: "Google Student Ambassador",
    stats: ["1 OF 100 SELECTED", "35,000+ APPLICANTS NATIONWIDE"],
    blurb:
      "One of 100 students picked from 35,000+ applicants across the U.S.",
    bullets: [
      "Interview first-time users about their Gemini experience and turn it into product feedback",
      "Coordinate the Gemini campus tour launch with Google's team and 3 student orgs, for 500+ attendees",
    ],
    imgs: [],
    links: [],
  },
  "pm.board": {
    label: "Steal A BlindBox · concept board",
    file: "blindbox_concepts.fig",
    kicker: "ROBLOX · CO-CREATOR",
    title: "Steal A BlindBox",
    stats: ["CO-CREATOR", "CONCEPTS + IDEATION"],
    blurb:
      "A new Roblox game I co-created. I came up with the concepts and drove the ideation behind it.",
    bullets: [],
    imgs: [],
    links: [{ label: "PLAY ON ROBLOX →", href: "https://www.roblox.com/games/116444937500627/Steal-A-BlindBox" }],
  },
  "pm.wheel": {
    label: "NomNom · hamster wheel",
    file: "nomnom_mascot.fig",
    kicker: "PRODUCT@TAMU IDEATHON · OCT 2025",
    title: "NomNom",
    stats: ["1ST PLACE", "FIGMA PROTOTYPE"],
    blurb:
      "A social cooking app built around weekly themed challenges and rotating crews. The hamster following you around is its mascot.",
    bullets: [
      "Validated the concept with user research and a SWOT analysis",
      "Mapped and prototyped the onboarding, challenge and voting flows in Figma",
      "Delivered the winning pitch",
    ],
    sprites: [{ id: "hamster", label: "NomNom mascot" }],
    imgs: ["/nomnom-kitchen.png", "/nomnom-logo.png", "/nommi.gif"],
    links: [{ label: "DEVPOST →", href: "https://devpost.com/software/nomnom-wnj5z7" }],
  },
  "pm.record": {
    label: "Consulting team lead · record player",
    file: "team_cadence.wav",
    kicker: "TEXAS A&M CONSULTING GROUP · TEAM LEAD",
    title: "Keeping 7 consultants in rhythm",
    stats: ["TEAM OF 7", "LIVE CLIENT ENGAGEMENT"],
    blurb:
      "I led a team of 7 consultants on a live client engagement, scoping experimentation plans for new product launches and running the weekly client meetings.",
    bullets: [],
    imgs: [],
    links: [],
    music: true,
  },
};
