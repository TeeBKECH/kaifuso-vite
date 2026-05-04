// Падающие листья в hero (sparticlesjs.dev). Активируется на странице с
// классом .leaves-mode (см. main-lite-leaves.pug).
//
// logo-decor.svg использовать «как есть» нельзя — это композиция логотипа
// 618×320 со множеством путей, sparticles требует square 1:1. Делаем три
// стилизованных листа в тёплой палитре прямо в коде (data-URI, ~700 байт
// на каждый), не плодим ассеты. Если позже понадобятся «фирменные» листы —
// можно подменить URL'ы здесь.

import { motion } from '@/scripts/utils/anim-utils.js'

const CONTAINER_CLASS = 'home-anim_leaves'

function leafSvg({ fill, vein }) {
  // 64×64 viewBox, простой силуэт листа с центральной прожилкой
  return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>
<path d='M32 4 C 18 12, 8 28, 12 44 C 14 52, 22 60, 32 60 C 42 60, 50 52, 52 44 C 56 28, 46 12, 32 4 Z'
      fill='${fill}' fill-opacity='0.9'/>
<path d='M32 6 Q 33 32 32 58' stroke='${vein}' stroke-width='1.2' stroke-opacity='0.55' fill='none'/>
<path d='M32 18 Q 24 22 18 28' stroke='${vein}' stroke-width='0.8' stroke-opacity='0.4' fill='none'/>
<path d='M32 28 Q 40 30 46 38' stroke='${vein}' stroke-width='0.8' stroke-opacity='0.4' fill='none'/>
<path d='M32 38 Q 25 42 20 48' stroke='${vein}' stroke-width='0.7' stroke-opacity='0.35' fill='none'/>
</svg>`
}

const LEAVES = [
  { fill: '#FFC387', vein: '#a36d3a' },
  { fill: '#E89A4F', vein: '#7a4519' },
  { fill: '#D67232', vein: '#5a3010' },
].map((c) => `data:image/svg+xml;utf8,${encodeURIComponent(leafSvg(c))}`)

export async function initIntroLeaves() {
  if (motion.reduced) return

  const intro = document.querySelector('.page-intro')
  if (!intro) return
  if (intro.querySelector(`.${CONTAINER_CLASS}`)) return

  if (getComputedStyle(intro).position === 'static') {
    intro.style.position = 'relative'
  }

  const wrap = document.createElement('div')
  wrap.className = CONTAINER_CLASS
  wrap.setAttribute('aria-hidden', 'true')
  intro.appendChild(wrap)

  const { default: Sparticles } = await import('sparticles')

  // Параметры подобраны под «листву на ветру»: умеренное падение вниз,
  // ощутимый боковой drift, медленное вращение, мягкое появление-исчезание.
  // eslint-disable-next-line no-new
  new Sparticles(wrap, {
    count: 22,
    shape: 'image',
    imageUrl: LEAVES,
    color: 'random',
    randomColorCount: 1,
    minSize: 14,
    maxSize: 32,
    direction: 180,
    xVariance: 4,
    yVariance: 1.5,
    speed: 4,
    parallax: 1.5,
    rotation: 1.2,
    drift: 4,
    glow: 0,
    twinkle: false,
    alphaSpeed: 6,
    alphaVariance: 1,
    minAlpha: 0.6,
    maxAlpha: 1,
    composition: 'source-over',
  })
}
