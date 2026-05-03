// 4-конечные звёзды-частицы в hero-секции. Каждая звезда:
//   • один раз за цикл проигрывает CSS-keyframe (1 итерация, animation-fill: both)
//   • после animationend ждёт случайную паузу
//   • переезжает на новую случайную позицию и снова стартует
// Это устраняет «эффект радиации» (мгновенное исчезновение после появления),
// который возникал при изменении animation-duration на лету у CSS-infinite-цикла.

import { motion } from '@/scripts/utils/anim-utils.js'

const STAR_COUNT = 5
const KEYFRAME = 'home-anim-twinkle'

function rand(min, max) {
  return min + Math.random() * (max - min)
}

function spawn(star) {
  // Сбрасываем анимацию (force reflow), чтобы перезапустить с новым duration
  star.style.animation = 'none'
  // eslint-disable-next-line no-unused-expressions
  star.offsetWidth

  star.style.left = `${rand(5, 92).toFixed(1)}%`
  star.style.top = `${rand(8, 80).toFixed(1)}%`
  star.style.setProperty('--size', `${rand(10, 18).toFixed(1)}px`)

  const dur = rand(3.6, 5.2)
  star.style.animation = `${KEYFRAME} ${dur.toFixed(2)}s ease-in-out 1 both`
}

function attachLoop(star) {
  star.addEventListener('animationend', () => {
    setTimeout(() => spawn(star), rand(900, 2200))
  })
}

export function initIntroStars() {
  if (motion.reduced || !motion.hasHover) return

  // Рисуем звёзды в .page-intro (если есть) или в .home-hero как фолбэк
  const intros = document.querySelectorAll('.page-intro, .home-hero')
  intros.forEach((intro) => {
    if (intro.querySelector('.home-anim_stars')) return

    if (getComputedStyle(intro).position === 'static') {
      intro.style.position = 'relative'
    }

    const wrap = document.createElement('div')
    wrap.className = 'home-anim_stars'
    wrap.setAttribute('aria-hidden', 'true')
    intro.appendChild(wrap)

    for (let i = 0; i < STAR_COUNT; i++) {
      const s = document.createElement('span')
      s.className = 'home-anim_star'
      attachLoop(s)
      wrap.appendChild(s)
      // Стартовая задержка — разносим первые вспышки по времени
      setTimeout(() => spawn(s), i * rand(450, 900))
    }
  })
}
