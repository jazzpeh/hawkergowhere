import { test as base, type Page } from '@playwright/test'

export { expect } from '@playwright/test'

export const NOON_SGT_2026_10_20 = '2026-10-20T04:00:00Z'
export const MAXWELL = { latitude: 1.280550957, longitude: 103.8444595 }

// Every test runs on the fixture snapshot at noon, 20 Oct 2026, with the network outside the site cut off.
// `lang` pre-chooses a language so the first-open chooser stays out of the way; null shows it.
export const test = base.extend<{ now: string; lang: string | null }>({
  now: [NOON_SGT_2026_10_20, { option: true }],
  lang: ['en', { option: true }],
  page: async ({ page, now, lang }, use) => {
    await page.route(url => url.hostname !== 'localhost', route => route.abort())
    await page.clock.setFixedTime(new Date(now))
    if (lang) await page.addInitScript(l => { if (!localStorage.getItem('hgw-lang')) localStorage.setItem('hgw-lang', l) }, lang)
    // A Content Security Policy violation or a script error fails the test, so a change cannot quietly break the deployed page.
    const problems: string[] = []
    page.on('console', m => { if (m.type() === 'error' && /Content Security Policy/i.test(m.text())) problems.push(m.text()) })
    page.on('pageerror', e => problems.push(e.message))
    await use(page)
    if (problems.length) throw new Error(`page reported:\n${problems.join('\n')}`)
  },
})

export const shot = (page: Page, name: string) => page.screenshot({ path: `e2e/screenshots/${name}.png`, fullPage: true, animations: 'disabled' })

export async function pinUncleLines(page: Page) {
  await page.addInitScript(() => {
    Math.random = () => 0
  })
}

export const rowNames = (page: Page, group: string) =>
  page.locator('#abody .bgrp', { hasText: group }).locator('xpath=following-sibling::ol[1]').locator('.bn > span')
