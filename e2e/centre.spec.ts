import { expect, pinUncleLines, shot, test } from './fixtures.ts'

test('a renovation shows the long closure without a calendar, and Go here lands on the alternative', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /^Bukit Timah Market,/ }).click()
  const sheet = page.getByRole('dialog', { name: 'Bukit Timah Market' })
  await expect(sheet.locator('.vbig')).toHaveText('Closed lah')
  await expect(sheet.locator('.vsub')).toHaveText('Back Tue 1 Jan 2030')
  await expect(sheet.locator('.cal')).toHaveCount(0)
  await expect(sheet.locator('.sched .bn')).toHaveText('Renovation')
  await shot(page, 'closed-works')
  await sheet.locator('#goalt').click()
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(page.getByRole('heading', { name: 'All 123 centres' })).toBeVisible()
  await expect(page.getByRole('button', { name: /^Clementi Ave 2 Blk 353,/ })).toBeFocused()
})

test('tapping a calendar day answers whether that day is open', async ({ page }) => {
  await page.goto('/#/c/golden-mile-food-centre')
  const sheet = page.getByRole('dialog', { name: 'Golden Mile Food Centre' })
  await expect(sheet.locator('.vbig')).toHaveText('Shutting soon')
  await expect(sheet.locator('.vsub')).toHaveText('Shut from Mon 26 Oct')
  await expect(sheet.locator('#cal-ans')).toHaveText('Tap a day to check')
  await sheet.getByRole('button', { name: 'Tue 27 Oct' }).click()
  await expect(sheet.locator('#cal-ans')).toHaveText('Tue 27 Oct: shut for cleaning')
  await sheet.getByRole('button', { name: 'Fri 30 Oct' }).click()
  await expect(sheet.locator('#cal-ans')).toHaveText('Fri 30 Oct: open')
  await expect(sheet.getByRole('button', { name: 'Fri 30 Oct' })).toHaveAttribute('aria-pressed', 'true')
  await shot(page, 'closing-soon')
})

test('a link to a centre opens it, and back or Escape closes it', async ({ page }) => {
  await pinUncleLines(page)
  await page.goto('/#/c/adam-road-food-centre')
  const sheet = page.getByRole('dialog', { name: 'Adam Road Food Centre' })
  await expect(sheet.locator('.vsay .vline')).toHaveText('“Adam Road Food Centre open today! Go go go, chope a seat.”')
  await page.keyboard.press('Escape')
  await expect(sheet).toBeHidden()
  await expect(page).toHaveURL(/\/$/)
  await page.getByRole('button', { name: /^Golden Mile,/ }).click()
  await expect(page).toHaveURL(/#\/c\/golden-mile-food-centre$/)
  await page.goBack()
  await expect(page.getByRole('dialog')).toBeHidden()
})

test('a link to a centre that does not exist just opens home', async ({ page }) => {
  await page.goto('/#/c/no-such-centre')
  await expect(page.locator('.headline')).toBeVisible()
  await expect(page.getByRole('dialog')).toBeHidden()
})

test('Tell my kakis copies a message with a link to the centre', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/#/c/bukit-timah-market')
  await page.getByRole('button', { name: 'Tell my kakis' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Copied' })).toBeVisible()
  const copied = await page.evaluate(() => navigator.clipboard.readText())
  expect(copied).toBe('Uncle says Bukit Timah Market closed today, go Clementi Ave 2 Blk 353 instead lah http://localhost:4173/#/c/bukit-timah-market')
})
