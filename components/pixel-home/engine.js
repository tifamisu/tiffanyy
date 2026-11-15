/* ─────────────────────────────────────────────────────────────
   PIXEL HOME — engine
   mountPixelHome(rootEl, options) → cleanup()
   options:
     music        true  → built-in lofi synth for the record player
                  false → no synth; listen for "pixelhome:music" and
                          drive your existing music player instead
     syncHash     true  → #uiux / #marketing / #pm deep links
     onRoomChange (id, theme) => void   (e.g. set your site accent)
   Events on window:
     "pixelhome:room"  detail { id, accent, theme }
     "pixelhome:music" detail { playing }
   ───────────────────────────────────────────────────────────── */
import { PROFILE, ORDER, ROOMS, ITEMS } from "./content.js";

export function mountPixelHome(root, opts = {}) {
  const W = 256, H = 160, FLOOR = 88;
  const MIN_X = 8, MAX_X = 248, MIN_Y = 98, MAX_Y = 154;
  const SPEED = 74;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = matchMedia("(hover: none)").matches;
  const syncHash = opts.syncHash !== false;
  const internalMusic = opts.music !== false;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ═════════════════════ DOM ═════════════════════ */
  root.classList.add("ph-root");
  root.innerHTML = `
  <div class="ph-device">
    <header class="ph-top">
      <div class="ph-id">
        <p class="ph-hello">hi, i'm</p>
        <h1 class="ph-name">${esc(PROFILE.name)}</h1>
        <p class="ph-tag">${esc(PROFILE.tagline)}</p>
      </div>
      <div class="ph-news">
        ${PROFILE.news.map((n, i) => `<button class="ph-chip" data-news="${i}"><b>${esc(n.tag)}</b><span>${esc(n.text)}</span></button>`).join("")}
        <a class="ph-btn" href="${esc(PROFILE.resume)}" target="_blank" rel="noopener noreferrer">RESUME ↗</a>
      </div>
    </header>
    <div class="ph-tabs" role="tablist" aria-label="Choose a room">
      ${ORDER.map((id, i) => `<button role="tab" class="ph-tab" data-room="${id}" aria-selected="false" style="--tab:${ROOMS[id].theme.accent}"><span class="ph-tab-n">${i + 1}</span><span class="ph-tab-i" aria-hidden="true">${ROOMS[id].icon}</span><span>${esc(ROOMS[id].tab)}</span></button>`).join("")}
    </div>
    <div class="ph-stage">
      <canvas class="ph-canvas" width="${W}" height="${H}" tabindex="0"></canvas>
      <div class="ph-roomtag" aria-hidden="true"></div>
      ${internalMusic ? `<button class="ph-music" aria-pressed="false" aria-label="Toggle music">♪ <span>OFF</span></button>` : ""}
      <div class="ph-tip" hidden></div>
      <button class="ph-prompt" hidden></button>
      <div class="ph-say" hidden><span class="ph-say-name">TIF</span><p></p></div>
      <div class="ph-menu" hidden>
        <div class="ph-cd" role="group" aria-labelledby="ph-cd-title">
          <div class="ph-cd-bar"><span id="ph-cd-title">Room Player</span><span class="ph-cd-btns" aria-hidden="true"><i>_</i><i>□</i><i>✕</i></span></div>
          <div class="ph-cd-menu" aria-hidden="true"><span><u>R</u>oom</span><span><u>V</u>iew</span><span><u>O</u>ptions</span><span><u>H</u>elp</span></div>
          <div class="ph-cd-body">
            <canvas class="ph-cd-pet" width="17" height="16" aria-hidden="true"></canvas>
            ${ORDER.map((id, i) => `<button class="ph-cd-opt" data-pick="${id}" data-i="${i}" aria-label="Start in the ${esc(ROOMS[id].title.toLowerCase())}"><canvas class="ph-cd-cv" width="40" height="48" data-cd="${id}" aria-hidden="true"></canvas><span class="ph-cd-btn">${esc(ROOMS[id].tab.toLowerCase())}</span></button>`).join("")}
          </div>
          <div class="ph-cd-status"><span class="ph-cd-room"></span><span class="ph-cd-count"></span></div>
        </div>
      </div>
      <div class="ph-modal" hidden>
        <div class="ph-win" role="dialog" aria-modal="true" aria-labelledby="ph-card-title"></div>
      </div>
    </div>
    <div class="ph-dock">
      <span class="ph-dock-l">IN THIS ROOM</span>
      <div class="ph-dock-items"></div>
    </div>
    <p class="ph-hint">${coarse ? "tap anywhere to walk · tap things to open them" : "←↑↓→ / WASD walk · click to walk there · E or ENTER to open · 1 2 3 switch rooms"}</p>
    <p class="ph-sr" aria-live="polite"></p>
  </div>`;
  const $ = (s) => root.querySelector(s);
  const cv = $(".ph-canvas");
  const ctx = cv.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  const tipEl = $(".ph-tip"), promptEl = $(".ph-prompt"), sayEl = $(".ph-say");
  const modal = $(".ph-modal"), win = $(".ph-win"), dockItems = $(".ph-dock-items");
  const tagEl = $(".ph-roomtag"), srEl = $(".ph-sr"), musicBtn = $(".ph-music");
  const menuEl = $(".ph-menu"), cdRoom = $(".ph-cd-room"), cdCount = $(".ph-cd-count");

  /* ═════════════════════ draw helpers ═════════════════════ */
  let C = ctx;
  const R = (x, y, w, h, c) => { C.fillStyle = c; C.fillRect(Math.round(x), Math.round(y), w, h); };
  const P = (x, y, c) => R(x, y, 1, 1, c);
  const circ = (cx, cy, r, c) => {
    cx = Math.round(cx); cy = Math.round(cy);
    const n = Math.floor(r);
    for (let dy = -n; dy <= n; dy++) { const w = Math.floor(Math.sqrt(r * r - dy * dy) + 0.25); R(cx - w, cy + dy, 2 * w + 1, 1, c); }
  };
  const ring = (cx, cy, r, c) => {
    for (let a = 0; a < Math.PI * 2; a += 0.12) P(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), c);
  };
  const line = (x0, y0, x1, y1, c, t = 1) => {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let e = dx + dy;
    for (;;) { R(x0, y0, t, t, c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
  };
  const spr = (rows, x, y, pal, flip = false) => {
    const w = rows[0].length;
    for (let j = 0; j < rows.length; j++) for (let i = 0; i < w; i++) {
      const ch = rows[j][i]; if (ch === "." || !pal[ch]) continue;
      P(x + (flip ? w - 1 - i : i), y + j, pal[ch]);
    }
  };
  const sprOutline = (rows, x, y, pal, oc) => {
    const all = {}; for (const k in pal) all[k] = oc;
    spr(rows, x - 1, y, all); spr(rows, x + 1, y, all); spr(rows, x, y - 1, all); spr(rows, x, y + 1, all);
    spr(rows, x, y, pal);
  };
  const FONT = {
    A: "010101111101101", B: "110101110101110", C: "011100100100011", D: "110101101101110", E: "111100110100111",
    F: "111100110100100", G: "011100101101011", H: "101101111101101", I: "111010010010111", J: "001001001101010",
    K: "101101110101101", L: "100100100100111", M: "101111111101101", N: "110101101101101", O: "010101101101010",
    P: "110101110100100", Q: "010101101110011", R: "110101110101101", S: "011100010001110", T: "111010010010010",
    U: "101101101101111", V: "101101101101010", W: "101101111111101", X: "101101010101101", Y: "101101010010010",
    Z: "111001010100111", 0: "111101101101111", 1: "010110010010111", 2: "110001010100111", 3: "110001010001110",
    4: "101101111001001", 5: "111100110001110", 6: "011100111101111", 7: "111001010010010", 8: "111101111101111",
    9: "111101111001110", "!": "010010010000010", "/": "001001010100100", "+": "000010111010000", "-": "000000111000000",
    ".": "000000000000010", "?": "110001010000010", ":": "000010000010000", " ": "000000000000000",
  };
  const text = (s, x, y, c) => {
    for (const ch of s.toUpperCase()) { const g = FONT[ch] || FONT[" "]; for (let k = 0; k < 15; k++) if (g[k] === "1") P(x + (k % 3), y + ((k / 3) | 0), c); x += 4; }
  };
  const SP = {
    heart: ["##.##", "#####", ".###.", "..#.."],
    heartL: [".##.##.", "#######", "#######", ".#####.", "..###..", "...#..."],
    spark: ["..#..", "..#..", "##.##", "..#..", "..#.."],
    note: ["..###", "..#.#", "..#..", "..#..", "###..", ".##.."],
    star: ["..#..", ".###.", "#####", ".#.#.", "#...#"],
    plane: ["...b...", "..bbb..", "bbbbbbb", "...b...", "..bbb.."],
    apple: ["...g...", "..g....", ".rrwrr.", "rrrwrrr", "rrrrrrr", ".rrrrr.", "..r.r.."],
    penguin: [
      "....kkkk....", "..kkkkkkkk..", ".kkkkkkkkkk.", ".kkwwkkwwkk.", "kkwkwwwwkwkk", "kkwwwoowwwkk",
      "kkpwwwwwwpkk", ".kkwwwwwwkk.", "kkkwwwwwwkkk", "kk.wwwwwwkkk", "...wwwwww...", "...kwwwwk...", "...oo..oo...",
    ],
    bunny: [
      "...ww....ww...", "..wpw....wpw..", "..wpw....wpw..", "..wpw....wpw..", "..www....www..",
      ".wwwwwwwwwwww.", "wwwwwwwwwwwwww", "wwkwwwwwwwwkww", "wwkwwwwwwwwkww", "wbbwwwmmwwwbbw",
      "wwwwwwwwwwwwww", ".wwwwwwwwwwww.", "..wwwwwwwwww..",
    ],
    cursor: ["k.....", "kk....", "kwk...", "kwwk..", "kwwwk.", "kwwkk.", "kkk...", ],
  };

  /* plushie + pet pixel art (Tiffany's designs, redrawn in pixels) */
  const fix = (rows, w) => rows.map((r) => (r + ".".repeat(w)).slice(0, w));
  const PLUSH = {
    deer: {
      oc: "#7b5848",
      pal: { a: "#5e3a2c", p: "#f3b0bd", b: "#e6c6a6", s: "#fff3df", c: "#fbe9d6", e: "#4a2a20", h: "#ffffff", r: "#f4a3ab", n: "#a8806a", w: "#fffaf4", k: "#5b3a2e", g: "#f6b6d6", t: "#d9b08c", d: "#c79f7c" },
      rows: fix([
        "...a..........a...",
        "..pa..........ap..",
        "...ap........pa...",
        "....aa......aa....",
        ".....bbbbbbbb.....",
        "....bbbsbbsbbb....",
        ".bbbbbbbbbbbbbbbb.",
        "bccbbbbbbbbbbbbccb",
        ".bb.beebbbbeeb.bb.",
        "....behbbbbheb....",
        "....beebbbbeeb....",
        "....brbbnnbbrb....",
        ".....wwwwwwww.....",
        "....wwkkgkkwww....",
        "....wwwkkkkwww..tt",
        ".....bbsbbsbb..ttt",
        ".....bbbbbbbb..tt.",
        "......dd..dd......",
        "......aa..aa......",
      ], 18),
    },
    teacup: {
      oc: "#6f6680",
      pal: { k: "#2e2633", v: "#a58bd0", w: "#ffffff", l: "#d9cfe8", e: "#3b3140", h: "#ffffff", r: "#f6b3c0", m: "#e58aa0", c: "#b9aec9", W: "#f7f4fb", d: "#d9cfe8" },
      rows: fix([
        ".....kkkkkkkv.....",
        "....kkkkkkkkvv....",
        "...wwwwwwwwwwwll..",
        "..lwwwwwwwwwwwlll.",
        "..lweewwwwweewlll.",
        "..lwehwwwwwehwll..",
        "..lwrwwwmwwwrwl...",
        "...wwwwkkkwwww....",
        "..ccccckkkcccccc..",
        "..cWWWWWWWWWWWcWc.",
        "..cWdWWWWWWWdWc.c.",
        "...cWWWWvWWWWcWc..",
        "....cWWWWWWWWcc...",
        "..cccccccccccccc..",
        ".cWdWWdWWdWWdWWdc.",
        "..cccccccccccccc..",
      ], 18),
    },
    angel: {
      oc: "#6e6474",
      pal: { H: "#2a2430", w: "#ffffff", k: "#1f1a22", d: "#d8d2dc", x: "#9a95a0", X: "#3a343e", e: "#5a4570", h: "#ffffff", r: "#f6b3c0", n: "#f2a0b0", p: "#f4c4cf", b: "#e8d9b8" },
      rows: fix([
        "....HHHHHHHHHH....",
        "...H..........H...",
        "....HHHHHHHHHH....",
        ".....wwwwwwww.....",
        "....wwwwwwwwww....",
        ".kkkwxxxwwwwwwkkk.",
        ".kdkwxXxwwweewkdk.",
        ".kkkwxxxwwwehwkkk.",
        ".wwwrwwwwnwwwrwww.",
        ".kdkwwwwwwwwwwkdk.",
        ".kkkpwwwkkwwwpkkk.",
        ".wwppwwbbbbwwppww.",
        ".kdk.wwbbbbww.kdk.",
        ".kkk.wwwwwwww.kkk.",
        "..k...ww..ww...k..",
        "......ww..ww......",
      ], 18),
    },
    hamster: {
      oc: "#8f8c82",
      pal: { g: "#aeada2", w: "#f0f0ea", k: "#46473f", n: "#a6633f", s: "#f0f0ea", f: "#aeada2" },
      rows: fix([
        ".ggg.....ggg.",
        "gwwgggggggwwg",
        "gwggggsgggggg",
        ".gggggsggggg.",
        "ggkgggggggkgg",
        "wwwwwwnwwwwww",
        "wkwwwwwwwwwkw",
        "wwwwwwwwwwwww",
        ".wwwwwwwwwww.",
        "..ff.....ff..",
      ], 13),
    },
  };
  const HAM_STEP = (rows, k) => rows.map((r, j) => (j === 9 ? (k ? ".ff.......ff." : "...ff...ff...") : r));
  const MINI = {
    deer: { pal: PLUSH.deer.pal, oc: PLUSH.deer.oc, rows: ["a......a", ".a.bb.a.", "bbbbbbbb", "bebbbbeb", "brbnnbrb", ".wwkkww.", ".bbbbbb.", "..d..d.."] },
    teacup: { pal: PLUSH.teacup.pal, oc: PLUSH.teacup.oc, rows: [".kkkkv..", "wwwwwwll", "weewweel", "wwwmwwll", "ccckkccc", "cWWWWWWc", ".cWWWWc.", "cccccccc"] },
    angel: { pal: PLUSH.angel.pal, oc: PLUSH.angel.oc, rows: [".HHHHHH.", "H......H", ".HHHHHH.", "kwwwwwwk", "kxwwwewk", "kwwnwwwk", "kwwkkwwk", "..wwww.."] },
  };
  function drawHamster(x, y, moving, walkT) {
    const k = moving ? Math.floor(walkT * 10) % 2 : 0;
    const hop = moving && k ? -1 : 0;
    C.globalAlpha = 0.16; R(x - 5, y, 11, 2, "#000"); C.globalAlpha = 1;
    sprOutline(HAM_STEP(PLUSH.hamster.rows, k), Math.round(x) - 6, Math.round(y) - 10 + hop, PLUSH.hamster.pal, PLUSH.hamster.oc);
  }

  /* ═════════════════════ rooms ═════════════════════ */
  const lerp = (a, b, k) => a + (b - a) * k;
  const bob = (t, sp = 1, ph = 0) => (reduce ? 0 : Math.round(Math.sin(t * sp + ph) * 1.4));

  function door(x, to, frame, fill, deco) {
    return {
      id: "door-" + to, kind: "door", to,
      hit: { x, y: 38, w: 22, h: 50 }, spot: { x: x + 11, y: 100 }, face: "up",
      label: "to " + ROOMS[to].tab.toLowerCase() + " room",
      draw(t, hl) {
        R(x, 38, 22, 50, frame); R(x + 3, 41, 16, 47, fill);
        R(x + 3, 41, 16, 1, "rgba(255,255,255,.5)");
        R(x + 5, 44, 12, 18, "rgba(255,255,255,.35)"); R(x + 5, 66, 12, 18, "rgba(255,255,255,.25)");
        P(x + 16, 66, frame); P(x + 16, 67, frame);
        deco(x, t);
        // floor arrow mat
        const left = x < 128;
        R(x + 1, 90, 20, 5, frame);
        const ax = x + 8 + (left ? -1 : 1) * (hl && !reduce ? Math.round(Math.sin(t * 8)) : 0);
        if (left) { P(ax, 92, fill); R(ax + 1, 91, 1, 3, fill); R(ax + 2, 92, 5, 1, fill); }
        else { R(ax, 92, 5, 1, fill); R(ax + 4, 91, 1, 3, fill); P(ax + 5, 92, fill); }
      },
    };
  }

  /* ---------- UI/UX studio ---------- */
  const UX = {
    INK: "#4a4566", LIL: "#c9b8ff", LIL2: "#a996f0", MINT: "#a8e6cf", MINT2: "#7fd1b4", BLUE: "#bfe0ff", BUT: "#ffe39a", PEACH: "#ffc6b3", PEACH2: "#f5a994", PINK: "#ffd0e2",
  };
  const uxRoom = {
    bg() {
      R(0, 0, W, FLOOR, "#fdfcff");
      for (let x = 0; x < W; x += 8) R(x, 0, 1, 82, "#f0ebff");
      for (let y = 0; y < 82; y += 8) R(0, y, W, 1, "#f0ebff");
      // ruler
      R(0, 0, W, 5, "#f4f0ff"); R(0, 5, W, 1, "#e2d9ff");
      for (let x = 0; x < W; x += 4) R(x, x % 16 ? 3 : 1, 1, x % 16 ? 2 : 4, UX.LIL);
      // baseboard
      R(0, 80, W, 8, "#efe9ff"); R(0, 80, W, 1, "#ddd2ff"); R(0, 87, W, 1, "#ddd2ff");
      // floor tiles
      for (let y = FLOOR; y < H; y += 12) for (let x = 0; x < W; x += 16) R(x, y, 16, 12, ((x / 16 + (y - FLOOR) / 12) % 2) ? "#f6f2ff" : "#ffffff");
      for (let y = FLOOR; y < H; y += 12) R(0, y, W, 1, "#eee8ff");
      // window (left)
      R(5, 14, 20, 46, "#e2d9ff"); R(7, 16, 16, 42, "#dff0ff");
      R(7, 16, 16, 14, "#ffe7f0"); R(7, 30, 16, 14, "#fff3d6");
      circ(17, 26, 3, "#fff"); circ(12, 40, 2.4, "#fff"); circ(15, 40, 3, "#fff"); circ(18, 41, 2, "#fff");
      R(14, 16, 2, 42, "#e2d9ff"); R(7, 36, 16, 2, "#e2d9ff");
      R(4, 59, 22, 3, "#ffffff"); R(4, 62, 22, 1, "#ddd2ff");
      // swatch strip pinned above desk
      [UX.LIL, UX.MINT, UX.BLUE, UX.BUT, UX.PEACH].forEach((c, i) => { R(100 + i * 8, 33, 6, 6, c); R(100 + i * 8, 39, 6, 1, "#e8e1fb"); });
      P(119, 32, "#ff7eb6"); P(120, 32, "#ff7eb6");
      // rug
      for (let y = 0; y < 22; y++) {
        const w = Math.round(Math.sqrt(1 - Math.pow((y - 11) / 11.5, 2)) * 46);
        R(128 - w, 120 + y, w * 2, 1, y % 4 < 2 ? "#e8f8f1" : "#dff4ec");
      }
      for (let i = 0; i < 9; i++) circ(96 + i * 8, 131 + (i % 2 ? 3 : -3), 1, [UX.LIL, UX.PEACH, UX.BUT][i % 3]);
    },
    anim(t) {
      // floaty shapes on the 'canvas' wall
      const ty = 24 + bob(t, 1.1, 2);
      for (let i = 0; i < 6; i++) R(155 + i, ty + 5 - i, 12 - i * 2, 1, UX.MINT2);
      spr(SP.star, 212, 14 + bob(t, 1.6, 1), { "#": "#ffd36e" });
      ring(220, 36 + bob(t, 0.9, 3), 3, UX.LIL2); ring(220, 36 + bob(t, 0.9, 3), 2.2, UX.LIL2);
      for (let i = 0; i < 14; i++) P(66 + i, 44 + Math.round(Math.sin(i * 0.9 + (reduce ? 0 : t * 3)) * 1.5), UX.LIL2);
      // collaborator cursor wandering on the wall
      const cx = reduce ? 160 : 150 + Math.sin(t * 0.45) * 60, cy = reduce ? 12 : 14 + Math.sin(t * 0.8) * 6;
      spr(SP.cursor, cx, cy, { k: "#2fae86", w: "#ffffff" });
      R(cx + 6, cy + 6, 15, 7, "#2fae86"); text("DEV", cx + 8, cy + 7, "#fff");
    },
    objects: [
      {
        id: "easel", kind: "floor", hit: { x: 28, y: 36, w: 38, h: 70 }, spot: { x: 46, y: 114 }, base: 104,
        block: { x: 30, y: 98, w: 32, h: 6 },
        draw(t) {
          const wd = "#e6c7a6", wd2 = "#d2ab84";
          line(46, 36, 46, 100, wd2, 2); line(38, 44, 32, 104, wd, 2); line(54, 44, 60, 104, wd, 2);
          R(30, 74, 34, 3, wd); R(30, 77, 34, 1, wd2);
          R(31, 40, 32, 34, "#ffffff"); R(31, 40, 32, 1, "#e2d9ff"); R(31, 73, 32, 1, "#e2d9ff"); R(31, 40, 1, 34, "#e2d9ff"); R(62, 40, 1, 34, "#e2d9ff");
          R(33, 42, 28, 30, "#fff0f6");
          // mini self-portrait: black hair, blush
          circ(47, 56, 9, "#1f1b29"); R(39, 56, 16, 14, "#1f1b29");
          circ(47, 57, 6.4, "#ffe9de"); R(41, 52, 12, 3, "#1f1b29"); P(44, 55, "#1f1b29"); P(50, 55, "#1f1b29");
          R(44, 57, 1, 2, "#1f1b29"); R(50, 57, 1, 2, "#1f1b29"); P(43, 60, "#ff98b8"); P(51, 60, "#ff98b8");
          R(42, 66, 10, 4, "#ff86ba"); P(46, 66, "#fff"); P(47, 66, "#fff");
          P(44, 49, "#fff"); P(50, 50, "#fff");
          // paint palette on ledge
          R(52, 71, 9, 3, "#fff"); P(53, 72, "#ff86ba"); P(55, 72, UX.MINT2); P(57, 72, "#ffd36e"); P(59, 72, UX.LIL2);
          // brush
          line(34, 66, 38, 72, "#cfa77f"); P(34, 65, "#ff86ba");
        },
      },
      {
        // pinned poster: tidalBYTE '26 (giant penguin peeking over a pixel city, like the site's hero)
        id: "byte", kind: "wall", hit: { x: 67, y: 8, w: 31, h: 34 }, spot: { x: 82, y: 112 },
        draw(t) {
          R(68, 10, 29, 31, UX.INK); R(69, 11, 27, 23, "#e4e9f0");
          for (let x = 72; x < 96; x += 4) R(x, 11, 1, 23, "#d8dfe9");
          spr(SP.penguin, 77, 13 + bob(t, 1.4, 1), { k: "#2f3346", w: "#ffffff", o: "#f5a142", p: "#ff9ec4" });
          [[69, 26, 5, 8], [74, 22, 6, 12], [80, 28, 5, 6], [86, 24, 5, 10], [91, 27, 5, 7]].forEach(([x, y, w, h]) => {
            R(x, y, w, h, "#7b8799"); R(x, y, w, 1, "#5c6678");
            for (let yy = y + 2; yy < y + h - 1; yy += 3) for (let xx = x + 1; xx < x + w - 1; xx += 2) P(xx, yy, (xx + yy) % 3 ? "#c9d6e6" : "#8fb4e8");
          });
          text("BYTE", 72, 35, "#ffffff"); text("26", 89, 35, "#8fb4e8");
          circ(82, 10, 1.6, "#ff86ba"); P(82, 9, "#ffffff");
        },
      },
      {
        id: "monitor", kind: "floor", hit: { x: 86, y: 44, w: 70, h: 60 }, spot: { x: 121, y: 114 }, base: 102,
        block: { x: 88, y: 96, w: 66, h: 6 },
        draw(t) {
          // desk
          R(88, 79, 66, 4, "#ffffff"); R(88, 83, 66, 1, "#d6c9ff"); R(88, 79, 66, 1, "#efe9ff");
          R(91, 84, 3, 18, "#d6c9ff"); R(148, 84, 3, 18, "#d6c9ff");
          R(124, 84, 24, 12, "#dbeeff"); R(124, 95, 24, 1, "#bcd9f5"); R(133, 88, 6, 1, "#9cc4ea");
          // monitor
          R(118, 72, 6, 7, "#d6c9ff"); R(112, 77, 18, 2, "#d6c9ff");
          R(100, 46, 42, 27, UX.INK); R(102, 48, 38, 23, "#ffffff");
          R(102, 48, 38, 7, UX.LIL); P(104, 51, "#ff86ba"); P(106, 51, "#ffd36e"); P(108, 51, UX.MINT2);
          text("AISLE0", 114, 49, "#ffffff");
          // flight cards
          R(104, 57, 16, 7, "#eaf8f2"); spr(SP.plane, 105, 58, { b: "#2f8fd8" }); R(113, 59, 5, 1, UX.MINT2); R(113, 61, 4, 1, UX.MINT2);
          R(122, 57, 16, 7, "#fff0f6"); R(124, 59, 8, 1, "#ff86ba"); R(124, 61, 11, 1, "#ffc0d8");
          // task rows w/ live progress
          const p = reduce ? 20 : Math.floor((t * 8) % 34);
          R(104, 65, 34, 2, "#efe9ff"); R(104, 65, p, 2, UX.LIL2);
          R(104, 68, 34, 2, "#efe9ff"); R(104, 68, 22, 2, UX.MINT2);
          if (Math.floor(t * 2) % 2 || reduce) P(137, 58, "#3ccf8e");
          // lamp
          R(92, 76, 8, 3, UX.LIL2); line(95, 76, 92, 66, UX.LIL2); line(92, 66, 97, 60, UX.LIL2);
          R(94, 57, 8, 4, UX.BUT); R(95, 61, 6, 1, "#f5cf6b");
          // pen cup
          R(145, 73, 6, 6, UX.PEACH); R(145, 73, 6, 1, UX.PEACH2); P(146, 71, UX.LIL2); P(146, 72, UX.LIL2); P(149, 70, UX.MINT2); P(149, 71, UX.MINT2); P(149, 72, UX.MINT2);
        },
      },
      {
        id: "arcade", kind: "floor", hit: { x: 166, y: 36, w: 34, h: 68 }, spot: { x: 183, y: 114 }, base: 102,
        block: { x: 168, y: 96, w: 30, h: 6 },
        draw(t) {
          R(170, 40, 26, 62, UX.PEACH); R(170, 40, 3, 62, UX.PEACH2); R(193, 40, 3, 62, "#ffd6c9");
          R(171, 41, 24, 10, UX.BUT); R(171, 50, 24, 1, "#f2cb63"); text("APPLE", 173, 43, "#e0523b");
          R(172, 52, 22, 17, UX.INK); R(174, 54, 18, 13, "#2b2848");
          // tiny scene: apple + a running pixel girl
          spr(SP.apple, 179, 55, { g: "#5fbf6a", r: "#ff5a5a", w: "#ffd0d0" });
          const fx = reduce ? 176 : 175 + Math.floor((t * 6) % 14);
          R(fx, 63, 2, 3, "#1f1b29"); P(fx, 66, "#ff86ba");
          if (!reduce && Math.floor(t * 12) % 7 === 0) R(174, 54 + Math.floor((t * 30) % 13), 18, 1, "rgba(255,255,255,.18)");
          R(170, 69, 26, 7, "#ffd9cc"); R(170, 69, 26, 1, "#fff");
          R(176, 66, 1, 4, UX.INK); circ(176, 66, 1.4, "#e0523b");
          circ(184, 72, 1.3, UX.MINT2); circ(189, 72, 1.3, UX.LIL2);
          R(181, 82, 4, 7, UX.PEACH2); R(182, 83, 2, 5, "#e8907a");
          spr(SP.heart, 176, 92, { "#": "#ffffff" }); spr(SP.heart, 186, 92, { "#": "#ffffff" });
        },
      },
      {
        id: "claw", kind: "floor", hit: { x: 198, y: 32, w: 32, h: 72 }, spot: { x: 214, y: 112 }, base: 102,
        block: { x: 200, y: 96, w: 28, h: 6 },
        draw(t) {
          const B = "#c9b8ff", B2 = "#a996f0";
          R(200, 34, 28, 68, B); R(200, 34, 2, 68, B2); R(226, 34, 2, 68, "#ddd2ff");
          R(201, 35, 26, 8, UX.BUT); R(201, 42, 26, 1, "#f2cb63"); text("PLUSH", 204, 37, "#e0523b");
          // glass case
          R(203, 45, 22, 28, "#eef7ff"); R(203, 72, 22, 1, B2);
          R(203, 46, 22, 1, B2);
          const cx = reduce ? 214 : 207 + Math.round((Math.sin(t * 0.9) + 1) * 7);
          const drop = reduce ? 0 : Math.max(0, Math.round(Math.sin(t * 0.9 * 2 + 1) * 3));
          R(cx, 47, 1, 4 + drop, UX.INK); R(cx - 2, 51 + drop, 5, 1, "#9aa0b4"); P(cx - 2, 52 + drop, "#9aa0b4"); P(cx + 2, 52 + drop, "#9aa0b4");
          // plushie pile (deer, teacup, angel bunny)
          sprOutline(MINI.angel.rows, 210, 55, MINI.angel.pal, MINI.angel.oc);
          sprOutline(MINI.deer.rows, 204, 64, MINI.deer.pal, MINI.deer.oc);
          sprOutline(MINI.teacup.rows, 216, 64, MINI.teacup.pal, MINI.teacup.oc);
          line(205, 49, 208, 46, "#ffffff"); line(205, 53, 211, 47, "#ffffff");
          // control panel
          R(200, 73, 28, 4, "#ddd2ff"); R(200, 77, 28, 1, B2);
          R(216, 72, 1, 4, UX.INK); circ(216, 71, 1.4, "#ff86ba"); circ(222, 75, 1.3, UX.MINT2);
          R(204, 80, 9, 9, B2); R(205, 81, 7, 7, "#8f7be0");
          R(218, 82, 4, 6, B2); R(219, 83, 2, 4, "#8f7be0");
          spr(SP.heart, 205, 93, { "#": "#ffffff" }); spr(SP.heart, 218, 93, { "#": "#ffffff" });
        },
      },
      door(230, "mkt", "#e2d9ff", "#ffb3d1", (x) => { spr(SP.heart, x + 9, 48, { "#": "#ffffff" }); }),
    ],
  };

  /* ---------- Marketing boutique ---------- */
  const MK = { PINK: "#ffd9e8", P2: "#ffcade", HOT: "#ff4fa0", ROSE: "#ff8fbf", ROSE2: "#f26aa6", WAIN: "#ffc2da", INK: "#5a2a44", CREAM: "#fff7fb" };
  const mkRoom = {
    bg() {
      R(0, 0, W, FLOOR, MK.PINK);
      for (let x = 2; x < W; x += 10) R(x, 0, 3, 58, MK.P2);
      for (let y = 14; y < 58; y += 14) for (let x = (y % 28 ? 6 : 1); x < W; x += 10) spr(SP.heart, x - 1, y, { "#": "#ffc0d7" });
      // lace trim top
      R(0, 0, W, 3, "#ffffff");
      for (let x = 0; x < W; x += 6) { circ(x + 3, 3, 2.2, "#ffffff"); P(x + 3, 3, MK.P2); }
      // chair rail + wainscot
      R(0, 58, W, 2, "#ffffff"); for (let x = 0; x < W; x += 4) P(x + 1, 60, "#ffffff");
      R(0, 61, W, 21, MK.WAIN);
      for (let x = 4; x < W; x += 28) { R(x, 64, 22, 1, "#ffadcd"); R(x, 78, 22, 1, "#ffadcd"); R(x, 64, 1, 15, "#ffadcd"); R(x + 21, 64, 1, 15, "#ffadcd"); }
      R(0, 80, W, 8, "#fff5f9"); R(0, 80, W, 1, "#ffadcd"); R(0, 87, W, 1, "#ffadcd");
      // floor: checker
      for (let y = FLOOR; y < H; y += 12) for (let x = 0; x < W; x += 12) R(x, y, 12, 12, ((x / 12 + (y - FLOOR) / 12) % 2) ? "#ffe6ef" : "#fff7fa");
      // heart rug
      const hx = 128, hy = 118;
      C.fillStyle = MK.ROSE;
      for (let y = 0; y < 32; y++) for (let x = -40; x <= 40; x++) {
        const nx = x / 40 * 1.25, ny = -(y - 10) / 20;
        const v = Math.pow(nx * nx + ny * ny - 1, 3) - nx * nx * ny * ny * ny;
        if (v <= 0) C.fillRect(hx + x, hy + y, 1, 1);
      }
      C.fillStyle = "#ffb3d1";
      for (let y = 2; y < 30; y++) for (let x = -36; x <= 36; x++) {
        const nx = x / 36 * 1.25, ny = -(y - 10) / 18;
        const v = Math.pow(nx * nx + ny * ny - 1, 3) - nx * nx * ny * ny * ny;
        if (v <= 0 && (x + y) % 4 === 0) C.fillRect(hx + x, hy + y, 1, 1);
      }
      // garland
      for (let x = 70; x < 226; x++) P(x, 8 + Math.round(Math.sin((x - 70) / 156 * Math.PI) * 6), "#ffffff");
    },
    anim(t) {
      for (let i = 0; i < 9; i++) {
        const x = 76 + i * 18, y = 9 + Math.round(Math.sin((x - 70) / 156 * Math.PI) * 6);
        const on = reduce || (Math.floor(t * 2 + i) % 3 !== 0);
        spr(SP.heart, x - 2, y, { "#": i % 2 ? "#ffffff" : (on ? MK.HOT : MK.ROSE) });
      }
    },
    objects: [
      door(4, "ux", "#ffffff", "#d9ccff", (x) => { spr(SP.spark, x + 8, 47, { "#": "#ffffff" }); }),
      {
        id: "poster", kind: "wall", hit: { x: 30, y: 12, w: 42, h: 52 }, spot: { x: 51, y: 102 },
        draw(t) {
          R(32, 14, 38, 48, "#1d2b53"); R(34, 16, 34, 44, "#2f6fd6");
          for (let y = 16; y < 60; y += 4) R(34, y, 34, 1, "#3a7be0");
          text("TIDAL", 41, 19, "#ffffff"); R(41, 25, 19, 1, "#19b6ee");
          spr(SP.penguin, 45, 30 + bob(t, 2), { k: "#1d2b53", w: "#ffffff", o: "#f5a142", p: "#ff9ec4" });
          text("HACK", 43, 51, "#ffe39a");
          spr(SP.spark, 36, 30, { "#": "#ffe39a" }); spr(SP.spark, 61, 40, { "#": "#19b6ee" });
          // washi tape
          R(30, 12, 8, 4, "#ffb3d1"); R(64, 12, 8, 4, "#ffffff"); R(30, 58, 8, 4, "#ffffff"); R(64, 58, 8, 4, "#ffb3d1");
        },
      },
      {
        id: "shelf", kind: "wall", hit: { x: 82, y: 20, w: 50, h: 34 }, spot: { x: 107, y: 102 },
        draw(t) {
          // frames
          R(85, 30, 14, 17, "#ffffff"); R(87, 32, 10, 13, "#cfeae4"); circ(92, 37, 2.5, "#ffffff"); R(88, 41, 8, 3, "#9ed6c8");
          R(102, 24, 14, 23, "#ffffff"); R(104, 26, 10, 19, "#fff1d6"); circ(109, 32, 3, "#ffd27a"); R(105, 39, 8, 1, "#f2b98a"); R(106, 41, 6, 1, "#f2b98a");
          R(119, 33, 11, 14, "#ffffff"); R(121, 35, 7, 10, "#ffe2ec"); spr(SP.heart, 122, 38, { "#": MK.ROSE });
          // shelf
          R(82, 47, 50, 3, "#ffffff"); R(82, 50, 50, 1, "#ffadcd");
          for (let x = 84; x < 132; x += 6) { circ(x + 2, 51, 1.6, "#ffffff"); }
          R(86, 52, 3, 4, "#ffffff"); R(125, 52, 3, 4, "#ffffff");
        },
      },
      {
        id: "vanity", kind: "floor", hit: { x: 136, y: 26, w: 46, h: 70 }, spot: { x: 159, y: 108 }, base: 94,
        block: { x: 138, y: 88, w: 42, h: 6 },
        draw(t) {
          // mirror
          for (let y = -15; y <= 15; y++) { const w = Math.round(Math.sqrt(1 - (y / 15.5) ** 2) * 12); R(159 - w, 46 + y, w * 2 + 1, 1, "#ffffff"); }
          for (let y = -13; y <= 13; y++) { const w = Math.round(Math.sqrt(1 - (y / 13.5) ** 2) * 10); R(159 - w, 46 + y, w * 2 + 1, 1, "#eaf2ff"); }
          line(153, 38, 157, 34, "#ffffff"); line(153, 42, 160, 35, "#ffffff");
          R(155, 29, 3, 3, MK.HOT); R(161, 29, 3, 3, MK.HOT); R(158, 30, 3, 2, MK.ROSE2);
          // polaroids on mirror edge (social cards)
          R(144, 44, 8, 9, "#ffffff"); R(145, 45, 6, 5, "#2f6fd6"); P(147, 46, "#fff");
          R(166, 40, 8, 9, "#ffffff"); R(167, 41, 6, 5, "#ffb3d1"); spr(SP.heart, 167, 42, { "#": "#ffffff" });
          // table + frilly skirt
          R(136, 62, 46, 3, "#ffffff"); R(136, 65, 46, 1, "#ffadcd");
          R(138, 66, 42, 24, "#ffb3d1");
          for (let x = 140; x < 180; x += 4) R(x, 66, 1, 24, "#ff9ec4");
          for (let x = 138; x < 180; x += 4) { circ(x + 2, 90, 1.8, "#ffffff"); }
          R(138, 66, 42, 2, "#ffffff"); for (let x = 139; x < 180; x += 3) P(x, 68, "#ffffff");
          // phone with heart + perfume
          R(141, 52, 7, 10, MK.INK); R(142, 53, 5, 8, "#ffc0d8"); spr(SP.heart, 142, 55, { "#": MK.HOT });
          R(170, 56, 5, 6, "#e7d2ff"); R(171, 54, 3, 2, "#ffffff"); R(172, 53, 1, 1, MK.HOT);
        },
      },
      {
        id: "bunny", kind: "floor", hit: { x: 190, y: 40, w: 36, h: 62 }, spot: { x: 208, y: 112 }, base: 100,
        block: { x: 196, y: 94, w: 24, h: 6 },
        draw(t) {
          // tiered stand
          R(193, 80, 30, 2, "#ffffff"); for (let x = 194; x < 223; x += 3) P(x, 82, "#ffffff");
          R(206, 82, 4, 14, "#ffffff"); R(200, 96, 16, 3, "#ffffff"); R(200, 99, 16, 1, "#ffadcd");
          R(197, 63, 22, 2, "#ffffff"); for (let x = 198; x < 219; x += 3) P(x, 65, "#ffffff");
          R(206, 65, 4, 15, "#ffffff");
          // sticker sheet, drawn in-engine so it always stays crisp
          R(200, 70, 16, 10, "#ffffff"); R(200, 70, 16, 1, "#ffd6e8");
          circ(204, 75.5, 2.4, "#ffd6e8"); circ(210, 74.5, 2, "#bdf0e6"); circ(215, 76, 1.7, "#ffe9a8");
          spr(SP.heart, 205, 72, { "#": MK.HOT });
          // floating stickers above
          spr(SP.heart, 203, 51 + bob(t, 2.2, 1), { "#": MK.HOT });
          circ(215, 50 + bob(t, 1.9, 0.5), 2.2, "#bdf0e6");
          spr(SP.spark, 220, 46 + bob(t, 1.7, 1), { "#": "#ffffff" });
        },
      },
      door(232, "pm", "#ffffff", "#b5c7a1", (x) => { spr(SP.note, x + 8, 48, { "#": "#ffffff" }); }),
    ],
  };

  /* ---------- PM listening room ---------- */
  const PM = { SAGE: "#d6d8ff", SAGE2: "#c6c9f7", SAGED: "#8fe3b0", CREAM: "#ffffff", WOOD: "#b9bdf0", WOOD2: "#9ea3e0", WOODL: "#d4d6fa", TOM: "#ff7ac8", BUT: "#7fe8ef", NAVY: "#5a5a9c", CORK: "#eef0ff" };
  const pmRoom = {
    bg() {
      // wall: periwinkle panels with pastel circuit traces
      R(0, 0, W, FLOOR, "#d6d8ff");
      for (let x = 0; x < W; x += 16) R(x, 0, 1, 61, "#c8cbf8");
      [[6, 18, 40], [160, 26, 70], [60, 8, 30], [200, 50, 50], [10, 48, 14]].forEach(([x, y, w], i) => { R(x, y, w, 1, "#aeeaf2"); P(x + w, y, i % 2 ? "#ff9ed8" : "#ffffff"); P(x, y, "#ffffff"); });
      [[46, 18, 14], [230, 26, 24], [90, 8, 10]].forEach(([x, y, h]) => R(x, y, 1, h, "#aeeaf2"));
      R(0, 0, W, 3, "#ffffff"); R(0, 3, W, 1, "#ffb3e6");
      R(0, 57, W, 3, "#eeeeff"); R(0, 60, W, 1, "#8ff0f0");
      R(0, 61, W, 20, "#c3c5f3");
      for (let x = 0; x < W; x += 16) { R(x, 61, 1, 20, "#b4b6ec"); R(x + 4, 66, 8, 1, "#b4b6ec"); R(x + 4, 74, 8, 1, "#b4b6ec"); }
      R(0, 80, W, 8, "#aeb0e6"); R(0, 80, W, 1, "#ffffff");
      // floor: lilac tiles with a soft grid
      R(0, FLOOR, W, H - FLOOR, "#e4e2fa");
      for (let y = FLOOR + 6; y < H; y += 9) R(0, y, W, 1, "#d0cdf2");
      for (let x = 0; x < W; x += 18) R(x, FLOOR, 1, H - FLOOR, "#d8d5f6");
      // holo pad instead of the rug
      for (let y = 0; y < 30; y++) { const w = Math.round(Math.sqrt(1 - ((y - 15) / 15.5) ** 2) * 62); R(128 - w, 118 + y, w * 2, 1, y === 0 || y === 29 ? "#8ff0f0" : (y % 3 ? "#eafcfb" : "#dff6fb")); }
      for (let y = 4; y < 26; y++) { const w = Math.round(Math.sqrt(Math.max(0, 1 - ((y - 15) / 11.5) ** 2)) * 46); if (w > 0) { P(128 - w, 118 + y, "#ffb3e6"); P(128 + w, 118 + y, "#ffb3e6"); } }
      // window becomes a viewport onto a pastel city at sunset
      R(116, 12, 44, 38, "#ffffff");
      for (let y = 15; y < 47; y++) R(119, y, 38, 1, y < 24 ? "#ffd1ec" : y < 34 ? "#ecd6ff" : "#cfdcff");
      [[119, 34, 6], [126, 28, 5], [132, 37, 7], [140, 31, 5], [146, 26, 6], [153, 35, 4]].forEach(([x, y, w]) => R(x, y, w, 47 - y, "#9aa0e6"));
      R(116, 12, 44, 1, "#8ff0f0"); R(137, 15, 2, 32, "#ffffff"); R(119, 30, 38, 1, "#ffffff");
      R(114, 50, 48, 3, "#ffffff"); R(114, 53, 48, 1, "#ffb3e6");
      // shelf: pastel glowing spines + trophy
      R(176, 36, 50, 3, "#ffffff"); R(176, 39, 50, 1, "#8ff0f0");
      [[178, "#ff9ed8", 12], [182, "#8ff0f0", 10], [186, "#b8f5a0", 13], [190, "#c9b3ff", 11], [194, "#fff1a8", 9]].forEach(([x, c, h]) => { R(x, 36 - h, 4, h, c); R(x, 36 - h, 4, 1, "rgba(255,255,255,.6)"); });
      line(198, 35, 203, 27, "#9ea3e0", 2);
      R(212, 31, 7, 5, "#ffe58a"); R(214, 27, 3, 4, "#ffe58a"); R(211, 27, 2, 2, "#ffe58a"); R(218, 27, 2, 2, "#ffe58a"); R(213, 35, 5, 1, "#f2c84b");
    },
    anim(t) {
      // city windows blink, a drone drifts by, a scan line sweeps the viewport, LEDs pulse along the ledge
      [[121, 37], [122, 40], [128, 31], [129, 35], [134, 40], [135, 43], [142, 33], [148, 29], [149, 33], [154, 38]].forEach(([x, y], i) => {
        if (reduce || (Math.floor(t * 1.2 + i * 1.3) % 3)) P(x, y, i % 3 === 0 ? "#ffffff" : i % 2 ? "#8ff0f0" : "#ffb3e6");
      });
      const dx = reduce ? 130 : 119 + Math.floor((t * 6) % 37); P(dx, 19, "#ffffff"); P(dx + 1, 19, "#8ff0f0");
      if (!reduce) { const sy = 15 + Math.floor((t * 10) % 32); C.globalAlpha = 0.35; R(119, sy, 38, 1, "#ffffff"); C.globalAlpha = 1; }
      const k = reduce ? 0 : Math.floor((t * 40) % W);
      R(k, 60, 14, 1, "#ffffff");
    },
    objects: [
      door(4, "mkt", PM.CREAM, "#ffb3d1", (x) => { spr(SP.heart, x + 9, 48, { "#": "#ffffff" }); }),
      {
        id: "board", kind: "wall", hit: { x: 26, y: 10, w: 58, h: 48 }, spot: { x: 55, y: 102 },
        draw(t) {
          R(28, 12, 54, 44, PM.WOOD); R(30, 14, 50, 40, PM.CORK);
          for (let i = 0; i < 40; i++) P(31 + ((i * 37) % 48), 15 + ((i * 23) % 38), "#dfe1fb");
          const cols = [["TODO", "#c4f4f6"], ["WIP", "#ffd1ec"], ["DONE", "#d4f7c4"]];
          cols.forEach(([lbl, c], i) => {
            const x = 32 + i * 16;
            text(lbl, x + (lbl.length === 3 ? 2 : 0), 16, PM.NAVY);
            const n = i === 2 ? 3 : 2;
            for (let k = 0; k < n; k++) {
              const y = 23 + k * 10;
              R(x + 1, y, 13, 9, c); R(x + 1, y + 8, 13, 1, "rgba(0,0,0,.1)");
              R(x + 3, y + 3, 8, 1, "rgba(47,51,70,.45)"); R(x + 3, y + 5, 6, 1, "rgba(47,51,70,.3)");
              P(x + 7, y, PM.TOM);
            }
          });
          // blind box sketches pinned over the notes
          const box = (x, y, c, c2) => { R(x, y + 2, 9, 7, c); R(x, y, 9, 2, c2); R(x + 4, y, 1, 9, "#ffffff"); text("?", x + 1, y + 3, "#ffffff"); };
          box(70, 44, PM.TOM, "#ffb3e0");
          box(19 + 14, 46, PM.SAGED, "#8fae7b");
          spr(SP.spark, 76, 16, { "#": PM.BUT });
        },
      },
      {
        id: "wheel", kind: "floor", hit: { x: 36, y: 60, w: 48, h: 46 }, spot: { x: 86, y: 106 }, face: "left", base: 103,
        block: { x: 40, y: 97, w: 40, h: 6 },
        draw(t) {
          const cx = WHEEL_X, cy = 79;
          // bedding tray
          R(38, 97, 44, 6, PM.CREAM); R(38, 102, 44, 1, "#d4d6fa");
          for (let i = 0; i < 12; i++) P(40 + ((i * 7) % 40), 98 + (i % 3), "#d4d6fa");
          // stand
          line(cx, cy, cx - 10, 97, PM.WOOD2, 2); line(cx, cy, cx + 10, 97, PM.WOOD2, 2);
          // wheel
          ring(cx, cy, 14, PM.TOM); ring(cx, cy, 13.2, PM.TOM); ring(cx, cy, 12.4, "#ffb3e0");
          for (let k = 0; k < 6; k++) { const a = wheelAng + (k * Math.PI) / 3; line(cx, cy, cx + Math.cos(a) * 12, cy + Math.sin(a) * 12, "#ffd1ec"); }
          circ(cx, cy, 1.5, PM.CREAM);
          if (pet.inWheel) drawHamster(cx, cy + 12, true, pet.walkT);
          // name tag + 1st-place rosette (NomNom won the ideathon)
          text("NOM", 66, 98, PM.NAVY);
          circ(42, 72, 3, PM.BUT); circ(42, 72, 1.5, "#fff3c4"); R(40, 75, 2, 4, PM.TOM); R(43, 75, 2, 4, PM.TOM);
        },
      },
      {
        id: "badge", kind: "wall", hit: { x: 88, y: 12, w: 26, h: 56 }, spot: { x: 101, y: 102 },
        draw(t) {
          R(99, 13, 4, 3, "#9ea3e0"); P(100, 12, "#9ea3e0");
          const sw = reduce ? 0 : Math.round(Math.sin(t * 1.4) * 1);
          line(100, 16, 93 + sw, 40, PM.NAVY); line(102, 16, 109 + sw, 40, PM.NAVY);
          for (let k = 0; k < 6; k++) { P(Math.round(lerp(100, 93 + sw, k / 6)), Math.round(lerp(16, 40, k / 6)), "#ffffff"); }
          const bx = 91 + sw;
          R(bx + 6, 38, 8, 3, "#c0c6d4");
          R(bx, 41, 20, 27, "#ffffff"); R(bx, 41, 20, 1, "#e6e2d6"); R(bx + 19, 41, 1, 27, "#e6e2d6");
          // photo
          R(bx + 3, 45, 8, 9, "#dfe8f5"); circ(bx + 7, 49, 3, "#1f1b29"); R(bx + 5, 49, 5, 4, "#ffe9de"); R(bx + 4, 52, 7, 2, "#1f1b29");
          P(bx + 6, 50, "#1f1b29"); P(bx + 8, 50, "#1f1b29");
          R(bx + 12, 46, 6, 1, PM.NAVY); R(bx + 12, 48, 5, 1, "#9aa0b4"); R(bx + 12, 50, 6, 1, "#9aa0b4");
          spr(SP.spark, bx + 13, 52 + (reduce ? 0 : (Math.floor(t * 2) % 2)), { "#": PM.BUT });
          R(bx, 59, 20, 9, PM.TOM); text("1/100", bx + 1, 61, "#ffffff");
        },
      },
      {
        id: "record", kind: "floor", hit: { x: 110, y: 54, w: 56, h: 48 }, spot: { x: 138, y: 112 }, base: 100,
        block: { x: 112, y: 94, w: 52, h: 6 },
        draw(t) {
          R(112, 68, 52, 3, PM.WOODL); R(114, 71, 48, 25, PM.WOOD); R(114, 95, 48, 1, PM.WOOD2);
          R(116, 96, 3, 4, "#9ea3e0"); R(157, 96, 3, 4, "#9ea3e0");
          // vinyl crate shelf
          R(117, 74, 22, 18, "#8f94d6");
          [PM.TOM, PM.BUT, PM.CREAM, PM.SAGED, "#ffb3d1", PM.NAVY, PM.TOM].forEach((c, i) => R(118 + i * 3, 77 + (i % 2), 2, 15 - (i % 2), c));
          // speaker
          R(142, 74, 18, 18, "#9ea3e0");
          for (let y = 76; y < 91; y += 2) for (let x = 144; x < 159; x += 2) P(x, y, "#7d82c8");
          circ(151, 83, 4.5, "#7d82c8"); circ(151, 83, 2, music ? (Math.floor(t * 6) % 2 ? "#6c71b8" : "#8f94d6") : "#6c71b8");
          // turntable
          R(118, 60, 34, 8, PM.CREAM); R(118, 67, 34, 1, "#d4d6fa");
          for (let y = 0; y < 5; y++) { const w = Math.round(Math.sqrt(1 - ((y - 2) / 2.6) ** 2) * 12); R(133 - w, 61 + y, w * 2 + 1, 1, "#1f1f2b"); }
          R(131, 62, 4, 3, PM.TOM);
          if (music && !reduce) { const a = t * 6; P(Math.round(133 + Math.cos(a) * 9), Math.round(63 + Math.sin(a) * 1.6), "#6b6b80"); }
          line(147, 61, 147, 64, "#c0c6d4"); line(147, 64, 141, 64 + (music ? 0 : -1), "#c0c6d4"); R(146, 60, 3, 2, "#9aa0b4");
          R(150, 65, 1, 1, music ? "#4dd17f" : "#9aa0b4");
        },
      },
      {
        id: "phone", kind: "floor", hit: { x: 170, y: 50, w: 58, h: 52 }, spot: { x: 196, y: 112 }, base: 100,
        block: { x: 174, y: 94, w: 52, h: 6 },
        draw(t) {
          // lamp glow
          C.globalAlpha = 0.22; for (let k = 0; k < 10; k++) R(211 - k, 64 + k, 12 + k * 2, 1, PM.BUT); C.globalAlpha = 1;
          // desk
          R(174, 74, 52, 3, PM.WOODL); R(176, 77, 48, 5, PM.WOOD); R(176, 82, 48, 1, PM.WOOD2);
          R(178, 82, 3, 18, PM.WOOD2); R(219, 82, 3, 18, PM.WOOD2); R(196, 78, 8, 1, PM.CREAM);
          // lamp
          R(213, 71, 8, 3, PM.NAVY); R(216, 63, 2, 8, PM.NAVY); R(210, 57, 14, 7, PM.BUT); R(210, 63, 14, 1, "#5fd6d6");
          // notebook
          R(186, 71, 14, 3, PM.CREAM); R(186, 70, 14, 1, "#e6e7fb"); R(196, 69, 2, 5, PM.TOM);
          // mug + steam
          R(201, 67, 6, 7, PM.CREAM); R(207, 69, 2, 3, PM.CREAM); R(202, 68, 4, 1, "#ff9ed8");
          if (!reduce) for (let k = 0; k < 2; k++) { const s = (t * 0.9 + k * 0.5) % 1; P(203 + k * 2 + Math.round(Math.sin(s * 7) * 1), 65 - Math.round(s * 8), "rgba(255,255,255," + (0.8 - s * 0.8) + ")"); }
          // phone — rings every few seconds
          const ringing = !reduce && (t % 7) < 1.6;
          const sx = ringing ? (Math.floor(t * 30) % 2 ? 1 : -1) : 0;
          R(180 + sx, 61, 8, 13, PM.NAVY); R(181 + sx, 62, 6, 11, "#111111");
          R(182 + sx, 63, 4, 5, "#3b3b46"); R(182 + sx, 63, 2, 2, "#ffffff");
          R(182 + sx, 70, 4, 1, "#ffffff");
          if (ringing) {
            R(178, 49, 12, 9, "#ffffff"); R(182, 58, 3, 2, "#ffffff"); R(178, 49, 12, 1, "#e6e2d6");
            R(183, 51, 2, 4, PM.TOM); P(183, 56, PM.TOM); P(184, 56, PM.TOM);
          }
        },
      },
      {
        id: "plant", kind: "decor", base: 104, block: { x: 232, y: 98, w: 20, h: 6 },
        draw(t) {
          const sw = reduce ? 0 : Math.round(Math.sin(t * 0.8) * 1);
          const leaf = (x, y, w, h, c) => { for (let j = 0; j < h; j++) { const k = Math.round(Math.sin((j / h) * Math.PI) * w); R(x - k, y + j, k * 2 + 1, 1, c); } };
          line(242, 92, 236 + sw, 66, "#7fcfa8"); line(242, 92, 248 + sw, 70, "#7fcfa8"); line(242, 92, 241, 60, "#7fcfa8");
          leaf(236 + sw, 60, 5, 12, PM.SAGED); leaf(248 + sw, 64, 5, 11, "#b8f5c8"); leaf(241, 52, 5, 12, "#8fe3b0");
          P(236 + sw, 66, PM.SAGE); P(248 + sw, 69, PM.SAGE); P(241, 58, PM.SAGE);
          R(235, 90, 15, 3, "#ffd1ec"); R(236, 93, 13, 11, "#ffb3e0"); R(236, 93, 13, 1, "#f598cb");
        },
      },
      {
        // cats + rabbits holding a little product meeting around a coffee table
        id: "huddle", kind: "decor", base: 139, block: { x: 200, y: 128, w: 52, h: 12 },
        draw(t) {
          const CAT = [".f.....f.", ".ff...ff.", ".fffffff.", "fffffffff", "ffefffeff", "fbfffffbf", "ffffnffff", ".fffffff.", "..ff.ff.."];
          const BUN = [".fi...if.", ".fi...if.", ".fi...if.", ".ff...ff.", ".fffffff.", "fffffffff", "ffefffeff", "fbffnffbf", "fffffffff", ".fffffff.", "..ff.ff.."];
          const crew = [
            { rows: CAT, x: 214, y: 124, fur: "#f2a65a", ear: "#f2a65a" },   // ginger cat (back)
            { rows: BUN, x: 228, y: 120, fur: "#ffffff", ear: "#ffb3d1" },   // white rabbit (back)
            { rows: BUN, x: 202, y: 127, fur: "#c9a27e", ear: "#f4d2c0" },   // brown rabbit (left)
            { rows: CAT, x: 242, y: 129, fur: "#9aa0b4", ear: "#9aa0b4" },   // grey cat (right)
          ];
          // idea icons the speaker shows: bulb, ?, chart, !, heart
          const icons = [
            (x, y) => { circ(x + 2, y + 1.5, 2, "#ffd84d"); R(x + 1, y + 4, 3, 1, "#9aa0b4"); P(x + 1, y, "#fff6c4"); },
            (x, y) => text("?", x + 1, y, PM.TOM),
            (x, y) => { R(x, y + 3, 1, 2, PM.SAGED); R(x + 2, y + 1, 1, 4, PM.BUT); R(x + 4, y - 1, 1, 6, PM.TOM); },
            (x, y) => text("!", x + 1, y, PM.TOM),
            (x, y) => spr(SP.heart, x, y, { "#": "#ff6fa8" }),
          ];
          const beat = reduce ? 0 : Math.floor(t / 1.7);
          const talker = beat % crew.length;
          const draw = (c, k) => {
            const hop = !reduce && k === talker && Math.floor(t * 6) % 2 ? -1 : 0;
            const nod = !reduce && k !== talker && (Math.floor(t * 1.3 + k) % 4 === 0) ? 1 : 0;
            sprOutline(c.rows, c.x, c.y + hop + nod, { f: c.fur, i: c.ear, e: "#2f3346", n: "#ff8fb0", b: "#ffc2d1" }, "#5a5a9c");
          };
          // back row sits behind the table
          draw(crew[0], 0); draw(crew[1], 1);
          // coffee table: laptop + sticky notes
          for (let y = 0; y < 7; y++) { const w = Math.round(Math.sqrt(1 - ((y - 3) / 3.6) ** 2) * 14); R(226 - w, 132 + y, w * 2 + 1, 1, y === 0 ? PM.WOODL : PM.WOOD); }
          R(221, 139, 2, 5, PM.WOOD2); R(230, 139, 2, 5, PM.WOOD2);
          R(221, 128, 10, 5, PM.NAVY); R(222, 129, 8, 3, "#3b4466"); R(223, 130, 4, 1, PM.BUT); R(219, 133, 14, 1, "#c0c6d4");
          R(214, 134, 4, 3, "#ffe39a"); R(234, 133, 4, 3, "#ffc4d6"); R(236, 135, 4, 3, "#c9e6b5");
          draw(crew[2], 2); draw(crew[3], 3);
          // speech bubble over whoever is talking
          const c = crew[talker];
          const bx = c.x - 2, by = c.y - 11;
          R(bx, by, 11, 8, "#ffffff"); R(bx + 1, by - 1, 9, 1, "#ffffff"); R(bx + 1, by + 8, 9, 1, "#ffffff");
          R(bx + 4, by + 9, 2, 1, "#ffffff"); P(bx + 4, by + 10, "#ffffff");
          icons[beat % icons.length](bx + 3, by + 1);
        },
      },
    ],
  };

  const ROOMDEF = { ux: uxRoom, mkt: mkRoom, pm: pmRoom };
  const bgCache = {};
  function bgFor(id) {
    if (bgCache[id]) return bgCache[id];
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const prev = C; C = c.getContext("2d"); ROOMDEF[id].bg(); C = prev;
    return (bgCache[id] = c);
  }

  /* ═════════════════════ Tif ═════════════════════ */
  const SK = "#ffe9de", SKS = "#f6cdbf", HR = "#1f1b29", HRH = "#4a4260", EY = "#15111c", BL = "#ff98b8", MO = "#c9566f", WH = "#ffffff";
  const OUTFIT = {
    mkt: { hair: "long", top: "#ff86ba", topS: "#ef62a0", skirt: "#ff86ba", skirtS: "#ef62a0", sleeve: "#ff86ba", hem: WH, chest: "#2a1a26", sock: WH, shoe: "#3a2030", bow: "#ff4fa0", bowS: "#d43a85" },
    ux: { hair: "pig", top: WH, topS: "#e9e4f7", skirt: "#c3b2ff", skirtS: "#a996f0", sleeve: WH, hem: "#a996f0", bib: "#c3b2ff", sock: WH, shoe: "#7fd6b9", bow: "#2a2433", bowS: "#ff9ec4" },
    pm: { hair: "bun", top: "#d9ccff", topS: "#bfaef5", skirt: "#a8f0e0", skirtS: "#7fd8c6", sleeve: "#d9ccff", hem: "#ff9ed8", chest: "#7fe8ff", sock: WH, shoe: "#ff9ed8", band: "#ffffff", phones: "#ffb3e6", pencil: "#7fe8ff", space: true },
  };
  const tif = { x: 128, y: 126, vx: 0, vy: 0, dir: "down", walkT: 0, moving: false, pvx: 0, sway: 0, lastStep: 0,
    pig: [{ th: 0.05, w: 0 }, { th: 0.05, w: 0 }] };

  function drawTail(ax, ay, s, th) {
    let x = ax, y = ay; const N = 10;
    for (let i = 0; i < N; i++) {
      const a = 1.0 * Math.exp(-i / 1.6) + th * (0.25 + 0.75 * i / (N - 1));
      x += s * Math.sin(a) * 2; y += Math.cos(a) * 2;
      const rad = i < 3 ? 1.9 : i < 7 ? 1.6 : Math.max(0.6, 1.6 - (i - 6) * 0.35);
      circ(x, y, rad, HR);
      if (i === 1 || i === 4) P(Math.round(x - s), Math.round(y), HRH);
    }
  }
  function tieBow(x, y, c, k) {
    x = Math.round(x); y = Math.round(y);
    R(x - 3, y - 2, 2, 3, c); R(x + 2, y - 2, 2, 3, c); R(x - 1, y - 1, 3, 2, k); P(x - 1, y + 1, c); P(x + 1, y + 1, c);
  }
  function drawBun(cx, cy, o, flip, view) {
    if (o.space) {
      const one = (x, y) => { circ(x, y, 2.8, HR); P(x - 1, y - 2, HRH); P(x, y - 2, HRH); R(x - 2, y + 2, 5, 1, o.pencil); P(x + 2, y + 2, "#ffffff"); };
      if (view === "side") { one(cx + (flip ? 1 : -1), cy - 1); one(cx + (flip ? -4 : 4), cy - 2); }
      else { one(cx - 5, cy - 1); one(cx + 5, cy - 1); }
      return;
    }
    circ(cx, cy, 3.2, HR); P(cx - 1, cy - 2, HRH); P(cx, cy - 2, HRH);
    // pencil through the bun
    const d = flip ? -1 : 1;
    for (let k = -5; k <= 5; k++) P(cx + k * d, cy + Math.round(k * 0.45), k === 5 ? "#ffffff" : k === 4 ? "#c9f7fb" : k === -5 ? "#ff9ec4" : o.pencil);
  }

  function modelFor(oid) { return (who_model_override || models[oid] || 1); }
  let who_model_override = 0;
  function drawTif(t, who = tif, oid = outfitId, noShadow = false) {
    const o = OUTFIT[oid];
    const st = who.moving ? Math.floor(who.walkT * 9) % 4 : 0;
    const bobY = who.moving && st % 2 ? -1 : 0;
    const fx = Math.round(who.x), fy = Math.round(who.y);
    const L = fx - 8, T = fy - 27 + bobY;
    const view = who.dir === "up" ? "back" : who.dir === "down" ? "front" : "side";
    const flip = who.dir === "left";
    const r = (dx, dy, w, h, c) => R(flip ? L + 16 - dx - w : L + dx, T + dy, w, h, c);
    const ax = (dx) => (flip ? L + 16 - dx : L + dx);
    const blink = !reduce && ((t + (who.blinkOff || 0)) % 3.7) < 0.13;
    const s = who.sway;
    const pig = o.hair === "pig";
    const armC = o.hair === "bun" ? o.sleeve : SK;
    const mv = modelFor(oid);

    // shadow
    if (!noShadow) { C.globalAlpha = 0.16; R(fx - 6, fy, 12, 2, "#000"); C.globalAlpha = 1; }

    const legsFB = () => {
      const lu = st === 1 ? 1 : 0, ru = st === 3 ? 1 : 0;
      if (pig) { r(5, 22, 2, 3 - lu, SK); r(9, 22, 2, 3 - ru, SK); r(5, 25 - lu, 2, 1, o.sock); r(9, 25 - ru, 2, 1, o.sock); }
      else { r(5, 22, 2, 4 - lu, o.sock); r(9, 22, 2, 4 - ru, o.sock); }
      r(4, 26 - lu, 3, 1, o.shoe); r(9, 26 - ru, 3, 1, o.shoe);
    };
    const legsSide = () => {
      const legs = st === 1 ? [[9, 0], [5, 1]] : st === 3 ? [[5, 0], [9, 1]] : [[6, 0], [8, 0]];
      legs.forEach(([x, up]) => {
        if (pig) { r(x, 22, 2, 3 - up, SK); r(x, 25 - up, 2, 1, o.sock); } else r(x, 22, 2, 4 - up, o.sock);
        r(x, 26 - up, 3, 1, o.shoe);
      });
    };
    const skirtFB = () => {
      if (mv === 5) { r(3, 17, 10, 2, o.skirt); r(2, 19, 12, 2, o.skirt); r(2, 21, 12, 1, o.hem); r(2, 19, 1, 2, o.skirtS); }
      r(4, 17, 8, 2, o.skirt); r(3, 19, 10, 2, o.skirt); r(3, 21, 10, 1, o.hem);
      r(4, 17, 1, 2, o.skirtS); r(3, 19, 1, 2, o.skirtS);
      if (o.hair === "long") { for (let i = 0; i < 10; i += 2) r(3 + i, 22, 1, 1, WH); r(6, 19, 1, 2, o.skirtS); r(9, 19, 1, 2, o.skirtS); }
      if (o.hair === "bun") { r(5, 19, 1, 2, o.skirtS); r(8, 19, 1, 2, o.skirtS); r(11, 19, 1, 2, o.skirtS); }
      if (pig) { r(9, 19, 2, 1, "#ffffff"); }
    };
    // five arm/body models (pick one per outfit). All keep the arms tucked against the body.
    const SL = o.hair === "bun" ? 99 : 2;
    const armCol = (dx, top, bot, w, lift) => {
      bot -= lift;
      for (let y = top; y <= bot; y++) {
        let c = y - top < SL ? o.sleeve : SK;
        if (o.hair === "long" && y === top + 1) c = WH;
        if (o.hair === "bun" && y === bot - 1) c = o.topS;
        if (y === bot) c = SK;
        r(dx, y, w, 1, c);
      }
    };
    const lowC = o.hair === "bun" ? o.sleeve : SK;
    const clasp = () => {
      r(4, 14, 2, 2, o.sleeve); r(10, 14, 2, 2, o.sleeve);
      if (o.hair === "long") { r(4, 15, 2, 1, WH); r(10, 15, 2, 1, WH); }
      r(5, 16, 2, 1, lowC); r(9, 16, 2, 1, lowC);
      r(6, 17, 4, 1, SK); r(7, 17, 2, 1, SKS);
    };
    const caps = () => {
      r(4, 14, 1, 3, o.sleeve); r(11, 14, 1, 3, o.sleeve);
      if (o.hair === "long") { r(4, 16, 1, 1, WH); r(11, 16, 1, 1, WH); }
    };
    const armsFB = (back) => {
      const la = st === 1 ? 1 : 0, ra = st === 3 ? 1 : 0;
      if (mv === 2) { armCol(4, 14, 19, 1, la); armCol(11, 14, 19, 1, ra); }
      else if (mv === 3) { back ? caps() : clasp(); }
      else if (mv === 4) { back ? clasp() : caps(); }
      else if (mv === 5) {
        [[2, la], [12, ra]].forEach(([x, l]) => {
          r(x + (x < 8 ? 1 : 0), 14 - l, 1, 1, o.sleeve); r(x, 15 - l, 2, 2, o.sleeve);
          if (o.hair === "long") r(x, 16 - l, 2, 1, WH);
          r(x, 17 - l, 2, 1, SK);
        });
      } else {
        r(5, 13, 1, 1, o.sleeve); r(10, 13, 1, 1, o.sleeve);
        armCol(4, 14, 19, 2, la); armCol(10, 14, 19, 2, ra);
        if (armC === SK) { r(5, 16, 1, 3 - la, SKS); r(10, 16, 1, 3 - ra, SKS); }
      }
    };
    const tailsFB = () => { drawTail(L + 2, T + 2, -1, who.pig[0].th); drawTail(L + 14, T + 2, 1, who.pig[1].th); };
    const bowsFB = () => { tieBow(L + 2, T + 2, o.bow, o.bowS); tieBow(L + 14, T + 2, o.bow, o.bowS); };

    // ── behind-the-body layers
    if (view !== "back") {
      if (pig) {
        if (view === "front") tailsFB();
        else drawTail(ax(5), T + 2, flip ? 1 : -1, who.pig[0].th + 0.2);
      }
      if (o.hair === "bun") drawBun(view === "front" ? L + 8 : ax(6), T + 0, o, flip, view);
    }
    // marketing: shaggy wolf cut, shoulder length with flicked-out layers
    if (o.hair === "long" && view === "front") {
      r(1, 5, 14, 8, HR); r(0 + s, 8, 1, 5, HR); r(15 + s, 8, 1, 5, HR);
      r(1 + s, 13, 3, 2, HR); r(12 + s, 13, 3, 2, HR); r(0 + s, 14, 1, 1, HR); r(15 + s, 14, 1, 1, HR);
      r(2 + s, 15, 1, 1, HR); r(13 + s, 15, 1, 1, HR);
    }
    if (o.hair === "long" && view === "side") {
      r(2, 4, 7, 9, HR); r(1, 7, 1, 5, HR); r(2 - s, 13, 5, 1, HR); r(2 - s, 14, 2, 1, HR); r(5 - s, 14, 2, 1, HR); r(1 - s, 14, 1, 1, HR);
    }
    if (o.hair === "bun" && view === "front") r(2, 5, 12, 7, HR);

    if (view === "front") {
      legsFB(); skirtFB();
      if (mv === 5) { r(4, 13, 8, 4, o.top); r(4, 13, 1, 4, o.topS); } else { r(5, 13, 6, 4, o.top); r(5, 13, 1, 4, o.topS); }
      armsFB(false);
      if (o.hair === "long") { r(5, 13, 6, 1, WH); r(6, 14, 4, 1, o.chest); r(6, 15, 1, 1, o.chest); r(9, 15, 1, 1, o.chest); }
      if (pig) { r(6, 15, 4, 2, o.bib); r(6, 13, 1, 2, o.bib); r(9, 13, 1, 2, o.bib); r(7, 13, 2, 1, SK); P(ax(8), T + 16, "#ffffff"); }
      if (o.hair === "bun") { r(5, 13, 2, 1, WH); r(9, 13, 2, 1, WH); r(7, 13, 2, 2, o.chest); r(6, 16, 1, 1, o.topS); r(9, 15, 1, 1, o.topS); }
      // head
      r(3, 3, 10, 10, SK); r(2, 5, 12, 6, SK);
      if (o.hair === "long") {
        r(4, 0, 8, 1, HR); r(3, 1, 10, 1, HR); r(2, 2, 12, 3, HR); r(1, 3, 2, 9, HR); r(13, 3, 2, 9, HR);
        r(0, 6, 1, 1, HR); r(15, 6, 1, 1, HR); r(0, 9, 1, 2, HR); r(15, 9, 1, 2, HR); r(1, 12, 1, 1, HR); r(14, 12, 1, 1, HR);
        r(3, 5, 10, 1, HR); r(3, 6, 2, 1, HR); r(6, 6, 1, 1, HR); r(9, 6, 1, 1, HR); r(11, 6, 2, 1, HR); r(3, 7, 1, 1, HR); r(12, 7, 1, 1, HR);
      } else {
        const side = pig ? 9 : 8;
        r(3, 1, 10, 1, HR); r(2, 2, 12, 3, HR); r(1, 3, 2, side, HR); r(13, 3, 2, side, HR);
        r(3, 5, 10, 1, HR); r(3, 6, 2, 1, HR); r(7, 6, 2, 1, HR); r(11, 6, 2, 1, HR);
      }
      if (pig) { r(2, 11, 1, 2, HR); r(13, 11, 1, 2, HR); }
      P(L + 5, T + 2, WH); P(L + 11, T + 3, HRH); P(L + 4, T + 3, HRH);
      if (blink) { r(4, 9, 2, 1, EY); r(10, 9, 2, 1, EY); }
      else { r(4, 7, 2, 3, EY); r(10, 7, 2, 3, EY); P(L + 4, T + 7, WH); P(L + 10, T + 7, WH); }
      r(3, 10, 2, 1, BL); r(11, 10, 2, 1, BL); r(7, 11, 2, 1, MO);
      if (o.hair === "long") { r(4, -2, 3, 3, o.bow); r(9, -2, 3, 3, o.bow); r(7, -1, 2, 2, o.bowS); r(6, 1, 1, 1, o.bowS); r(9, 1, 1, 1, o.bowS); }
      if (pig) bowsFB();
      if (o.hair === "bun") { r(3, 0, 10, 1, o.band); r(2, 1, 1, 1, o.band); r(13, 1, 1, 1, o.band); r(1, 2, 1, 4, o.band); r(14, 2, 1, 4, o.band); r(0, 6, 2, 4, o.phones); r(14, 6, 2, 4, o.phones); P(L + 0, T + 7, "#7fe8ff"); P(L + 15, T + 7, "#7fe8ff"); }
    } else if (view === "back") {
      legsFB(); skirtFB();
      if (mv === 5) r(4, 13, 8, 4, o.top); else r(5, 13, 6, 4, o.top);
      r(3, 1, 10, 1, HR); r(2, 2, 12, 10, HR); r(3, 12, 10, 1, HR);
      if (o.hair === "long") {
        r(4, 0, 8, 1, HR); r(1, 5, 14, 8, HR); r(0, 8, 1, 4, HR); r(15, 8, 1, 4, HR);
        r(2 + s, 13, 12, 1, HR); r(2 + s, 14, 2, 1, HR); r(6 + s, 14, 4, 1, HR); r(12 + s, 14, 2, 1, HR); r(4 + s, 15, 1, 1, HR); r(11 + s, 15, 1, 1, HR);
        r(5, 4, 1, 8, HRH); r(10, 6, 1, 6, HRH);
        r(5, 18, 2, 2, o.bow); r(9, 18, 2, 2, o.bow); r(7, 18, 2, 2, o.bowS);
        r(4, -2, 3, 3, o.bow); r(9, -2, 3, 3, o.bow); r(7, -1, 2, 2, o.bowS);
      }
      armsFB(true);
      P(L + 5, T + 3, WH); P(L + 10, T + 6, HRH); P(L + 6, T + 9, HRH);
      if (pig) { tailsFB(); bowsFB(); }
      if (o.hair === "bun") { drawBun(L + 8, T + 0, o, false, "back"); r(1, 2, 1, 4, o.band); r(14, 2, 1, 4, o.band); r(0, 6, 2, 4, o.phones); r(14, 6, 2, 4, o.phones); }
    } else {
      legsSide();
      r(5, 17, 7, 2, o.skirt); r(4, 19, 9, 2, o.skirt); r(4, 21, 9, 1, o.hem);
      if (o.hair === "long") for (let i = 0; i < 9; i += 2) r(4 + i, 22, 1, 1, WH);
      if (mv === 5) r(5, 13, 7, 4, o.top); else r(6, 13, 5, 4, o.top);
      if (o.hair === "long") r(9, 13, 2, 1, WH);
      if (o.hair === "bun") r(10, 13, 1, 2, o.chest);
      const sw = st === 1 ? 1 : st === 3 ? -1 : 0;
      if (mv === 4) { r(5, 14, 2, 2, o.sleeve); r(4, 16, 2, 1, lowC); }
      else if (mv === 3) { r(7, 14, 2, 2, o.sleeve); if (o.hair === "long") r(7, 15, 2, 1, WH); r(9, 16, 2, 1, lowC); r(11, 17, 1, 1, SK); }
      else if (mv === 2) { r(8, 14, 1, 2, o.sleeve); r(8 + sw, 16, 1, 3, lowC); r(8 + sw, 19, 1, 1, SK); }
      else if (mv === 5) { r(8, 14, 2, 1, o.sleeve); r(7 + sw, 15, 3, 2, o.sleeve); if (o.hair === "long") r(7 + sw, 16, 3, 1, WH); r(7 + sw, 17, 3, 1, SK); }
      else {
        r(7, 14, 2, 2, o.sleeve); if (o.hair === "long") r(7, 15, 2, 1, WH);
        r(7 + sw, 16, 2, 3, lowC); if (o.hair === "bun") r(7 + sw, 18, 2, 1, o.topS); r(7 + sw, 19, 2, 1, SK);
      }
      // head
      r(4, 3, 10, 10, SK); r(13, 5, 2, 6, SK);
      r(4, 1, 9, 1, HR); r(3, 2, 11, 3, HR); r(2, 3, 7, 9, HR); r(3, 12, 3, 1, HR);
      r(9, 5, 6, 1, HR); r(10, 6, 2, 1, HR); r(14, 6, 1, 1, HR);
      P(ax(6), T + 2, WH); P(ax(4), T + 6, HRH);
      if (o.hair === "bun") { r(7, 7, 2, 3, SK); P(ax(8), T + 8, SKS); }
      if (blink) r(10, 9, 2, 1, EY); else { r(10, 7, 2, 3, EY); P(ax(10) - (flip ? 1 : 0), T + 7, WH); }
      r(11, 10, 2, 1, BL); r(13, 11, 1, 1, MO);
      if (o.hair === "long") { r(5, 0, 5, 1, HR); r(13, 7, 1, 1, HR); r(5, -2, 2, 3, o.bow); r(9, -2, 2, 3, o.bow); r(7, -1, 2, 2, o.bowS); }
      if (pig) tieBow(ax(5) + (flip ? -1 : 0), T + 2, o.bow, o.bowS);
      if (o.hair === "bun") { r(6, 0, 3, 1, o.band); r(7, 1, 1, 5, o.band); r(6, 6, 3, 4, o.phones); P(ax(7) - (flip ? 1 : 0), T + 6, "#7fe8ff"); }
    }
  }

  /* ── Tif style B: ink outline + soft tonal ramp per room (reference style) ── */
  const RAMP = {
    ux: ["#34313f", "#6b667c", "#a6a0ba", "#d9d5e6", "#f6f4fa", "#e2b3c9"],
    mkt: ["#3c2f36", "#7d636d", "#c2a3ae", "#ecd8df", "#fbf4f6", "#eba3b8"],
    pm: ["#33362e", "#6d7162", "#a8ac97", "#d8dbca", "#f3f4ec", "#d9ad9c"],
  };
  const toRGB = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const RAMP_RGB = {}; for (const k in RAMP) RAMP_RGB[k] = RAMP[k].map(toRGB);
  const keyOf = (h) => { const [r, g, b] = toRGB(h); return (r << 16) | (g << 8) | b; };
  const EXACT = { [keyOf(EY)]: 0, [keyOf(HR)]: 1, [keyOf(HRH)]: 2, [keyOf(BL)]: 5, [keyOf(MO)]: 1 };
  const OFF = document.createElement("canvas"); OFF.width = 40; OFF.height = 48;
  const offc = OFF.getContext("2d", { willReadFrequently: true });
  const OUTLINE = { ux: [46, 42, 61], mkt: [58, 36, 49], pm: [74, 68, 128] };
  function stylize(oid) {
    const img = offc.getImageData(0, 0, 40, 48), d = img.data, ink = OUTLINE[oid] || OUTLINE.pm;
    const n = 40 * 48, solid = new Uint8Array(n);
    for (let i = 0; i < n; i++) solid[i] = d[i * 4 + 3] >= 128 ? 1 : 0;
    for (let i = 0; i < n; i++) {
      const o = i * 4, x = i % 40, y = (i / 40) | 0;
      if (solid[i]) {
        // soft shade on the lower-right edges for volume (like the CD Player pets)
        const edge = (x < 39 && !solid[i + 1]) || (y < 47 && !solid[i + 40]);
        if (edge) { d[o] = d[o] * 0.86; d[o + 1] = d[o + 1] * 0.86; d[o + 2] = d[o + 2] * 0.9; }
        d[o + 3] = 255;
        continue;
      }
      if ((x > 0 && solid[i - 1]) || (x < 39 && solid[i + 1]) || (y > 0 && solid[i - 40]) || (y < 47 && solid[i + 40])) {
        d[o] = ink[0]; d[o + 1] = ink[1]; d[o + 2] = ink[2]; d[o + 3] = 255;
      } else d[o + 3] = 0;
    }
    offc.putImageData(img, 0, 0);
  }
  // draws Tif in either style, at 1x or scaled, onto any canvas context
  function drawTifAny(t, who = tif, oid = outfitId, style = tifStyle, scale = 1, target = ctx) {
    const fx = Math.round(who.x), fy = Math.round(who.y), prev = C;
    target.globalAlpha = 0.16; target.fillStyle = "#000"; target.fillRect(fx - 6 * scale, fy, 12 * scale, 2 * scale); target.globalAlpha = 1;
    C = offc; offc.clearRect(0, 0, 40, 48);
    drawTif(t, Object.assign({}, who, { x: 20, y: 44 }), oid, true);
    if (style === "b") stylize(oid);
    C = prev;
    target.imageSmoothingEnabled = false;
    target.drawImage(OFF, 0, 0, 40, 48, fx - 20 * scale, fy - 44 * scale, 40 * scale, 48 * scale);
  }

  /* ═════════════════════ state ═════════════════════ */
  let roomId = ORDER[0];
  let models = { ux: 1, mkt: 1, pm: 1 };
  if (typeof opts.tifModel === "number") models = { ux: opts.tifModel, mkt: opts.tifModel, pm: opts.tifModel };
  else if (opts.tifModel && typeof opts.tifModel === "object") models = Object.assign(models, opts.tifModel);
  let stage = "loading", menuOn = opts.picker !== false, tifStyle = opts.tifStyle === "a" ? "a" : "b";
  let loadT = 0, fontsReady = !(document.fonts && document.fonts.ready), menuSel = 0, menuT = 1, flash = 0;
  const LOAD_MIN = reduce ? 0.5 : 2.2;
  if (!fontsReady) document.fonts.ready.then(() => { fontsReady = true; });
  {
    const h = (location.hash || "").replace("#", "").toLowerCase();
    const hit = ORDER.find((id) => ROOMS[id].hash === h || id === h);
    if (hit) { roomId = hit; menuOn = false; }
    if (opts.initialRoom && ROOMS[opts.initialRoom]) roomId = opts.initialRoom;
  }
  let outfitId = roomId;
  let target = null, pending = null, near = null, hover = null, cardObj = null;
  let trans = null, afterTrans = null, stuckT = 0, music = false, mounted = false;
  const pet = { x: 112, y: 130, moving: false, walkT: 0, inWheel: false, hopT: 0, trail: [] };
  let wheelAng = 0;
  const WHEEL_X = 60;
  const PET_OBJ = { id: "pet", kind: "pet", hit: { x: 0, y: 0, w: 0, h: 0 } };
  const keys = {};
  const parts = [];
  let sayTimer = 0;

  const objs = () => ROOMDEF[roomId].objects;
  const item = (o) => ITEMS[roomId + "." + o.id];
  const interactive = () => objs().filter((o) => o.kind !== "decor");

  function blocks() { return objs().filter((o) => o.block).map((o) => o.block); }
  function free(x, y) {
    if (x < MIN_X || x > MAX_X || y < MIN_Y || y > MAX_Y) return false;
    for (const b of blocks()) if (x + 3 > b.x && x - 3 < b.x + b.w && y > b.y && y - 2 < b.y + b.h) return false;
    return true;
  }

  /* ═════════════════════ UI wiring ═════════════════════ */
  function applyRoom() {
    const rm = ROOMS[roomId], th = rm.theme;
    for (const k in th) root.style.setProperty("--ph-" + k, th[k]);
    root.dataset.room = roomId;
    root.querySelectorAll(".ph-tab").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.room === roomId)));
    tagEl.textContent = `ROOM ${ORDER.indexOf(roomId) + 1}/${ORDER.length} · ${rm.title}`;
    cv.setAttribute("aria-label", `${rm.title}: a pixel room with Tif. Use the list below the room to open each item.`);
    dockItems.innerHTML = interactive().filter((o) => o.kind !== "door").map((o) => `<button class="ph-item" data-obj="${o.id}">${esc(item(o).label)}</button>`).join("");
    if (syncHash && mounted && history.replaceState) history.replaceState(null, "", "#" + rm.hash);
    window.dispatchEvent(new CustomEvent("pixelhome:room", { detail: { id: roomId, accent: th.accent, theme: th } }));
    opts.onRoomChange && opts.onRoomChange(roomId, th);
    srEl.textContent = rm.title;
  }

  function say(msg, ms = 5200) {
    sayEl.querySelector("p").textContent = msg;
    sayEl.hidden = false; sayTimer = ms / 1000;
  }

  function goRoom(id, entry) {
    if (trans || !ROOMS[id]) return;
    if (id === roomId && entry === "tab" && stage === "room") return;
    closeCard(true);
    trans = { t: 0, id, entry, swapped: false, fromMenu: stage === "menu" };
    target = null; pending = null;
  }

  function burst(x, y, n = 18) {
    if (reduce) return;
    const th = ROOMS[roomId].theme;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      parts.push({ x, y, vx: Math.cos(a) * (30 + Math.random() * 30), vy: Math.sin(a) * (24 + Math.random() * 22) - 10, life: 0.9, max: 0.9, kind: i % 3 ? "dot" : "spark", c: i % 2 ? "#ffffff" : th.accent });
    }
  }

  function walkTo(o, open = true) {
    target = { x: o.spot.x, y: o.spot.y }; pending = open ? o : null; stuckT = 0;
    sayEl.hidden = true;
  }

  function cardHTML(o) {
    const it = item(o);
    const list = interactive().filter((x) => x.kind !== "door");
    const i = list.indexOf(o);
    const fullId = "work-" + roomId + "-" + o.id;
    const hasFull = !!document.getElementById(fullId);
    const imgs = it.imgs || [];
    // one cover picture up top; the full gallery lives in the project section below
    const cover = imgs.length && !it.grid
      ? `<button class="ph-cover"${hasFull ? ` data-more="${fullId}"` : ""} aria-label="${hasFull ? `See all ${imgs.length} images in the full project` : esc(it.title)}">
          <img src="${esc(imgs[0])}" alt="" loading="lazy" decoding="async">
          ${imgs.length > 1 && hasFull ? `<span class="ph-count">+${imgs.length - 1} MORE ↓</span>` : ""}
        </button>`
      : "";
    return `
      <div class="ph-win-bar"><span class="ph-win-file">${esc(it.file)}</span>
        <span class="ph-win-btns" aria-hidden="true"><i>_</i><i>□</i></span>
        <button class="ph-x" aria-label="Close">✕</button></div>
      ${cover}
      <div class="ph-win-body">
        ${it.notif ? `<div class="ph-notif"><b>BeReal.</b> ${esc(it.notif)}</div>` : ""}
        <p class="ph-kicker">${esc(it.kicker)}</p>
        <h3 id="ph-card-title">${esc(it.title)}</h3>
        ${it.stats && it.stats.length ? `<div class="ph-stats">${it.stats.map((s) => `<span>${esc(s)}</span>`).join("")}</div>` : ""}
        <p class="ph-blurb">${esc(it.blurb)}</p>
        ${it.bullets && it.bullets.length ? `<ul>${it.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}
        ${it.sprites && it.sprites.length ? `<div class="ph-lineup">${it.sprites.map((sp, i) => `<figure><canvas data-sprite="${esc(sp.id)}" aria-hidden="true"></canvas><figcaption>${esc(sp.label || "plush " + (i + 1))}</figcaption></figure>`).join("")}</div>` : ""}
        ${it.grid && imgs.length ? `<div class="ph-imgs is-grid">${imgs.map((src) => `<img src="${esc(src)}" alt="" loading="lazy" decoding="async">`).join("")}</div>` : ""}
        <div class="ph-links">
          ${hasFull ? `<button class="ph-btn ph-more" data-more="${fullId}">FULL PROJECT ↓</button>` : ""}
          ${it.music && internalMusic ? `<button class="ph-btn ph-music-in">${music ? "❚❚ PAUSE MUSIC" : "♪ PLAY MUSIC"}</button>` : ""}
          ${(it.links || []).map((l) => `<a class="ph-btn" href="${esc(l.href)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}</a>`).join("")}
        </div>
      </div>
      <div class="ph-win-foot">
        <button class="ph-nav" data-nav="-1">◂ PREV</button>
        <span>${i + 1} / ${list.length}</span>
        <button class="ph-nav" data-nav="1">NEXT ▸</button>
      </div>`;
  }

  let lastFocus = null;
  function openCard(o, { walk = false } = {}) {
    if (!o || o.kind === "door" || o.kind === "decor") return;
    const it = item(o); if (!it) return;
    if (!cardObj) lastFocus = document.activeElement;
    cardObj = o;
    win.innerHTML = cardHTML(o);
    win.querySelectorAll(".ph-imgs img").forEach((img) => img.addEventListener("error", () => {
      const box = img.parentElement; img.remove(); if (box && !box.children.length) box.remove();
    }));
    const coverImg = win.querySelector(".ph-cover img");
    if (coverImg) coverImg.addEventListener("error", () => coverImg.closest(".ph-cover").remove());
    win.querySelectorAll("canvas[data-sprite]").forEach((c) => {
      const sp = PLUSH[c.dataset.sprite]; if (!sp) return;
      c.width = sp.rows[0].length + 2; c.height = sp.rows.length + 2;
      const prev = C; C = c.getContext("2d"); sprOutline(sp.rows, 1, 1, sp.pal, sp.oc); C = prev;
      c.style.width = c.width * (win.querySelectorAll("canvas[data-sprite]").length === 1 ? 7 : 4) + "px";
    });
    modal.hidden = false;
    tipEl.hidden = true;
    if (walk) walkTo(o, false);
    if (it.music && internalMusic && !music) setMusic(true);
    win.querySelector(".ph-x").focus({ preventScroll: true });
    srEl.textContent = "Opened " + it.title;
    for (let i = 0; i < 6 && !reduce; i++) parts.push({ x: o.spot.x + (Math.random() * 16 - 8), y: o.spot.y - 30, vx: Math.random() * 20 - 10, vy: -20 - Math.random() * 20, life: 1, max: 1, kind: roomId === "pm" ? "note" : roomId === "mkt" ? "heart" : "spark", c: ROOMS[roomId].theme.accent });
  }
  function closeCard(silent) {
    if (!cardObj) return;
    cardObj = null; modal.hidden = true; win.innerHTML = "";
    if (!silent) (lastFocus && lastFocus.focus ? lastFocus : cv).focus({ preventScroll: true });
  }

  /* ═════════════════════ music: original xylophone tune (~100 BPM, F# major) ═════════════════════ */
  let actx = null, master = null, mTimer = null, nextT = 0, stepN = 0;
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  // 8 bars of eighth notes; 0 = rest. Chords: F# · C# · D#m · B, twice.
  const MEL = [
    78, 0, 82, 85, 82, 0, 78, 80,   80, 0, 85, 0, 80, 78, 75, 0,
    75, 78, 82, 0, 85, 82, 80, 78,  80, 0, 0, 82, 78, 0, 0, 0,
    85, 0, 82, 85, 87, 0, 85, 82,   80, 82, 80, 77, 73, 0, 0, 0,
    75, 0, 78, 82, 87, 85, 82, 80,  78, 80, 82, 85, 90, 0, 0, 0,
  ];
  const ROOTS = [54, 49, 51, 47];
  const CHORDS = [[66, 70, 73], [61, 65, 68], [63, 66, 70], [59, 63, 66]];
  function bar(m, t0, vol, len = 0.55) {
    // xylophone: bright sine with a 3x overtone that dies fast, plus a tiny wooden click
    const f = hz(m), g = actx.createGain(), o1 = actx.createOscillator(), o2 = actx.createOscillator(), g2 = actx.createGain();
    o1.type = "sine"; o1.frequency.value = f; o2.type = "sine"; o2.frequency.value = f * 3;
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
    g2.gain.setValueAtTime(0.0001, t0); g2.gain.exponentialRampToValueAtTime(vol * 0.45, t0 + 0.003); g2.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.09);
    o1.connect(g); o2.connect(g2); g.connect(master); g2.connect(master);
    o1.start(t0); o2.start(t0); o1.stop(t0 + len + 0.05); o2.stop(t0 + 0.12);
  }
  function tick(t0, vol) {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = "triangle"; o.frequency.value = 1900;
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.04);
    o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + 0.06);
  }
  function schedule() {
    const STEP = 0.3; // eighth note at 100 BPM
    while (nextT < actx.currentTime + 0.3) {
      const i = stepN % MEL.length, b8 = Math.floor(i / 8) % 4, beat = i % 8;
      const swing = beat % 2 ? 0.035 : 0;
      if (MEL[i]) bar(MEL[i], nextT + swing, 0.16);
      if (beat === 0 || beat === 4) bar(ROOTS[b8], nextT, 0.13, 0.7);
      if (beat === 2 || beat === 6) CHORDS[b8].forEach((n, k) => bar(n, nextT + k * 0.025, 0.045, 0.4));
      if (beat % 2 === 1) tick(nextT + swing, 0.03);
      nextT += STEP; stepN++;
    }
  }
  function setMusic(on) {
    if (on === music) return;
    music = on;
    if (musicBtn) { musicBtn.setAttribute("aria-pressed", String(on)); musicBtn.querySelector("span").textContent = on ? "ON" : "OFF"; }
    const inBtn = win.querySelector(".ph-music-in"); if (inBtn) inBtn.textContent = on ? "❚❚ PAUSE MUSIC" : "♪ PLAY MUSIC";
    window.dispatchEvent(new CustomEvent("pixelhome:music", { detail: { playing: on } }));
    if (!internalMusic) return;
    try {
      if (on) {
        actx = actx || new (window.AudioContext || window.webkitAudioContext)();
        actx.resume();
        master = actx.createGain(); master.gain.value = 0.0001;
        const lp = actx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 6000;
        master.connect(lp); lp.connect(actx.destination);
        master.gain.exponentialRampToValueAtTime(0.7, actx.currentTime + 0.4);
        nextT = actx.currentTime + 0.05; stepN = 0;
        mTimer = setInterval(schedule, 60);
      } else if (actx && master) {
        clearInterval(mTimer); mTimer = null;
        const m = master; m.gain.cancelScheduledValues(actx.currentTime);
        m.gain.setValueAtTime(m.gain.value, actx.currentTime); m.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 0.4);
        setTimeout(() => m.disconnect(), 600);
      }
    } catch (e) { /* audio unavailable */ }
  }

  /* ═════════════════════ input ═════════════════════ */
  const toLogical = (e) => {
    const b = cv.getBoundingClientRect();
    return { x: ((e.clientX - b.left) / b.width) * W, y: ((e.clientY - b.top) / b.height) * H };
  };
  function hitTest(p) {
    if (!pet.inWheel && Math.abs(p.x - pet.x) <= 8 && p.y >= pet.y - 12 && p.y <= pet.y + 2) {
      PET_OBJ.hit = { x: Math.round(pet.x) - 7, y: Math.round(pet.y) - 11, w: 14, h: 12 };
      return PET_OBJ;
    }
    const list = objs().filter((o) => o.hit);
    const floor = list.filter((o) => o.kind === "floor").sort((a, b) => b.base - a.base);
    const rest = list.filter((o) => o.kind !== "floor");
    for (const o of [...floor, ...rest]) { const h = o.hit; if (p.x >= h.x && p.x <= h.x + h.w && p.y >= h.y && p.y <= h.y + h.h) return o; }
    return null;
  }
  const label = (o) => (o.kind === "door" ? "→ " + o.label : o.kind === "pet" ? "NomNom mascot ♡ click to pet" : item(o).label);
  function onMove(e) {
    if (cardObj || trans || stage !== "room") return;
    const p = toLogical(e), o = hitTest(p);
    hover = o;
    cv.style.cursor = o ? "pointer" : p.y > FLOOR ? "crosshair" : "default";
    if (o && !coarse) {
      tipEl.textContent = label(o);
      tipEl.style.left = ((o.hit.x + o.hit.w / 2) / W) * 100 + "%";
      tipEl.style.top = (Math.max(o.hit.y - 2, 4) / H) * 100 + "%";
      tipEl.hidden = false;
    } else tipEl.hidden = true;
  }
  function onLeave() { hover = null; tipEl.hidden = true; }
  function petPet() {
    pet.hopT = 0.35;
    for (let i = 0; i < 6 && !reduce; i++) parts.push({ x: pet.x + (Math.random() * 10 - 5), y: pet.y - 10, vx: Math.random() * 16 - 8, vy: -18 - Math.random() * 14, life: 1, max: 1, kind: "heart", c: i % 2 ? "#ff8fbf" : "#ffffff" });
    say("that's NomNom's mascot! it follows me everywhere. its wheel is in the PM room ♪", 4200);
  }
  function onClick(e) {
    if (trans || stage !== "room") return;
    const p = toLogical(e), o = hitTest(p);
    cv.focus({ preventScroll: true });
    if (o && o.kind === "pet") { petPet(); return; }
    if (o) { walkTo(o, true); return; }
    if (p.y > FLOOR) { target = { x: Math.max(MIN_X, Math.min(MAX_X, p.x)), y: Math.max(MIN_Y, Math.min(MAX_Y, p.y + 4)) }; pending = null; stuckT = 0; sayEl.hidden = true; }
  }
  let stageVisible = true;
  const io = "IntersectionObserver" in window ? new IntersectionObserver(([en]) => { stageVisible = en.intersectionRatio > 0.35; }, { threshold: [0, 0.35, 1] }) : null;
  io && io.observe(cv);
  const KEYMAP = { ArrowLeft: "l", a: "l", A: "l", ArrowRight: "r", d: "r", D: "r", ArrowUp: "u", w: "u", W: "u", ArrowDown: "d", s: "d", S: "d" };
  function typing() { const a = document.activeElement; return a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA" || a.isContentEditable); }
  function onKey(e) {
    if (typing()) return;
    if (stage === "loading") return;
    if (stage === "menu") {
      if (!stageVisible || trans) return;
      if (["ArrowDown", "ArrowRight", "s", "S", "d", "D"].includes(e.key)) { e.preventDefault(); setSel(menuSel + 1, true); }
      else if (["ArrowUp", "ArrowLeft", "w", "W", "a", "A"].includes(e.key)) { e.preventDefault(); setSel(menuSel - 1, true); }
      else if (["1", "2", "3"].includes(e.key) && ORDER[+e.key - 1]) { e.preventDefault(); choose(ORDER[+e.key - 1]); }
      else if ((e.key === "Enter" || e.key === " ") && !(document.activeElement && document.activeElement.classList.contains("ph-cd-opt"))) { e.preventDefault(); choose(ORDER[menuSel]); }
      return;
    }
    if (cardObj) {
      if (e.key === "Escape") { e.preventDefault(); closeCard(); }
      if (e.key === "ArrowRight") { e.preventDefault(); navCard(1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); navCard(-1); }
      if (e.key === "Tab") trapTab(e);
      return;
    }
    if (!stageVisible) return;
    const k = KEYMAP[e.key];
    if (k) { e.preventDefault(); keys[k] = true; sayEl.hidden = true; return; }
    if (["1", "2", "3"].includes(e.key) && ORDER[+e.key - 1]) { goRoom(ORDER[+e.key - 1], "tab"); return; }
    const onControl = document.activeElement && document.activeElement !== cv && /^(BUTTON|A|INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName);
    if ((e.key === "e" || e.key === "E" || (e.key === "Enter" && !onControl)) && near) { e.preventDefault(); openCard(near); }
  }
  function onKeyUp(e) { const k = KEYMAP[e.key]; if (k) keys[k] = false; }
  function trapTab(e) {
    const f = [...win.querySelectorAll("button, a[href]")];
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function navCard(d) {
    const list = interactive().filter((x) => x.kind !== "door");
    const i = list.indexOf(cardObj);
    openCard(list[(i + d + list.length) % list.length], { walk: true });
  }
  function onRootClick(e) {
    const t = e.target.closest("button, a");
    if (!t || !root.contains(t)) { return; }
    if (t.dataset.pick) { choose(t.dataset.pick); return; }
    if (t.classList.contains("ph-tab")) goRoom(t.dataset.room, "tab");
    else if (t.classList.contains("ph-item")) { const o = objs().find((x) => x.id === t.dataset.obj); openCard(o, { walk: true }); }
    else if (t.classList.contains("ph-x")) closeCard();
    else if (t.dataset.more) { const el = document.getElementById(t.dataset.more); closeCard(true); if (el) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); }
    else if (t.classList.contains("ph-nav")) navCard(+t.dataset.nav);
    else if (t.classList.contains("ph-music") || t.classList.contains("ph-music-in")) setMusic(!music);
    else if (t.classList.contains("ph-prompt")) { near && openCard(near); }
    else if (t.dataset.news != null) {
      const n = PROFILE.news[+t.dataset.news];
      const open = () => { const o = objs().find((x) => x.id === n.obj); openCard(o, { walk: true }); };
      if (stage === "loading" || trans) return;
      if (stage === "menu") { afterTrans = open; choose(n.room); }
      else if (n.room === roomId) open(); else { afterTrans = open; goRoom(n.room, "tab"); }
    }
  }
  function onModalBg(e) { if (e.target === modal) closeCard(); }
  function onBlur() { for (const k in keys) keys[k] = false; }

  // the sections below the hero talk to the room through this event
  function onGoto(e) {
    const d = e.detail || {}; if (!ROOMS[d.room]) return;
    if (d.quiet) {
      if (stage === "menu") setSel(ORDER.indexOf(d.room));
      else if (stage === "room" && !stageVisible && !trans && d.room !== roomId) {
        closeCard(true); roomId = d.room; outfitId = roomId; parts.length = 0;
        tif.x = 128; tif.y = 126; tif.dir = "down"; pet.trail = []; pet.inWheel = false; pet.x = 114; pet.y = 129;
        applyRoom();
      }
      return;
    }
    const open = () => { const o = d.obj && objs().find((x) => x.id === d.obj); if (o) openCard(o, { walk: true }); };
    if (stage === "loading") return;
    if (stage === "menu") { afterTrans = open; choose(d.room); }
    else if (d.room === roomId) open(); else { afterTrans = open; goRoom(d.room, "tab"); }
  }
  window.addEventListener("pixelhome:goto", onGoto);
  cv.addEventListener("pointermove", onMove);
  cv.addEventListener("pointerleave", onLeave);
  cv.addEventListener("click", onClick);
  root.addEventListener("click", onRootClick);
  modal.addEventListener("click", onModalBg);
  window.addEventListener("keydown", onKey);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);

  /* ═════════════════════ loop ═════════════════════ */
  function update(dt, t) {
    if (flash > 0) flash = Math.max(0, flash - dt);
    menuT += dt;
    if (stage === "loading") { loadT += dt; if (loadT >= LOAD_MIN && fontsReady) finishLoading(); }
    // room transition
    if (trans) {
      trans.t += dt;
      const half = reduce ? 0.05 : 0.24;
      if (!trans.swapped && trans.t >= half) {
        trans.swapped = true;
        const from = roomId; roomId = trans.id; outfitId = roomId;
        const fi = ORDER.indexOf(from), ti = ORDER.indexOf(roomId);
        if (trans.entry === "door") { tif.x = ti > fi ? 24 : 232; tif.y = 104; tif.dir = ti > fi ? "right" : "left"; }
        else { tif.x = 128; tif.y = 126; tif.dir = "down"; }
        parts.length = 0;
        if (stage === "menu") { stage = "room"; root.dataset.stage = "room"; menuEl.hidden = true; cv.focus({ preventScroll: true }); }
        pet.trail = []; pet.inWheel = false;
        pet.x = Math.max(12, Math.min(244, tif.x + (tif.dir === "right" ? -14 : 14))); pet.y = Math.min(MAX_Y, tif.y + 3);
        applyRoom();
        burst(tif.x, tif.y - 14, 22);
        say(ROOMS[roomId].greet, 4800);
      }
      if (trans.t >= half * 2) { trans = null; if (afterTrans) { const f = afterTrans; afterTrans = null; f(); } }
    }

    // movement
    let ix = (keys.r ? 1 : 0) - (keys.l ? 1 : 0), iy = (keys.d ? 1 : 0) - (keys.u ? 1 : 0);
    let vx = 0, vy = 0;
    if ((cardObj && !target) || stage !== "room") { ix = iy = 0; }
    if ((ix || iy) && !trans) { target = null; pending = null; const l = Math.hypot(ix, iy); vx = (ix / l) * SPEED; vy = (iy / l) * SPEED; }
    else if (target && !trans) {
      const dx = target.x - tif.x, dy = target.y - tif.y, d = Math.hypot(dx, dy);
      if (d < 1.5) {
        tif.x = target.x; tif.y = target.y; target = null;
        if (pending) {
          const o = pending; pending = null;
          tif.dir = o.face || "up";
          if (o.kind === "door") goRoom(o.to, "door"); else openCard(o);
        }
      } else { const sp = Math.min(SPEED, d / dt); vx = (dx / d) * sp; vy = (dy / d) * sp; }
    }
    const ox = tif.x, oy = tif.y;
    const clampX = (v) => Math.max(MIN_X, Math.min(MAX_X, v)), clampY = (v) => Math.max(MIN_Y, Math.min(MAX_Y, v));
    if (vx) { const nx = clampX(tif.x + vx * dt); if (free(nx, tif.y)) tif.x = nx; }
    if (vy) { const ny = clampY(tif.y + vy * dt); if (free(tif.x, ny)) tif.y = ny; }
    const moved = Math.hypot(tif.x - ox, tif.y - oy);
    tif.moving = moved > 0.01;
    tif.vx = (tif.x - ox) / Math.max(dt, 1e-3);
    if (Math.abs(vx) > 0.1 || Math.abs(vy) > 0.1) {
      if (Math.abs(vx) >= Math.abs(vy)) tif.dir = vx > 0 ? "right" : "left"; else tif.dir = vy > 0 ? "down" : "up";
    }
    if (tif.moving) tif.walkT += dt; else tif.walkT = 0;
    if (target && moved < 0.05) {
      stuckT += dt;
      if (stuckT > 0.35) {
        const o = pending; target = null; pending = null;
        if (o && Math.hypot(o.spot.x - tif.x, o.spot.y - tif.y) < 30) { if (o.kind === "door") goRoom(o.to, "door"); else { tif.dir = o.face || "up"; openCard(o); } }
      }
    } else stuckT = 0;

    // walk-through doors at the edges
    if (!trans && (keys.l || keys.r)) {
      const di = ORDER.indexOf(roomId);
      if (keys.l && tif.x <= MIN_X + 1 && di > 0) goRoom(ORDER[di - 1], "door");
      if (keys.r && tif.x >= MAX_X - 1 && di < ORDER.length - 1) goRoom(ORDER[di + 1], "door");
    }

    // hair physics
    const ax = (tif.vx - tif.pvx) / Math.max(dt, 1e-3); tif.pvx = tif.vx;
    const step = tif.moving ? Math.floor(tif.walkT * 9) : -1;
    const kick = step !== tif.lastStep && step >= 0 && step % 2 === 1; tif.lastStep = step;
    [[0, -1], [1, 1]].forEach(([i, sgn]) => {
      const p = tif.pig[i];
      const tgt = 0.05 - Math.max(-75, Math.min(75, tif.vx)) * sgn * 0.0045;
      const acc = -52 * (p.th - tgt) - 5.5 * p.w - Math.max(-5000, Math.min(5000, ax)) * sgn * 0.0024;
      p.w += acc * dt; if (kick && !reduce) p.w += 1.1; p.th += p.w * dt;
      p.th = Math.max(-0.45, Math.min(1.05, p.th));
    });
    const swTarget = Math.max(-1, Math.min(1, Math.round(-tif.vx / 40)));
    tif.sway = reduce ? 0 : swTarget;

    updatePet(dt);
    wheelAng += dt * (pet.inWheel && !reduce ? 7 : 0);

    // proximity
    let best = null, bd = 14;
    for (const o of interactive()) { if (o.kind === "door") continue; const d = Math.hypot(o.spot.x - tif.x, o.spot.y - tif.y); if (d < bd) { bd = d; best = o; } }
    if (best !== near) {
      near = best;
      if (near && !cardObj) { promptEl.textContent = (coarse ? "TAP ▸ " : "E / ENTER ▸ ") + item(near).label; promptEl.hidden = false; }
      else promptEl.hidden = true;
    }
    if (cardObj || stage !== "room") promptEl.hidden = true; else if (near) promptEl.hidden = false;
    if (!promptEl.hidden) {
      promptEl.style.left = (Math.max(40, Math.min(W - 40, tif.x)) / W) * 100 + "%";
      promptEl.style.top = ((tif.y - 34) / H) * 100 + "%";
    }

    // say timer
    if (!sayEl.hidden) { sayTimer -= dt; if (sayTimer <= 0) sayEl.hidden = true; }

    // particles
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; p.life -= dt; if (p.life <= 0) { parts.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.94; p.vy *= 0.94;
    }
    // ambient particles
    if (!reduce && Math.random() < dt * (roomId === "pm" ? (music ? 2.2 : 0) : 0.7)) {
      if (roomId === "pm") parts.push({ x: 128 + Math.random() * 14, y: 58, vx: Math.random() * 10 - 5, vy: -14, life: 2, max: 2, kind: "note", c: ["#e0523b", "#fff3dc", "#f6c85f"][Math.floor(Math.random() * 3)] });
      else if (roomId === "mkt") parts.push({ x: 196 + Math.random() * 26, y: 70, vx: Math.random() * 6 - 3, vy: -9, life: 2.2, max: 2.2, kind: "heart", c: Math.random() < 0.5 ? "#ff4fa0" : "#ffffff" });
      else parts.push({ x: 20 + Math.random() * 216, y: 84, vx: 0, vy: -6, life: 2.4, max: 2.4, kind: "dot", c: ["#c9b8ff", "#a8e6cf", "#ffc6b3", "#bfe0ff"][Math.floor(Math.random() * 4)] });
    }
  }

  function updatePet(dt) {
    if (pet.hopT > 0) pet.hopT -= dt;
    const tr = pet.trail, lp = tr[tr.length - 1];
    if (!lp || Math.hypot(lp.x - tif.x, lp.y - tif.y) > 1.5) { tr.push({ x: tif.x, y: tif.y }); if (tr.length > 60) tr.shift(); }
    const wheel = roomId === "pm" ? objs().find((o) => o.id === "wheel") : null;
    const wantWheel = !!wheel && (Math.hypot(wheel.spot.x - tif.x, wheel.spot.y - tif.y) < 20 || cardObj === wheel);
    if (pet.inWheel && !wantWheel) { pet.inWheel = false; pet.x = WHEEL_X + 10; pet.y = 108; }
    if (pet.inWheel) { pet.walkT += dt * 1.6; return; }
    let tx, ty;
    if (wantWheel) { tx = WHEEL_X + 4; ty = 106; }
    else { const p = tr[Math.max(0, tr.length - 9)] || tif; tx = p.x; ty = Math.min(MAX_Y, p.y + 3); }
    const dx = tx - pet.x, dy = ty - pet.y, d = Math.hypot(dx, dy);
    const gap = Math.hypot(tif.x - pet.x, tif.y - pet.y);
    if (d > 1.2 && (wantWheel || gap > 13 || tif.moving)) {
      const k = Math.min(1, (Math.min(95, d * 5 + 20) * dt) / d);
      pet.x += dx * k; pet.y += dy * k; pet.moving = true; pet.walkT += dt;
    } else { pet.moving = false; pet.walkT = 0; }
    if (wantWheel && d < 2) pet.inWheel = true;
  }

  function brackets(h, c, t) {
    const o = reduce ? 0 : Math.round((Math.sin(t * 6) + 1) / 2);
    const x0 = h.x - 1 - o, y0 = h.y - 1 - o, x1 = h.x + h.w + o, y1 = h.y + h.h + o;
    R(x0, y0, 4, 1, c); R(x0, y0, 1, 4, c); R(x1 - 3, y0, 4, 1, c); R(x1, y0, 1, 4, c);
    R(x0, y1, 4, 1, c); R(x0, y1 - 3, 1, 4, c); R(x1 - 3, y1, 4, 1, c); R(x1, y1 - 3, 1, 4, c);
  }

  function renderRoom(t) {
    ctx.drawImage(bgFor(roomId), 0, 0);
    const rd = ROOMDEF[roomId];
    rd.anim(t);
    const th = ROOMS[roomId].theme;
    const list = objs();
    list.filter((o) => o.kind === "wall" || o.kind === "door").forEach((o) => o.draw(t, o === hover || o === near));
    const floorThings = list.filter((o) => o.kind === "floor" || o.kind === "decor").map((o) => ({ base: o.base, draw: () => o.draw(t, o === hover || o === near) }));
    floorThings.push({ base: tif.y, draw: () => drawTifAny(t) });
    if (!pet.inWheel) floorThings.push({ base: pet.y, draw: () => drawHamster(pet.x, pet.y - (pet.hopT > 0 ? Math.round(Math.sin((pet.hopT / 0.35) * Math.PI) * 4) : 0), pet.moving, pet.walkT) });
    floorThings.sort((a, b) => a.base - b.base).forEach((f) => f.draw());
    // highlight
    const hl = hover || near;
    if (hl && hl.hit && !cardObj) brackets(hl.hit, th.accent, t);
    // near "!" bubble
    if (near && !cardObj) {
      const bx = Math.round(tif.x) - 3, by = Math.round(tif.y) - 40 + (reduce ? 0 : Math.round(Math.sin(t * 6)));
      R(bx, by, 7, 8, "#ffffff"); R(bx + 2, by + 8, 2, 1, "#ffffff"); R(bx + 3, by + 1, 1, 4, th.accent); P(bx + 3, by + 6, th.accent);
    }
    // particles
    for (const p of parts) {
      C.globalAlpha = Math.max(0, Math.min(1, p.life / p.max * 1.5));
      if (p.kind === "spark") spr(SP.spark, Math.round(p.x) - 2, Math.round(p.y) - 2, { "#": p.c });
      else if (p.kind === "heart") spr(SP.heart, Math.round(p.x) - 2, Math.round(p.y) - 2, { "#": p.c });
      else if (p.kind === "note") spr(SP.note, Math.round(p.x) - 2, Math.round(p.y) - 3, { "#": p.c });
      else R(p.x, p.y, 1, 1, p.c);
    }
    C.globalAlpha = 1;
  }

  /* ── loading screen + main menu (calm, neutral) ── */
  const MENU_BG = "#f4f3ee", MENU_DOT = "#e6e5dc", MENU_INK = "#34362f", MENU_MUTED = "#8a8c7f";
  const NEUTRAL = { bg: "#f4f3ee", paper: "#fbfaf6", ink: "#34362f", accent: "#34362f", accent2: "#8a8c7f", soft: "#ecebe3", shadow: "#d8d7cc" };
  function calmBg() {
    R(0, 0, W, H, MENU_BG);
    for (let y = 4; y < H; y += 8) for (let x = (y % 16 ? 4 : 0); x < W; x += 8) P(x, y, MENU_DOT);
  }
  function renderLoading(t) {
    calmBg();
    const p = Math.min(1, loadT / LOAD_MIN), e = 1 - Math.pow(1 - p, 2);
    R(68, 101, 120, 1, "#d8d7cc");
    for (let i = 0; i < 8; i++) { const x = 68 + (((i * 15 - (reduce ? 0 : t * 70)) % 120) + 120) % 120; R(x, 104, 5, 1, "#dddcd2"); }
    for (let k = 0; k < 3 && !reduce; k++) { const q = (t * 2.4 + k / 3) % 1; circ(112 - q * 22, 97 - q * 4, 2 * (1 - q) + 0.4, "#e2e1d7"); }
    C.setTransform(2, 0, 0, 2, 0, 0);
    drawHamster(64, 50, true, t * 1.3);
    text("LOADING", 50, 58, MENU_INK);
    for (let i = 0; i < Math.floor(t * 3) % 4; i++) P(78 + i * 2, 62, MENU_INK);
    C.setTransform(1, 0, 0, 1, 0, 0);
    R(92, 134, 72, 3, "#e2e1d7"); R(92, 134, Math.round(72 * e), 3, MENU_INK);
    text("NOMNOM IS WARMING UP THE ROOMS", 69, 143, MENU_MUTED);
  }
  const menuWhos = {};
  ORDER.forEach((id, i) => { menuWhos[id] = { x: 20, y: 44, dir: "down", moving: false, walkT: 0, sway: 0, blinkOff: i * 1.3, pig: [{ th: 0.05, w: 0 }, { th: 0.05, w: 0 }] }; });
  function renderMenu(t) {
    calmBg();
    menuEl.querySelectorAll("canvas[data-cd]").forEach((c, i) => {
      const id = c.dataset.cd, on = i === menuSel, who = menuWhos[id], c2 = c.getContext("2d");
      c2.clearRect(0, 0, c.width, c.height);
      who.moving = on && !reduce; who.walkT = on ? t : 0;
      const sw = on && !reduce ? Math.sin(t * 9) * 0.22 : 0;
      who.pig[0].th = 0.05 + sw; who.pig[1].th = 0.05 - sw;
      drawTifAny(t, who, id, tifStyle, 1, c2);
    });
    const pc = menuEl.querySelector(".ph-cd-pet");
    if (pc) { const prev = C; C = pc.getContext("2d"); C.clearRect(0, 0, pc.width, pc.height); drawHamster(8, 13, !reduce, t * 0.5); C = prev; }
  }
  function render(t) {
    C = ctx;
    if (stage === "loading") renderLoading(t); else if (stage === "menu") renderMenu(t); else renderRoom(t);
    let k = 0;
    if (trans) { const half = reduce ? 0.05 : 0.24; k = trans.t < half ? trans.t / half : 1 - (trans.t - half) / half; }
    if (flash > 0) k = Math.max(k, flash / 0.35);
    if (k > 0) { C.globalAlpha = Math.min(1, k); C.fillStyle = trans && !trans.fromMenu && stage === "room" ? "#ffffff" : MENU_BG; C.fillRect(0, 0, W, H); C.globalAlpha = 1; }
  }

  function applyNeutral() {
    for (const k in NEUTRAL) root.style.setProperty("--ph-" + k, NEUTRAL[k]);
    root.dataset.room = "menu";
  }
  function setSel(i, focus) {
    const n = ORDER.length; const next = ((i % n) + n) % n;
    if (next !== menuSel) menuT = 0;
    menuSel = next;
    menuEl.querySelectorAll(".ph-cd-opt").forEach((b, j) => { b.classList.toggle("is-on", j === menuSel); b.setAttribute("aria-current", j === menuSel ? "true" : "false"); });
    const id = ORDER[menuSel], count = ROOMDEF[id].objects.filter((o) => o.kind !== "door" && o.kind !== "decor").length;
    cdRoom.textContent = "Room: " + ROOMS[id].title.toLowerCase().replace(/(^|\s)\S/g, (m) => m.toUpperCase()).replace("Ui/ux", "UI/UX").replace("Pm ", "PM ");
    cdCount.textContent = "Projects: " + count + " of " + Object.keys(ITEMS).length;
    if (focus) { const b = menuEl.querySelectorAll(".ph-cd-opt")[menuSel]; if (b && menuEl.contains(document.activeElement)) b.focus({ preventScroll: true }); }
  }
  menuEl.addEventListener("pointerover", (e) => { const b = e.target.closest(".ph-cd-opt"); if (b) setSel(+b.dataset.i); });
  menuEl.addEventListener("focusin", (e) => { const b = e.target.closest(".ph-cd-opt"); if (b) setSel(+b.dataset.i); });
  function finishLoading() {
    flash = 0.35;
    if (menuOn) {
      stage = "menu"; root.dataset.stage = "menu"; menuEl.hidden = false; setSel(ORDER.indexOf(roomId)); menuT = 1;
      srEl.textContent = "Choose a room for Tif to start in";
    } else {
      stage = "room"; root.dataset.stage = "room"; applyRoom();
      burst(tif.x, tif.y - 14, 22); say(ROOMS[roomId].greet, 5200);
    }
  }
  function choose(id) {
    if (stage !== "menu" || trans) return;
    goRoom(id, "menu");
  }

  let raf = 0, last = performance.now(), running = true;
  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const t = now / 1000;
    update(dt, t);
    if (stageVisible || stage !== "room" || trans) render(t);
    raf = requestAnimationFrame(frame);
  }

  root.dataset.stage = "loading";
  applyNeutral();
  mounted = true;
  srEl.textContent = "Loading";
  raf = requestAnimationFrame(frame);

  /* ═════════════════════ cleanup ═════════════════════ */
  const destroy = function () {
    running = false; cancelAnimationFrame(raf);
    setMusic(false);
    if (actx) { try { actx.close(); } catch (e) {} }
    io && io.disconnect();
    window.removeEventListener("keydown", onKey);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("blur", onBlur);
    window.removeEventListener("pixelhome:goto", onGoto);
    root.removeEventListener("click", onRootClick);
    root.innerHTML = "";
  };
  /* extras for the preview / A-B test */
  destroy.setStyle = (st) => { tifStyle = st === "a" ? "a" : "b"; };
  destroy.setModel = (oid, n) => { if (oid === "all") models = { ux: n, mkt: n, pm: n }; else models[oid] = n; };
  destroy.renderTif = (canvas, oid, style = tifStyle, t = performance.now() / 1000, dir = "down", moving = false, model = 0, scale = 0) => {
    const c2 = canvas.getContext("2d"); c2.clearRect(0, 0, canvas.width, canvas.height);
    const sc = scale || Math.max(1, Math.floor(Math.min(canvas.width / 40, canvas.height / 48)));
    const sw = moving && !reduce ? Math.sin(t * 9) * 0.2 : 0;
    who_model_override = model;
    drawTifAny(t, { x: canvas.width / 2, y: canvas.height - 3 * sc, dir, moving: moving && !reduce, walkT: t, sway: 0, pig: [{ th: 0.05 + sw }, { th: 0.05 - sw }] }, oid, style, sc, c2);
    who_model_override = 0;
  };
  return destroy;
}
