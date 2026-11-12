# Design

The approved direction for HawkerGoWhere (working name until 2026-10-31: Uncle Says Closed), and the throwaway prototype that proves it. The app in `src/` still has the old list/cards look; it gets rebuilt from this once the design is signed off.

## Links

Both are private to the repo owner.

- Playable prototype: https://claude.ai/artifact/A3xpXizGkpxnKZTcL8PC41
- Case study for the GovTech pitch: https://claude.ai/artifact/Fnt44SFRHmLALCHQPhn5AC (source in `case-study/`, screenshots from the 7 Dec data)
- Design canvas (round 1 options, logo concepts, mood board, final screens): https://claude.ai/artifact/4CvkHsJbG8dPtmHuKWVaYM

## Run the prototype locally

```sh
npm run proto          # writes design/prototype/out/data.js and uncle-says-closed.html
npm run proto:photos   # downloads the 123 NEA photos into out/photos (resized with sips on macOS)
open design/prototype/out/preview.html
```

`out/` is gitignored. Photos stay out of git because the licence for the images themselves is unverified; the closures CSV only links to them.

If `nea.gov.sg` is blocked (it is in Claude's cloud sessions), read the photos back from the published prototype instead: they sit at `photos/<id>.jpg` on it.

To republish the artifact, publish `out/uncle-says-closed.html` with `out/photos/*.jpg` as supporting files at `photos/<id>.jpg`.

## Where things are

- `prototype/page.html` is the whole prototype: tokens, components, cast, spinner and state. `prototype/i18n.js` holds every string in English, Chinese, Malay and Tamil, plus the uncle's lines and dish names. `build.py` inlines the data, the strings and the mark.
- `prototype/make-data.ts` runs the real domain code (`scripts/parse.ts`, `src/domain/*`) over the fixture for 20 Oct and 7 Dec. Each centre also carries `shut` (its dated closures that end today or later) and `tbc` (quarters whose cleaning dates are not out yet) for the Board sheet.
- `brand/mark.svg` is the logo: a pandan location pin holding a bowl and chopsticks ("where to eat"). `brand/mark-icon.svg` is the 512px app icon. The wordmark is "Hawker**GoWhere**" in Plus Jakarta Sans 800, "GoWhere" in pandan. Earlier concepts stay in `brand/` for reference.
- `decisions.tsv` is the decision log, one row per call.

## Design rules

- HawkerGoWhere is an independent concept that borrows the government's GoWhere naming as a pitch. Every page says so in the footer, in the chosen language; it never uses a government crest, a gov.sg domain or government design-system branding. The uncle stays as the voice inside the app.
- Board is the design. The prototype has no other layouts.
- White and simple. White page, ink `#16181D` text, grey `#5B6068` secondary text, hairlines `#E4E5E9`, soft fills `#F3F4F6` for search, chips and secondary buttons. Colour only where it means something: chilli `#D22A1D` closed, pandan `#1C7E53` open and the main action, kaya `#F6C343` closing soon and "Go here" (amber `#8F5600` when it is text on white), slate `#6A6F78` not sure. The one solid block on a screen is the verdict card; the "Go here" sign inside it is white. Teh, peranakan and sakura survive only inside the illustrations.
- Language: on first open a full-screen chooser offers English, 中文, Bahasa Melayu and தமிழ் as big buttons; the choice is kept on the phone and the header's globe button changes it. Everything switches, dates included (via `Intl`, e.g. 12月9日周三, Rab, 9 Dis). Centre names stay in English because NEA publishes no translations. The verdict also shows the other three languages underneath. Chinese is the priority second language: at 70+ only 21% mainly speak English at home.
- Interaction stays quiet and useful: every button and row gives a little under the finger; tapping a calendar day answers "Sat 12 Dec: open", "Tue 8 Dec: shut for cleaning" or, where NEA has not published that quarter's dates, "dates not out yet, call first" (those days are hatched); the sheet closes by dragging its handle or header down; search marks the letters typed; choping pops the button. All motion stops under reduced motion.
- Text size: the A+ button beside the date steps through three sizes (x1, x1.15, x1.3) and is kept on the phone. Every font size in the stylesheet is `calc(Npx * var(--ts))`; the header's logo and language button stay fixed so they always fit.
- One family for everything you read: Plus Jakarta Sans, including the verdict word and the uncle's line. Ma Shan Zheng only for Chinese, Noto Sans Tamil for Tamil. The wordmark is an SVG. No Bungee, no handwriting face.
- Built for older users first: 17px body, nothing under 15px on the dark rows, tap targets 48px or more, centre names wrap instead of being cut off, every button says what it does in words, and nothing floats over the content.
- The verdict carries all four official languages, English largest. The strings live in `PLACARD_TEXT` and need a native speaker before launch.
- The cast rotates per centre: a Chinese uncle, a Malay makcik, an Indian uncle and a younger auntie. No government logos, and nothing implies halal status.
- Home, top to bottom: date, a plain headline ("Today 3 centres closed, 3 more closing soon."), "Find makan near me", search, your chope as one big verdict with its "Go here instead" (or a one-line hint to chope), then dark rows under a "Closed today" and a "Closing soon" header, five each with a "See all" per group, then "See all 123 centres" and "Eat where ah? Let Uncle pick" as a plain button.
- A row is a status dot, the centre's short name, the reason (Cleaning, Renovation) and the date that matters ("Back 9 Dec", "Shuts 26 Oct").
- Near me shows the six nearest; search shows eight matches. "See all" groups every centre under Your chope, Closed today, Closing soon, Not sure and Open today.
- The detail sheet: name and address, two labelled buttons ("Chope this centre", "Tell my kakis"), the verdict with the uncle's line, "Go here instead", "When Uncle shuts" (a five-week calendar from this Monday with shut days in chilli, drawn only when a closure lands in part of those weeks, then one row per remaining closure), stall facts, and the NEA photo last, plain.

## Open items

- Owner picked Board on 2026-10-29 and the other four layouts are gone (they live in git history before this change). Photos only appear at the bottom of the detail sheet, so the photo licence no longer blocks launch.
- Owner: approve the design and the new logo (mark C from the 2026-10-29 comparison).
- Native speaker check of every Chinese, Malay and Tamil string in `prototype/i18n.js`.
- Confirm the photo licence, or hotlink `nea.gov.sg` (it sends `cross-origin-resource-policy: cross-origin`) with an NEA credit.
- Create a local `.env` with `DATA_GOV_SG_API_KEY` to verify the `x-api-key` header name.
- Confirm GitHub Pages source is "GitHub Actions" before the first deploy.
- After approval: codify as a Design System artifact, rebuild `src/` from it, update e2e, run an accessibility and Lighthouse pass, then a persona usability test.
