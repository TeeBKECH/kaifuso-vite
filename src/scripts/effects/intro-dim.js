// Затемнение фона hero-секции «свечой». Добавляет .home-anim_dim внутрь
// каждого .page-intro_bg — слой лежит ПОД контентом интро (за счёт z-index),
// маска радиально открывает фон вокруг курсора (--cx/--cy ставит cursor-glow.js).

import { motion } from '@/scripts/utils/anim-utils.js'

export function initIntroDim() {
  if (motion.reduced) return
  document.querySelectorAll('.page-intro_bg').forEach((bg) => {
    if (bg.querySelector('.home-anim_dim')) return
    const dim = document.createElement('div')
    dim.className = 'home-anim_dim'
    dim.setAttribute('aria-hidden', 'true')
    bg.appendChild(dim)
  })
}
