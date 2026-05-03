// Глобальные «atmospheric» эффекты для всего сайта:
//   • Lenis smooth scroll
//   • Mouse-parallax (CSS-переменные --mx/--my для всех желающих)
//   • Custom cursor + warm glow
//   • Затемнение hero-фона «свечой» (intro-dim)
//   • 4-конечные звёзды в hero (с плавным появлением/исчезанием, без «радиации»)
//   • Scroll-parallax фона hero и медиа клуба
//   • 3D tilt у медиа-блоков (vanilla-tilt)
//   • Stagger-появление карточек афиши
//   • Soft fade-up у hero-контента на загрузке
//   • AOS-reveal для контентных блоков

import { initLenis } from '@/scripts/utils/smooth-scroll-lenis.js'
import { attachMouseParallax } from '@/scripts/utils/anim-utils.js'

import { initCursorGlow } from './cursor-glow.js'
import { initIntroDim } from './intro-dim.js'
import { initIntroStars } from './intro-stars.js'
import { initScrollParallax } from './scroll-parallax.js'
import { initTilt } from './tilt.js'
import { initAfishaStagger } from './afisha-stagger.js'
import { initHeroFade } from './hero-fade.js'
import { initAosReveal } from './aos-reveal.js'

let inited = false

export function initEffects() {
  if (inited) return
  inited = true

  // Сначала Lenis — другим эффектам нужен доступ к нему (scroll-parallax).
  initLenis()

  attachMouseParallax({ lerp: 0.07 })
  initCursorGlow()
  initIntroDim()
  initHeroFade()
  initIntroStars()
  initScrollParallax()
  initAfishaStagger()
  initAosReveal()
}

// Vanilla-tilt полагается на размеры элементов — Swiper'ы инициализируются
// в main.js синхронно после initEffects, но имеет смысл подождать кадр.
export function initEffectsLate() {
  initTilt()
}
