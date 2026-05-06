// Scroll-parallax. По умолчанию работает для:
//   • .page-intro_bg img  — фон hero, strength 0.18
//   • .home-club_media     — медиа-блок клуба, strength 0.10
// Доп. элементы можно помечать атрибутом data-parallax + data-parallax-strength.
// Использует Lenis (если активен) или нативный scroll.

import { motion } from '@/scripts/utils/anim-utils.js'
import { getLenis } from '@/scripts/utils/smooth-scroll-lenis.js'

const DEFAULTS = [
  { sel: '.page-intro_bg img', strength: 0.18 },
  { sel: '.home-about_decor--left', strength: -0.06 },
  { sel: '.home-about_decor--alt', strength: -0.06 },
  { sel: '.home-club_media', strength: 0.1 },
  { sel: '.home-about-gallery', strength: -0.1 },
  { sel: '.home-about-gallery_slide', strength: -0.2 },
  { sel: '.home-about-gallery_slide img', strength: 0.1 },
  // { sel: '.home-gallery', strength: -0.1 },
  { sel: '.home-gallery_slide', strength: -0.1 },
  { sel: '.home-gallery_slide img', strength: 0.04 },
  { sel: '.about-page_story_media img', strength: 0.2 },
  { sel: '.home-gallery_pagination', strength: -0.1 },
  { sel: '.home-about_logo', strength: 0.1 },
  { sel: '.about-page_story_media', strength: -0.1 },
]

export function initScrollParallax() {
  if (motion.reduced) return

  const items = []
  DEFAULTS.forEach(({ sel, strength }) => {
    document.querySelectorAll(sel).forEach((el) => {
      items.push({ el, strength })
    })
  })
  document.querySelectorAll('[data-parallax]').forEach((el) => {
    if (items.some((it) => it.el === el)) return
    const strength = parseFloat(el.dataset.parallax) || 0.12
    items.push({ el, strength })
  })

  if (!items.length) return
  items.forEach(({ el }) => (el.style.willChange = 'transform'))

  const update = () => {
    const vh = window.innerHeight
    items.forEach(({ el, strength }) => {
      const r = el.getBoundingClientRect()
      // Игнорируем элементы вне viewport (минор-оптимизация для длинных страниц)
      if (r.bottom < -200 || r.top > vh + 200) return
      const center = r.top + r.height / 2
      const offset = (center - vh / 2) * strength * -1
      if (el.classList.contains('home-gallery_pagination')) {
        el.style.transform = `translateX(-50%) translate3d(0, ${offset.toFixed(1)}px, 0)`
      } else if (el.classList.contains('home-about_decor--left')) {
        el.style.transform = `translateY(-50%) translate3d(0, ${offset.toFixed(1)}px, 0)`
      } else if (el.classList.contains('home-about_decor--alt')) {
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0) scaleX(-1)`
      } else {
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`
      }
    })
  }

  const lenis = getLenis()
  if (lenis) lenis.on('scroll', update)
  else window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update, { passive: true })
  update()
}
