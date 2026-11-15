"use client";

/* Scrolling sections under the pixel home.
   One section per room, in the same order and colors as the rooms.
   - Scrolling into a section quietly switches the room above to match.
   - "walk to it in the room ↑" scrolls back up and has Tif open that item.
   - Room cards have a "FULL PROJECT ↓" button that jumps down here.
   Every card has the same framed media slot on top:
   - projects with pictures show a bento (one big image + two small, "+N" for the rest);
     clicking any of them opens the lightbox with every image
   - projects without pictures show their headline stat in that slot instead
   - the sticker pack shows all 8 stickers; tap one to copy it
   Rooms with an odd number of projects show the first one as a wide feature card,
   so every row is full.
   Needs framer-motion (already in your project). */

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, MotionConfig, useInView, useScroll, useSpring } from "framer-motion";
import "./portfolio-sections.css";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { ROOMS, ORDER, ITEMS } from "./content";

type RoomId = "ux" | "mkt" | "pm";
type Theme = { bg: string; paper: string; ink: string; accent: string; accent2: string; soft: string; shadow: string };
type Item = {
  key: string; obj: string; label: string; file: string; kicker: string; title: string; notif?: string;
  stats?: string[]; blurb: string; bullets?: string[]; imgs?: string[]; labels?: string[];
  imgLinks?: Record<string, string>; coverLink?: { href: string; label: string };
  grid?: boolean; links?: { label: string; href: string }[]; comingSoon?: boolean;
};
type Shot = { room: RoomId; title: string; file: string; imgs: string[]; i: number };

const ease = [0.2, 0.8, 0.2, 1] as const;
const vars = (t: Theme) =>
  ({ "--ps-bg": t.bg, "--ps-paper": t.paper, "--ps-ink": t.ink, "--ps-accent": t.accent, "--ps-accent2": t.accent2, "--ps-soft": t.soft, "--ps-shadow": t.shadow } as CSSProperties);
const itemsFor = (room: RoomId): Item[] =>
  Object.keys(ITEMS).filter((k) => k.startsWith(room + ".")).map((k) => ({ key: k, obj: k.split(".")[1], ...ITEMS[k] }));

function goto(room: RoomId, obj?: string) {
  const home = document.getElementById("home");
  home?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  window.setTimeout(() => window.dispatchEvent(new CustomEvent("pixelhome:goto", { detail: { room, obj } })), 450);
}

