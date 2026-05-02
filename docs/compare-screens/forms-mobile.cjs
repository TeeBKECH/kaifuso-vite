// Скрин форм на мобильном — проверка submit во всю ширину.
const { chromium } = require('playwright')
const path = require('path')

;(async () => {
  const url = process.env.URL || 'http://127.0.0.1:4175/main.html'
  const outDir = __dirname
  const browser = await chromium.launch()

  const profiles = [
    { name: 'm-420', viewport: { width: 420, height: 900 } },
    { name: 'm-360', viewport: { width: 360, height: 740 } },
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

    // CTA event form в home-club
    const cta = page.locator('.home-club_form').first()
    if (await cta.count()) {
      await cta.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'start' }))
      await page.waitForTimeout(400)
      const box = await cta.boundingBox()
      if (box) {
        await page.screenshot({
          path: path.join(outDir, `f-${p.name}-cta.png`),
          clip: { x: 0, y: Math.max(0, box.y), width: p.viewport.width, height: Math.min(box.height + 20, 1200) },
        })
      }
    }

    // contacts form в самом низу страницы (home_contacts)
    const contacts = page.locator('.contacts.home_contacts').first()
    if (await contacts.count()) {
      await contacts.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'start' }))
      await page.waitForTimeout(400)
      const box = await contacts.boundingBox()
      if (box) {
        await page.screenshot({
          path: path.join(outDir, `f-${p.name}-contacts.png`),
          clip: { x: 0, y: Math.max(0, box.y), width: p.viewport.width, height: Math.min(box.height + 20, 1500) },
        })
      }
    }

    // Booking modal — открываем модалку через JS event, чтобы избежать перекрытий
    await page.evaluate(() => window.scrollTo({ top: 0 }))
    await page.waitForTimeout(200)
    await page.evaluate(() => {
      const ev = new CustomEvent('modal:open', { detail: { id: 'modal-form' } })
      document.dispatchEvent(ev)
      const m = document.getElementById('modal-form')
      if (m) m.classList.add('open')
    })
    await page.waitForTimeout(700)
    await page.screenshot({
      path: path.join(outDir, `f-${p.name}-booking.png`),
      fullPage: false,
    })

    await ctx.close()
  }

  await browser.close()
  console.log('done')
})().catch((err) => {
  console.error(err)
  process.exit(1)
})
