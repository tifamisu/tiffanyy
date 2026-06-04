"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef } from "react";

// Scroll-triggered fade up wrapper
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Staggered children wrapper
function StaggerContainer({ children, className = "", stagger = 0.1 }: { children: React.ReactNode; className?: string; stagger?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        visible: { transition: { staggerChildren: stagger } },
        hidden: {},
      }}
    >
      {children}
    </motion.div>
  );
}

function StaggerItem({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={{
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
      }}
    >
      {children}
    </motion.div>
  );
}

const SKILLS = [
  { id: "pm",           label: "PM",             color: "#ff2d78" },
  { id: "uiux",         label: "UI/UX",          color: "#4a90d9" },
  { id: "marketing",    label: "MARKETING",       color: "#e088c0" },
  { id: "illustration", label: "ILLUSTRATION",    color: "#8b5cf6" },
  { id: "graphic",      label: "GRAPHIC DESIGN",  color: "#5ecfb1" },
] as const;
type SkillId = typeof SKILLS[number]["id"] | null;

const SKILL_MAP: Record<string, string[]> = {
  pm:           ["nomnom","aisle0","tamuproduct","apple-collapse"],
  uiux:         ["nomnom","aisle0","apple-collapse"],
  marketing:    ["tidaltamu","soothe","tamuproduct","tidal-art"],
  illustration: ["nomnom","aisle0","char-art","pixel-art","tidal-art","apple-collapse","pixel-portraits"],
  graphic:      ["tidal-art","soothe","tidaltamu","tamuproduct","pixel-portraits"],
};

const DEFAULT_ACCENT = "#ff2d78";
function getAccent(s: SkillId) { return s ? (SKILLS.find(x=>x.id===s)?.color ?? DEFAULT_ACCENT) : DEFAULT_ACCENT; }
function isLit(id: string, s: SkillId) { return !s || (SKILL_MAP[s]?.includes(id) ?? false); }
function cardStyle(id: string, s: SkillId): React.CSSProperties {
  if (!s) return { transition:"all 0.4s ease" };
  return isLit(id, s)
    ? { transition:"all 0.4s ease" }
    : { opacity:0.15, filter:"grayscale(1)", transition:"all 0.4s ease" };
}

type PortfolioItem = { id: string; type: string; };

const ALL_PROJECTS: PortfolioItem[] = [
  { id: "nomnom", type: "project" },
  { id: "aisle0", type: "project" },
];
const ALL_MARKETING: PortfolioItem[] = [
  { id: "tidal-art", type: "marketing" },
  { id: "tidaltamu", type: "marketing" },
  { id: "tamuproduct", type: "marketing" },
  { id: "soothe", type: "marketing" },
];
const ALL_CREATIVE: PortfolioItem[] = [
  { id: "apple-collapse", type: "creative" },
  { id: "pixel-art", type: "creative" },
  { id: "char-art", type: "creative" },
  { id: "pixel-portraits", type: "creative" },
];

function sortItems(items: PortfolioItem[], skill: SkillId): PortfolioItem[] {
  if (!skill) return items;
  const lit = items.filter(i => SKILL_MAP[skill]?.includes(i.id));
  const dim = items.filter(i => !SKILL_MAP[skill]?.includes(i.id));
  return [...lit, ...dim];
}

// TYPEWRITER NAME
function TypewriterName({ accent }: { accent: string }) {
  const fullText = "TIFFANY\nYIN.";
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, 120);
    return () => clearInterval(interval);
  }, []);

  return (
    <h1 className="hero-name" style={{ minHeight:"80px" }}>
      {displayed.split("\n").map((line, idx) => (
        <span key={idx}>
          {idx > 0 && <br/>}
          {line}
        </span>
      ))}
      <span className="pixel-cursor" style={{ background: accent, transition: "background 0.3s" }} />
    </h1>
  );
}

// SCROLL LIFELINE - MAGICAL GIRL COLLECTING Y2K ITEMS
function ScrollLifeline({ accent }: { accent: string }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [collected, setCollected] = useState<Set<number>>(new Set());

  const items = [
    { at: 0.12, x: 14, y: 75, type: "heart" },
    { at: 0.28, x: 22, y: 170, type: "star" },
    { at: 0.42, x: 10, y: 260, type: "bunny" },
    { at: 0.56, x: 26, y: 345, type: "sparkle" },
    { at: 0.70, x: 12, y: 430, type: "heart" },
    { at: 0.84, x: 22, y: 520, type: "star" },
    { at: 0.95, x: 18, y: 590, type: "clover" },
  ];

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? window.scrollY / h : 0;
      setScrollProgress(p);
      items.forEach((item, i) => {
        if (p >= item.at - 0.01) setCollected(prev => { const n = new Set(prev); n.add(i); return n; });
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (isMobile) return null;

  const path = "M20,0 C20,50 8,90 8,140 C8,190 28,230 28,280 C28,330 8,370 8,420 C8,470 24,510 24,560 C24,590 18,620 18,620";
  const totalLength = 680;

  const charY = Math.min(scrollProgress, 0.96) * 620;
  const getX = (progress: number) => {
    const y = Math.min(progress, 0.96) * 620;
    if (y < 140) return 20 + (8 - 20) * (y / 140);
    if (y < 280) return 8 + (28 - 8) * ((y - 140) / 140);
    if (y < 420) return 28 + (8 - 28) * ((y - 280) / 140);
    if (y < 560) return 8 + (24 - 8) * ((y - 420) / 140);
    return 18;
  };
  const charX = getX(scrollProgress);

  return (
    <div style={{
      position:"fixed", left:0, top:48,
      width:52, height:"calc(100vh - 48px)", zIndex:50, pointerEvents:"none",
    }}>
      {/* Black sidebar bar */}
      <div style={{
        position:"absolute", left:0, top:0, width:48, height:"100%",
        background:"#111", borderRight:`2px solid ${accent}`,
        opacity:0.9, transition:"border-color 0.3s",
      }}/>
      <svg width="46" height="85%" viewBox="0 0 38 620" preserveAspectRatio="none" style={{ overflow:"visible", position:"absolute", top:"7.5%", left:4, zIndex:1 }}>
        {items.map((item, i) => (
          <g key={i} transform={`translate(${item.x - 6}, ${item.y - 6})`}>
            <g opacity={collected.has(i) ? 0 : 1} style={{ transition:"opacity 0.15s" }}>
              {item.type === "heart" && (
                <path d="M6,10 C6,8 4,6 2.5,6 C1,6 0,7.5 0,7.5 C0,10 6,14 6,14 C6,14 12,10 12,7.5 C12,7.5 11,6 9.5,6 C8,6 6,8 6,10 Z" fill="#ff6b9d" opacity="0.8"/>
              )}
              {item.type === "star" && (
                <polygon points="6,0 7.5,4.5 12,4.5 8.5,7.5 9.5,12 6,9 2.5,12 3.5,7.5 0,4.5 4.5,4.5" fill="#ffb347" opacity="0.8"/>
              )}
              {item.type === "bunny" && (
                <g>
                  <ellipse cx="6" cy="8" rx="5" ry="4" fill="#ffd4e8"/>
                  <ellipse cx="4" cy="2" rx="1.5" ry="4" fill="#ffd4e8"/>
                  <ellipse cx="8" cy="2" rx="1.5" ry="4" fill="#ffd4e8"/>
                  <circle cx="4.5" cy="7.5" r="0.8" fill="#111"/>
                  <circle cx="7.5" cy="7.5" r="0.8" fill="#111"/>
                  <circle cx="6" cy="8.5" r="0.5" fill="#ff6b9d"/>
                </g>
              )}
              {item.type === "sparkle" && (
                <path d="M6,0 L7,5 L12,6 L7,7 L6,12 L5,7 L0,6 L5,5 Z" fill="#ff2d78" opacity="0.7"/>
              )}
              {item.type === "clover" && (
                <g>
                  <circle cx="4" cy="4" r="3" fill="#5ecfb1" opacity="0.7"/>
                  <circle cx="8" cy="4" r="3" fill="#5ecfb1" opacity="0.7"/>
                  <circle cx="6" cy="7" r="3" fill="#5ecfb1" opacity="0.7"/>
                  <rect x="5.5" y="8" width="1" height="4" fill="#5ecfb1" rx="0.5"/>
                </g>
              )}
            </g>

            {collected.has(i) && scrollProgress >= item.at && scrollProgress < item.at + 0.05 && (() => {
              const t = Math.min(1, (scrollProgress - item.at) / 0.035);
              return (
                <g opacity={Math.max(0, 1 - t * 1.3)}>
                  <circle cx={-2 - t * 6} cy={2 - t * 8} r={Math.max(0, 1.2 - t)} fill="#ffb6d5"/>
                  <circle cx={14 + t * 5} cy={4 - t * 6} r={Math.max(0, 1 - t * 0.8)} fill="#ff6b9d"/>
                  <circle cx={0 - t * 4} cy={10 + t * 3} r={Math.max(0, 0.8 - t * 0.6)} fill="#ffd4e8"/>
                  <circle cx={12 + t * 7} cy={8 + t * 4} r={Math.max(0, 1 - t * 0.8)} fill="#ffb347"/>
                  {/* Mini hearts */}
                  <path d={`M${-3 - t * 8},${4 - t * 10} c0,-1 -1,-2 -1.5,-2 c-0.5,0 -1,0.5 -1,0.5 c0,1 2.5,3 2.5,3 c0,0 2.5,-2 2.5,-3 c0,0 -0.5,-0.5 -1,-0.5 c-0.5,0 -1.5,1 -1.5,2 z`} fill="#ff2d78" opacity={Math.max(0, 0.8 - t)} transform="scale(0.8)"/>
                  {/* Sparkle dots */}
                  <circle cx={13 + t * 6} cy={2 - t * 6} r={Math.max(0, 1.5 - t)} fill="#ffb6d5" opacity={Math.max(0, 0.7 - t)}/>
                  <circle cx={6} cy={-2 - t * 8} r={Math.max(0, 1.8 - t)} fill={accent} opacity={Math.max(0, 0.9 - t)}/>
                </g>
              );
            })()}
          </g>
        ))}
      </svg>

      <img
        src="/magic.gif"
        alt=""
        style={{
          position:"absolute",
          left: charX - 14,
          top: `${(charY / 620) * 100}%`,
          width: 56,
          height: 56,
          objectFit:"contain",
          transform: "translateY(-50%)",
          filter: "drop-shadow(0 0 4px rgba(255,45,120,0.6)) drop-shadow(0 0 8px rgba(255,45,120,0.3))",
          transition: "left 0.1s ease-out",
          imageRendering: "pixelated",
        }}
      />

      <div style={{
        position:"absolute", top:-20, left:0, width:"100%", textAlign:"center",
        fontFamily:"'Press Start 2P',monospace", fontSize:"6px", color:accent,
        opacity: collected.size > 0 ? 0.7 : 0, transition:"opacity 0.3s, color 0.3s",
      }}>
        {collected.size}/{items.length}
      </div>
    </div>
  );
}


// SCROLL STICKERS
const STICKERS = [
  { src: "/heart.gif", top: "250px", side: "left" as const, offset: "40px", rotation: -12, size: 120 },
  { src: "/pebble.png", top: "600px", side: "right" as const, offset: "45px", rotation: 8, size: 130 },
  { src: "/phone.png", top: "1000px", side: "left" as const, offset: "35px", rotation: -15, size: 150 },
  { src: "/cat.png", top: "1400px", side: "right" as const, offset: "40px", rotation: 10, size: 125 },
  { src: "/paintbrush.png", top: "1800px", side: "left" as const, offset: "45px", rotation: -8, size: 135 },
  { src: "/cd.png", top: "2150px", side: "right" as const, offset: "35px", rotation: 15, size: 130 },
  { src: "/clover.png", top: "2500px", side: "left" as const, offset: "40px", rotation: -12, size: 120 },
  { src: "/me.png", top: "2800px", side: "right" as const, offset: "40px", rotation: 5, size: 170 },
];

function ScrollStickers() {
  const [scrollY, setScrollY] = useState(0);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrollY(y);
      setRevealed(prev => {
        const next = new Set(prev);
        STICKERS.forEach((s, i) => {
          const stickerTop = parseInt(s.top);
          if (y - stickerTop + 600 > 250) next.add(i);
        });
        return next;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const mobileScale = 0.45;

  return (
    <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, pointerEvents:"none", overflow:"hidden", zIndex:1 }}>
      {STICKERS.map((s, i) => {
        const stickerTop = parseInt(s.top);
        const liveProgress = Math.min(1, Math.max(0, (scrollY - stickerTop + 600) / 250));
        const progress = revealed.has(i) ? 1 : liveProgress;
        const isStuck = progress >= 1;
        const bobClass = isStuck ? `sticker-bob-${i % 3}` : "";
        const size = isMobile ? s.size * mobileScale : s.size;
        const offset = isMobile ? "4px" : s.offset;
        // On mobile, alternate stickers to right side only so they sit in blank spaces
        const mobileSide = isMobile ? "right" as const : s.side;

        return (
          <div key={i} className={bobClass} style={{
            position: "absolute",
            top: s.top,
            [mobileSide]: offset,
            width: size,
            height: size,
            opacity: progress * (isMobile ? 0.6 : 1),
            transform: `rotate(${s.rotation}deg) scale(${0.7 + progress * 0.3})`,
            transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
            filter: `drop-shadow(0 0 ${isMobile ? "2px" : "4px"} white) drop-shadow(0 0 ${isMobile ? "2px" : "4px"} white) drop-shadow(0 0 2px white) drop-shadow(0 1px 3px rgba(0,0,0,0.12))`,
          }}>
            <img src={s.src} alt="" style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              ...(s.src === "/cd.png" ? { animation: "spin-cd 8s linear infinite" } : {}),
            }} />
          </div>
        );
      })}
    </div>
  );
}
const HATS = [
  { id:"none", label:"NONE", gif:null },
  { id:"bow", label:"🎀 BOW", gif:"/bow.gif" },
  { id:"star", label:"⭐ STARS", gif:"/star.gif" },
  { id:"flower", label:"🌸 FLOWER", gif:"/flower.gif" },
];

