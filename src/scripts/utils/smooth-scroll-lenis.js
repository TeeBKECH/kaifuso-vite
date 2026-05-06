// Глобальный плавный скролл через Lenis. Активируем для анимационных вариантов главной.
import Lenis from 'lenis'

let instance = null

export function initLenis() {
  if (instance) return instance
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null

  instance = new Lenis({
    duration: 1.1,
    easing: (t) => 1 - Math.pow(1 - t, 3),
    smoothWheel: true,
    // Lenis v2: нативный touch-скролл (smoothTouch в опциях нет — он игнорировался).
    syncTouch: false,
  })

  function raf(time) {
    instance.raf(time)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)

  // Открываем доступ для дебага и автотестов: window.__lenis.scrollTo(target, { immediate: true })
  if (typeof window !== 'undefined') window.__lenis = instance

  return instance
}

export function getLenis() {
  return instance
}
