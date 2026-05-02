// Скриншоты секции home-afisha в разных состояниях:
// 1) default (никаких ховеров)
// 2) hover на 2-й слайд
// 3) после клика на nav-next (свайп)
const { chromium } = require('playwright')
const path = require('path')

;(async () => {
  const url = process.env.URL || 'http://127.0.0.1:4175/main.html'
  const outDir = __dirname
  const widths = [1728, 1280, 1024, 768, 420]

  const browser = await chromium.launch()

  for (const width of widths) {
    const ctx = await browser.newContext({
      viewport: { width, height: 900 },
      deviceScaleFactor: 1,
      hasTouch: false,
      isMobile: false,
    })
    const page = await ctx.newPage()
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForTimeout(500)

    const section = await page.locator('.home-afisha').first()
    await section.scrollIntoViewIfNeeded()
    await page.waitForTimeout(400)

    // 1) Default
    await page.screenshot({
      path: path.join(outDir, `afisha-${width}-1-default.png`),
      clip: await section.boundingBox(),
    })

    // 2) Hover на 2-й слайд (если экран ≥769)
    if (width >= 769) {
      const slides = await page.locator('.home-afisha_slide').all()
      if (slides.length >= 2) {
        await slides[1].hover()
        await page.waitForTimeout(900)
        await page.screenshot({
          path: path.join(outDir, `afisha-${width}-2-hover2.png`),
          clip: await section.boundingBox(),
        })
        // Уйти с hover
        await page.mouse.move(0, 0)
        await page.waitForTimeout(900)
      }
    }

    // 3) Клик на next, потом скриншот без hover
    const nextBtn = page.locator('.home-afisha_nav-next')
    if (await nextBtn.count() > 0) {
      await nextBtn.first().click()
      await page.waitForTimeout(900)
      await page.mouse.move(0, 0)
      await page.waitForTimeout(300)
      await page.screenshot({
        path: path.join(outDir, `afisha-${width}-3-after-next.png`),
        clip: await section.boundingBox(),
      })
    }

    await ctx.close()
    console.log('Saved snapshots for width', width)
  }

  await browser.close()
})().catch((err) => {
  console.error(err)
  process.exit(1)
})
