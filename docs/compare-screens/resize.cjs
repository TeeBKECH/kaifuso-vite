// Resize a large reference jpg/png using browser canvas via Playwright (no native deps)
const { chromium } = require('playwright')
const path = require('path')
const fs = require('fs')
;(async () => {
  const inputPath = process.env.IN
  const outPath = process.env.OUT
  const targetWidth = parseInt(process.env.W || '1024', 10)
  if (!inputPath || !outPath) {
    console.error('Set IN= and OUT=')
    process.exit(1)
  }

  const buf = fs.readFileSync(inputPath)
  const ext = path.extname(inputPath).slice(1).toLowerCase() || 'jpeg'
  const mime = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`
  const dataUri = `data:${mime};base64,${buf.toString('base64')}`

  const browser = await chromium.launch()
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await page.setContent('<canvas id="c"></canvas>')

  const result = await page.evaluate(
    async ({ src, targetWidth }) => {
      const img = new Image()
      img.src = src
      await new Promise((resolve) => {
        img.onload = resolve
      })
      const ratio = targetWidth / img.naturalWidth
      const canvas = document.getElementById('c')
      canvas.width = targetWidth
      canvas.height = Math.round(img.naturalHeight * ratio)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      return canvas.toDataURL('image/jpeg', 0.7)
    },
    { src: dataUri, targetWidth },
  )

  const base64 = result.replace(/^data:.*;base64,/, '')
  fs.writeFileSync(outPath, Buffer.from(base64, 'base64'))
  await browser.close()
  console.log('Saved:', outPath)
})().catch((err) => {
  console.error(err)
  process.exit(1)
})
