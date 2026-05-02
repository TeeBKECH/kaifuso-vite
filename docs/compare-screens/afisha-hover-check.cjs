// Проверка: hover на slide N не двигает wrapper, но открывает hovered slide.
const { chromium } = require('playwright')
const path = require('path')

;(async () => {
  const url = process.env.URL || 'http://127.0.0.1:4175/main.html'
  const browser = await chromium.launch()

  for (const width of [1728, 1280, 1024]) {
    const ctx = await browser.newContext({
      viewport: { width, height: 900 },
      hasTouch: false,
    })
    const page = await ctx.newPage()
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForTimeout(400)

    const afisha = page.locator('.home-afisha').first()
    await afisha.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'start' }))
    await page.mouse.move(2, 2)
    await page.waitForTimeout(500)

    // Default — записываем translate
    const initial = await page.evaluate(() => {
      const list = document.querySelector('.home-afisha_list')
      const wrapper = list?.querySelector('.swiper-wrapper')
      return wrapper ? getComputedStyle(wrapper).transform : null
    })

    // Hover на slide 2 (index 1)
    const slide2 = page.locator('.home-afisha_slide').nth(1)
    await slide2.hover()
    await page.waitForTimeout(900)

    const afterHover = await page.evaluate(() => {
      const list = document.querySelector('.home-afisha_list')
      const wrapper = list?.querySelector('.swiper-wrapper')
      const slides = Array.from(document.querySelectorAll('.home-afisha_slide'))
      return {
        transform: wrapper ? getComputedStyle(wrapper).transform : null,
        widths: slides.map((s) => Math.round(s.getBoundingClientRect().width)),
      }
    })

    console.log(`[${width}px hover-check]`, JSON.stringify({
      initialTransform: initial,
      afterHoverTransform: afterHover.transform,
      slideWidths: afterHover.widths,
      sameTransform: initial === afterHover.transform,
    }))

    const box = await afisha.boundingBox()
    if (box) {
      await page.screenshot({
        path: path.join(__dirname, `hover-check-${width}-hovered.png`),
        clip: box,
      })
    }

    await ctx.close()
  }
  await browser.close()
})().catch((err) => {
  console.error(err)
  process.exit(1)
})
