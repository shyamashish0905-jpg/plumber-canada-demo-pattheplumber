# PatThePlumber — multi-page website

A fast, offline-friendly, multi-page site for a licensed plumber in Toronto and the GTA.
Everything is plain HTML, CSS and JavaScript — no framework, no database, no paid plugins.

**Current status: draft.** The design, pages, SEO and interactions are finished, but the
business facts marked as placeholders still need Pat's real details before the site goes
live. Do not publish it until those are replaced.

---

## 1. What is in the box

| Page | File | Purpose |
| --- | --- | --- |
| Home | `index.html` | Summary, dispatch board, service preview, price teaser, review policy, contact CTA |
| Services & prices | `services.html` | Ten-job price board with weekday/night toggle, service details, FAQ |
| Service area | `service-area.html` | Interactive Toronto/GTA map, ten towns, arrival ticket, FAQ |
| Reviews | `reviews.html` | Honest review policy and three "waiting for a real customer" tickets |
| Guarantees & licence | `guarantees.html` | Guarantee, warranty and licence cards, paperwork sheet, FAQ |
| About Pat | `about.html` | Short bio framework, working standards, credentials |
| Contact | `contact.html` | Contact panel and photo quote form |
| Not found | `404.html` | Friendly error page (noindex, not in the sitemap) |

Supporting files:

- `styles.css` — all design and responsive styling.
- `script.js` — Toronto clock, price toggle, map routes, photo preview, form mailto handoff, scroll reveal, rubber stamps and the signature copper pipe.
- `assets/fonts/` — self-hosted Archivo Black and Public Sans.
- `assets/og-cover.png` — 1200×630 social sharing image.
- `favicon.svg` — maple-leaf site icon.
- `sitemap.xml` — all indexable pages.
- `robots.txt` — search and AI crawler rules.
- `llms.txt` — plain-language summary for AI assistants.

SEO built in:

- Unique title, meta description and canonical on every page.
- One `<h1>` per page and a logical heading order.
- Breadcrumbs, internal links and descriptive link text.
- JSON-LD `Plumber` / `LocalBusiness`, `WebSite`, `WebPage`, `BreadcrumbList`, `FAQPage` and `ContactPage` where relevant.
- Open Graph and Twitter card tags.
- Mobile-first layout, visible focus styles, skip link, reduced-motion support.
- No fake reviews and no fake `Review` / `AggregateRating` schema.

---

## 2. Preview it on your computer

From this folder, run one of these:

```powershell
# Python (already on most machines)
python -m http.server 4173

# or Node
npx serve .
```

Then open `http://127.0.0.1:4173/` in a browser.

Do not double-click `index.html` for final testing — some browsers treat `file://` pages
differently. The local server is the realistic preview.

If you edit a file in `src/pages/` or `tools/build.js`, rebuild the pages:

```powershell
node tools/build.js
```

You do **not** need to rebuild after editing `styles.css` or `script.js`.

---

## 3. Replace the placeholders BEFORE launch

Every unconfirmed fact is visibly marked. Search the project for `XXX`, `$000`, `PL._____`,
`PLACEHOLDER`, `CREW NAME`, `XX–XX` and `[CUSTOMER NAME]` to find them all.

| What | Where to change it |
| --- | --- |
| Phone number | `tools/build.js` (phone panel and footer), `src/pages/index.html` (phone slab), `src/pages/contact.html` (call panel + FAQ) |
| Open hours | `tools/build.js` (footer), `src/pages/contact.html` (FAQ), status bar wording |
| Crew name / on-duty label | `tools/build.js` (status bar), `src/pages/index.html` (dispatch board) |
| Arrival windows | `src/pages/index.html`, `src/pages/service-area.html` (town buttons, town cards, ticket) |
| Prices (weekday + night) | `src/pages/services.html` (price rows `data-day` / `data-night`), `src/pages/index.html` (teaser rows) |
| Real service list | `src/pages/services.html`, `src/pages/index.html` (six service cards) |
| Licence number and issuer | `tools/build.js` (footer), `src/pages/guarantees.html`, `src/pages/about.html` |
| Guarantee and warranty terms | `src/pages/guarantees.html`, `src/pages/index.html` (trust cards) |
| Years in the trade / bio | `src/pages/about.html` |
| Real customer reviews | `src/pages/reviews.html`, `src/pages/index.html` (review teaser) |
| Quoted and paid amounts | `src/pages/reviews.html` (replace `$000` only with real figures) |
| Domain name | `tools/build.js`, `const SITE_ORIGIN` near the top |

