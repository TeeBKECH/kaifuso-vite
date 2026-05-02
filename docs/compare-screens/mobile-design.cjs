// Снимки мобильной версии главной + открытое меню (392px согласно Figma).
const { chromium } = require('playwright')
const path = require('path')

;(async () => {
  const url = process.env.URL || 'http://127.0.0.1:4175/main.html'
  const outDir = __dirname
  const browser = await chromium.launch()

  const profiles = [
    { name: 'figma-392', viewport: { width: 392, height: 848 } },
    { name: 'phone-360', viewport: { width: 360, height: 740 } },
  ]

  for (const p of profiles) {
    const ctx = await browser.newContext({
      viewport: p.viewport,
      deviceScaleFactor: 2,
      hasTouch: true,
      isMobile: true,
    })
    const page = await ctx.newPage()
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForTimeout(500)

    // Полностраничный снимок
    await page.screenshot({
      path: path.join(outDir, `mobile-main-${p.name}-fullpage.png`),
      fullPage: true,
    })

    // Снимки секций отдельно
    const sections = ['.home-hero, .page-intro--kaifuso', '.home-about', '.home-about-gallery', '.home-afisha', '.home-club']
    for (const sel of sections) {
      const loc = page.locator(sel).first()
      if (await loc.count()) {
        await loc.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'start' }))
        await page.waitForTimeout(400)
        const box = await loc.boundingBox()
        if (box) {
          const safeName = sel.replace(/[.,\s]/g, '_').replace(/[^\w-]/g, '')
          await page.screenshot({
            path: path.join(outDir, `mobile-${p.name}-${safeName}.png`),
            clip: box,
          })
        }
      }
    }

    // Открыть мобильное меню
    await page.evaluate(() => window.scrollTo({ top: 0 }))
    await page.waitForTimeout(200)
    const burger = page.locator('.header_burger--mobile').first()
    if (await burger.count()) {
      await burger.click()
      await page.waitForTimeout(700)
      await page.screenshot({
        path: path.join(outDir, `mobile-menu-${p.name}.png`),
        fullPage: false,
      })
    }

    await ctx.close()
  }

  await browser.close()
})().catch((err) => {
  console.error(err)
  process.exit(1)
})