function DressUpWidget({ accent }: { accent: string }) {
  const [hat, setHat] = useState("none");
  const [hovered, setHovered] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const imgH = Math.round(261*160/355);
  const gif = hovered ? "/smile.gif" : (HATS.find(h=>h.id===hat)?.gif ?? "/mascot.gif");
  
  const widget = (
    <div style={{ background:"#d4d0c8",border:"3px solid #111",boxShadow: maximized ? "none" : "4px 4px 0 #111",width:"100%",fontFamily:"'Press Start 2P',monospace", maxWidth: maximized ? 600 : "100%" }}>
      <div style={{ background:`linear-gradient(90deg,${accent} 0%,${accent}99 100%)`,padding:"5px 8px",display:"flex",justifyContent:"space-between",alignItems:"center",transition:"background 0.3s" }}>
        <span style={{ fontSize:"7px",color:"white",letterSpacing:"0.5px" }}>TIFFANY_CHARA_MAKER.exe</span>
        <div>
          <span style={{ display:"inline-flex",alignItems:"center",justifyContent:"center",width:14,height:14,background:"#d4d0c8",border:"2px solid #111",fontSize:"7px",cursor:"pointer",marginLeft:2,color:"#111" }}>_</span>
          <span onClick={()=>setMaximized(!maximized)} style={{ display:"inline-flex",alignItems:"center",justifyContent:"center",width:14,height:14,background:"#d4d0c8",border:"2px solid #111",fontSize:"7px",cursor:"pointer",marginLeft:2,color:"#111" }}>{maximized ? "❐" : "□"}</span>
          {maximized && <span onClick={()=>setMaximized(false)} style={{ display:"inline-flex",alignItems:"center",justifyContent:"center",width:14,height:14,background:"#d4d0c8",border:"2px solid #111",fontSize:"7px",cursor:"pointer",marginLeft:2,color:"#111" }}>✕</span>}
        </div>
      </div>
      <div style={{ display:"flex" }}>
        <div style={{ background:"#f0ede8",borderRight:"2px solid #999",padding: maximized ? "24px 20px" : "16px 12px",display:"flex",flexDirection:"column" as const,alignItems:"center",minWidth: maximized ? 240 : 160 }}>
          <div style={{ position:"relative",width: maximized ? 240 : 160,height: maximized ? Math.round(261*240/355) : imgH,cursor:"none" }} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}>
            <img src={gif} alt="OC" style={{ width:"100%",height:"100%",imageRendering:"pixelated",display:"block" }}/>
          </div>
          <div style={{ marginTop:8,fontSize: maximized ? "8px" : "6px",color:"#888",textAlign:"center" as const,lineHeight:1.8 }}>TIFFANY OC<br/><span style={{ color:accent,transition:"color 0.3s" }}>✦ ur artist ✦</span></div>
        </div>
        <div style={{ flex:1,display:"flex",flexDirection:"column" as const,position:"relative" as const,overflow:"hidden" }}>
          {/* Magazine-style kaomoji fill on hover */}
          {hovered && (
            <div style={{
              position:"absolute",inset:0,zIndex:10,
              background:"#111",
              display:"flex",flexWrap:"wrap" as const,alignContent:"center",justifyContent:"center",
              gap:"4px",padding:"8px",
              animation:"fadeIn 0.2s ease-out",
            }}>
              {Array.from({length:20}).map((_,i) => (
                <span key={i} style={{
                  fontFamily:"'Space Mono',monospace",
                  fontSize: i % 3 === 0 ? "14px" : i % 3 === 1 ? "10px" : "12px",
                  color: i % 4 === 0 ? accent : i % 4 === 1 ? "white" : i % 4 === 2 ? `${accent}88` : "#555",
                  transform: `rotate(${(i % 5) * 4 - 8}deg)`,
                  lineHeight: 1.4,
                  whiteSpace:"nowrap" as const,
                }}>( ˶ᵔ ᵕ ᵔ˶ )</span>
              ))}
            </div>
          )}
          <div style={{ padding:"10px 8px 6px",background:"#d4d0c8" }}>
            <p style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"6px",color:"#555",marginBottom:8 }}>🎀 HATS</p>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6 }}>
              {HATS.map(h=>(<button key={h.id} onClick={()=>setHat(h.id)} style={{ padding:"8px 6px",fontFamily:"'Press Start 2P',monospace",fontSize:"6px",background:hat===h.id?accent:"white",color:hat===h.id?"white":"#111",border:`2px solid ${hat===h.id?"#111":"#999"}`,cursor:"none",boxShadow:hat===h.id?"2px 2px 0 #111":"none",letterSpacing:"0.3px",transition:"background 0.3s" }}>{h.label}</button>))}
            </div>
          </div>
          <div style={{ background:"#d4d0c8",borderTop:"2px solid #999",padding:"4px 8px",fontSize:"6px",color:"#555",display:"flex",justifyContent:"space-between",marginTop:"auto" }}>
            <span>{hovered?"( ˶ᵔ ᵕ ᵔ˶ )":`HAT: ${hat.toUpperCase()}`}</span>
            <span style={{ color:accent,transition:"color 0.3s" }}>✦</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (maximized) {
    return (
      <div onClick={()=>setMaximized(false)} style={{
        position:"fixed", inset:0, zIndex:9999, background:"rgba(0,0,0,0.8)",
        display:"flex", alignItems:"center", justifyContent:"center",
        animation:"fadeIn 0.2s ease-out",
      }}>
        <div onClick={e=>e.stopPropagation()} style={{ width:"90vw", maxWidth:600 }}>
          {widget}
        </div>
      </div>
    );
  }

  return widget;
}

// Y2K MUSIC PLAYER
const TRACKS = [
  { title:"boba date", start:0 },
  { title:"sunflower", start:126 },
  { title:"ocean railway", start:229 },
  { title:"honey lemon tea", start:346 },
  { title:"matcha mochi", start:424 },
  { title:"macarons for two", start:553 },
  { title:"afternoon nap", start:744 },
  { title:"hot air balloon", start:860 },
  { title:"grandma's house", start:976 },
  { title:"rainy day", start:1061 },
  { title:"sweet cafe", start:1220 },
  { title:"a day in the park", start:1403 },
  { title:"study time", start:1545 },
  { title:"boy meets girl", start:1679 },
  { title:"snow angels", start:1765 },
  { title:"if i only knew", start:1914 },
  { title:"slice of life", start:2015 },
  { title:"meteor shower", start:2108 },
  { title:"bento box", start:2249 },
  { title:"heading home", start:2371 },
  { title:"moving day", start:2505 },
  { title:"cream soda", start:2584 },
  { title:"honey's waltz", start:2690 },
  { title:"love letters", start:2747 },
  { title:"wishing on a star", start:2854 },
  { title:"monday blues", start:2956 },
  { title:"willow tree", start:3067 },
  { title:"moonlight", start:3201 },
  { title:"aquarium", start:3324 },
  { title:"hot cocoa", start:3419 },
];

