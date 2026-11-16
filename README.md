# HawkerGoWhere

Is my hawker centre open today? HawkerGoWhere answers in one tap, in English, Chinese, Malay or Tamil, from NEA's published closure dates, and points you to the nearest open centre when yours is shut.

**Live:** https://jazzpeh.github.io/hawkergowhere/

HawkerGoWhere is an independent concept, not a Singapore Government service.

## How it works

- Every morning at 05:00 Singapore time, a GitHub Actions job downloads NEA's [Dates of Hawker Centres Closure](https://data.gov.sg/datasets/d_bda4baa634dd1cc7a6c7cad5f19e2d68/view) from data.gov.sg, parses it, tests the app against a fixed copy, builds it and deploys it to GitHub Pages.
- The site is static: one HTML page, its script and styles, the fonts, and `data/centres.json`. Visitors never call data.gov.sg, so its rate limit never affects them.
- The status logic lives in `src/domain/` and is covered by unit tests in `tests/`. The screens are in `src/ui/`, the strings for all four languages in `src/i18n.ts`, and the browser tests in `e2e/`.
- Design decisions and the prototype are in `design/`.

## Run it

```sh
npm ci
npm run snapshot:fixture   # writes public/data/centres.json from the fixture, no API key needed
npm run dev
npm test && npm run e2e    # unit tests, then browser tests against the production build
```

`npm run snapshot` fetches the live data. It reads `DATA_GOV_SG_API_KEY` from the environment or from a local `.env`, which git ignores.

## Privacy and security

- No accounts, cookies, analytics or tracking. Your chosen language, text size and choped centres stay in your browser's local storage.
- "Near me" uses your location only in the browser, to sort centres by distance. It is never sent anywhere.
- The page's Content Security Policy allows scripts, styles, fonts and data from the site itself only, and images from the site and www.nea.gov.sg. The browser tests fail on any policy violation.
- The data.gov.sg API key is a GitHub Actions secret. It reaches only the snapshot step, is sent only to data.gov.sg, and the deploy fails if it appears anywhere in the built site.

See [SECURITY.md](SECURITY.md) to report a problem.

## Licence

Code: MIT, see [LICENSE](LICENSE). Contains information from Dates of Hawker Centres Closure accessed from data.gov.sg, made available under the [Singapore Open Data Licence version 1.0](https://data.gov.sg/open-data-licence). Centre photos are NEA's and load from nea.gov.sg.
