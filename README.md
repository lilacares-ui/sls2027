# SLS 2027

Website for the ITE Western District Student Leadership Summit, February 5–7, 2027, at UC Berkeley.

Static HTML/CSS/JS — no build step or dependencies.

## Structure

- `index.html`, `students.html`, `site-visits.html`, `sponsor.html`, `about.html`, `contact.html` — the site's pages
- `assets/css/style.css` — all styles
- `assets/js/main.js` — nav toggle, mailing-list signup, photo strip, sponsor photo carousels, video embeds, sponsorship-email copy fallback
- `assets/js/mailing-list-setup.md` — how the mailing-list form is wired to a Google Sheet
- `assets/img/` — logo and photos (`pics_09.07.2026/web/` holds the web-optimized copies actually used by the site)
- `assets/icons/` — source SVGs for a few of the custom icons

Pages load `style.css` and `main.js` with a `?v=N` suffix so browsers pick up new versions right
after a deploy. Bump `N` on every page whenever the CSS or JS changes.

## Running locally

Open any of the HTML files directly in a browser, or serve the folder so relative
paths resolve exactly as they will in production:

```powershell
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Then visit `http://localhost:8791`.
