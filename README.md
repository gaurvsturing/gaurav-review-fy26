# Gaurav Kumar Singh — Year in Review FY 2025/26

A live, interactive review portal built in the same posture as the BFSI Master Platform — React + Vite, Tailwind CSS, fully aligned with the Turing.com design system.

## What this is

A single-page web app with five sections accessible from a sticky sidebar:
1. **Executive Summary** — headline win, KPI tiles, live BFSI Platform link, promotion thesis
2. **The Three Questions** — expandable cards with BLUF (Bottom Line Up Front) summaries
3. **The Year in Motion** — interactive quarterly timeline (Q3'25 → Q2'26)
4. **Benchmarks vs IC6** — side-by-side last-year vs this-year comparison across all 5 IC6 benchmarks
5. **What I'm Asking For** — forward-looking IC6 scope ask

Plus:
- **PDF download button** (lower-left of sidebar) — generates a print-friendly archival copy for HR
- **Mobile-responsive** — works on any device, sidebar collapses to a top bar
- **Fast** — single bundle, no backend, no API calls, no database

## Run locally

```bash
npm install
npm run dev
```

Opens at http://localhost:5173

## Build for production

```bash
npm run build
```

Outputs static files to `dist/` — drop into any static host.

## Deploy to Netlify

**Option 1 — drag and drop (fastest):**
1. Run `npm run build`
2. Go to [app.netlify.com](https://app.netlify.com/drop)
3. Drag the `dist/` folder onto the page
4. Done — Netlify gives you a URL like `https://amazing-name-123.netlify.app`

**Option 2 — connect GitHub repo (recommended for iteration):**
1. Push this folder to a new GitHub repo
2. In Netlify: New Site → Import from Git → pick the repo
3. Build settings auto-detected from `netlify.toml` (build command: `npm run build`, publish: `dist`)
4. Optional: configure a custom domain

## Edit the content

All review content lives in `src/App.jsx` at the top of the file in the **DATA** section:
- `KPI_TILES` — the 4 numbers in the executive summary
- `QUESTIONS` — the three annual review questions, BLUFs, and full answers
- `QUARTERS` — the quarterly timeline data (Q3'25 → Q2'26)
- `BENCHMARKS` — the IC6 benchmarks side-by-side comparison
- `FEEDBACK` — the action items table
- `FORWARD_ASKS` — the looking-ahead cards

Edit any of those, save, and the dev server hot-reloads.

## Brand system

Uses the Turing.com design tokens (Poppins font, blue scale, gray scale, signature shadows like `shadow-hero` and `shadow-blue-glow`, dark `deploy-ai-card` gradient for hero moments). Defined in `tailwind.config.js`.
