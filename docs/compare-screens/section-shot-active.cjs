// Capture afisha section with a specific active slide via swiper.slideTo
const { chromium } = require('playwright')
const path = require('path')

;(async () => {
  const url = process.env.URL || 'http://127.0.0.1:4175/main.html'
  const out = process.env.OUT || path.join(__dirname, 'section.png')
  const width = parseInt(process.env.WIDTH || '1024', 10)
  const height = parseInt(process.env.HEIGHT || '900', 10)
  const targetIndex = parseInt(process.env.INDEX || '1', 10)

  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(1000)
  await page.waitForSelector('.home-afisha_list.swiper-initialized', { timeout: 5000 })
  await page.waitForTimeout(300)

  // Click next button to move to slide `targetIndex`
  for (let i = 0; i < targetIndex; i += 1) {
    await page.click('.home-afisha_nav-next')
    await page.waitForTimeout(800)
  }
  await page.waitForTimeout(500)

  const el = await page.$('.home-afisha')
  await el.scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)
  await el.screenshot({ path: out })
  await browser.close()
  console.log('Saved:', out, 'index:', targetIndex)
})().catch((err) => {
  console.error(err)
  process.exit(1)
})
