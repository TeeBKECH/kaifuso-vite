import { motion } from '@/scripts/utils/anim-utils.js'

/** @param {HTMLElement} root */
function setPreloaderProgress(root, p) {
  const v = Math.max(0, Math.min(1, p))
  root.style.setProperty('--preloader-progress', String(v))
}

/**
 * @param {HTMLElement} root
 * @param {HTMLElement} body
 */
function finishPreloader(root, body) {
  let hideFallbackId = 0
  let removed = false
  const removeNode = () => {
    if (removed) return
    removed = true
    window.clearTimeout(hideFallbackId)
    root.remove()
  }

  root.classList.add('preloader--done')
  root.setAttribute('aria-busy', 'false')
  body.classList.remove('noscroll')
  hideFallbackId = window.setTimeout(removeNode, 80)
}

/**
 * Декоративный режим: 0 → 1 за data-preloader-seconds (сек), без ожидания load.
 * @param {HTMLElement} root
 * @param {number} durationSec
 * @param {() => void} onDone
 */
function runTimedPreloader(root, durationSec, onDone) {
  const durationMs = Math.max(0.3, durationSec) * 1000
  const t0 = performance.now()
  const easeOutCubic = (t) => 1 - (1 - t) ** 3

  let raf = 0
  const tick = (now) => {
    const raw = Math.min(1, (now - t0) / durationMs)
    setPreloaderProgress(root, easeOutCubic(raw))
    if (raw >= 1) {
      setPreloaderProgress(root, 1)
      onDone()
      return
    }
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
}

/**
 * Режим загрузки: целевой прогресс из readyState + window.load; плавное следование.
 * Реальный единый «процент загрузки страницы» в браузере недоступен — используем этапы
 * парсинга/интерактивности и событие load (= 100%), значения можно подкрутить при необходимости.
 * @param {HTMLElement} root
 * @param {() => void} onDone
 */
function runLoadPreloader(root, onDone) {
  let target = 0
  const sync = () => {
    const rs = document.readyState
    if (rs === 'complete') target = 1
    else if (rs === 'interactive') target = Math.max(target, 0.72)
    else target = Math.max(target, 0.1)
  }

  sync()
  document.addEventListener('readystatechange', sync)
  window.addEventListener(
    'load',
    () => {
      target = 1
    },
    { once: true },
  )

  let current = 0
  let raf = 0
  let finished = false

  const tick = () => {
    if (finished) return
    sync()
    current += (target - current) * 0.14
    if (target >= 1 && current > 0.997) current = 1
    setPreloaderProgress(root, current)

    if (document.readyState === 'complete' && current >= 0.999) {
      finished = true
      setPreloaderProgress(root, 1)
      document.removeEventListener('readystatechange', sync)
      cancelAnimationFrame(raf)
      onDone()
      return
    }
    raf = requestAnimationFrame(tick)
  }

  raf = requestAnimationFrame(tick)
}

/** ≤768px: тёмный фон держим до window.load, затем плавно убираем (лист по-прежнему от --preloader-progress). */
function bindMobileBackdropAfterLoad(root) {
  const mq = window.matchMedia('(max-width: 768px)')
  const apply = () => {
    if (!mq.matches) return
    root.classList.add('preloader--backdrop-after-load')
  }
  if (document.readyState === 'complete') apply()
  else window.addEventListener('load', apply, { once: true })
}

/**
 * data-preloader-mode: "load" | "timed"
 * data-preloader-seconds: секунды (только timed), по умолчанию 2
 */
export function initPreloader() {
  if (typeof document === 'undefined') return

  const root = document.getElementById('preloader')
  if (!root) return

  const body = document.body
  const mode = root.dataset.preloaderMode === 'timed' ? 'timed' : 'load'
  const seconds = parseFloat(String(root.dataset.preloaderSeconds || '2'), 10) || 2

  bindMobileBackdropAfterLoad(root)

  if (motion.reduced) {
    setPreloaderProgress(root, 1)
    finishPreloader(root, body)
    return
  }

  body.classList.add('noscroll')

  const done = () => finishPreloader(root, body)

  if (mode === 'timed') {
    runTimedPreloader(root, seconds, done)
  } else {
    runLoadPreloader(root, done)
  }
}
