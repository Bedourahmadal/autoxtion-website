# Autoxtion Website — Handoff

## What this is
A finished bilingual (Arabic RTL + English LTR) one-page marketing website for **Autoxtion**, a company providing AI + Extended-Reality training solutions for the oil & gas / fuel-station sectors.

The site is **already built and works** — it is plain, self-contained HTML (no build step, no framework, no server). You just need to host it and point the domain at it. The owner got stuck on the DNS/hosting step and wants help finishing deployment.

## Files in this bundle (`site/`)
- **`index.html`** — Arabic homepage (the main page; must stay named `index.html`).
- **`AUTOXTION-EN.html`** — English version.
- The two are linked by an in-page language switch (EN ⇄ عربي). All images and the hero video are embedded/linked inside the files.

Both are fully standalone: open `index.html` in any browser and everything renders. No npm install, no bundler.

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

## The demo form (already wired)
The "Request a Demo" popup posts to **Formspree** endpoint `https://formspree.io/f/xykrwpbv` — submissions email the site owner. After go-live, in Formspree set "Restrict to Domain" = `autoxtion.com`. The first real submission triggers a one-time confirmation email from Formspree.

## Notes
- Hero video is embedded from Google Drive (`/preview` iframe) — needs internet; consider self-hosting an mp4 later for speed.
- These HTML files are the actual deliverable, not a prototype to rebuild — they can be shipped as-is. The only task is hosting + DNS.