export default function PortfolioSections({ showMissing = false }: { showMissing?: boolean }) {
  const [active, setActive] = useState<RoomId>(ORDER[0] as RoomId);
  const [shot, setShot] = useState<Shot | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: rootRef, offset: ["start end", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  return (
    <MotionConfig reducedMotion="user">
      <div ref={rootRef} className="ps-root" data-room={active} style={vars(ROOMS[active].theme)}>
        <motion.div className="ps-progress" style={{ scaleX: progress }} aria-hidden="true" />

        <nav className="ps-nav" aria-label="Portfolio sections">
          {ORDER.map((id: RoomId) => (
            <a key={id} href={`#work-${id}`} className="ps-nav-a" aria-current={active === id ? "true" : undefined}
              onClick={(e) => { e.preventDefault(); document.getElementById(`work-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>
              {active === id && <motion.span layoutId="ps-pill" className="ps-pill" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="ps-nav-t"><span aria-hidden="true">{ROOMS[id].icon}</span> {ROOMS[id].tab}</span>
            </a>
          ))}
        </nav>

        {ORDER.map((id: RoomId, i: number) => (
          <RoomSection key={id} id={id} index={i} onActive={setActive} onOpen={setShot} showMissing={showMissing} />
        ))}

        <AnimatePresence>{shot && <Lightbox key="lb" shot={shot} setShot={setShot} />}</AnimatePresence>
      </div>
    </MotionConfig>
  );
}

function RoomSection({ id, index, onActive, onOpen, showMissing }:
  { id: RoomId; index: number; onActive: (r: RoomId) => void; onOpen: (s: Shot) => void; showMissing: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });
  const room = ROOMS[id];
  const items = itemsFor(id);
  const featureFirst = items.length % 2 === 1;

  useEffect(() => {
    if (!inView) return;
    onActive(id);
    window.dispatchEvent(new CustomEvent("pixelhome:goto", { detail: { room: id, quiet: true } }));
  }, [inView, id, onActive]);

  return (
    <section ref={ref} id={`work-${id}`} className="ps-sec" data-room={id} style={vars(room.theme)} aria-labelledby={`ps-h-${id}`}>
      <div className="ps-inner">
        <motion.header className="ps-head" initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.55, ease }}>
          <p className="ps-eyebrow">ROOM {index + 1} / {ORDER.length}</p>
          <h2 id={`ps-h-${id}`}><span className="ps-icon" aria-hidden="true">{room.icon}</span>{room.title}</h2>
          <motion.span className="ps-rule" aria-hidden="true" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15, ease }} />
          <p className="ps-intro">{room.intro}</p>
          <button className="ps-back" onClick={() => goto(id)}>↑ walk around this room</button>
        </motion.header>

        <div className="ps-grid">
          {items.map((it, i) => (
            <Card key={it.key} room={id} it={it} i={i} featured={featureFirst && i === 0} onOpen={onOpen} showMissing={showMissing} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Card({ room, it, i, featured, onOpen, showMissing }:
  { room: RoomId; it: Item; i: number; featured: boolean; onOpen: (s: Shot) => void; showMissing: boolean }) {
  // images that fail to load drop out, so a missing file never leaves an empty tile
  const [bad, setBad] = useState<string[]>([]);
  const markBad = useCallback((src: string) => setBad((b) => (b.includes(src) ? b : [...b, src])), []);
  const imgs = (it.imgs || []).filter((s) => !bad.includes(s));
  const isStickers = !!it.grid;
  const stats = it.stats || [];
  const statCover = !isStickers && !imgs.length;
  const chips = statCover ? stats.slice(1) : stats;

  return (
    <motion.article id={`work-${room}-${it.obj}`} className={`ps-card${featured ? " is-featured" : ""}`}
      initial={{ opacity: 0, y: 36, scale: 0.98 }} whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, delay: (i % 2) * 0.08, ease }}
      whileHover={{ y: -4 }}>
      <div className="ps-bar"><span className="ps-file">{it.file}</span><span className="ps-btns" aria-hidden="true"><i>_</i><i>□</i><i>✕</i></span></div>
      <div className="ps-card-in">
        <div className={`ps-media${statCover ? " is-stat" : ""}`}>
          {isStickers ? (
            <Stickers it={it} showMissing={showMissing} />
          ) : imgs.length ? (
            <Bento imgs={imgs} title={it.title} links={it.imgLinks} onBad={markBad} showMissing={showMissing}
              onPick={(k) => onOpen({ room, title: it.title, file: it.file, imgs, i: k })} />
          ) : (
            <StatCover room={room} it={it} stat={stats[0]} />
          )}
        </div>
        <div className="ps-body">
          <p className="ps-kicker">{it.kicker}</p>
          <h3>{it.title}</h3>
          {!!chips.length && (
            <div className="ps-stats">{chips.map((s, k) => (
              <motion.span key={s} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: 0.15 + k * 0.07, duration: 0.35, ease }}>{s}</motion.span>
            ))}</div>
          )}
          <p className="ps-blurb">{it.blurb}</p>
          {!!it.bullets?.length && <ul>{it.bullets.map((b) => <li key={b}>{b}</li>)}</ul>}
          <div className="ps-links">
            {(it.links || []).map((l) => <a key={l.href} className="ps-btn" href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>)}
            <button className="ps-btn ps-btn-ghost" onClick={() => goto(room, it.obj)}>walk to it in the room ↑</button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function Img({ src, alt, showMissing, onBad }: { src: string; alt: string; showMissing: boolean; onBad?: (s: string) => void }) {
  const [bad, setBad] = useState(false);
  if (bad) return showMissing ? <span className="ps-missing">{src}</span> : null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" decoding="async" draggable={false}
    onError={() => { setBad(true); onBad?.(src); }} />;
}

/* One big image + up to two small ones; the last small one says "+N" when there are more.
   A tile whose image is in `links` (a site screenshot) opens that site instead of the viewer. */
function Bento({ imgs, title, links, onPick, onBad, showMissing }:
  { imgs: string[]; title: string; links?: Record<string, string>; onPick: (k: number) => void; onBad: (s: string) => void; showMissing: boolean }) {
  const shown = imgs.slice(0, 3);
  const more = imgs.length - 3;
  return (
    <div className={`ps-bento n${shown.length}`}>
      {shown.map((src, k) => {
        const main = k === 0;
        const href = links?.[src];
        const cls = `ps-tile${main ? " is-main" : ""}${href ? " is-link" : ""}`;
        const inner = (
          <>
            <Img key={src} src={src} alt={main ? `${title}, image 1` : ""} onBad={onBad} showMissing={showMissing} />
            {href ? (
              <span className="ps-visit" aria-hidden="true">VISIT SITE ↗</span>
            ) : main ? (
              <span className="ps-zoom" aria-hidden="true">⤢</span>
            ) : null}
            {!main && k === shown.length - 1 && more > 0 && <span className="ps-more">+{more}</span>}
          </>
        );
        return href ? (
          <a key={src} className={cls} href={href} target="_blank" rel="noopener noreferrer"
            aria-label={`Visit the live ${title} site (opens in a new tab)`}>{inner}</a>
        ) : (
          <button type="button" key={src} className={cls} onClick={() => onPick(k)}
            aria-label={main && imgs.length > 1 ? `Open ${title} gallery, ${imgs.length} images` : `Open image ${k + 1} of ${imgs.length}`}>
            {inner}
          </button>
        );
      })}
    </div>
  );
}

/* A sleepy little pixel critter for projects with nothing to show yet. */
function SleepyArt() {
  return (
    <svg className="ps-cs-art" viewBox="0 0 32 32" shapeRendering="crispEdges" aria-hidden="true">
      <g fill="var(--ps-accent)">
        <rect x="9" y="10" width="14" height="2" /><rect x="7" y="12" width="18" height="2" />
        <rect x="5" y="14" width="22" height="10" /><rect x="7" y="24" width="18" height="2" />
        <rect x="9" y="26" width="14" height="2" />
      </g>
      <rect x="9" y="16" width="4" height="3" fill="var(--ps-ink)" />
      <rect x="19" y="16" width="4" height="3" fill="var(--ps-ink)" />
      <rect x="13" y="20" width="6" height="2" fill="var(--ps-ink)" />
      <g className="ps-cs-zzz" fill="var(--ps-ink)">
        <rect x="23" y="4" width="5" height="2" /><rect x="26" y="6" width="2" height="2" />
        <rect x="24" y="8" width="2" height="2" /><rect x="23" y="10" width="5" height="2" />
      </g>
    </svg>
  );
}

/* For projects without pictures: the headline number gets the frame.
   With coverLink set, the whole panel opens that link (e.g. a live prototype).
   With comingSoon set, there's nothing to show yet, so a cute sleepy graphic
   stands in instead of a stat. */
function StatCover({ room, it, stat }: { room: RoomId; it: Item; stat?: string }) {
  if (it.comingSoon) {
    return (
      <div className="ps-statcover ps-comingsoon">
        <SleepyArt />
        <span className="ps-cs-badge">COMING SOON</span>
        <p className="ps-sc-file">{it.file}</p>
      </div>
    );
  }
  const inner = (
    <>
      {it.notif ? (
        <div className="ps-notif"><b>BeReal.</b> {it.notif}</div>
      ) : (
        <span className="ps-sc-icon" aria-hidden="true">{ROOMS[room].icon}</span>
      )}
      {stat && <p className="ps-sc-stat">{stat}</p>}
      <p className="ps-sc-file">{it.file}</p>
      {it.coverLink && <span className="ps-visit" aria-hidden="true">{it.coverLink.label}</span>}
    </>
  );
  return it.coverLink ? (
    <a className="ps-statcover is-link" href={it.coverLink.href} target="_blank" rel="noopener noreferrer"
      aria-label={`${it.coverLink.label.replace(/[↗→]/g, "").trim()}: ${it.title} (opens in a new tab)`}>{inner}</a>
  ) : (
    <div className="ps-statcover">{inner}</div>
  );
}

function Lightbox({ shot, setShot }: { shot: Shot; setShot: (s: Shot | null) => void }) {
  const { imgs, i, title, file, room } = shot;
  const n = imgs.length;
  const closeRef = useRef<HTMLButtonElement>(null);
  const go = useCallback((d: number) => setShot({ ...shot, i: (i + d + n) % n }), [shot, i, n, setShot]);

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });
    return () => { document.body.style.overflow = prevOverflow; prevFocus?.focus?.({ preventScroll: true }); };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShot(null);
      else if (e.key === "ArrowRight" && n > 1) go(1);
      else if (e.key === "ArrowLeft" && n > 1) go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, n, setShot]);

  return (
    <motion.div className="ps-lb" style={vars(ROOMS[room].theme)} role="dialog" aria-modal="true" aria-label={`${title} images`}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
      onClick={(e) => { if (e.target === e.currentTarget) setShot(null); }}>
      <motion.div className="ps-lb-win" initial={{ scale: 0.96, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97, y: 8 }}
        transition={{ duration: 0.22, ease }}>
        <div className="ps-bar">
          <span className="ps-file">{file}</span>
          {n > 1 && <span className="ps-lb-count">{i + 1} / {n}</span>}
          <button ref={closeRef} className="ps-lb-x" onClick={() => setShot(null)} aria-label="Close">✕</button>
        </div>
        <div className="ps-lb-stage">
          <AnimatePresence mode="wait" initial={false}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img key={imgs[i]} src={imgs[i]} alt={`${title}, image ${i + 1} of ${n}`}
              initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.16 }} />
          </AnimatePresence>
          {n > 1 && (
            <>
              <button className="ps-lb-nav is-prev" onClick={() => go(-1)} aria-label="Previous image">◂</button>
              <button className="ps-lb-nav is-next" onClick={() => go(1)} aria-label="Next image">▸</button>
            </>
          )}
        </div>
        {n > 1 && (
          <div className="ps-lb-strip" role="group" aria-label="All images">
            {imgs.map((src, k) => (
              <button key={src} className="ps-lb-thumb" aria-current={k === i ? "true" : undefined}
                aria-label={`Image ${k + 1}`} onClick={() => setShot({ ...shot, i: k })}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* Normalizes any image (png/gif/webp) to a PNG blob so the clipboard
   accepts it — Chrome's async Clipboard API only writes image/png. */
async function toPngBlob(src: string): Promise<Blob> {
  const res = await fetch(src);
  const raw = await res.blob();
  if (raw.type === "image/png") return raw;
  const bitmap = await createImageBitmap(raw);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0);
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png")
  );
}

function Stickers({ it, showMissing }: { it: Item; showMissing: boolean }) {
  const [copied, setCopied] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleCopy(src: string) {
    try {
      const blob = await toPngBlob(src);
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setFailed(null);
      setCopied(src);
    } catch {
      setCopied(null);
      setFailed(src);
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { setCopied(null); setFailed(null); }, 1400);
  }

  return (
    <div className="ps-stickers-frame">
      <motion.div className="ps-stickers" initial="hide" whileInView="show" viewport={{ once: true, margin: "-40px" }}
        variants={{ show: { transition: { staggerChildren: 0.05 } } }}>
        {(it.imgs || []).map((src, k) => {
          const label = it.labels?.[k] || "sticker";
          return (
            <motion.button key={src} type="button" className="ps-sticker" onClick={() => handleCopy(src)}
              aria-label={`Copy the ${label} sticker`} title={label}
              variants={{ hide: { opacity: 0, scale: 0.6, rotate: -8 }, show: { opacity: 1, scale: 1, rotate: 0, transition: { type: "spring", stiffness: 380, damping: 18 } } }}
              whileHover={{ scale: 1.12, rotate: k % 2 ? -6 : 6 }} whileTap={{ scale: 0.88 }}>
              <Img src={src} alt={`Mochi Bunny, ${label}`} showMissing={showMissing} />
              <span className="ps-sticker-l">{label}</span>
              {copied === src && (
                <motion.span className="ps-copied-badge" initial={{ opacity: 0, y: 4, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
                  copied!
                </motion.span>
              )}
              {failed === src && (
                <motion.span className="ps-copied-badge ps-copied-badge--err" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                  long-press to save
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </motion.div>
      <span className="ps-copy-hint" aria-hidden="true">tap a sticker to copy it</span>
    </div>
  );
}