After any edit in `src/` or `tools/build.js`:

```powershell
node tools/build.js
```

The placeholder domain is deliberate. Canonicals stay relative until you set a real
`SITE_ORIGIN`; after that the build automatically switches canonicals and social image URLs
to absolute addresses. This prevents a preview deployment from being deindexed.

### A note about reviews

The three review tickets are intentionally empty. Do not fill them with invented quotes.
When a real customer sends words and permission, add their first name, neighbourhood, the
quoted price and the paid price. Do not add `Review` or `AggregateRating` schema until those
reviews are real and verifiable.

---

## 4. Put the site online (plain words)

You only need to upload the **built website files**, not the `src/` or `tools/` folders.
The files that make up the live site are:

```
*.html
styles.css
script.js
favicon.svg
sitemap.xml
robots.txt
llms.txt
assets/
```

### Option A — Netlify Drop (easiest, free)

1. Go to <https://app.netlify.com/drop>.
2. Drag this whole folder onto the page. Netlify uploads the files and gives you a temporary address such as `https://something.netlify.app`.
3. Check the site on a phone and a computer.
4. When you are ready, add your own domain in **Site settings → Domain management**.
5. Netlify automatically uses `404.html` for missing pages.

You can also connect a GitHub repository later so every rebuild deploys automatically.

### Option B — GitHub Pages (free)

1. Create a GitHub account and a new repository.
2. Upload the built files (or push them with Git) to the `main` branch.
3. Open **Settings → Pages**, choose **Deploy from a branch**, pick `main` and `/ (root)`.
4. GitHub gives you `https://yourname.github.io/repo-name/`.
5. Custom domain: add it under **Settings → Pages → Custom domain** and follow the DNS instructions.

GitHub Pages also serves `404.html` for missing pages.

### Option C — Cloudflare Pages (free, fast)

1. Go to <https://pages.cloudflare.com>.
2. Create a project and upload the folder directly, or connect a Git repository.
3. No build command is needed; leave the build command empty and set the output directory to `/`.
4. Add your domain under **Custom domains**.

### Option D — Traditional web host (cPanel / FTP)

1. Log in to your host's control panel or FTP client.
2. Open the `public_html` (or `www`) folder.
3. Upload the built files and the `assets` folder, keeping the same structure.
4. Make sure `index.html` sits directly inside `public_html`.
5. Enable free HTTPS/SSL in the hosting panel if it is not already on.

### After the site is live

1. Open the live address and click every page and every map town.
2. Send a test photo quote to yourself and confirm the email app opens correctly.
3. Do not submit the site to Google until the phone number, prices, licence and service list are real.

---

## 5. Set the real domain

1. Open `tools/build.js`.
2. Change:

   ```js
   const SITE_ORIGIN = "https://example.com";
   ```

   to the real address, for example:

   ```js
   const SITE_ORIGIN = "https://pattheplumber.ca";
   ```

3. Run `node tools/build.js`.
4. Confirm `sitemap.xml`, `robots.txt`, `llms.txt` and the JSON-LD blocks now use the real domain.
5. Re-upload the changed files.

Use the same domain form everywhere (with or without `www`, but not both). If you use
`www`, set the bare domain to redirect to it, or the other way around.

---

## 6. Google and AI search checklist

Do these in order after the real facts are in place and the site is live.

1. **Google Search Console** — <https://search.google.com/search-console>
   - Add the domain as a property and verify it.
   - Submit `https://your-domain/sitemap.xml`.
   - Use **URL Inspection** on the home page and request indexing.

2. **Bing Webmaster Tools** — <https://www.bing.com/webmasters>
   - Add the site, verify it and submit the same sitemap.

