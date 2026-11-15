# Tiffany Yin — pixel portfolio

A Next.js (App Router) site: a walkable pixel-art "home" (`components/pixel-home/PixelHome.tsx`)
with three rooms (UI/UX, Marketing, Product Management), plus a scrollable project section below
(`PortfolioSections.tsx`) that mirrors each room's projects as cards.

## Run locally

```
npm install
npm run dev
```
Open http://localhost:3000.

## Deploy to Vercel

**Option A — Vercel CLI (fastest):**
```
npm i -g vercel
vercel
```
Follow the prompts (link or create a project); it builds and deploys in one step.
Run `vercel --prod` to push straight to production.

**Option B — GitHub import:**
1. Push this folder to a new GitHub repo:
   ```
   git init
   git add .
   git commit -m "pixel portfolio"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
2. In Vercel: New Project → Import the repo → it auto-detects Next.js → Deploy.

No environment variables or special build settings are needed — it's a static-friendly
Next.js app with no backend.

## Editing content

- **`components/pixel-home/content.js`** — all project copy, stats, links and image paths for
  every room. This is the file to edit for new projects, new blurbs, or new links.
- **`components/pixel-home/engine.js`** — the hand-drawn pixel-art canvas engine (rooms, Tif's
  sprite, decorations, animations). Edit this to change how a room looks.
- **`public/`** — every image referenced by `content.js`/`engine.js` (as `/filename.png`, which is
  the correct Next.js convention for files in `public/`).
- **Fonts** — Press Start 2P (pixel UI), Space Mono (body), Gaegu (handwritten name) are loaded
  via Google Fonts `<link>` tags in `app/layout.tsx`.

### "Coming soon" cards
A project with no screenshots yet (currently just Apple Collapse) shows a cute sleepy pixel
graphic and a "COMING SOON" badge instead of a broken image. To flip this off once you have real
screenshots, in `content.js` set that item's `imgs` to the real `/file.png` paths and remove its
`comingSoon: true` line.
