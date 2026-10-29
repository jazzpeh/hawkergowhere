# Design

The approved direction for Uncle Says Closed, and the throwaway prototype that proves it. The app in `src/` still has the old list/cards look; it gets rebuilt from this once the design is signed off.

## Links

Both are private to the repo owner.

- Playable prototype: https://claude.ai/artifact/A3xpXizGkpxnKZTcL8PC41
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

- `prototype/page.html` is the whole prototype: tokens, components, placard text, cast, spinner and state. `build.py` inlines the data and logo.
- `prototype/make-data.ts` runs the real domain code (`scripts/parse.ts`, `src/domain/*`) over the fixture for 20 Oct and 7 Dec. Each centre also carries `shut` (its dated closures that end today or later) and `tbc` (quarters whose cleaning dates are not out yet) for the Board sheet.
- `brand/` holds the four logo concepts. Peekaboo Shutter is the pick; Half-Shut reads best at 16px.
- `decisions.tsv` is the decision log, one row per call.

## Design rules

- Flat colour. Chilli `#E23B2E` (text-safe `#D22A1D`) means closed and nothing else. Pandan `#1F8A5B` (`#1C7E53`) is open and the primary action. Kaya `#F6C343` is closing soon, "Go here" and the floating button. Slate `#6A6F78` is unknown. Cream `#FFF4E0` ground, ink `#1E1B18` text. Teh, peranakan and sakura are accents only.
- Plus Jakarta Sans for UI. Bungee only on placards and the wordmark. Ma Shan Zheng only for Chinese. Noto Sans Tamil for Tamil. Gochi Hand only on the taped note.
- Placards carry all four official languages, English largest. The strings live in `PLACARD_TEXT` and need a native speaker before launch.
- The cast rotates per centre: a Chinese uncle, a Malay makcik, an Indian uncle and a younger auntie. No government logos, and nothing implies halal status.
- Home answers without scrolling: uncle headline with tappable counts, "Find makan near me", search, at most six tiles, "See all". "Eat where ah?" is the floating button.
- Layouts share one data path: `view(rows, near)` in `page.html` draws any list of centres as the board, wall, deck, shelves or stalls, so search, near me, chope, "See all" and "Go here" behave the same in all five.
  - Board (default): your first chope answered in one big verdict with its "Go here instead", then one dark row per centre with a status dot, the reason and the date that matters ("Back 9 Dec", "Shuts 26 Oct"). Eight rows on home, no photos. "See all" groups the rows under Your chope, Shut today, Closing soon, Not sure and Open today.
    - Board's detail sheet repeats the verdict with the three other languages on one line and the uncle's line inside it, then "Go here instead", then "When Uncle shuts": a five-week calendar from this Monday with shut days in chilli, drawn only when a closure lands in part of those weeks, and one dark row per remaining closure. The photo sits last, plain and in full colour. The tile layouts keep the polaroid sheet.
  - Wall: taped polaroids, at most six on home.
  - Deck: one big card with the uncle's line, swipe, arrow keys or Next to move; up to 12 on home.
  - Shelves: one sideways rail per status on a teh plank; every shut and closing centre on home, 12 for near me.
  - Stalls: lit signboard over a roller shutter: down when shut (counter says when it is back), part down and flickering when closing soon, up when open.
- Tiles are each centre's real NEA photo as a taped polaroid. Closed goes black and white with the placard stamped across; closing soon is faded with a kaya stamp; open is full colour.

## Open items

- Owner picked Board on 2026-10-29. Wall, Deck, Shelves and Stalls stay behind the Layout switch until Board is built in `src/`; then they go. Photos now only appear at the bottom of the detail sheet, so the photo licence no longer blocks launch.
- Owner: approve the design and the logo.
- Owner: pick a way to show stalls (see the 2026-10-29 `stalls` rows in `decisions.tsv`). No open dataset lists stalls inside hawker centres.
- Native speaker check of the Malay, Chinese and Tamil placard strings.
- Confirm the photo licence, or hotlink `nea.gov.sg` (it sends `cross-origin-resource-policy: cross-origin`) with an NEA credit.
- Create a local `.env` with `DATA_GOV_SG_API_KEY` to verify the `x-api-key` header name.
- Confirm GitHub Pages source is "GitHub Actions" before the first deploy.
- After approval: codify as a Design System artifact, rebuild `src/` from it, update e2e, run an accessibility and Lighthouse pass, then a persona usability test.
