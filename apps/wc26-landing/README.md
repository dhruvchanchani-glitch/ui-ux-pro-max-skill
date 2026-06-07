# WC26 — landing page

Single-page marketing site for the WC26 World Cup companion app. Plain
HTML + Tailwind via CDN; no build step.

## Deploy

```bash
vercel --prod
```

Or any static host: copy the contents of this folder to it.

## What's included (launch checklist)

| Item | Status |
|---|---|
| Landing page live | ✅ `index.html` |
| Open Graph tags (`og:*` + Twitter Card) | ✅ |
| Favicon | ✅ `favicon.svg` |
| Mobile responsive | ✅ Tailwind responsive classes |
| Privacy policy | ✅ `privacy.html` |
| Terms of service | ✅ `terms.html` |
| `robots.txt` | ✅ |
| `sitemap.xml` | ✅ |
| Security headers | ✅ `vercel.json` (HSTS, X-Frame, no-sniff) |
| Reduced-motion respect | ✅ inline CSS guard |

## What you still need to add before pressing go

| Item | Where |
|---|---|
| Real `og-image.png` (1200×630) | `public/og-image.png` |
| `apple-touch-icon.png` (180×180) | `public/apple-touch-icon.png` |
| Real screenshots of the app | Embed in `index.html` features section, replace the CSS placeholders |
| App Store / Play Store URLs | Replace `href="#"` on the download buttons |
| Real launch date / countdown | Optional but punchy |
| Plausible / Fathom / GA snippet | Pick one, add to `<head>` |
| IndexNow API key | https://www.indexnow.org/ |

## SEO bits (you must do)

1. **Google Search Console** — verify ownership via the `<meta>` tag or
   a `google-site-verification.html` file. Submit `sitemap.xml`.
2. **Bing Webmaster Tools** — same pattern; submit the sitemap.
3. **IndexNow** — generate a key, drop it as `/[your-key].txt`, then
   POST changed URLs to https://www.bing.com/indexnow on every publish.
4. **Meta description + title** — already set in `index.html`, but
   tweak per page when you have analytics to lean on.

## SEO + share preview self-check

Before pushing, check:

```bash
curl -s https://wc26.app/ | grep -i "og:"
```

…should show your OG tags. And paste the URL into the LinkedIn /
Twitter card validators to confirm the preview image renders.
