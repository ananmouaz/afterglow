# Afterglow

Turn photos into instant-style prints, with handwritten captions and small pen doodles. Photos stay in your browser; no account or upload server is required.

**[Open Afterglow](https://ananmouaz.github.io/afterglow/)** · [Vercel mirror](https://afterglow-film-studio-f236bc48.vercel.app)

## Features

- Mini, Square, and Wide frames at their actual physical dimensions, plus a four-photo booth Strip (two fit on one 10 × 15 cm print) a Peel-apart print whose ragged chemical edge is unique to each photo, and a fold-up Matchbook that holds two photo cards.
- Edit up to 12 photos through Crop → Look → Caption, then prepare print sheets.
- Original, Instant Natural, Instant Rich, and five creative looks with adjustable intensity. Optional exposure, softening, flash-style light, grain, and light leak.
- Four caption fonts, four frame colors, and eight hand-drawn symbols.
- Print styles: Classic, Now playing (song, artist and player controls), Ticket stub, and Boarding pass. Optional orange seven-segment date stamp.
- Fewer cuts or Fit more layouts, shared cutting guides, multiple sheets, and optional printing-cost comparison.
- Current-sheet JPG at 600 DPI, or lossless PDF containing every sheet at its actual paper size.
- Responsive editor, keyboard-aware layout, large-text support, reduced-motion support, and undo for photo removal.

| Frame | Outer size | Image area |
|---|---|---|
| Mini | 54 × 86 mm | 46 × 62 mm |
| Square | 72 × 86 mm | 62 × 62 mm |
| Wide | 108 × 86 mm | 99 × 62 mm |

## Run locally

Use Node.js 22 or newer.

```sh
npm ci
npm run dev
```

To check print sheets without uploading photos, open the dev server with `?demo=4` (1–12). It fills the tray with sample prints and opens the print page. Only the dev server reads this.

```sh
npm test
npm run build
npm run preview
```

React, TypeScript, and Vite. Fonts are bundled locally. Rendering, filters, captions, and exports share the same canvas engine.

## Deploy

GitHub Actions tests, builds, and deploys to GitHub Pages on each push to `main`. In repository Settings → Pages, choose **GitHub Actions** as the source. The workflow builds with the repository path as Vite’s base URL.

For Vercel, import this repository, select Vite, and use the default build settings. No environment variables are needed by the app. The existing `vercel.json` supplies its static-site routing.

## Photos and printing

JPEG, PNG, WebP, AVIF, and GIF are accepted, up to 25 MB per file. For HEIC, export a JPEG first. Edits live only in the current tab: export your sheets before refreshing or closing it.

Use glossy paper, matching paper dimensions, and 100% / Actual size for PDFs. Disable automatic enhancement, cropping, and borderless enlargement where your printer supports it. Filters are aesthetic interpretations inspired by instant photography; matching real Instax still requires physical comparison. Ordinary photo paper differs from instant film in chemistry, finish, and thickness.

## Credits

The sample photograph is by [Sean Oulashin on Unsplash](https://unsplash.com/photos/KMn4VEeEPR8). Fonts: DM Sans, Caveat, Special Elite, and Permanent Marker, bundled through Fontsource with their licenses. Frame dimensions reference [Fujifilm’s film specifications](https://www.instax.com/film/).
