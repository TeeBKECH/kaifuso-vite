// Проверка: 1) гор.скролл на main.html, 2) home-about, 3) home-afisha (hover + touch).
const { chromium, devices } = require('playwright')
const path = require('path')

const URL = process.env.URL || 'http://127.0.0.1:4175/main.html'
const outDir = __dirname

;(async () => {
  const browser = await chromium.launch()

  // Прогон по разным viewport (mouse, hover) — покажет HOVER-конфигурацию свайпера
  const widthsHover = [1728, 1280, 1100, 1024]
  for (const width of widthsHover) {
    const ctx = await browser.newContext({
      viewport: { width, height: 900 },
      deviceScaleFactor: 1,
      hasTouch: false,
    })
    const page = await ctx.newPage()
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForTimeout(400)

    // 1. Проверка горизонтального скролла на странице
    const scroll = await page.evaluate(() => ({
      docW: document.documentElement.scrollWidth,
      winW: window.innerWidth,
      hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
    }))
    console.log(`[${width}px hover] scroll`, JSON.stringify(scroll))

    // 2. home-about снимок
    const about = page.locator('.home-about').first()
    await about.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'start' }))
    await page.waitForTimeout(400)
    const aboutBox = await about.boundingBox()
    if (aboutBox) {
      await page.screenshot({
        path: path.join(outDir, `home-fix-about-${width}.png`),
        clip: aboutBox,
      })
    }

    // 3. home-afisha снимок (default state, без hover)
    const afisha = page.locator('.home-afisha').first()
    await afisha.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'start' }))
    await page.mouse.move(2, 2)
    await page.waitForTimeout(500)
    const afishaBox = await afisha.boundingBox()
    if (afishaBox) {
      await page.screenshot({
        path: path.join(outDir, `home-fix-afisha-${width}.png`),
        clip: afishaBox,
      })
    }

    await ctx.close()
  }

  // Touch-эмуляция (no-hover): мобильные размеры
  const touchProfiles = [
    { name: 'tablet-768', viewport: { width: 768, height: 1024 } },
    { name: 'phone-420', viewport: { width: 420, height: 800 } },
    { name: 'phone-360', viewport: { width: 360, height: 740 } },
  ]
  for (const p of touchProfiles) {
    const ctx = await browser.newContext({
      viewport: p.viewport,
      deviceScaleFactor: 1,
      hasTouch: true,
      isMobile: true,
      // эмулируем (hover: none)
      reducedMotion: 'no-preference',
    })
    const page = await ctx.newPage()
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForTimeout(400)

    const scroll = await page.evaluate(() => ({
      docW: document.documentElement.scrollWidth,
      winW: window.innerWidth,
      hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
    }))
    console.log(`[${p.name} touch] scroll`, JSON.stringify(scroll))

    const about = page.locator('.home-about').first()
    await about.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'start' }))
    await page.waitForTimeout(400)
    const aboutBox = await about.boundingBox()
    if (aboutBox) {
      await page.screenshot({
        path: path.join(outDir, `home-fix-about-${p.name}.png`),
        clip: aboutBox,
      })
    }

    const afisha = page.locator('.home-afisha').first()
    await afisha.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'start' }))
    await page.waitForTimeout(500)
    const afishaBox = await afisha.boundingBox()
    if (afishaBox) {
      await page.screenshot({
        path: path.join(outDir, `home-fix-afisha-${p.name}-1-init.png`),
        clip: afishaBox,
      })
    }

    const next = page.locator('.home-afisha_nav-next').first()
    if (await next.count()) {
      await next.click()
      await page.waitForTimeout(700)
      const info = await page.evaluate(() => {
        const list = document.querySelector('.home-afisha_list')
        const swiper = list?.swiper
        return {
          activeIndex: swiper?.activeIndex,
          slidesPerView: swiper?.params?.slidesPerView,
        }
      })
      console.log(`[${p.name} touch after-next]`, JSON.stringify(info))
      const afishaBoxAfter = await afisha.boundingBox()
      if (afishaBoxAfter) {
        await page.screenshot({
          path: path.join(outDir, `home-fix-afisha-${p.name}-2-next.png`),
          clip: afishaBoxAfter,
        })
      }
    }

    await ctx.close()
  }

  await browser.close()
})().catch((err) => {
  console.error(err)
  process.exit(1)
})
