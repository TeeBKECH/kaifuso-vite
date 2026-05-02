// Проверка адаптивности: header, hero, home-afisha, footer на разных разрешениях.
const { chromium } = require('playwright')
const path = require('path')

;(async () => {
  const url = process.env.URL || 'http://127.0.0.1:4175/main.html'
  const outDir = __dirname
  const browser = await chromium.launch()

  // Профили: desktop (hover), tablet/mobile (touch)
  const profiles = [
    { name: 'd-1728', viewport: { width: 1728, height: 900 }, hasTouch: false, isMobile: false },
    { name: 'd-1280', viewport: { width: 1280, height: 800 }, hasTouch: false, isMobile: false },
    { name: 'd-1100', viewport: { width: 1100, height: 800 }, hasTouch: false, isMobile: false },
    { name: 'd-1024', viewport: { width: 1024, height: 768 }, hasTouch: false, isMobile: false },
    { name: 't-820', viewport: { width: 820, height: 1180 }, hasTouch: true, isMobile: true },
    { name: 'm-768', viewport: { width: 768, height: 1024 }, hasTouch: true, isMobile: true },
    { name: 'm-420', viewport: { width: 420, height: 848 }, hasTouch: true, isMobile: true },
    { name: 'm-360', viewport: { width: 360, height: 740 }, hasTouch: true, isMobile: true },
  ]

  for (const p of profiles) {
    const ctx = await browser.newContext({
      viewport: p.viewport,
      deviceScaleFactor: 2,
      hasTouch: p.hasTouch,
      isMobile: p.isMobile,
    })
    const page = await ctx.newPage()
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForTimeout(500)

    // header (top of page)
    await page.screenshot({
      path: path.join(outDir, `r-${p.name}-header.png`),
      clip: { x: 0, y: 0, width: p.viewport.width, height: 110 },
    })

    // hero
    const hero = page.locator('.home-hero, .page-intro--kaifuso').first()
    if (await hero.count()) {
      const box = await hero.boundingBox()
      if (box) {
        await page.screenshot({
          path: path.join(outDir, `r-${p.name}-hero.png`),
          clip: { x: 0, y: 0, width: p.viewport.width, height: Math.min(box.height, 900) },
        })
      }
    }

    // afisha
    const afisha = page.locator('.home-afisha').first()
    if (await afisha.count()) {
      await afisha.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'start' }))
      await page.waitForTimeout(500)
      const box = await afisha.boundingBox()
      if (box) {
        await page.screenshot({
          path: path.join(outDir, `r-${p.name}-afisha.png`),
          clip: { x: 0, y: Math.max(0, box.y), width: p.viewport.width, height: Math.min(box.height, 1100) },
        })
      }
    }

    // footer
    const footer = page.locator('footer.footer').first()
    if (await footer.count()) {
      await footer.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'start' }))
      await page.waitForTimeout(400)
      const box = await footer.boundingBox()
      if (box) {
        await page.screenshot({
          path: path.join(outDir, `r-${p.name}-footer.png`),
          clip: { x: 0, y: Math.max(0, box.y), width: p.viewport.width, height: Math.min(box.height, 1100) },
        })
      }
    }

    await ctx.close()
  }

  await browser.close()
  console.log('done')
})().catch((err) => {
  console.error(err)
  process.exit(1)
})
