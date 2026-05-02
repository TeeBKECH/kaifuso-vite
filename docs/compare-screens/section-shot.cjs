// Capture clipped screenshot of a specific section by selector at a given viewport
const { chromium } = require('playwright')
const path = require('path')

;(async () => {
  const url = process.env.URL || 'http://127.0.0.1:4175/main.html'
  const out = process.env.OUT || path.join(__dirname, 'section.png')
  const width = parseInt(process.env.WIDTH || '1728', 10)
  const height = parseInt(process.env.HEIGHT || '1000', 10)
  const selector = process.env.SELECTOR || '.home-afisha'
  const padTop = parseInt(process.env.PAD_TOP || '40', 10)
  const padBottom = parseInt(process.env.PAD_BOTTOM || '40', 10)

  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(1500)
  // ждём инициализации swiper
  try {
    await page.waitForSelector('.home-afisha_list.swiper-initialized', { timeout: 5000 })
  } catch (e) {
    console.warn('swiper init timeout')
  }
  await page.waitForTimeout(500)

  const el = await page.$(selector)
  if (!el) {
    console.error('Selector not found:', selector)
    process.exit(2)
  }
  const box = await el.boundingBox()
  if (!box) {
    console.error('boundingBox null')
    process.exit(3)
  }
  const clip = {
    x: 0,
    y: Math.max(0, box.y - padTop),
    width,
    height: Math.min(8000, box.height + padTop + padBottom),
  }
  await page.screenshot({ path: out, clip, fullPage: true })
  await browser.close()
  console.log('Saved:', out, 'clip:', clip)
})().catch((err) => {
  console.error(err)
  process.exit(1)
})
