// Soft fade-up у hero-контента на загрузке страницы. Применяется ко всем
// .page-intro_kicker / _title / _text / _btn — на всех страницах с intro.
// Стили в effects.scss (.home-anim_fade + .is-revealed).

import { motion } from '@/scripts/utils/anim-utils.js'

const SEL = '.page-intro_kicker, .page-intro_title, .page-intro_text, .page-intro_btn'

export function initHeroFade() {
  const blocks = document.querySelectorAll(SEL)
  if (!blocks.length) return

  blocks.forEach((el, i) => {
    el.classList.add('home-anim_fade')
    el.style.setProperty('--i', i)
  })

  if (motion.reduced) {
    blocks.forEach((el) => el.classList.add('is-revealed'))
    return
  }

  // RAF чтобы стартовое состояние гарантированно отрисовалось
  requestAnimationFrame(() => {
    blocks.forEach((el) => el.classList.add('is-revealed'))
  })
}
