// Снимки модалки site-menu (десктоп) на разных ширинах + проверка иконки телефона.
const { chromium } = require('playwright')
const path = require('path')

;(async () => {
  const url = process.env.URL || 'http://127.0.0.1:4175/main.html'
  const outDir = __dirname
  const browser = await chromium.launch()

  const profiles = [
    { name: 'd-1728', viewport: { width: 1728, height: 980 }, hasTouch: false },
    { name: 'd-1280', viewport: { width: 1280, height: 900 }, hasTouch: false },
    { name: 'm-768', viewport: { width: 768, height: 1024 }, hasTouch: true, isMobile: true },
    { name: 'm-420', viewport: { width: 420, height: 900 }, hasTouch: true, isMobile: true },
  ]

  for (const p of profiles) {
    const ctx = await browser.newContext({
      viewport: p.viewport,
      deviceScaleFactor: 2,
      hasTouch: p.hasTouch || false,
      isMobile: p.isMobile || false,
    })
    const page = await ctx.newPage()
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForTimeout(500)

    // header (sanity check phone icon)
    await page.screenshot({
      path: path.join(outDir, `sm-${p.name}-header.png`),
      clip: { x: 0, y: 0, width: p.viewport.width, height: 110 },
    })

    // open site-menu (desktop only) or mobile-menu (small)
    const burger = p.viewport.width > 992
      ? page.locator('.header_burger--site').first()
      : page.locator('.header_burger--mobile').first()
    if (await burger.count()) {
      await burger.click()
      await page.waitForTimeout(700)
      await page.screenshot({
        path: path.join(outDir, `sm-${p.name}-open.png`),
        fullPage: false,
      })
    }

    await ctx.close()
  }

  await browser.close()
  console.log('done')
})().catch((err) => {
  console.error(err)
  process.exit(1)
})
