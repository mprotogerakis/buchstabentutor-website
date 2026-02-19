# Buchstabentutor Website

Statische Website + Kontaktformular-Funktion für Cloudflare Pages.

## Struktur
- `website/` statische Seiten (Output Directory in Cloudflare)
- `functions/api/contact.js` Pages Function für Kontaktformular (`/api/contact`)

## Cloudflare Pages Setup
- Framework preset: `None`
- Build command: leer
- Build output directory: `website`

## Erforderliche Secrets (Production)
- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL`
- `CONTACT_FROM_EMAIL`
