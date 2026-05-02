// Headless screenshot of /main.html for visual QA
const { chromium } = require('playwright')
const path = require('path')

;(async () => {
  const url = process.env.URL || 'http://127.0.0.1:4175/main.html'
  const out = process.env.OUT || path.join(__dirname, 'local-main-fullpage.png')
  const width = parseInt(process.env.WIDTH || '1728', 10)
  const height = parseInt(process.env.HEIGHT || '1000', 10)

  const browser = await chromium.launch()
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
  })
  const page = await ctx.newPage()
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(800)
  await page.screenshot({ path: out, fullPage: true })
  await browser.close()
  console.log('Saved:', out)
})().catch((err) => {
  console.error(err)
  process.exit(1)
})
