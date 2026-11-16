import { expect, rowNames, shot, test } from './fixtures.ts'

test('home answers the day: 3 closed and 3 closing soon on 20 Oct 2026', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.headline')).toHaveText('Today 3 centres closed, 3 more closing soon.')
  await expect(page.locator('.today')).toHaveText('Tue 20 Oct')
  await expect(rowNames(page, 'Closed today')).toHaveText(['Bukit Timah Market', 'Clementi West Street 2 Blk 726', 'Toa Payoh Lorong 7 Blk 22'])
  await expect(rowNames(page, 'Closing soon')).toHaveText(['Golden Mile', 'Redhill Lane Blk 79', 'Redhill Lane Blk 85'])
  await expect(page.getByRole('button', { name: /^Bukit Timah Market,/ }).locator('.bwhen')).toHaveText('Back 1 Jan 2030')
  await expect(page.getByRole('button', { name: /^Golden Mile,/ }).locator('.bwhen')).toHaveText('Shuts 26 Oct')
  await expect(page.getByText('Chope your usual centre and Uncle answers it first.')).toBeVisible()
  await shot(page, 'home')
})

test('the footer says who made it, how fresh the data is and the licence', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#disclaim')).toHaveText('HawkerGoWhere is an independent concept, not a Singapore Government service.')
  await expect(page.locator('#asof')).toHaveText('Data as of 20 Oct 2026, 8:00 am')
  await expect(page.getByRole('link', { name: 'Singapore Open Data Licence version 1.0' })).toHaveAttribute('href', 'https://data.gov.sg/open-data-licence')
})

test('a status header opens every centre with that status', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /See all 123 centres/ }).click()
  await expect(page.getByRole('heading', { name: 'All 123 centres' })).toBeVisible()
  await expect(page.locator('#wall .bgrp')).toHaveText([/Closed today\s*3/, /Closing soon\s*3/, /Not sure, call first\s*2/, /Open today\s*115/])
  await page.getByRole('button', { name: 'Back to today' }).click()
  await expect(page.locator('.headline')).toBeVisible()
})

test('chope puts your centre first as one big answer', async ({ page }) => {
  await page.goto('/#/c/bukit-timah-market')
  await page.getByRole('button', { name: 'Chope this centre' }).click()
  await expect(page.getByRole('button', { name: 'Choped' })).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('Escape')
  const card = page.locator('#abody .verdict')
  await expect(card.locator('.vbig')).toHaveText('Closed lah')
  await expect(card.locator('.vnm')).toHaveText('Bukit Timah Market')
  await expect(card.locator('.go-sign .nm')).toHaveText('Clementi Ave 2 Blk 353')
  await page.reload()
  await expect(page.locator('#abody .verdict .vnm')).toHaveText('Bukit Timah Market')
})

test('search marks what you typed and says when nothing matches', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('searchbox', { name: 'Search hawker centre' }).fill('bed')
  await expect(page.locator('#abody .brow')).toHaveCount(8)
  await expect(page.locator('#abody mark').first()).toHaveText('Bed')
  await page.getByRole('searchbox', { name: 'Search hawker centre' }).fill('zzzz')
  await expect(page.getByText('Paiseh, cannot find this one leh.')).toBeVisible()
})
