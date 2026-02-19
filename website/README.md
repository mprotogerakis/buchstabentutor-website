# Buchstabentutor Website (Cloudflare Pages)

## Inhalt
Statische Seiten für:
- Startseite
- Impressum (`/impressum/`)
- Datenschutzerklärung (`/datenschutz/`)
- Kontakt (`/kontakt/`)
- `404.html`
- Sicherheitsheader (`_headers`)
- Functions-Routing (`_routes.json`)
- `robots.txt`, `sitemap.xml`
- Cloudflare Pages Function: `functions/api/contact.js`

## Deployment mit Cloudflare Pages
1. Cloudflare Pages Projekt mit diesem Git-Repository verbinden.
2. Build command leer lassen.
3. Output directory auf `website` setzen.
4. Domain `www.buchstabentutor.de` verbinden.
5. Optional Redirect von Apex auf `www` in Cloudflare konfigurieren.
6. Für das Kontaktformular in Cloudflare Pages folgende Secrets setzen:
   - `RESEND_API_KEY`
   - `CONTACT_TO_EMAIL` (Zieladresse, z. B. `lernapps@icloud.com`)
   - `CONTACT_FROM_EMAIL` (verifizierte Senderadresse bei Resend)

## Rechtliche Pflege
- Inhalte in `impressum/index.html` und `datenschutz/index.html` regelmäßig prüfen.
- Bei neuen SDKs (Analytics, Crash-Reporting, Login, In-App-Kauf etc.) Datenschutzerklärung aktualisieren.
- Wenn Kontaktversand-Anbieter oder Datenfluss geändert wird, Datenschutzerklärung anpassen.
