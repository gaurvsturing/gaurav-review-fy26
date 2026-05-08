# Gaurav Kumar Singh — Year in Review FY 2025/26

A live, interactive review portal built as a visual sibling of the BFSI Master Platform — React + Vite, Tailwind CSS, fully aligned with the Turing internal-platform design language.

## What this is

A single-page web app with five sections accessible from a black sidebar (just like the BFSI platform):
1. **Executive Summary** — KPI tiles, headline win, live BFSI Platform link, promotion ask
2. **The Three Questions** — expandable cards with BLUF (Bottom Line Up Front) summaries
3. **The Year in Motion** — interactive quarterly tabs (Q3'25 → Q2'26)
4. **Benchmarks vs IC6** — signature bar chart of YoY progression + side-by-side comparison + action items
5. **What I'm Asking For** — forward-looking IC6 scope ask

Plus:
- **Black sidebar** with active blue pill (matches BFSI exactly)
- **Light gray (`#f8f8f8`) main background** with white cards (matches BFSI exactly)
- **Massive Poppins headings** (32–52px), **bold KPI numbers** (44px), big rounded cards
- **"Data source · …" pills** under each section title (signature pattern from BFSI)
- **Eyebrow chips** ("FY 2025/26 · ANNUAL REVIEW", etc.) for section labels
- **Recharts** progression chart in the Benchmarks section
- **PDF download button** at the bottom of the sidebar (HR archival)
- **Mobile-responsive** — sidebar collapses to top bar on small screens

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

Outputs static files to `dist/`.

---

## Deploy: GitHub Pages (recommended)

This repo includes a GitHub Actions workflow at `.github/workflows/deploy.yml` that auto-builds and deploys to GitHub Pages on every push to `main`.

### One-time setup

1. **Push this folder to a new GitHub repo:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Year in Review portal"
   git branch -M main
   # Either with gh CLI:
   gh repo create gaurav-review-fy26 --private --source=. --remote=origin --push
   # Or manually create the repo on github.com, then:
   git remote add origin git@github.com:<your-username>/gaurav-review-fy26.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repo on github.com → **Settings** → **Pages**
   - Under "Build and deployment", set **Source** to **GitHub Actions**
   - That's it — the workflow file already in the repo will take over

3. **First deploy:**
   - Go to the **Actions** tab on github.com to watch the build run (~90 seconds)
   - Once green, your site will be live at `https://<your-username>.github.io/gaurav-review-fy26/`

### Iteration

After setup, any change is just:
```bash
git add . && git commit -m "tweak Q2 wording" && git push
```
The workflow rebuilds and redeploys automatically.

### Custom domain (optional)

If you want a custom URL like `review.yourdomain.com`:
- Settings → Pages → **Custom domain** → enter your domain
- Add a CNAME DNS record pointing to `<your-username>.github.io`

---

## Alternative: Deploy to Netlify

If you'd rather use Netlify (URL would be `<name>.netlify.app`, matching your BFSI platform's URL pattern):

1. Push the repo to GitHub (same as above)
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import from Git**
3. Pick your repo. The included `netlify.toml` auto-configures everything.
4. First deploy takes ~60 seconds.
5. Optionally rename to something clean like `gaurav-review-fy26.netlify.app` (Site config → Change site name).

---

## Edit the content

All review content lives at the top of `src/App.jsx` in the **DATA** section:
- `KPI_TILES` — the 4 numbers in the executive summary
- `QUESTIONS` — the three annual review questions, BLUFs, and full answers
- `QUARTERS` — the quarterly initiatives (Q3'25 → Q2'26)
- `BENCHMARKS` — the IC6 benchmarks side-by-side comparison
- `FEEDBACK` — the action items table
- `FORWARD_ASKS` — the looking-ahead cards

Edit any value, save, dev server hot-reloads. Push to deploy.

## Brand system

Sidebar/main-content split, KPI tile pattern, segmented controls, account-tab style filters, and "Data source ·" pills are direct adaptations from the BFSI Master Platform. Color tokens, typography (Poppins 400/500/600/700), and spacing follow the Turing.com design system documented in `design.md`.
