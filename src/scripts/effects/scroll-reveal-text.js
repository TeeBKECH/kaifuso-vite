// Проявление блока текста по скроллу — одна градиентная mask (как на десктопе) на всех ширинах.
// Узкая вёрстка: другой расчёт p + более узкая полоса градиента (меньше feather), чем на десктопе.
// touchmove + window scroll: на части Android только scroll может редко стрелять при инерции.
//
// data-scroll-reveal-full-at (0…1), data-scroll-reveal-lead — зарезервировано

import { motion } from '@/scripts/utils/anim-utils.js'
import { getLenis } from '@/scripts/utils/smooth-scroll-lenis.js'

const NARROW_MQ = '(max-width: 1024px)'

function isNarrowViewport() {
  if (typeof window.matchMedia === 'function' && window.matchMedia(NARROW_MQ).matches) {
    return true
  }
  const w = window.innerWidth || document.documentElement?.clientWidth || 0
  return w <= 1024
}

function clamp01(x) {
  return Math.max(0, Math.min(1, x))
}

function endFracFromFullAt(fullAt) {
  return Math.min(0.72, Math.max(0.3, fullAt))
}

/** На низком viewport (ниже «типичного» телефона пользователя) чуть больше span и gamma —
 * меньше пикселей на экран, тот же тюнинг казался бы слишком резким; запас по скроллу и верху блока. */
function narrowProgressTuningByVh(vh) {
  const hi = 780
  const lo = 520
  if (vh >= hi) return { spanMult: 0.74, gamma: 1.38 }
  if (vh <= lo) return { spanMult: 0.88, gamma: 1.52 }
  const t = (hi - vh) / (hi - lo)
  return {
    spanMult: 0.74 + (0.88 - 0.74) * t,
    gamma: 1.38 + (1.52 - 1.38) * t,
  }
}

/** Узкий экран: по верху блока. Блок ≈ высоте экрана → к моменту просмотра rect.top уже малый и «сырой» прогресс ≈1,
 * верх оказывается под сплошной маской, градиент только внизу. Большой span + gamma>1 и слабый boost снижают p,
 * чтобы верхние строки дольше оставались в полупрозрачной зоне. */
function revealProgressNarrowByTop(rect, vh, fullAt) {
  const endF = endFracFromFullAt(fullAt)
  const startT = vh * 1.0
  const endTFrac = Math.max(0.05, Math.min(0.24, 0.7 - endF * 0.5))
  const endT = vh * endTFrac
  const { spanMult, gamma } = narrowProgressTuningByVh(vh)
  const span = Math.max(vh * spanMult, startT - endT)
  const raw = clamp01((startT - rect.top) / span)
  return clamp01(raw ** gamma)
}

function viewportHeight() {
  const vv = window.visualViewport
  return Math.max(1, vv?.height ?? window.innerHeight ?? 1)
}

function revealScrubRange(vh, h, fullAt) {
  const ratio = h / Math.max(vh, 1)
  const endFrac = endFracFromFullAt(fullAt)
  const endLine = vh * endFrac

  let startLine = vh * 1.05
  if (ratio >= 0.38) {
    const u = Math.min(1, (ratio - 0.38) / 0.62)
    startLine += vh * (0.06 + 0.16 * u)
  }
  startLine += Math.min(vh * 0.28, h * 0.32)

  const gap = startLine - endLine
  const span = Math.max(vh * 0.18, gap)
  return { startLine, endLine, span }
}

/**
 * @param {HTMLElement} el
 * @param {boolean} narrow — узкая ширина: более узкая полоса смягчения градиента
 */