3. **Google Business Profile** — <https://business.google.com>
   - This matters more than any on-page tweak for local plumbing searches.
   - Set the business as a service-area business if Pat does not want the home address shown.
   - Use the same business name, phone number and service area as the website.

4. **Rich Results Test** — <https://search.google.com/test/rich-results>
   - Paste each page URL and confirm the `LocalBusiness` and `FAQPage` data is detected.

5. **PageSpeed Insights** — <https://pagespeed.web.dev>
   - Test the live home page on mobile. The site is lightweight, but hosting speed matters.

6. **AI crawlers**
   - `robots.txt` already allows GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended and CCBot.
   - `llms.txt` gives assistants a short, accurate summary and page list.
   - AI answers still depend on normal search signals, so keep the content accurate, specific and up to date.

7. **Real reviews**
   - Ask real customers for a few sentences and permission to publish their first name and neighbourhood.
   - Add the quoted and paid amounts only when they are accurate.
   - Never buy reviews or invent testimonials. Fake review markup can lead to manual penalties.

8. **Keep it current**
   - Update `TODAY` in `tools/build.js` when content changes, rebuild, and resubmit the sitemap if needed.

---

## 7. Testing commands

The repository includes small headless-Chrome tools used during development.

```powershell
# Responsive + structural audit at 390, 768, 1024 and 1440 px
node tools/audit.js

# Link, anchor, heading and structured-data check
node tools/check-links.js

# Price toggle, map, form, mobile nav, stamps, pipe and reduced motion
node tools/interact.js
```

These expect the site to be served at `http://127.0.0.1:4173/`.

Latest results:

- 32/32 responsive page-width checks clean.
- 7/7 indexable pages pass link, anchor, heading and schema checks.
- 48/48 interaction checks pass with no console errors.

Screenshots used during review are in `tools/shots/`.

---

## 8. File structure

```
.
├─ index.html, services.html, service-area.html, reviews.html,
│  guarantees.html, about.html, contact.html, 404.html
├─ styles.css
├─ script.js
├─ favicon.svg
├─ sitemap.xml
├─ robots.txt
├─ llms.txt
├─ assets/
│  ├─ fonts/
│  └─ og-cover.png
├─ src/
│  ├─ pages/          page content fragments (edit these)
│  └─ partials/       shared SVG sprite and copper pipe markup
└─ tools/
   ├─ build.js        static site generator (run after editing src/)
   ├─ audit.js        responsive audit
   ├─ check-links.js  link and SEO integrity check
   ├─ interact.js     behaviour tests
   ├─ capture.js      headless screenshots
   └─ probe.js        quick page probe
```

---

## 9. Practical notes

- The photo form does **not** upload anything. It opens the visitor's email app with the
  details filled in; the visitor attaches the photos there. Nothing is stored on the site.
- If you want the form to send directly from the site later, you will need a form service
  (for example Netlify Forms, Formspree or a small serverless endpoint) and a privacy note.
- The map is drawn for clarity, not to scale, and is not a live GPS estimate.
- All visuals are custom SVG/CSS. There are no stock photos and no external tracking scripts.
- The copper pipe, faucet, stamps and reveals respect `prefers-reduced-motion`.
- Keep the brand colours and 3px outlines consistent if you add new sections:
  red `#FF0000`, white `#FFFFFF`, copper `#C8642E`, navy `#0E1A3A`,
  yellow `#FFD23F`, warm white `#FFFCF5`, ink `#121212`, water `#3FB8F5`.

---

## 10. Pre-launch sign-off

- [ ] Real phone number added everywhere.
- [ ] Real hours and emergency availability confirmed.
- [ ] Crew/on-duty wording confirmed or removed.
- [ ] Real arrival windows per town.
- [ ] Real weekday and night prices (or the price board removed).
- [ ] Real service list confirmed.
- [ ] Licence number and issuing body added.
- [ ] Guarantee and warranty terms supplied by Pat.
- [ ] Bio and years in the trade supplied by Pat.
- [ ] Real reviews only, with permission.
- [ ] `SITE_ORIGIN` set to the live domain and the site rebuilt.
- [ ] Sitemap submitted to Google and Bing.
- [ ] Google Business Profile created or updated.
- [ ] Test photo quote completed on a phone.
