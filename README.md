# Autoxtion Website — Handoff

## What this is
The bilingual (Arabic RTL + English LTR) marketing site for **AUTOXTION — Intelligent Immersive Experiences**: immersive training & simulation, immersive learning and interactive XR experiences, for industry & energy, education, training and culture & heritage.

Plain static HTML, CSS and JS — no build step, no framework, no server.

## Files
- **`index.html`** — Arabic homepage (the main page; must stay named `index.html`).
- **`en/index.html`** — English homepage, same structure.
- **`assets/css/site.css`** — every style, one file for both directions (logical properties only).
- **`assets/js/site.js`** — menu, sector tabs, the enquiry form, WhatsApp link.
- **`assets/img/`** — images in three widths each (700 / 1000–1400 / 1536–2000) for `srcset`; `og-autoxtion.jpg` is the share image.
- **`assets/brand/`** — the vector logo and the favicon (the favicon is temporary).
- **`AUTOXTION-EN.html`** — the old English address, kept only to forward to `/en/`.
- **`robots.txt`, `sitemap.xml`** — search engines.
- **`badge/`** — the training badge page (separate; still uses `uploads/logo.png`).

Rules the site keeps: light backgrounds, one teal accent (`#0A7E8F`), no project footage or client details, no unsupported numbers, no images of women.

## The domain & hosting situation (this is what needs finishing)
- **Domain:** `autoxtion.com`, registered at **Hostinger**.
- **Host:** the site was uploaded to **Cloudflare** (Workers & Pages, project `autoxtion`) — it works on a `*.workers.dev` URL. (A Netlify attempt was abandoned because that account got suspended.)
- **Goal:** make `https://autoxtion.com` (and `www.autoxtion.com`) serve this site, with automatic SSL.

### Current state of DNS (as last seen)
The domain was being added as a Cloudflare zone. Cloudflare issued these nameservers:
- `burt.ns.cloudflare.com`
- `candy.ns.cloudflare.com`

**Remaining step:** in Hostinger → Domains → `autoxtion.com` → DNS / Nameservers → **Change Nameservers → Use custom nameservers**, replace the current `cosmos.dns-parking.com` / `nova.dns-parking.com` with the two Cloudflare nameservers above, save, then click **"I updated my nameservers"** in Cloudflare. Propagation can take up to 24h; SSL auto-provisions after.

### Important DNS records to preserve (email must keep working)
When Cloudflare imported the zone it kept these — do **not** delete them:
- `A  @  75.2.60.5`
- `CNAME  www  autoxtion.netlify.app`  ← **should be updated** to point at the Cloudflare Pages project instead (e.g. `autoxtion.pages.dev`) since Netlify was abandoned.
- Email records: `MX mx1.hostinger.com` (pri 5), `MX mx2.hostinger.com` (pri 10), `TXT @ v=spf1...`, `TXT _dmarc`, and the three `hostingermail-*._domainkey` CNAMEs. Keep all of these.

### Recommended clean approach for a developer
Rather than the mixed A-record/nameserver state above, simplest is:
1. Host the two files on **Cloudflare Pages** (drag-drop upload of `site/`, or connect a git repo).
2. Add `autoxtion.com` as a **Custom domain** on that Pages project — Cloudflare creates the correct CNAME/records automatically once the zone uses Cloudflare nameservers.
3. Re-add the Hostinger email records listed above in the Cloudflare DNS tab (MX + SPF + DMARC + DKIM), so email keeps flowing.
4. Confirm SSL is Active, then test `autoxtion.com`, `www.autoxtion.com`, and the EN page.

## The enquiry form
The form on the homepage posts to **FormSubmit** (`https://formsubmit.co/ajax/info@autoxtion.com`); copies go to the addresses in the hidden `_cc` field. Every "Discuss your project" / "Request a demo" button scrolls to it and pre-selects the request type.

## Notes
- Fonts come from Google Fonts: Alexandria (Arabic) and Plus Jakarta Sans (Latin) — the free pair closest to Roobert, which pixaera.com uses. Self-host them before launch for speed.
