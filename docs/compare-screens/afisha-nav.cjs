// Проверка стрелок афиши: next, next, prev — должно последовательно двигать слайды.
const { chromium } = require('playwright')
const path = require('path')

;(async () => {
  const url = process.env.URL || 'http://127.0.0.1:4175/main.html'
  const outDir = __dirname
  const widths = [1728, 1280, 1024]

  const browser = await chromium.launch()

  for (const width of widths) {
    const ctx = await browser.newContext({
      viewport: { width, height: 900 },
      deviceScaleFactor: 1,
    })
    const page = await ctx.newPage()
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })

    // Прыгнем сразу в нужную секцию (без скролла, чтобы избежать sticky/scroll-анимаций)
    await page.evaluate(() => {
      const el = document.querySelector('.home-afisha')
      if (el) {
        const rect = el.getBoundingClientRect()
        window.scrollTo({ top: window.scrollY + rect.top - 80, behavior: 'instant' })
      }
    })
    await page.waitForTimeout(500)

    const sectionLoc = page.locator('.home-afisha').first()
    const list = page.locator('.home-afisha_list')
    const next = page.locator('.home-afisha_nav-next')
    const prev = page.locator('.home-afisha_nav-prev')

    const snap = async (label) => {
      // Уйти курсором, чтобы не было hover'а
      await page.mouse.move(5, 5)
      await page.waitForTimeout(750)
      const box = await sectionLoc.boundingBox()
      if (!box) return
      // Активный индекс/translate для логов
      const info = await page.evaluate(() => {
        const list = document.querySelector('.home-afisha_list')
        const swiper = list?.swiper
        const slides = list ? Array.from(list.querySelectorAll('.home-afisha_slide')) : []
        const wrapper = list?.querySelector('.swiper-wrapper')
        const transform = wrapper ? getComputedStyle(wrapper).transform : null
        return {
          activeIndex: swiper?.activeIndex ?? null,
          slideCount: slides.length,
          activeSlideIdx: slides.findIndex((s) => s.classList.contains('swiper-slide-active')),
          widths: slides.map((s) => Math.round(s.getBoundingClientRect().width)),
          transform,
        }
      })
      console.log(`[${width}px ${label}]`, JSON.stringify(info))
      await page.screenshot({
        path: path.join(outDir, `afisha-${width}-nav-${label}.png`),
        clip: box,
      })
    }

    await snap('0-init')

    await next.click()
    await snap('1-next1')

    await next.click()
    await snap('2-next2')

    await next.click()
    await snap('3-next3')

    await next.click()
    await snap('4-next4')

    await next.click()
    await snap('5-next5-overshoot')

    await prev.click()
    await snap('6-prev1')

    await prev.click()
    await snap('7-prev2')

    await ctx.close()
  }

  await browser.close()
})().catch((err) => {
  console.error(err)
  process.exit(1)
})
