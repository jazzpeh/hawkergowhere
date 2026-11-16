import { expect, MAXWELL, rowNames, shot, test } from './fixtures.ts'

test.describe('first open', () => {
  test.use({ lang: null })

  test('asks for a language, then remembers it', async ({ page }) => {
    await page.goto('/')
    const chooser = page.getByRole('dialog', { name: /Choose your language/ })
    await expect(chooser).toBeVisible()
    await shot(page, 'language')
    await chooser.getByRole('button', { name: '中文' }).click()
    await expect(chooser).toBeHidden()
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-SG')
    await expect(page.locator('.headline')).toHaveText('今天3个小贩中心休息，另有3个即将休息。')
    await expect(rowNames(page, '今天休息')).toHaveCount(3)
    await page.reload()
    await expect(page.getByRole('dialog', { name: /Choose your language/ })).toBeHidden()
    await expect(page.locator('.headline')).toHaveText('今天3个小贩中心休息，另有3个即将休息。')
  })
})

test('the language button switches everything, dates included', async ({ page }) => {
  await page.goto('/#/c/golden-mile-food-centre')
  await expect(page.getByRole('dialog', { name: 'Golden Mile Food Centre' })).toBeVisible()
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Language: English' }).click()
  await page.getByRole('button', { name: 'Bahasa Melayu' }).click()
  await expect(page.locator('.headline')).toHaveText('Hari ini 3 pusat penjaja tutup, 3 lagi akan tutup.')
  await expect(page.getByRole('button', { name: /^Golden Mile,/ }).locator('.bwhen')).toHaveText('Tutup 26 Okt')
  await expect(page.locator('#disclaim')).toHaveText('HawkerGoWhere ialah konsep bebas, bukan perkhidmatan Kerajaan Singapura.')
})

test('A+ makes all text bigger and is remembered', async ({ page }) => {
  await page.goto('/')
  const size = () => page.locator('.headline').evaluate(el => parseFloat(getComputedStyle(el).fontSize))
  const base = await size()
  await page.getByRole('button', { name: 'Text size' }).click()
  await page.getByRole('button', { name: 'Text size' }).click()
  expect(await size()).toBeCloseTo(base * 1.3, 0)
  await page.reload()
  expect(await size()).toBeCloseTo(base * 1.3, 0)
})

test.describe('near me', () => {
  test.use({ geolocation: MAXWELL, permissions: ['geolocation'] })

  test('lists the six nearest centres with distances', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Find makan near me' }).click()
    await expect(page.getByText('Showing the 6 nearest to you')).toBeVisible()
    await expect(page.locator('#abody .brow .bn > span')).toHaveText(['Maxwell', 'Smith Street Blk 335', 'Amoy Street', 'Tanjong Pagar Plaza Blk 6', 'Upper Cross Street Blk 531A', 'New Market Road Blk 32'])
    await expect(page.locator('#abody .brow .bsub').first()).toContainText('50 m')
    await shot(page, 'near-me')
  })
})

test.describe('location off', () => {
  test.use({ permissions: [] })

  test('says so plainly and keeps the closures on screen', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Find makan near me' }).click()
    await expect(page.getByText('Uncle cannot see where you are. Turn on location for this page, or search instead.')).toBeVisible()
    await expect(rowNames(page, 'Closed today')).toHaveCount(3)
  })
})

test('when the closure list cannot load, it says what to do', async ({ page }) => {
  await page.route('**/data/centres.json', route => route.fulfill({ status: 503 }))
  await page.goto('/')
  await expect(page.getByRole('alert')).toHaveText('Aiyoh, Uncle cannot load the closure list right now. Check your connection and refresh the page.')
  await shot(page, 'data-down')
})

test.describe('phone width', () => {
  test.use({ viewport: { width: 360, height: 780 } })

  for (const l of ['en', 'zh', 'ms', 'ta'] as const) {
    test(`nothing scrolls sideways in ${l}, at the largest text size`, async ({ page }) => {
      await page.addInitScript(x => { localStorage.setItem('hgw-lang', x); localStorage.setItem('hgw-ts', '2') }, l)
      await page.goto('/#/c/golden-mile-food-centre')
      await expect(page.getByRole('dialog')).toBeVisible()
      const wide = () => page.evaluate(() => document.documentElement.scrollWidth > innerWidth || [...document.querySelectorAll('.panel')].some(p => p.scrollWidth > p.clientWidth))
      expect(await wide()).toBe(false)
      await page.keyboard.press('Escape')
      expect(await wide()).toBe(false)
      if (l === 'ta') await shot(page, 'phone-ta')
    })
  }
})
