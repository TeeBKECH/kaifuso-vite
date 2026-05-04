// Глобальные «atmospheric» эффекты для всего сайта:
//   • Lenis smooth scroll
//   • Mouse-parallax (CSS-переменные --mx/--my для всех желающих)
//   • Custom cursor + warm glow
//   • Затемнение hero-фона «свечой» (intro-dim)
//   • 4-конечные звёзды в hero (с плавным появлением/исчезанием, без «радиации»)
//     или альтернативные эффекты — particles.js/sparticles (см. detectMode)
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
import { initIntroParticles } from './intro-particles.js'
import { initIntroLeaves } from './intro-leaves.js'
import { initScrollParallax } from './scroll-parallax.js'
import { initTilt } from './tilt.js'
import { initAfishaStagger } from './afisha-stagger.js'
import { initHeroFade } from './hero-fade.js'
import { initAosReveal } from './aos-reveal.js'

let inited = false

// Режимы интро (выставляются на .page через @page_class в pug):
//   • .lite-effects   — fog/stars выключены, glow 300px, dim светлее (см. effects.scss).
//   • .particles-mode — интерактивные частицы в hero (particles.js).
//   • .leaves-mode    — падающие листья (sparticles).
// .particles-mode и .leaves-mode по логике взаимоисключают звёзды и обычно
// идут вместе с .lite-effects (тестовые страницы main-lite-*).
function detectMode() {
  return {
    lite: !!document.querySelector('.lite-effects'),
    particles: !!document.querySelector('.particles-mode'),
    leaves: !!document.querySelector('.leaves-mode'),
  }
}

export function initEffects() {
  if (inited) return
  inited = true

  const mode = detectMode()
  if (mode.lite) document.body.classList.add('effects-lite')

  // Сначала Lenis — другим эффектам нужен доступ к нему (scroll-parallax).
  initLenis()

  attachMouseParallax({ lerp: 0.07 })
  initCursorGlow()
  initIntroDim()
  initHeroFade()

  // Hero-частицы: только один режим за раз.
  // Звёзды — дефолт; в particles/leaves/lite — отключаем.
  if (mode.particles) {
    initIntroParticles()
  } else if (mode.leaves) {
    initIntroLeaves()
  } else if (!mode.lite) {
    initIntroStars()
  }

  initScrollParallax()
  initAfishaStagger()
  initAosReveal()
}

// Vanilla-tilt полагается на размеры элементов — Swiper'ы инициализируются
// в main.js синхронно после initEffects, но имеет смысл подождать кадр.
export function initEffectsLate() {
  initTilt()
}