function MusicPlayer({ accent }: { accent: string }) {
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [shuffled, setShuffled] = useState(false);
  const [shuffleOrder, setShuffleOrder] = useState<number[]>([]);
  const [shuffleIndex, setShuffleIndex] = useState(0);
  const playerRef = useRef<any>(null);
  const trackPollRef = useRef<any>(null);
  const iframeId = "yt-player";

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const initPlayer = () => {
      if (playerRef.current) return;
      playerRef.current = new (window as any).YT.Player(iframeId, {
        height: "0", width: "0",
        videoId: "TQvXEza4fPc",
        playerVars: { autoplay: 0, loop: 1, playlist: "TQvXEza4fPc" },
        events: { onReady: () => setPlayerReady(true) },
      });
    };
    if ((window as any).YT && (window as any).YT.Player) { initPlayer(); }
    else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    }
  }, [isMobile]);

  // Poll current time to update track name
  useEffect(() => {
    if (playing && playerRef.current?.getCurrentTime) {
      trackPollRef.current = setInterval(() => {
        const t = playerRef.current.getCurrentTime();
        for (let i = TRACKS.length - 1; i >= 0; i--) {
          if (t >= TRACKS[i].start) { setCurrentTrack(i); break; }
        }
      }, 1000);
    }
    return () => { if (trackPollRef.current) clearInterval(trackPollRef.current); };
  }, [playing]);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 8000);
    return () => clearTimeout(t);
  }, []);

  const generateShuffle = () => {
    const order = Array.from({ length: TRACKS.length }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  };

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (playing) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
    setPlaying(!playing);
    setShowHint(false);
  };

  const goToTrack = (idx: number) => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(TRACKS[idx].start, true);
    setCurrentTrack(idx);
    if (!playing) { playerRef.current.playVideo(); setPlaying(true); }
  };

  const skipNext = () => {
    if (shuffled) {
      const nextSI = (shuffleIndex + 1) % shuffleOrder.length;
      setShuffleIndex(nextSI);
      goToTrack(shuffleOrder[nextSI]);
    } else {
      goToTrack((currentTrack + 1) % TRACKS.length);
    }
  };

  const skipPrev = () => {
    if (shuffled) {
      const prevSI = (shuffleIndex - 1 + shuffleOrder.length) % shuffleOrder.length;
      setShuffleIndex(prevSI);
      goToTrack(shuffleOrder[prevSI]);
    } else {
      goToTrack((currentTrack - 1 + TRACKS.length) % TRACKS.length);
    }
  };

  const toggleShuffle = () => {
    if (!shuffled) {
      const order = generateShuffle();
      setShuffleOrder(order);
      // Find current track in shuffle order to start from there
      const idx = order.indexOf(currentTrack);
      setShuffleIndex(idx >= 0 ? idx : 0);
      setShuffled(true);
    } else {
      setShuffled(false);
    }
  };

  if (isMobile) return null;

  return (
    <>
      <div id={iframeId} style={{ position:"absolute",top:-9999,left:-9999 }} />
      <div style={{ position:"fixed",bottom:24,right:24,zIndex:9998,cursor:"none",display:"flex",flexDirection:"column" as const,alignItems:"flex-end",gap:8 }}>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity:0,y:20,scale:0.8 }}
              animate={{ opacity:1,y:0,scale:1 }}
              exit={{ opacity:0,y:20,scale:0.8 }}
              transition={{ type:"spring",stiffness:300,damping:25 }}
              style={{ background:"#d4d0c8",border:"3px solid #111",boxShadow:"4px 4px 0 #111",width:250,fontFamily:"'Press Start 2P',monospace" }}
            >
              <div style={{ background:`linear-gradient(90deg,${accent} 0%,${accent}99 100%)`,padding:"4px 8px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <span style={{ fontSize:"6px",color:"white",letterSpacing:"0.5px" }}>♫ NOW PLAYING</span>
                <span onClick={()=>setExpanded(false)} style={{ display:"inline-flex",alignItems:"center",justifyContent:"center",width:14,height:14,background:"#d4d0c8",border:"1px solid #111",fontSize:"7px",cursor:"none",color:"#111" }}>✕</span>
              </div>
              {/* Track display */}
              <div style={{ padding:"12px 10px",background:"#111",textAlign:"center" as const }}>
                <p style={{ fontSize:"6px",color:"#555",marginBottom:6 }}>TRACK {currentTrack + 1} / {TRACKS.length}</p>
                <motion.p
                  key={currentTrack}
                  initial={{ opacity:0,y:8 }}
                  animate={{ opacity:1,y:0 }}
                  style={{ fontSize:"8px",color:accent,marginBottom:4,letterSpacing:"0.5px",transition:"color 0.3s" }}
                >✦ {TRACKS[currentTrack].title} ✦</motion.p>
                <p style={{ fontSize:"5px",color:"#666",lineHeight:1.8 }}>{playing ? "♫ ♫ ♫" : "~ paused ~"}</p>
              </div>
              {/* Controls */}
              <div style={{ padding:"10px",display:"flex",justifyContent:"center",alignItems:"center",gap:8,background:"#d4d0c8" }}>
                <button onClick={toggleShuffle} title="Shuffle" style={{ width:28,height:28,background:shuffled?accent:"white",color:shuffled?"white":"#111",border:"2px solid #111",boxShadow:"2px 2px 0 #111",fontFamily:"'Press Start 2P',monospace",fontSize:"7px",cursor:"none",display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.2s" }}>🔀</button>
                <button onClick={skipPrev} style={{ width:30,height:30,background:"white",border:"2px solid #111",boxShadow:"2px 2px 0 #111",fontFamily:"'Press Start 2P',monospace",fontSize:"10px",cursor:"none",display:"flex",alignItems:"center",justifyContent:"center" }}>⏮</button>
                <button onClick={togglePlay} style={{ width:40,height:30,background:accent,border:"2px solid #111",boxShadow:"2px 2px 0 #111",fontFamily:"'Press Start 2P',monospace",fontSize:"12px",color:"white",cursor:"none",display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.3s" }}>{playing?"⏸":"▶"}</button>
                <button onClick={skipNext} style={{ width:30,height:30,background:"white",border:"2px solid #111",boxShadow:"2px 2px 0 #111",fontFamily:"'Press Start 2P',monospace",fontSize:"10px",cursor:"none",display:"flex",alignItems:"center",justifyContent:"center" }}>⏭</button>
              </div>
              {/* Status */}
              <div style={{ padding:"4px 8px",borderTop:"2px solid #999",fontSize:"5px",color:"#888",textAlign:"center" as const,display:"flex",justifyContent:"space-between" }}>
                <span>{shuffled ? "🔀 shuffle on" : "sequential"}</span>
                <span style={{ color:accent,transition:"color 0.3s" }}>✦</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint tab */}
        <AnimatePresence>
          {showHint && !expanded && (
            <motion.div
              initial={{ opacity:0,y:10 }}
              animate={{ opacity:1,y:0 }}
              exit={{ opacity:0,y:10 }}
              style={{
                position:"absolute",bottom:88,right:0,
                background:"#111",border:`2px solid ${accent}`,boxShadow:`3px 3px 0 ${accent}`,
                padding:"6px 10px",fontFamily:"'Press Start 2P',monospace",fontSize:"6px",
                color:"white",letterSpacing:"0.5px",
                display:"flex",flexDirection:"column" as const,alignItems:"center",gap:4,
                width:80,
              }}
            >
              <span><span style={{ color:accent }}>♫</span> click me!</span>
              <motion.span
                animate={{ y:[0,4,0] }}
                transition={{ repeat:Infinity,duration:0.8 }}
                style={{ fontSize:"10px",color:accent }}
              >↓</motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spinning CD */}
        <motion.div
          onClick={()=>{ if(!expanded){ setExpanded(true); setShowHint(false); } else togglePlay(); }}
          whileHover={{ scale:1.1 }}
          whileTap={{ scale:0.9 }}
          style={{ width:80,height:80,cursor:"none",position:"relative",filter:"drop-shadow(0 0 4px white) drop-shadow(0 0 4px white) drop-shadow(0 2px 6px rgba(0,0,0,0.25))" }}
        >
          <img src="/cd.png" alt="Music player" style={{ width:"100%",height:"100%",objectFit:"contain",animation:playing?"spin-cd 3s linear infinite":"spin-cd 15s linear infinite" }}/>
          {!playing && !expanded && (
            <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px",color:"white",textShadow:"0 0 6px #111" }}>▶</div>
          )}
        </motion.div>
      </div>
    </>
  );
}

// MOBILE HEART TAP EFFECT
function MobileHeartTaps() {
  const [hearts, setHearts] = useState<{id:number;x:number;y:number;delay:number}[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const idRef = useRef(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    const handleTouch = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      const id = idRef.current++;
      const count = 3;
      const newHearts = Array.from({ length: count }, (_, i) => ({
        id: id + i,
        x: touch.clientX,
        y: touch.clientY,
        delay: i * 0.12,
      }));
      idRef.current += count;
      setHearts(prev => [...prev, ...newHearts]);
      setTimeout(() => {
        setHearts(prev => prev.filter(h => !newHearts.find(n => n.id === h.id)));
      }, 1200);
    };
    window.addEventListener("touchstart", handleTouch, { passive: true });
    return () => window.removeEventListener("touchstart", handleTouch);
  }, [isMobile]);

  if (!isMobile) return null;

  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:99998 }}>
      {hearts.map(h => (
        <motion.div
          key={h.id}
          initial={{ opacity:0.8, scale:0.2 }}
          animate={{ opacity:0, scale:1.8 }}
          transition={{ duration:0.9, delay:h.delay, ease:"easeOut" }}
          style={{
            position:"absolute",
            left: h.x - 20,
            top: h.y - 20,
            width: 40,
            height: 40,
          }}
        >
          <svg width="40" height="40" viewBox="0 0 20 20" style={{ imageRendering:"pixelated" }}>
            {/* top bumps */}
            <rect x="3" y="2" width="1" height="1" fill="#ff2d78"/>
            <rect x="4" y="1" width="1" height="1" fill="#ff2d78"/>
            <rect x="5" y="1" width="1" height="1" fill="#ff2d78"/>
            <rect x="6" y="1" width="1" height="1" fill="#ff2d78"/>
            <rect x="7" y="2" width="1" height="1" fill="#ff2d78"/>
            <rect x="8" y="2" width="1" height="1" fill="#ff2d78"/>
            <rect x="9" y="2" width="1" height="1" fill="#ff2d78"/>
            <rect x="10" y="2" width="1" height="1" fill="#ff2d78"/>
            <rect x="11" y="2" width="1" height="1" fill="#ff2d78"/>
            <rect x="12" y="1" width="1" height="1" fill="#ff2d78"/>
            <rect x="13" y="1" width="1" height="1" fill="#ff2d78"/>
            <rect x="14" y="1" width="1" height="1" fill="#ff2d78"/>
            <rect x="15" y="2" width="1" height="1" fill="#ff2d78"/>
            {/* sides */}
            <rect x="2" y="3" width="1" height="1" fill="#ff2d78"/>
            <rect x="8" y="3" width="1" height="1" fill="#ff2d78"/>
            <rect x="10" y="3" width="1" height="1" fill="#ff2d78"/>
            <rect x="16" y="3" width="1" height="1" fill="#ff2d78"/>
            <rect x="2" y="4" width="1" height="1" fill="#ff2d78"/>
            <rect x="16" y="4" width="1" height="1" fill="#ff2d78"/>
            <rect x="2" y="5" width="1" height="1" fill="#ff2d78"/>
            <rect x="16" y="5" width="1" height="1" fill="#ff2d78"/>
            <rect x="2" y="6" width="1" height="1" fill="#ff2d78"/>
            <rect x="16" y="6" width="1" height="1" fill="#ff2d78"/>
            {/* narrowing */}
            <rect x="3" y="7" width="1" height="1" fill="#ff2d78"/>
            <rect x="15" y="7" width="1" height="1" fill="#ff2d78"/>
            <rect x="3" y="8" width="1" height="1" fill="#ff2d78"/>
            <rect x="15" y="8" width="1" height="1" fill="#ff2d78"/>
            <rect x="4" y="9" width="1" height="1" fill="#ff2d78"/>
            <rect x="14" y="9" width="1" height="1" fill="#ff2d78"/>
            <rect x="4" y="10" width="1" height="1" fill="#ff2d78"/>
            <rect x="14" y="10" width="1" height="1" fill="#ff2d78"/>
            <rect x="5" y="11" width="1" height="1" fill="#ff2d78"/>
            <rect x="13" y="11" width="1" height="1" fill="#ff2d78"/>
            <rect x="5" y="12" width="1" height="1" fill="#ff2d78"/>
            <rect x="13" y="12" width="1" height="1" fill="#ff2d78"/>
            <rect x="6" y="13" width="1" height="1" fill="#ff2d78"/>
            <rect x="12" y="13" width="1" height="1" fill="#ff2d78"/>
            <rect x="7" y="14" width="1" height="1" fill="#ff2d78"/>
            <rect x="11" y="14" width="1" height="1" fill="#ff2d78"/>
            <rect x="8" y="15" width="1" height="1" fill="#ff2d78"/>
            <rect x="10" y="15" width="1" height="1" fill="#ff2d78"/>
            {/* bottom point */}
            <rect x="9" y="16" width="1" height="1" fill="#ff2d78"/>
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

// CURSOR
function getActualBgColor(el: Element): string {
  let c: Element|null = el;
  while (c) { const bg = window.getComputedStyle(c).backgroundColor; if (bg && bg!=="rgba(0, 0, 0, 0)" && bg!=="transparent") return bg; c=c.parentElement; }
  return "rgb(255,255,255)";
}
function CustomCursor() {
  const [pos, setPos] = useState({ x:-100,y:-100 });
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const move = (e: MouseEvent) => {
      setPos({ x:e.clientX,y:e.clientY });
      const el = document.elementFromPoint(e.clientX,e.clientY);
      if (el) { const bg=getActualBgColor(el); const m=bg.match(/\d+/g); if(m){const[r,g,b]=m.map(Number);setIsDark(0.299*r+0.587*g+0.114*b<128);} }
    };
    window.addEventListener("mousemove",move);
    return ()=>window.removeEventListener("mousemove",move);
  },[]);
  return (<div className="mobile-hide" style={{ position:"fixed",left:pos.x,top:pos.y,width:56,height:56,pointerEvents:"none",zIndex:99999,transform:"translate(-4px,-4px)",imageRendering:"pixelated" }}><img src={isDark?"/white bunny.png":"/dark bunny.png"} alt="" style={{ width:56,height:56,imageRendering:"pixelated",display:"block" }}/></div>);
}

// 2D → 3D HOVER REVEAL CELL
function RevealCell({ art2d, art3d }: { art2d: string; art3d: string }) {
  const [show3d, setShow3d] = useState(false);
  const timeoutRef = useRef<any>(null);

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShow3d(true);
  };
  const handleMove = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShow3d(true);
    timeoutRef.current = setTimeout(() => setShow3d(false), 2000);
  };
  const handleLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShow3d(false);
  };
  // Mobile tap to toggle
  const handleTap = () => {
    if (show3d) { setShow3d(false); return; }
    setShow3d(true);
    timeoutRef.current = setTimeout(() => setShow3d(false), 2000);
  };

  return (
    <div
      onMouseEnter={handleEnter}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onTouchStart={handleTap}
      style={{ position:"relative",width:"100%",height:"100%",overflow:"hidden" }}
    >
      <img src={art2d} alt="" style={{
        position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"contain",padding:"6px",
        opacity: show3d ? 0 : 1,
        transition:"opacity 0.4s ease-in-out",
      }}/>
      <img src={art3d} alt="" style={{
        position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",
        opacity: show3d ? 1 : 0,
        transform: show3d ? "scale(1)" : "scale(1.05)",
        transition:"opacity 0.4s ease-in-out, transform 0.4s ease-in-out",
      }}/>
      <div style={{
        position:"absolute",bottom:4,left:0,right:0,textAlign:"center",
        fontFamily:"'Press Start 2P',monospace",fontSize:"4px",
        color: show3d ? "white" : "#999",
        textShadow: show3d ? "0 1px 3px rgba(0,0,0,0.8)" : "none",
        transition:"color 0.3s",letterSpacing:"0.3px",
      }}>
        {show3d ? "IN-GAME" : "2D ART"}
      </div>
    </div>
  );
}