function applyRevealGradientMask(el, p, narrow) {
  el.style.webkitClipPath = 'none'
  el.style.clipPath = 'none'

  const rect = el.getBoundingClientRect()
  const h = Math.max(1, rect.height)
  const pEff = clamp01(p * 1.02 - 0.005)

  const feather = narrow
    ? Math.max(52, Math.min(140, h * 0.22))
    : Math.max(48, Math.min(120, h * 0.18))

  if (pEff <= 0.002) {
    const t = 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 100%)'
    el.style.webkitMaskImage = t
    el.style.maskImage = t
    return
  }

  // К концу p сужаем «перо» до 0, чтобы мягкий край сам сходил к сплошной маске без скачка mask:none.
  const taperStart = narrow ? 0.78 : 0.85
  let featherUse = feather
  if (pEff > taperStart) {
    const k = clamp01((pEff - taperStart) / (1 - taperStart))
    featherUse = feather * (1 - k)
  }

  const boost = (1 - pEff) * featherUse * (narrow ? 0.08 : 0.3)
  const edge = Math.min(h, pEff * h + boost)
  const t0 = Math.max(0, edge - featherUse * (narrow ? 0.28 : 0.35))
  const t1 = Math.min(h, edge + featherUse * (narrow ? 0.38 : 0.5))

  if (featherUse <= 2 || t1 - t0 < 2) {
    const solid = 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 100%)'
    el.style.webkitMaskImage = solid
    el.style.maskImage = solid
    return
  }

  const g = `linear-gradient(to bottom, rgba(0,0,0,1) 0px, rgba(0,0,0,1) ${t0}px, rgba(0,0,0,0) ${t1}px)`
  el.style.webkitMaskImage = g
  el.style.maskImage = g
}

/** @param {HTMLElement} container */
function initScrollRevealBlock(container) {
  if (container.dataset.scrollRevealTextInit === '1') return
  container.dataset.scrollRevealTextInit = '1'

  const rawFull = parseFloat(
    String(container.getAttribute('data-scroll-reveal-full-at') || ''),
    10,
  )

  container.style.webkitMaskSize = '100% 100%'
  container.style.maskSize = '100% 100%'
  container.style.webkitMaskRepeat = 'no-repeat'
  container.style.maskRepeat = 'no-repeat'
  if ('webkitMaskMode' in container.style) {
    container.style.webkitMaskMode = 'alpha'
  }
  if ('maskMode' in container.style) {
    container.style.maskMode = 'alpha'
  }

  const update = () => {
    const rect = container.getBoundingClientRect()
    const narrow = isNarrowViewport()
    const vh = narrow ? viewportHeight() : Math.max(1, window.innerHeight)
    const h = Math.max(1, rect.height)
    const fullAt =
      Number.isFinite(rawFull) && rawFull > 0 && rawFull < 1
        ? rawFull
        : narrow
          ? 0.62
          : 0.54

    if (rect.bottom < -20) {
      fillMaskFull(container)
      return
    }

    if (rect.top > vh + 40) {
      applyRevealGradientMask(container, 0, narrow)
      return
    }

    let p
    if (narrow) {
      p = revealProgressNarrowByTop(rect, vh, fullAt)
    } else {
      const { startLine, span } = revealScrubRange(vh, h, fullAt)
      const anchor = (rect.top + rect.bottom) * 0.5
      p = clamp01((startLine - anchor) / span)
    }

    applyRevealGradientMask(container, p, narrow)
  }

  let scrollRaf = 0
  const scheduleUpdate = () => {
    if (scrollRaf) return
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = 0
      update()
    })
  }

  const lenis = getLenis()
  if (lenis) lenis.on('scroll', scheduleUpdate)
  window.addEventListener('scroll', scheduleUpdate, { passive: true })
  window.addEventListener('touchmove', scheduleUpdate, { passive: true })
  window.addEventListener('resize', scheduleUpdate, { passive: true })
  window.visualViewport?.addEventListener('resize', scheduleUpdate, { passive: true })
  window.visualViewport?.addEventListener('scroll', scheduleUpdate, { passive: true })
  update()
}

function fillMaskFull(el) {
  el.style.webkitMaskImage = 'none'
  el.style.maskImage = 'none'
  el.style.webkitClipPath = 'none'
  el.style.clipPath = 'none'
}

export function initScrollRevealText(root = document) {
  if (typeof document === 'undefined') return
  if (motion.reduced) {
    root.querySelectorAll('[data-scroll-reveal-text]').forEach((el) => {
      if (el instanceof HTMLElement) fillMaskFull(el)
    })
    return
  }

  root.querySelectorAll('[data-scroll-reveal-text]').forEach((el) => {
    if (el instanceof HTMLElement) initScrollRevealBlock(el)
  })
}
