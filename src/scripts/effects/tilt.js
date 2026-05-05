// 3D tilt у медиа-блоков (vanilla-tilt.js). Лёгкий наклон + блик.
// Применяется на hover-устройствах. Селекторы — медиа, у которых
// собственного hover-эффекта нет (афиша исключена — у неё свой open/close).
// Доп. элементы можно помечать [data-tilt].

import VanillaTilt from 'vanilla-tilt'
import { motion } from '@/scripts/utils/anim-utils.js'

const SELECTORS = [
  // '.home-club_media',
  // '.home-about-gallery_slide',
  // '.home-gallery_slide',
  // '.gallery_slide',
  // '[data-tilt]',
]

export function initTilt() {
  if (!motion.hasHover || motion.reduced) return
  const els = document.querySelectorAll(SELECTORS.join(', '))
  if (!els.length) return
  VanillaTilt.init(Array.from(els), {
    max: 5,
    speed: 700,
    glare: true,
    'max-glare': 0.16,
    perspective: 1300,
    scale: 1.01,
  })
}