// STICKER CELL — click to copy with watermark
function StickerCell({ src, label, bg, index, accent }: { src: string; label: string; bg: string; index: number; accent: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = src;
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });

      const size = 200;
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0, size, size);

      // Add watermark
      ctx.font = "10px 'Press Start 2P', monospace";
      ctx.fillStyle = "rgba(180, 180, 180, 0.35)";
      ctx.textAlign = "right";
      ctx.fillText("@tif", size - 6, size - 6);

      // Try clipboard first (works on desktop)
      try {
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((b) => { if (b) resolve(b); else reject(); }, "image/png");
        });
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
        return;
      } catch {}

      // Fallback for mobile - try share API
      try {
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((b) => { if (b) resolve(b); else reject(); }, "image/png");
        });
        const file = new File([blob], `mochi-bunny-${label}.png`, { type: "image/png" });
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: "Mochi Bunny Sticker" });
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
          return;
        }
      } catch {}

      // Last fallback - download
      const link = document.createElement("a");
      link.download = `mochi-bunny-${label}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error("Copy failed:", e);
    }
  };

  return (
    <motion.div
      onClick={handleCopy}
      whileHover={{ scale: 1.15, rotate: index % 2 === 0 ? 5 : -5 }}
      whileTap={{ scale: 0.9 }}
      style={{
        background: bg, border: "2px solid #eee", borderRadius: "12px",
        aspectRatio: "1", display: "flex", flexDirection: "column" as const,
        alignItems: "center", justifyContent: "center", padding: "8px",
        filter: "drop-shadow(0 0 3px white) drop-shadow(0 0 3px white)",
        cursor: "pointer", position: "relative" as const,
      }}
    >
      <img src={src} alt={label} style={{ width: "75%", height: "75%", objectFit: "contain" }} />
      <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: "4px", color: "#999", marginTop: 4 }}>
        {copied ? "copied!" : label}
      </span>
      {/* Copied toast */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: -8 }}
            exit={{ opacity: 0, y: -16 }}
            style={{
              position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)",
              background: accent, color: "white",
              fontFamily: "'Press Start 2P',monospace", fontSize: "5px",
              padding: "3px 6px", borderRadius: 4, whiteSpace: "nowrap" as const,
              boxShadow: "2px 2px 0 #111",
            }}
          >
            ✦ copied!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// RENDER CARDS
function WinBar({ title, accent, pink }: { title: string; accent: string; pink?: boolean }) {
  return (
    <div style={{ background: pink ? `linear-gradient(90deg,${accent} 0%,${accent}99 100%)` : "linear-gradient(90deg,#111 0%,#444 100%)", color:"white",fontFamily:"'Press Start 2P',monospace",fontSize:"9px",padding:"6px 10px",display:"flex",justifyContent:"space-between",alignItems:"center",letterSpacing:"0.5px",transition:"background 0.3s" }}>
      <span>{title}</span>
      <div><span className="win-btn">_</span><span className="win-btn">□</span><span className="win-btn">✕</span></div>
    </div>
  );
}

function ProjectCard({ id, activeSkill, accent }: { id: string; activeSkill: SkillId; accent: string }) {
  const [hoverNom, setHoverNom] = useState(false);
  const [hoverAisle, setHoverAisle] = useState(false);
  if (id === "nomnom") return (
    <div className="project-window pixel-border" style={cardStyle("nomnom",activeSkill)}>
      <WinBar title="nomnom.figma — Product@TAMU Ideathon Fall 2025" accent={accent} pink/>
      <div className="project-body">
        <div>
          <div style={{ display:"inline-block",background:accent,color:"white",fontFamily:"'Press Start 2P',monospace",fontSize:"7px",padding:"8px 12px",border:"2px solid #111",boxShadow:"3px 3px 0 #111",marginBottom:"20px",lineHeight:1.8,letterSpacing:"0.5px",transition:"background 0.3s" }}>🏆 WINNER<br/>TCL 40" Q3K QLED SMART TV<br/>Product@TAMU Ideathon F25</div>
          <h3 className="project-title-px">NomNom</h3>
          <p className="project-desc-mono">Turns everyday cooking into a social game. Every week, a rotating "kitchen crew" gets a wild theme — "make something yellow," "recreate your fave childhood snack." Cook, upload, vote, climb. Designed entirely in Figma.</p>
          <div className="role-box"><strong style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"8px",color:accent,display:"block",marginBottom:"8px",transition:"color 0.3s" }}>// MY ROLE</strong>Led ideation from concept to execution. Created all graphics, animations & illustrations for the home + onboarding screens. Shaped the core product vision with the team.</div>
          <div style={{ display:"flex",gap:"10px",flexWrap:"wrap" as const,marginBottom:"20px" }}>
            {["FIGMA","IDEATION","ILLUSTRATION"].map(t=>(<span key={t} style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"7px",padding:"5px 8px",background:"#f0ede8",border:"2px solid #111" }}>{t}</span>))}
          </div>
          <div style={{ display:"flex",gap:"10px",flexWrap:"wrap" as const }}>
            <a href="https://devpost.com/software/nomnom-wnj5z7" target="_blank" rel="noopener noreferrer" className="pixel-link" onMouseEnter={e=>{(e.target as HTMLElement).style.background=accent;(e.target as HTMLElement).style.color="white"}} onMouseLeave={e=>{(e.target as HTMLElement).style.background="white";(e.target as HTMLElement).style.color="#111"}}>VIEW ON DEVPOST →</a>
            <a href="https://www.figma.com/design/V8LfQOqcc6Z7ZSELBJDyaP/Ideathon---Nom-Nom?node-id=0-1&t=C0NTWmIVTCDppE0A-1" target="_blank" rel="noopener noreferrer" className="pixel-link" style={{ background:"#111",color:"white" }} onMouseEnter={e=>{(e.target as HTMLElement).style.background=accent;(e.target as HTMLElement).style.color="white"}} onMouseLeave={e=>{(e.target as HTMLElement).style.background="#111";(e.target as HTMLElement).style.color="white"}}>VIEW FIGMA →</a>
          </div>
        </div>
        <a href="https://devpost.com/software/nomnom-wnj5z7" target="_blank" rel="noopener noreferrer" style={{ position:"relative",background:"#b75f3b",borderRadius:"20px",display:"flex",alignItems:"center",justifyContent:"center",minHeight:280,padding:32,overflow:"hidden",cursor:"pointer",textDecoration:"none" }} onMouseEnter={()=>setHoverNom(true)} onMouseLeave={()=>setHoverNom(false)}>
          <img src="/nomnom-logo.png" alt="NomNom logo" style={{ width:"75%",maxWidth:240,height:"auto",borderRadius:"16px" }}/>
          <motion.img
            src="/nom.svg"
            alt="Nom character"
            animate={{ y:[0,-8,0], rotate:[0,3,-3,0] }}
            transition={{ duration:3, repeat:Infinity, ease:"easeInOut" }}
            style={{ position:"absolute",bottom:-8,right:-8,width:"55%",maxWidth:200,height:"auto",filter:"drop-shadow(0 0 4px white) drop-shadow(0 0 4px white) drop-shadow(0 2px 4px rgba(0,0,0,0.15))" }}
          />
          {hoverNom && (
            <div style={{ position:"absolute",inset:0,background:"rgba(183,95,59,0.7)",display:"flex",alignItems:"center",justifyContent:"center",animation:"fadeIn 0.15s ease-out",borderRadius:"20px" }}>
              <span style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"10px",color:"#f4f3ee",letterSpacing:"1px",textShadow:"0 2px 4px rgba(0,0,0,0.3)" }}>take a closer look? →</span>
            </div>
          )}
        </a>
      </div>
    </div>
  );
  if (id === "aisle0") return (
    <div className="project-window pixel-border" style={cardStyle("aisle0",activeSkill)}>
      <WinBar title="aisleO.exe — TAMUhack 2026" accent={accent} pink/>
      <div className="project-body">
        <div>
          <div style={{ display:"inline-block",background:accent,color:"white",fontFamily:"'Press Start 2P',monospace",fontSize:"7px",padding:"8px 12px",border:"2px solid #111",boxShadow:"3px 3px 0 #111",marginBottom:"20px",lineHeight:1.8,letterSpacing:"0.5px",transition:"background 0.3s" }}>🥇 1ST PLACE<br/>AMERICAN AIRLINES CHALLENGE<br/>TAMUhack 2026 — 75K AA MILES</div>
          <h3 className="project-title-px">AIsle0</h3>
          <p className="project-desc-mono">Real-time guided inspection platform connecting airline ground & flight crews by flight number. Live task visibility, AI hazard tagging, step-level compliance evidence — reducing turnaround delays. Built with React, React Native, Supabase & OpenAI.</p>
          <div className="role-box"><strong style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"8px",color:accent,display:"block",marginBottom:"8px",transition:"color 0.3s" }}>// MY ROLE</strong>Designed all UI elements, animations & custom illustrations — including drawings & GIFs that communicate complex airline workflows. Deeply involved in ideation, helping define the product concept and user experience from the ground up.</div>
          <div style={{ display:"flex",gap:"10px",flexWrap:"wrap" as const,marginBottom:"20px" }}>
            {["UI DESIGN","ILLUSTRATION","REACT","IDEATION"].map(t=>(<span key={t} style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"7px",padding:"5px 8px",background:"#f0ede8",border:"2px solid #111" }}>{t}</span>))}
          </div>
          <a href="https://devpost.com/software/idk-yet-8ba2hz" target="_blank" rel="noopener noreferrer" className="pixel-link" onMouseEnter={e=>{(e.target as HTMLElement).style.background=accent;(e.target as HTMLElement).style.color="white"}} onMouseLeave={e=>{(e.target as HTMLElement).style.background="white";(e.target as HTMLElement).style.color="#111"}}>VIEW ON DEVPOST →</a>
        </div>
        <a href="https://devpost.com/software/idk-yet-8ba2hz" target="_blank" rel="noopener noreferrer" style={{ position:"relative",background:"#111",borderRadius:"16px",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",minHeight:220,cursor:"pointer",textDecoration:"none" }} onMouseEnter={()=>setHoverAisle(true)} onMouseLeave={()=>setHoverAisle(false)}>
          <img src="/aisle0-hero.png" alt="AIsle0 landing page" style={{ width:"100%",height:"auto",display:"block" }}/>
          {hoverAisle && (
            <div style={{ position:"absolute",inset:0,background:"rgba(17,17,17,0.65)",display:"flex",alignItems:"center",justifyContent:"center",animation:"fadeIn 0.15s ease-out" }}>
              <span style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"10px",color:"#7fdbca",letterSpacing:"1px",textShadow:"0 2px 4px rgba(0,0,0,0.4)" }}>take a closer look? →</span>
            </div>
          )}
        </a>
      </div>
    </div>
  );
  return null;
}

function ArtCard({ id, activeSkill, accent }: { id: string; activeSkill: SkillId; accent: string }) {
  const [artHover, setArtHover] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const images = ["/art-1.png","/art-2.png","/art-3.png","/art-4.png","/art-5.png","/art-6.png"];
  const titles = ["butterfly dreams","crystal heart","space bunnies","character studies","pink portrait WIP","city girl"];

  if (id === "char-art") return (
    <>
      {/* Y2K Lightbox Gallery */}
      {galleryOpen && (
        <div onClick={()=>setGalleryOpen(false)} style={{
          position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.85)",
          display:"flex",alignItems:"center",justifyContent:"center",
          animation:"fadeIn 0.2s ease-out",cursor:"none",
        }}>
          <div onClick={e=>e.stopPropagation()} style={{
            background:"#d4d0c8",border:"3px solid #111",boxShadow:"8px 8px 0 #111",
            width:"70vh",maxWidth:"90vw",display:"flex",flexDirection:"column" as const,
          }}>
            <div style={{ background:`linear-gradient(90deg,${accent} 0%,${accent}99 100%)`,padding:"5px 10px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <span style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"8px",color:"white",letterSpacing:"0.5px" }}>{titles[current]}.png — {current+1}/{images.length}</span>
              <span onClick={()=>setGalleryOpen(false)} style={{ display:"inline-flex",alignItems:"center",justifyContent:"center",width:16,height:16,background:"#d4d0c8",border:"2px solid #111",fontSize:"9px",cursor:"none",color:"#111",fontFamily:"'Press Start 2P',monospace" }}>✕</span>
            </div>
            <div style={{ display:"flex",alignItems:"center",background:"#111",position:"relative" as const,aspectRatio:"1",overflow:"hidden" }}>
              <button onClick={()=>setCurrent(p=>(p-1+images.length)%images.length)} style={{
                position:"absolute",left:8,zIndex:2,width:40,height:40,background:accent,border:"2px solid #111",boxShadow:"2px 2px 0 #111",
                fontFamily:"'Press Start 2P',monospace",fontSize:"14px",color:"white",cursor:"none",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:0,
              }}>◀</button>
              <img src={images[current]} alt={titles[current]} style={{ width:"100%",height:"100%",objectFit:"contain",display:"block" }}/>
              <button onClick={()=>setCurrent(p=>(p+1)%images.length)} style={{
                position:"absolute",right:8,zIndex:2,width:40,height:40,background:accent,border:"2px solid #111",boxShadow:"2px 2px 0 #111",
                fontFamily:"'Press Start 2P',monospace",fontSize:"14px",color:"white",cursor:"none",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:0,
              }}>▶</button>
            </div>
            <div style={{ background:"#d4d0c8",padding:"8px",display:"flex",justifyContent:"center",gap:8,borderTop:"2px solid #999" }}>
              {images.map((_,i)=>(
                <span key={i} onClick={()=>setCurrent(i)} style={{ width:10,height:10,background:i===current?accent:"#999",border:"2px solid #111",cursor:"none",transition:"background 0.2s" }}/>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Card */}
      <div className="art-window pixel-border" style={cardStyle("char-art",activeSkill)}>
        <WinBar title="character_art.png" accent={accent}/>
        <div
          style={{ position:"relative",cursor:"none",overflow:"hidden" }}
          onMouseEnter={()=>setArtHover(true)}
          onMouseLeave={()=>setArtHover(false)}
          onClick={()=>{ setGalleryOpen(true); setCurrent(0); }}
        >
          <div className="art-img-slot"><img src="/art-1.png" alt="2D character art"/></div>
          {artHover && (
            <div style={{
              position:"absolute",inset:0,background:"rgba(0,0,0,0.6)",
              display:"flex",flexDirection:"column" as const,alignItems:"center",justifyContent:"center",
              animation:"fadeIn 0.15s ease-out",
            }}>
              <span style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"16px",color:accent,marginBottom:8,transition:"color 0.3s" }}>✦ CLICK ME ✦</span>
              <span style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"7px",color:"white",letterSpacing:"1px" }}>view gallery</span>
            </div>
          )}
        </div>
        <div className="art-window-body">
          <p className="art-win-title">2D CHARACTER ART</p>
          <p className="art-win-desc">Original character illustrations — expressive, story-driven 2D art spanning multiple styles and moods.</p>
          <a href="https://sites.google.com/view/tiffanyyin/recent-works" target="_blank" rel="noopener noreferrer" className="pixel-link" style={{ marginTop:"12px",fontSize:"7px",padding:"6px 10px" }}
            onMouseEnter={e=>{(e.target as HTMLElement).style.background=accent;(e.target as HTMLElement).style.color="white"}}
            onMouseLeave={e=>{(e.target as HTMLElement).style.background="white";(e.target as HTMLElement).style.color="#111"}}
          >VIEW ALL WORKS →</a>
        </div>
      </div>
    </>
  );
  if (id === "tidal-art") {
    const [tidalHover, setTidalHover] = useState(false);
    return (
      <div className="art-window pixel-border" style={cardStyle("tidal-art",activeSkill)}>
        <WinBar title="tidalhack_assets.psd" accent={accent}/>
        <a href="https://s26.tidaltamu.com/" target="_blank" rel="noopener noreferrer"
          style={{ position:"relative",display:"block",cursor:"pointer",overflow:"hidden",textDecoration:"none" }}
          onMouseEnter={()=>setTidalHover(true)}
          onMouseLeave={()=>setTidalHover(false)}
        >
          <div className="art-img-slot" style={{ aspectRatio:"16/9" }}><img src="/tidal-site.png" alt="TIDALHack website" style={{ objectFit:"cover",objectPosition:"left center" }}/></div>
          {tidalHover && (
            <div style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",animation:"fadeIn 0.15s ease-out" }}>
              <span style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"10px",color:"white",letterSpacing:"1px",border:`2px solid ${accent}`,padding:"10px 16px",background:"rgba(0,0,0,0.6)" }}>VIEW LIVE SITE →</span>
            </div>
          )}
        </a>
        <div className="art-window-body">
          <p className="art-win-title">TIDALHACK WEBSITE</p>
          <p className="art-win-desc">Designed all visual assets for the official TIDALHack hackathon website — the site that drove 1,000+ registrations and 120% attendance growth. Created mascots, illustrations, and branding, then collaborated closely with web developers to bring it to life.</p>
        </div>
      </div>
    );
  }
  if (id === "pixel-art") {
    const [rblxOpen, setRblxOpen] = useState(false);
    const [rblxCurrent, setRblxCurrent] = useState(0);
    const rblxImages = ["/lilaki.png","/pudo.png","/bandaidbunny.png","/bandaidbunnyyy.png","/roblox-ingame.png","/roblox-lilaki.png","/bb.png"];
    const rblxTitles = ["Lilaki — teacup bunny","Pudo — cherry blossom fawn","Bandaid Bunny — angel","Bandaid Bunny — WIP","in-game: Hanamii, Fawn, Dev Cat","in-game: Celestial Lilaki","in-game: Bandaid Bunny army"];
    return (
      <>
        {rblxOpen && (
          <div onClick={()=>setRblxOpen(false)} style={{ position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",animation:"fadeIn 0.2s ease-out" }}>
            <div onClick={e=>e.stopPropagation()} style={{ background:"#d4d0c8",border:"3px solid #111",boxShadow:"8px 8px 0 #111",width:"70vh",maxWidth:"90vw",display:"flex",flexDirection:"column" as const }}>
              <div style={{ background:`linear-gradient(90deg,${accent} 0%,${accent}99 100%)`,padding:"5px 10px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <span style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"8px",color:"white",letterSpacing:"0.5px" }}>{rblxTitles[rblxCurrent]} — {rblxCurrent+1}/{rblxImages.length}</span>
                <span onClick={()=>setRblxOpen(false)} style={{ display:"inline-flex",alignItems:"center",justifyContent:"center",width:16,height:16,background:"#d4d0c8",border:"2px solid #111",fontSize:"9px",cursor:"pointer",color:"#111",fontFamily:"'Press Start 2P',monospace" }}>x</span>
              </div>
              <div style={{ display:"flex",alignItems:"center",background:"#111",position:"relative" as const,aspectRatio:"1",overflow:"hidden" }}>
                <button onClick={()=>setRblxCurrent(p=>(p-1+rblxImages.length)%rblxImages.length)} style={{ position:"absolute",left:8,zIndex:2,width:40,height:40,background:accent,border:"2px solid #111",boxShadow:"2px 2px 0 #111",fontFamily:"'Press Start 2P',monospace",fontSize:"14px",color:"white",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:0 }}>{"<"}</button>
                <img src={rblxImages[rblxCurrent]} alt={rblxTitles[rblxCurrent]} style={{ width:"100%",height:"100%",objectFit:"contain",display:"block" }}/>
                <button onClick={()=>setRblxCurrent(p=>(p+1)%rblxImages.length)} style={{ position:"absolute",right:8,zIndex:2,width:40,height:40,background:accent,border:"2px solid #111",boxShadow:"2px 2px 0 #111",fontFamily:"'Press Start 2P',monospace",fontSize:"14px",color:"white",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:0 }}>{">"}</button>
              </div>
              <div style={{ background:"#d4d0c8",padding:"8px",display:"flex",justifyContent:"center",gap:6,borderTop:"2px solid #999" }}>
                {rblxImages.map((_,i)=>(<span key={i} onClick={()=>setRblxCurrent(i)} style={{ width:10,height:10,background:i===rblxCurrent?accent:"#999",border:"2px solid #111",cursor:"pointer",transition:"background 0.2s" }}/>))}
              </div>
            </div>
          </div>
        )}
        <div className="art-window pixel-border" style={cardStyle("pixel-art",activeSkill)}>
          <WinBar title="roblox_assets.psd — Steal From Plushies" accent={accent}/>
          {/* 2D to 3D hover reveal grid */}
          <div className="art-img-slot" style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",background:"#f8f6f3",cursor:"pointer",padding:0 }} onClick={()=>{ setRblxOpen(true); setRblxCurrent(0); }}>
            <RevealCell art2d="/lilaki.png" art3d="/lilaki-3d.png" />
            <RevealCell art2d="/pudo.png" art3d="/pudo-3d.png" />
            <RevealCell art2d="/bandaidbunny.png" art3d="/bandaidbunny-3d.png" />
          </div>
          <div className="art-window-body">
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px",flexWrap:"wrap" as const,gap:"8px" }}>
              <p className="art-win-title" style={{ marginBottom:0 }}>ROBLOX GAME ASSET DESIGN</p>
              <span className="rblx-stat" style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"7px",color:accent,background:"#111",padding:"4px 8px",letterSpacing:"0.5px",transition:"color 0.3s" }}>3.3M+ VISITS</span>
            </div>
            <p className="art-win-desc">Paid character designer for Steal From Plushies. Designed original plushie characters from concept to in-game assets, collaborating with game developers on 3D modeling and launch.</p>
            <div style={{ display:"flex",gap:"6px",flexWrap:"wrap" as const,marginTop:"8px" }}>
              {["PAID CREATOR","CHARACTER DESIGN","GAME ASSETS","ROBLOX"].map(t=>(<span key={t} style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"5px",padding:"4px 6px",background:"#f0ede8",border:"2px solid #111" }}>{t}</span>))}
            </div>
            <a href="https://www.roblox.com/games/102678267868609/Steal-From-Plushies" target="_blank" rel="noopener noreferrer" className="pixel-link" style={{ marginTop:"10px",fontSize:"7px",padding:"6px 10px" }}
              onMouseEnter={e=>{(e.target as HTMLElement).style.background=accent;(e.target as HTMLElement).style.color="white"}}
              onMouseLeave={e=>{(e.target as HTMLElement).style.background="white";(e.target as HTMLElement).style.color="#111"}}
            >PLAY ON ROBLOX</a>
          </div>
        </div>
      </>
    );
  }
  if (id === "apple-collapse") {
    const [gameHover, setGameHover] = useState(false);
    const [gameOpen, setGameOpen] = useState(false);
    const [gameCurrent, setGameCurrent] = useState(0);
    const gameImages = ["/apple.png","/game1.png","/game2.png","/game3.png","/game4.png","/game5.png"];
    const gameTitles = ["game menu art","sprite expressions 1","sprite expressions 2","sprite expressions 3","sprite expressions 4","character sketches"];
    return (
      <>
        {gameOpen && (
          <div onClick={()=>setGameOpen(false)} style={{ position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",animation:"fadeIn 0.2s ease-out" }}>
            <div onClick={e=>e.stopPropagation()} style={{ background:"#d4d0c8",border:"3px solid #111",boxShadow:"8px 8px 0 #111",width:"70vh",maxWidth:"90vw",display:"flex",flexDirection:"column" as const }}>
              <div style={{ background:`linear-gradient(90deg,${accent} 0%,${accent}99 100%)`,padding:"5px 10px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <span style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"8px",color:"white",letterSpacing:"0.5px" }}>{gameTitles[gameCurrent]} — {gameCurrent+1}/{gameImages.length}</span>
                <span onClick={()=>setGameOpen(false)} style={{ display:"inline-flex",alignItems:"center",justifyContent:"center",width:16,height:16,background:"#d4d0c8",border:"2px solid #111",fontSize:"9px",cursor:"pointer",color:"#111",fontFamily:"'Press Start 2P',monospace" }}>✕</span>
              </div>
              <div style={{ display:"flex",alignItems:"center",background:"#111",position:"relative" as const,aspectRatio:"16/9",overflow:"hidden" }}>
                <button onClick={()=>setGameCurrent(p=>(p-1+gameImages.length)%gameImages.length)} style={{ position:"absolute",left:8,zIndex:2,width:40,height:40,background:accent,border:"2px solid #111",boxShadow:"2px 2px 0 #111",fontFamily:"'Press Start 2P',monospace",fontSize:"14px",color:"white",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:0 }}>◀</button>
                <img src={gameImages[gameCurrent]} alt={gameTitles[gameCurrent]} style={{ width:"100%",height:"100%",objectFit:"contain",display:"block" }}/>
                <button onClick={()=>setGameCurrent(p=>(p+1)%gameImages.length)} style={{ position:"absolute",right:8,zIndex:2,width:40,height:40,background:accent,border:"2px solid #111",boxShadow:"2px 2px 0 #111",fontFamily:"'Press Start 2P',monospace",fontSize:"14px",color:"white",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:0 }}>▶</button>
              </div>
              <div style={{ background:"#d4d0c8",padding:"8px",display:"flex",justifyContent:"center",gap:6,borderTop:"2px solid #999" }}>
                {gameImages.map((_,i)=>(<span key={i} onClick={()=>setGameCurrent(i)} style={{ width:10,height:10,background:i===gameCurrent?accent:"#999",border:"2px solid #111",cursor:"pointer",transition:"background 0.2s" }}/>))}
              </div>
            </div>
          </div>
        )}
        <div className="project-window pixel-border" style={{ marginBottom:"16px",...cardStyle("apple-collapse",activeSkill) }}>
          <WinBar title="apple_collapse.exe — Indie RPG" accent={accent}/>
          <div className="project-body">
            <div style={{ position:"relative",cursor:"pointer",overflow:"hidden",borderRadius:"8px" }} onMouseEnter={()=>setGameHover(true)} onMouseLeave={()=>setGameHover(false)} onClick={()=>{ setGameOpen(true); setGameCurrent(0); }}>
              <img src="/apple.png" alt="Apple Collapse" style={{ width:"100%",display:"block" }}/>
              {gameHover && (
                <div style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",flexDirection:"column" as const,alignItems:"center",justifyContent:"center",animation:"fadeIn 0.15s ease-out" }}>
                  <span style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"14px",color:accent,marginBottom:8 }}>✦ CLICK ME ✦</span>
                  <span style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"7px",color:"white",letterSpacing:"1px" }}>view sprite art</span>
                </div>
              )}
            </div>
            <div>
              <p className="project-title-px">APPLE COLLAPSE</p>
              <p className="project-desc-mono">Co-created a school apocalypse-themed indie RPG with a team of 4. Led ideation and designed nearly all character sprite animations, expression sheets, and visual assets — bringing the game's world and characters to life from sketch to pixel.</p>
              <div style={{ display:"flex",gap:"6px",flexWrap:"wrap" as const,margin:"12px 0" }}>
                {["IDEATION","SPRITE ART","ANIMATION","GAME DESIGN"].map(t=>(<span key={t} style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"5px",padding:"4px 6px",background:"#f0ede8",border:"2px solid #111" }}>{t}</span>))}
              </div>
              <a href="https://nataliecullen.itch.io/apple-collapse-demo" target="_blank" rel="noopener noreferrer" className="pixel-link" style={{ fontSize:"7px",padding:"6px 10px" }}
                onMouseEnter={e=>{(e.target as HTMLElement).style.background=accent;(e.target as HTMLElement).style.color="white"}}
                onMouseLeave={e=>{(e.target as HTMLElement).style.background="white";(e.target as HTMLElement).style.color="#111"}}
              >PLAY DEMO →</a>
            </div>
          </div>
        </div>
      </>
    );
  }
  if (id === "pixel-portraits") return (
    <div className="art-window pixel-border" style={cardStyle("pixel-portraits",activeSkill)}>
      <WinBar title="atj_portraits.psd" accent={accent}/>
      <div className="art-img-slot" style={{ aspectRatio:"1",background:"#faf8f5" }}><img src="/pixel-portraits.png" alt="Pixel portraits" style={{ objectFit:"contain",padding:"8px" }}/></div>
      <div className="art-window-body">
        <p className="art-win-title">PIXEL PORTRAITS — ATJ</p>
        <p className="art-win-desc">Commissioned pixel portraits for Asian Texans for Justice — 11 unique character illustrations designed for their website.</p>
        <div style={{ display:"flex",gap:"6px",flexWrap:"wrap" as const,marginTop:"8px" }}>
          {["CLIENT WORK","PIXEL ART"].map(t=>(<span key={t} style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"5px",padding:"4px 6px",background:"#f0ede8",border:"2px solid #111" }}>{t}</span>))}
        </div>
      </div>
    </div>
  );
  if (id === "soothe") return (
    <div className="art-window pixel-border" style={{ marginBottom:"24px",...cardStyle("soothe",activeSkill) }}>
      <WinBar title="soothe_beginnings.canva" accent={accent}/>
      <div style={{ padding:"28px" }}>
        <p className="art-win-title" style={{ marginBottom:"12px" }}>SOOTHE BEGINNINGS — MARKETING DESIGN</p>
        <p className="art-win-desc" style={{ marginBottom:"16px" }}>Branded graphics for Soothe Beginnings during a business analytics internship. Assets deployed across Pinterest Ads, Facebook & other social platforms as part of live paid marketing campaigns.</p>
        <div style={{ display:"flex",gap:"8px",flexWrap:"wrap" as const }}>
          <span style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"6px",padding:"5px 8px",background:"#1a1a1a",color:accent,border:`2px solid ${accent}`,transition:"all 0.3s" }}>CANVA</span>
          <span style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"6px",padding:"5px 8px",background:"#1a1a1a",color:"#f0ede8",border:"2px solid #555" }}>PINTEREST ADS</span>
          <span style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"6px",padding:"5px 8px",background:"#1a1a1a",color:"#f0ede8",border:"2px solid #555" }}>FACEBOOK</span>
        </div>
      </div>
    </div>
  );
  return null;
}

function SocialCard({ id, activeSkill, accent }: { id: string; activeSkill: SkillId; accent: string }) {
  if (id === "tidaltamu") return (
    <div className="social-window pixel-border" style={{ position:"relative" as const,...cardStyle("tidaltamu",activeSkill) }}>
      <WinBar title="@tidaltamu — instagram" accent={accent} pink/>
      <div className="social-body">
        <p style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"13px",color:accent,marginBottom:"12px",letterSpacing:"1px",transition:"color 0.3s" }}>@tidaltamu</p>
        <p className="social-org">TIDAL @ Texas A&M</p>
        <p className="social-desc">Managing social presence for one of A&M's premier student tech organizations. Content strategy, creative direction & community engagement — driving hackathon growth through mascot-led campaigns targeting university audiences across Texas.</p>
        <div className="stat-row">
          <div style={{ background:"#111",color:accent,fontFamily:"'Press Start 2P',monospace",fontSize:"7px",padding:"6px 10px",lineHeight:1.6,letterSpacing:"0.5px",transition:"color 0.3s" }}>120% ↑<br/>ATTENDANCE</div>
          <div style={{ background:"#111",color:accent,fontFamily:"'Press Start 2P',monospace",fontSize:"7px",padding:"6px 10px",lineHeight:1.6,letterSpacing:"0.5px",transition:"color 0.3s" }}>~1,000<br/>REGISTRATIONS</div>
        </div>
      </div>
      <motion.img src="/pebble.png" alt="Pebble mascot" className="floating-mascot" animate={{ y:[0,-8,0], rotate:[0,3,-3,0] }} transition={{ duration:3, repeat:Infinity, ease:"easeInOut" }} style={{ position:"absolute",bottom:8,right:8,width:"45%",maxWidth:180,height:"auto",filter:"drop-shadow(0 0 4px rgba(255,45,120,0.4)) drop-shadow(0 0 8px rgba(255,45,120,0.2))",imageRendering:"auto" }}/>
    </div>
  );
  if (id === "tamuproduct") return (
    <div className="social-window pixel-border" style={{ position:"relative" as const,...cardStyle("tamuproduct",activeSkill) }}>
      <WinBar title="@tamuproduct — instagram" accent={accent} pink/>
      <div className="social-body">
        <p style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"13px",color:accent,marginBottom:"12px",letterSpacing:"1px",transition:"color 0.3s" }}>@tamuproduct</p>
        <p className="social-org">Product @ Texas A&M</p>
        <p className="social-desc">Running social media for the student org dedicated to product management & design at Texas A&M. Content creation, community building & keeping the Aggie product-curious community informed and engaged.</p>
      </div>
      <motion.img src="/product.png" alt="Product mascots" className="floating-mascot" animate={{ y:[0,-6,0], rotate:[0,2,-2,0] }} transition={{ duration:3.5, repeat:Infinity, ease:"easeInOut" }} style={{ position:"absolute",bottom:8,right:8,width:"55%",maxWidth:220,height:"auto",filter:"drop-shadow(0 0 4px rgba(255,45,120,0.4)) drop-shadow(0 0 8px rgba(255,45,120,0.2))",imageRendering:"auto" }}/>
    </div>
  );
  return null;
}

// LOADING SPLASH SCREEN
function LoadingSplash({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);
  // 0=dark, 1=drawing outline, 2=fill color + float, 3=name, 4=exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 1800);
    const t3 = setTimeout(() => setPhase(3), 2400);
    const t4 = setTimeout(() => setPhase(4), 3400);
    const t5 = setTimeout(() => onComplete(), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, [onComplete]);

  return (
    <motion.div
      animate={phase >= 4 ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      style={{
        position: "fixed", inset: 0, zIndex: 99999, background: "#111",
        display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Phase 1: Line drawing appears (using magic.gif which is the outline) */}
      {/* Phase 2: Crossfade to full color bunny + start floating */}
      <div style={{ position: "relative", width: 200, height: 200, marginBottom: 24 }}>
        {/* Outline drawing version */}
        <motion.img
          src="/magic.gif"
          alt=""
          initial={{ opacity: 0 }}
          animate={
            phase === 1 ? { opacity: 1 } :
            phase >= 2 ? { opacity: 0 } :
            { opacity: 0 }
          }
          transition={{ duration: phase === 1 ? 1.2 : 0.5 }}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "contain",
            filter: "drop-shadow(0 0 6px rgba(255,45,120,0.4))",
          }}
        />

        {/* Full color bunny */}
        <motion.img
          src="/mochi-bunny.png"
          alt=""
          initial={{ opacity: 0 }}
          animate={
            phase >= 2 ? {
              opacity: 1,
              y: phase >= 2 ? [0, -12, 0] : 0,
              rotate: phase >= 2 ? [0, 3, -3, 0] : 0,
            } : { opacity: 0 }
          }
          transition={phase >= 2 ? {
            opacity: { duration: 0.6 },
            y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          } : { duration: 0.3 }}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "contain",
            filter: phase >= 2 ? "drop-shadow(0 0 12px rgba(255,45,120,0.5)) drop-shadow(0 0 24px rgba(255,45,120,0.2))" : "none",
          }}
        />
      </div>

      {/* Name + subtitle */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={phase >= 3 ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        style={{ textAlign: "center", fontFamily: "'Press Start 2P',monospace", zIndex: 1 }}
      >
        <p style={{ fontSize: "20px", color: "#ff2d78", letterSpacing: "3px", marginBottom: 10 }}>TIFFANY YIN</p>
        <p style={{ fontSize: "6px", color: "#555", letterSpacing: "2px" }}>PM / UI/UX / ILLUSTRATION</p>
      </motion.div>

      {/* Pixel hearts floating up */}
      {Array.from({ length: 6 }, (_, i) => (
        <motion.div key={i}
          animate={{ y: [0, -500], opacity: [0, 0.5, 0.6, 0] }}
          transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: 0.5 + i * 0.4, ease: "linear" }}
          style={{ position: "absolute", bottom: -20, left: `${12 + i * 15}%`, pointerEvents: "none", fontSize: 8 + Math.random() * 8, color: "#ff2d78" }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" style={{ imageRendering: "pixelated" }}>
            <rect x="3" y="1" width="2" height="1" fill="#ff2d78"/>
            <rect x="9" y="1" width="2" height="1" fill="#ff2d78"/>
            <rect x="2" y="2" width="1" height="2" fill="#ff2d78"/>
            <rect x="5" y="2" width="4" height="1" fill="#ff2d78"/>
            <rect x="11" y="2" width="1" height="2" fill="#ff2d78"/>
            <rect x="2" y="4" width="1" height="2" fill="#ff2d78"/>
            <rect x="11" y="4" width="1" height="2" fill="#ff2d78"/>
            <rect x="3" y="6" width="1" height="2" fill="#ff2d78"/>
            <rect x="10" y="6" width="1" height="2" fill="#ff2d78"/>
            <rect x="4" y="8" width="1" height="1" fill="#ff2d78"/>
            <rect x="9" y="8" width="1" height="1" fill="#ff2d78"/>
            <rect x="5" y="9" width="1" height="1" fill="#ff2d78"/>
            <rect x="8" y="9" width="1" height="1" fill="#ff2d78"/>
            <rect x="6" y="10" width="2" height="1" fill="#ff2d78"/>
          </svg>
        </motion.div>
      ))}

      {/* Loading bar */}
      <motion.div style={{ position: "absolute", bottom: 60, left: "50%", transform: "translateX(-50%)", width: 160, height: 3, background: "#222" }}>
        <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 3.5, ease: "easeInOut" }} style={{ height: "100%", background: "#ff2d78" }}/>
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const [activeSkill, setActiveSkill] = useState<SkillId>(null);
  const [loading, setLoading] = useState(true);
  const accent = getAccent(activeSkill);
  const toggle = (id: SkillId) => setActiveSkill(p => p===id ? null : id);

  const projects = useMemo(() => sortItems(ALL_PROJECTS, activeSkill), [activeSkill]);
  const marketingItems = useMemo(() => sortItems(ALL_MARKETING, activeSkill), [activeSkill]);
  const creativeItems = useMemo(() => sortItems(ALL_CREATIVE, activeSkill), [activeSkill]);

  // Split marketing into cards (tidal, soothe) and social handles
  const marketingCards = marketingItems.filter(i => i.id === "tidal-art" || i.id === "soothe");
  const socialCards = marketingItems.filter(i => i.id === "tidaltamu" || i.id === "tamuproduct");
  // Split creative into grid items and featured (apple collapse)
  const creativeFeatured = creativeItems.filter(i => i.id === "apple-collapse");
  const creativeGrid = creativeItems.filter(i => i.id !== "apple-collapse");

  if (loading) return <LoadingSplash onComplete={() => setLoading(false)} />;

  return (
    <motion.main initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.5 }} style={{ fontFamily:"'Press Start 2P',monospace",background:"#f0ede8",minHeight:"100vh",color:"#111",position:"relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
        * { box-sizing:border-box;margin:0;padding:0; }
        @media(max-width:768px){
          .mobile-hide{display:none !important}
        }
        ::-webkit-scrollbar{width:12px}::-webkit-scrollbar-track{background:#d4d0c8;border-left:1px solid #888}::-webkit-scrollbar-thumb{background:#888;border:2px solid #d4d0c8}
        .pixel-border{border:3px solid #111;box-shadow:4px 4px 0 #111}
        .win-btn{width:16px;height:16px;background:#d4d0c8;border:2px solid #111;font-size:9px;display:inline-flex;align-items:center;justify-content:center;cursor:none !important;font-family:'Press Start 2P',monospace;margin-left:3px;color:#111;line-height:1}
        .hero-grid{display:grid;grid-template-columns:1fr 1fr;gap:0;max-width:1200px;margin:0 auto;padding:20px 40px;min-height:calc(100vh - 80px);align-content:center}
        @media(max-width:768px){
          .hero-grid{grid-template-columns:1fr;padding:0 16px;margin:20px auto}
          .hero-left{padding:24px !important}
          .hero-right{border-left:3px solid #111 !important;border-top:none !important;padding:20px !important}
          .hero-name{font-size:22px !important}
          .section-wrap{padding:40px 16px !important}
          .section-header{gap:8px !important;margin-bottom:24px !important;flex-wrap:wrap}
          .section-title{font-size:12px !important}
          .project-body{padding:16px !important;grid-template-columns:1fr !important;gap:16px !important}
          .project-title-px{font-size:12px !important}
          .project-desc-mono{font-size:11px !important}
          .art-showcase{grid-template-columns:1fr !important;gap:12px !important}
          .marketing-grid{grid-template-columns:1fr !important}
          .social-grid{grid-template-columns:1fr !important;gap:12px !important}
          .social-body{padding:16px !important}
          .social-handle{font-size:10px !important}
          .stat-row{flex-wrap:wrap}
          .pixel-border{box-shadow:3px 3px 0 #111 !important}
          .nav-item{font-size:6px !important;padding:0 6px !important;white-space:nowrap}
          .nav-logo{font-size:8px !important;padding:0 10px !important}
          .checkerboard-accent{height:8px}
          .footer-bar{padding:24px 16px !important}
          .footer-name{font-size:11px !important}
          .hero-titlebar{margin-left:-24px !important;margin-right:-24px !important;margin-top:-24px !important;margin-bottom:20px !important}
          .lab-grid{grid-template-columns:1fr !important;padding:16px !important;gap:16px !important}
          .lab-grid h3{font-size:14px !important}
          .lab-grid .pixel-link{font-size:7px !important;padding:8px 12px !important}
          .sticker-mobile-grid{display:grid !important;grid-template-columns:repeat(4,1fr) !important;gap:6px !important;width:100% !important}
          .sticker-mobile-grid>div{min-width:unset !important;aspect-ratio:1 !important;padding:4px !important;border-radius:8px !important}
          .sticker-mobile-grid>div img{width:65% !important;height:65% !important}
          .lab-sticker-hint{font-size:5px !important}
          .lab-sticker-hint::after{content:" tap to save!" !important}
          .lab-tags{gap:4px !important}
          .lab-tags span{font-size:5px !important;padding:3px 5px !important}
          .lab-status{font-size:4px !important;padding:4px 8px !important}
          .art-img-slot{aspect-ratio:auto !important;min-height:180px !important}
          .reveal-label{font-size:3px !important}
          .rblx-stat{font-size:6px !important;padding:3px 6px !important}
          .project-body{grid-template-columns:1fr !important;padding:16px !important;gap:16px !important}
          .stat-row{flex-wrap:wrap}
          .social-body{padding:16px !important}
          .floating-mascot{max-width:100px !important;width:35% !important}
        }
        .hero-left{background:white;padding:32px;border:3px solid #111;box-shadow:6px 6px 0 #111}
        .hero-name{font-family:'Press Start 2P',monospace;font-size:clamp(20px,3vw,32px);line-height:1.6;color:#111;margin-bottom:8px}
        .hero-sub{font-family:'Space Mono',monospace;font-size:12px;color:#555;line-height:1.8;margin-bottom:24px;padding-left:14px}
        .hero-right{background:#1a1a1a;padding:24px;border:3px solid #111;border-left:none;box-shadow:6px 6px 0 #111;display:flex;flex-direction:column;justify-content:center}
        .section-wrap{max-width:1200px;margin:0 auto;padding:40px 40px}
        .section-header{display:flex;align-items:center;gap:16px;margin-bottom:24px}
        .section-line{flex:1;height:3px;background:repeating-linear-gradient(90deg,#111 0px,#111 8px,transparent 8px,transparent 14px)}
        .project-window{background:white;margin-bottom:20px}
        .project-body{padding:24px;display:grid;grid-template-columns:1fr 1fr;gap:24px}
        .project-title-px{font-family:'Press Start 2P',monospace;font-size:16px;color:#111;margin-bottom:16px;letter-spacing:1px}
        .project-desc-mono{font-family:'Space Mono',monospace;font-size:12px;line-height:1.9;color:#333;margin-bottom:20px}
        .role-box{background:#f0ede8;border:2px solid #111;padding:16px;font-family:'Space Mono',monospace;font-size:11px;line-height:1.8;color:#333;margin-bottom:20px}
        .pixel-link{display:inline-block;font-family:'Press Start 2P',monospace;font-size:8px;color:#111;text-decoration:none;border:2px solid #111;padding:8px 14px;background:white;box-shadow:3px 3px 0 #111;transition:all 0.1s;letter-spacing:0.5px}
        .pixel-link:active{transform:translate(2px,2px);box-shadow:1px 1px 0 #111}
        .art-showcase{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;align-items:stretch}
        .art-window{background:white;display:flex;flex-direction:column;height:100%}
        .art-window-body{padding:16px;flex:1;display:flex;flex-direction:column}
        .art-img-slot{width:100%;aspect-ratio:1;background:#f0ede8;display:flex;align-items:center;justify-content:center;overflow:hidden}
        .art-img-slot img{width:100%;height:100%;object-fit:cover}
        .art-win-title{font-family:'Press Start 2P',monospace;font-size:8px;color:#111;margin-bottom:8px;letter-spacing:0.5px}
        .art-win-desc{font-family:'Space Mono',monospace;font-size:11px;color:#555;line-height:1.7}
        .social-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:stretch}
        .social-window{background:white;display:flex;flex-direction:column;height:100%}
        .social-body{padding:28px;flex:1}
        .social-org{font-family:'Space Mono',monospace;font-size:13px;font-weight:700;color:#111;margin-bottom:12px}
        .social-desc{font-family:'Space Mono',monospace;font-size:11px;line-height:1.8;color:#444}
        .stat-row{display:flex;gap:12px;margin-top:16px}
        .section-bg-dark{background:#1a1a1a;padding:36px 0}
        .section-bg-dark .section-title{color:#f0ede8}
        .checkerboard-accent{background-image:repeating-conic-gradient(#ddd 0% 25%,transparent 0% 50%);background-size:8px 8px;height:12px;border-top:1px solid #bbb;border-bottom:1px solid #bbb}
        .art-gallery-scroll{-ms-overflow-style:auto;scrollbar-width:thin}
        .art-gallery-scroll::-webkit-scrollbar{height:8px}
        .art-gallery-scroll::-webkit-scrollbar-track{background:#222}
        .art-gallery-scroll::-webkit-scrollbar-thumb{background:#ff2d78;border-radius:4px}
        .pixel-cursor{display:inline-block;width:10px;height:16px;animation:blink 1s step-end infinite;vertical-align:middle;margin-left:4px}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes scroll-left{0%{transform:translateX(100vw)}100%{transform:translateX(-100%)}}
        @keyframes bob0{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes bob1{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes bob2{0%,100%{transform:translateY(-2px)}50%{transform:translateY(4px)}}
        @keyframes spin-cd{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        @keyframes fadeIn{0%{opacity:0}100%{opacity:1}}
        .sticker-bob-0{animation:bob0 3s ease-in-out infinite}
        .sticker-bob-1{animation:bob1 3.5s ease-in-out infinite}
        .sticker-bob-2{animation:bob2 2.8s ease-in-out infinite}
        .sticker-desktop-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;width:100%}
      `}</style>

      <CustomCursor/>
      <MobileHeartTaps/>
      <ScrollLifeline accent={accent}/>
      <ScrollStickers/>
      <MusicPlayer accent={accent}/>

      {/* TICKER */}
      <div style={{ background:"#111",color:accent,fontFamily:"'Press Start 2P',monospace",fontSize:"9px",padding:"8px 0",overflow:"hidden",whiteSpace:"nowrap",letterSpacing:"1px",transition:"color 0.3s" }}>
        <span style={{ display:"inline-block",animation:"scroll-left 28s linear infinite" }}>✦ TIFFANY YIN ✦ MARKETING + ANALYTICS ✦ TEXAS A&M ✦ UI/UX DESIGN ✦ ILLUSTRATION ✦ PRODUCT MANAGEMENT ✦ GRAPHIC DESIGN ✦ 2D CHARACTER ART ✦ TIFFANY YIN ✦</span>
      </div>

      {/* NAV */}
      <nav style={{ background:"#d4d0c8",borderBottom:"3px solid #111",display:"flex",alignItems:"stretch",height:48,position:"sticky",top:0,zIndex:100 }}>
        <a href="#" className="nav-logo" style={{ background:"#111",color:"#f0ede8",fontFamily:"'Press Start 2P',monospace",fontSize:"10px",padding:"0 20px",display:"flex",alignItems:"center",letterSpacing:"1px",borderRight:"3px solid #111",textDecoration:"none" }}>TY.EXE</a>
        {[["#projects","PROJECTS"],["#marketing","MARKETING"],["#creative","CREATIVE"],["#lab","LAB"]].map(([href,label])=>(
          <a key={label} href={href} className="nav-item" style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"8px",padding:"0 16px",display:"flex",alignItems:"center",justifyContent:"center",borderRight:"1px solid #999",color:"#111",textDecoration:"none",letterSpacing:"0.5px",whiteSpace:"nowrap",flex:1 }}
            onMouseEnter={e=>{(e.target as HTMLElement).style.background=accent;(e.target as HTMLElement).style.color="white"}}
            onMouseLeave={e=>{(e.target as HTMLElement).style.background="";(e.target as HTMLElement).style.color="#111"}}
          >{label}</a>
        ))}
      </nav>

      {/* HERO */}
      <div className="hero-grid">
        <div className="hero-left pixel-border">
          <div className="hero-titlebar" style={{ background:"linear-gradient(90deg,#111 0%,#444 100%)",color:"white",fontFamily:"'Press Start 2P',monospace",fontSize:"9px",padding:"6px 10px",display:"flex",justifyContent:"space-between",alignItems:"center",letterSpacing:"0.5px",marginBottom:"20px",marginLeft:"-32px",marginRight:"-32px",marginTop:"-32px" }}>
            <span>tiffany_yin.exe</span>
            <div><span className="win-btn">_</span><span className="win-btn">□</span><span className="win-btn">✕</span></div>
          </div>
          <p style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"9px",color:accent,marginBottom:"12px",letterSpacing:"1px",transition:"color 0.3s" }}>&gt; LOADING PORTFOLIO...</p>
          <TypewriterName accent={accent}/>
          
          <p className="hero-sub" style={{ borderLeft:`3px solid ${accent}`,transition:"border-color 0.3s" }}>Senior Marketing (Analytics & Consulting)<br/>@ Texas A&M University<br/>Minor in English Literature</p>

          <div style={{ display:"flex",flexWrap:"wrap",gap:"8px",marginBottom:"12px" }}>
            {SKILLS.map((s,i)=>{
              const on = activeSkill===s.id;
              return (<motion.button key={s.id} onClick={()=>toggle(s.id)}
                whileTap={{ scale:0.9 }}
                whileHover={{ scale:1.05 }}
                transition={{ type:"spring",stiffness:400,damping:17 }}
                style={{
                fontFamily:"'Press Start 2P',monospace",fontSize:"7px",padding:"6px 10px",
                background:on?s.color:"#f0ede8",color:on?"white":"#111",
                border:`2px solid ${on?s.color:"#111"}`,letterSpacing:"0.5px",
                cursor:"none",boxShadow:on?`2px 2px 0 ${s.color}`:"2px 2px 0 #111",
                transition:"background 0.2s, color 0.2s, border-color 0.2s",
              }}>{s.label}</motion.button>);
            })}
          </div>
          <p style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"6px",color:"#999",letterSpacing:"0.5px",marginBottom:"16px" }}>
            {activeSkill ? `✦ showing ${SKILLS.find(s=>s.id===activeSkill)?.label} work — click again to reset` : "↑ click a skill to filter my work ↑"}
          </p>
          <p style={{ fontFamily:"'Space Mono',monospace",fontSize:"12px",color:"#444",lineHeight:"1.9" }}>Passionate about building things that are as meaningful as they are beautiful — from 2D characters to real product experiences.</p>

          {/* Contact Links */}
          <div style={{ display:"flex",gap:"10px",marginTop:"20px",flexWrap:"wrap" as const }}>
            <motion.a whileHover={{ scale:1.08,y:-2 }} whileTap={{ scale:0.95 }} href="https://drive.google.com/file/d/1vITK6FYd9sgjFQbRwKmbbIa1Tky-Sq-3/view?usp=sharing" target="_blank" rel="noopener noreferrer" style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"7px",padding:"8px 12px",background:"#111",color:"white",border:"2px solid #111",boxShadow:"2px 2px 0 #111",textDecoration:"none",cursor:"none",letterSpacing:"0.5px",display:"flex",alignItems:"center",gap:6 }}>
              <span style={{ fontSize:"10px" }}>📄</span> RESUME
            </motion.a>
            <motion.a whileHover={{ scale:1.08,y:-2 }} whileTap={{ scale:0.95 }} href="mailto:tiffanyyin2@gmail.com" style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"7px",padding:"8px 12px",background:accent,color:"white",border:"2px solid #111",boxShadow:"2px 2px 0 #111",textDecoration:"none",cursor:"none",letterSpacing:"0.5px",display:"flex",alignItems:"center",gap:6,transition:"background 0.3s" }}>
              <span style={{ fontSize:"10px" }}>✉️</span> EMAIL
            </motion.a>
            <motion.a whileHover={{ scale:1.08,y:-2 }} whileTap={{ scale:0.95 }} href="https://linkedin.com/in/tiffany-yin-0b4197138/" target="_blank" rel="noopener noreferrer" style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"7px",padding:"8px 12px",background:"white",color:"#111",border:"2px solid #111",boxShadow:"2px 2px 0 #111",textDecoration:"none",cursor:"none",letterSpacing:"0.5px",display:"flex",alignItems:"center",gap:6 }}>
              <span style={{ fontSize:"10px" }}>💼</span> LINKEDIN
            </motion.a>
          </div>
        </div>
        <div className="hero-right">
          <p style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"7px",color:accent,marginBottom:"14px",letterSpacing:"1px",textAlign:"center" as const,transition:"color 0.3s" }}>✦ DRESS ME UP ✦</p>
          <DressUpWidget accent={accent}/>
          <p style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"6px",color:"#555",marginTop:"10px",letterSpacing:"0.5px",textAlign:"center" as const }}>click tabs to customize !</p>
        </div>
      </div>

      <div className="checkerboard-accent"/>

      {/* PROJECTS — reordered */}
      <section id="projects" style={{ background:"#f0ede8",padding:"36px 0" }}>
        <div className="section-wrap" style={{ paddingTop:0,paddingBottom:0 }}>
          <FadeUp>
            <div className="section-header">
              <span style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"10px",color:accent,background:"#111",padding:"6px 10px",letterSpacing:"1px",transition:"color 0.3s" }}>01</span>
              <h2 style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(14px,2.5vw,22px)",color:"#111",letterSpacing:"1px" }}>HACKATHON PROJECTS</h2>
              <div className="section-line"/>
            </div>
          </FadeUp>
          {projects.map((p,i) => <FadeUp key={`${activeSkill}-${p.id}`} delay={i * 0.15}><ProjectCard id={p.id} activeSkill={activeSkill} accent={accent}/></FadeUp>)}
        </div>
      </section>

      <div className="checkerboard-accent"/>

      {/* MARKETING & DESIGN */}
      <section id="marketing" className="section-bg-dark">
        <div className="section-wrap">
          <FadeUp>
            <div className="section-header">
              <span style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"10px",color:"white",background:accent,padding:"6px 10px",letterSpacing:"1px",transition:"background 0.3s" }}>02</span>
              <h2 style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(14px,2.5vw,22px)",color:"#f0ede8",letterSpacing:"1px" }}>MARKETING & DESIGN</h2>
              <div style={{ flex:1,height:"3px",background:"repeating-linear-gradient(90deg,#f0ede8 0px,#f0ede8 8px,transparent 8px,transparent 14px)" }}/>
            </div>
          </FadeUp>
          {/* TIDAL + Soothe cards */}
          {marketingCards.map(a => <FadeUp key={`${activeSkill}-${a.id}`}><ArtCard id={a.id} activeSkill={activeSkill} accent={accent}/></FadeUp>)}
          {/* Social handles */}
          <div style={{ marginTop:"24px" }}>
            <StaggerContainer className="social-grid" stagger={0.15}>
              {socialCards.map(s => <StaggerItem key={`${activeSkill}-${s.id}`}><SocialCard id={s.id} activeSkill={activeSkill} accent={accent}/></StaggerItem>)}
            </StaggerContainer>
          </div>
        </div>
      </section>

      <div className="checkerboard-accent"/>

      {/* CREATIVE WORK */}
      <section id="creative" style={{ background:"#f0ede8",padding:"36px 0" }}>
        <div className="section-wrap" style={{ paddingTop:0,paddingBottom:0 }}>
          <FadeUp>
            <div className="section-header">
              <span style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"10px",color:accent,background:"#111",padding:"6px 10px",letterSpacing:"1px",transition:"color 0.3s" }}>03</span>
              <h2 style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(14px,2.5vw,22px)",color:"#111",letterSpacing:"1px" }}>CREATIVE WORK</h2>
              <div className="section-line"/>
            </div>
          </FadeUp>
          {/* Apple Collapse - featured */}
          <FadeUp><ArtCard id="apple-collapse" activeSkill={activeSkill} accent={accent}/></FadeUp>
          {/* Art grid - char art, pixel portraits, pixel art */}
          <div style={{ marginTop:"16px" }}>
          <StaggerContainer className="art-showcase" stagger={0.12}>
            {creativeItems.filter(i => i.id !== "apple-collapse").map(a => <StaggerItem key={`${activeSkill}-${a.id}`}><ArtCard id={a.id} activeSkill={activeSkill} accent={accent}/></StaggerItem>)}
          </StaggerContainer>
          </div>
        </div>
      </section>

      <div className="checkerboard-accent"/>

      {/* PRODUCT LAB */}
      <section id="lab" className="section-bg-dark">
        <div className="section-wrap">
          <FadeUp>
            <div className="section-header">
              <span style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"10px",color:"white",background:accent,padding:"6px 10px",letterSpacing:"1px",transition:"background 0.3s" }}>04</span>
              <h2 style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"clamp(14px,2.5vw,22px)",color:"#f0ede8",letterSpacing:"1px" }}>PRODUCT LAB</h2>
              <div style={{ flex:1,height:"3px",background:"repeating-linear-gradient(90deg,#f0ede8 0px,#f0ede8 8px,transparent 8px,transparent 14px)" }}/>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="pixel-border" style={{ background:"white",overflow:"hidden" }}>
              <div style={{ background:`linear-gradient(90deg,${accent} 0%,${accent}99 100%)`,color:"white",fontFamily:"'Press Start 2P',monospace",fontSize:"9px",padding:"6px 10px",display:"flex",justifyContent:"space-between",alignItems:"center",letterSpacing:"0.5px",transition:"background 0.3s" }}>
                <span>product_case_study.exe — IN PROGRESS</span>
                <div><span className="win-btn">_</span><span className="win-btn">□</span><span className="win-btn">✕</span></div>
              </div>

              <div className="lab-grid" style={{ padding:"36px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"36px",overflow:"hidden" }}>
                {/* Left - concept info */}
                <div>
                  <div style={{ display:"inline-block",background:"#111",color:accent,fontFamily:"'Press Start 2P',monospace",fontSize:"7px",padding:"6px 10px",marginBottom:"20px",letterSpacing:"0.5px",transition:"color 0.3s" }}>🧪 CASE STUDY</div>

                  <h3 style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"18px",color:"#111",marginBottom:"16px",letterSpacing:"1px",lineHeight:1.6 }}>MOCHI BUNNY</h3>

                  <p style={{ fontFamily:"'Space Mono',monospace",fontSize:"13px",color:"#444",lineHeight:1.9,marginBottom:"20px" }}>
                    A pixel art sticker pack featuring an expressive bunny character with a pink bow — 8 stickers covering every mood from sleepy to furious. Built for LINE Creators Market, KakaoTalk, and digital sticker platforms.
                  </p>

                  <div style={{ fontFamily:"'Space Mono',monospace",fontSize:"11px",color:"#666",lineHeight:1.9,marginBottom:"24px" }}>
                    <p style={{ marginBottom:"12px" }}>From market opportunity to product strategy — a full PM case study covering:</p>
                    <div className="lab-tags" style={{ display:"flex",flexWrap:"wrap" as const,gap:"6px" }}>
                      {["MARKET RESEARCH","USER PERSONAS","PRODUCT STRATEGY","PRICING MODEL","DESIGN SYSTEM","GO-TO-MARKET","SUCCESS METRICS"].map(t=>(
                        <span key={t} style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"6px",padding:"4px 8px",background:"#f0ede8",border:"2px solid #111",letterSpacing:"0.3px" }}>{t}</span>
                      ))}
                    </div>
                  </div>

                  <a href="/case-study" className="pixel-link" style={{ fontSize:"8px",padding:"10px 16px" }}
                    onMouseEnter={e=>{(e.target as HTMLElement).style.background=accent;(e.target as HTMLElement).style.color="white"}}
                    onMouseLeave={e=>{(e.target as HTMLElement).style.background="white";(e.target as HTMLElement).style.color="#111"}}
                  >READ FULL CASE STUDY →</a>
                </div>

                {/* Right - sticker preview grid */}
                <div style={{ display:"flex",flexDirection:"column" as const,gap:"8px",justifyContent:"center",alignItems:"center",width:"100%" }}>
                  <motion.p className="lab-sticker-hint"
                    animate={{ opacity:[0.5,1,0.5] }}
                    transition={{ repeat:Infinity,duration:2,ease:"easeInOut" }}
                    style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"6px",color:accent,textAlign:"center" as const,letterSpacing:"0.5px",transition:"color 0.3s" }}
                  >✦ click to copy & paste in ur texts! ✦</motion.p>
                  <div className="sticker-mobile-grid sticker-desktop-grid">
                  {[
                    { src:"/sticker-love.gif", label:"love", bg:"#f0ede8" },
                    { src:"/sticker-mad.png", label:"mad", bg:"#f0ede8" },
                    { src:"/sticker-sleep.png", label:"sleep", bg:"#f0ede8" },
                    { src:"/sticker-huh.png", label:"huh?", bg:"#f0ede8" },
                    { src:"/sticker-cry.png", label:"cry", bg:"#f0ede8" },
                    { src:"/sticker-ahh.png", label:"ahh!", bg:"#f0ede8" },
                    { src:"/sticker-loading.png", label:"loading", bg:"#f0ede8" },
                    { src:"/sticker-what.png", label:"what", bg:"#f0ede8" },
                  ].map((s,i)=>(
                    <StickerCell key={i} src={s.src} label={s.label} bg={s.bg} index={i} accent={accent}/>
                  ))}
                </div>
                </div>
              </div>

              {/* Bottom status bar */}
              <div className="lab-status" style={{ background:"#d4d0c8",borderTop:"2px solid #999",padding:"6px 12px",display:"flex",justifyContent:"space-between",fontFamily:"'Press Start 2P',monospace",fontSize:"5px",color:"#666" }}>
                <span>platforms: iMessage / LINE / KakaoTalk</span>
                <span style={{ color:accent,transition:"color 0.3s" }}>product thinking meets art</span>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      <FadeUp>
        <footer style={{ background:"#111",color:"white",padding:"28px 40px",textAlign:"center" as const,borderTop:`3px solid ${accent}`,transition:"border-color 0.3s" }}>
          <p style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"14px",color:accent,marginBottom:"12px",letterSpacing:"2px",transition:"color 0.3s" }}>TIFFANY YIN</p>
          <p style={{ fontFamily:"'Space Mono',monospace",fontSize:"11px",color:"#888",letterSpacing:"2px" }}>TEXAS A&M ✦ MARKETING & ANALYTICS ✦ CLASS OF 2027</p>
          <p style={{ fontFamily:"'Press Start 2P',monospace",fontSize:"8px",color:accent,marginTop:"20px",transition:"color 0.3s" }}>✦ made with love & too many late nights ✦</p>
        </footer>
      </FadeUp>
    </motion.main>
  );
}
