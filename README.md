# Autoxtion Website

The bilingual (Arabic RTL at `/`, English LTR at `/en/`) site for **AUTOXTION — Intelligent Immersive Experiences**: immersive training & simulation, immersive learning, interactive XR experiences, and AI consulting.

Built with [Astro](https://astro.build) and Tailwind CSS on the free
[Astroship](https://github.com/surjithctly/astroship) template (GPL-3.0, see `LICENSE`).
The template's author asks to keep the small "Made by Web3Templates" credit in the footer.

## Run it locally

```bash
npm install
npm run dev
```

Then open <http://localhost:4321>. `npm run build` writes the finished site to `dist/`.

## Publish

Pushing to `main` publishes the site. The workflow in `.github/workflows/deploy.yml` builds it
and deploys it to GitHub Pages (Settings → Pages → Source: **GitHub Actions**).
`autoxtion.com` is the Pages custom domain; `public/CNAME` carries it into each build.

## Where things are

- `src/data/` — the page text in Arabic and English: `home.json`, `solutions.json`, `consulting.json`.
- `src/lib/i18n.ts` — shared strings (menu, footer, form messages) and the contact details.
- `src/views/` — one view per page type (home, solution, consulting, about), shared by both languages.
- `src/pages/` — the addresses: `/`, `/solutions/<slug>/`, `/consulting/`, `/about/`, and the same under `/en/`.
- `src/components/` — header, footer, hero, solution cards, sector tabs, the forms.
- `src/scripts/site.ts` — the forms (field checks, sending through FormSubmit with copies to the team),
  pre-selecting a request type, the sector tabs, consultant details, the phone request bar.
- `public/` — images, logo, the training badge pages (`/badge/`), `CNAME`, `robots.txt`.

## The forms

Both forms post to **FormSubmit** (`https://formsubmit.co/ajax/info@autoxtion.com`); copies go to the
addresses in the hidden `_cc` field. Buttons and links with `data-open-form` (or `?purpose=…#contact`)
open the form with the request type chosen.

## Site rules

Light backgrounds in black and grey, no project footage or client details, no unsupported numbers,
headings without a full stop.
