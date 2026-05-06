// Подсветка текста при скролле: вертикальная «полоса» (несколько строк сразу), а не узкая волна по одной букве.
// Разметка: любое число контейнеров с data-scroll-reading и вложенными p внутри root.
// Подписка на скролл как в scroll-parallax: Lenis если есть, иначе window.

import { motion } from '@/scripts/utils/anim-utils.js'
import { getLenis } from '@/scripts/utils/smooth-scroll-lenis.js'

/** Класс span на каждом символе — стили в .home-about_read-char (home.scss). */
const CHAR_CLASS = 'home-about_read-char'

/** Ограничивает число отрезком [0, 1] — для прогресса и смешивания цвета. */
function clamp01(x) {
  return Math.max(0, Math.min(1, x))
}

/**
 * S-образное сглаживание 0→1: медленнее на краях, быстрее в середине —
 * переход «тусклый / яркий» по буквам выглядит мягче, чем по линейному t.
 */
function smoothstep(t) {
  t = clamp01(t)
  return t * t * (3 - 2 * t)
}

/**
 * Разбивает текст абзаца на отдельные span (по одному символу, пробел тоже).
 * Нужно, чтобы задать каждому символу свой цвет от скролла.
 * @param {HTMLParagraphElement} p
 */
function wrapParagraph(p) {
  const text = p.textContent || ''
  if (!text) return []
  const frag = document.createDocumentFragment()
  /** @type {HTMLSpanElement[]} */
  const chars = []
  for (const ch of text) {
    const span = document.createElement('span')
    span.className = CHAR_CLASS
    span.textContent = ch
    frag.appendChild(span)
    chars.push(span)
  }
  p.replaceChildren(frag)
  return chars
}

/**
 * Интерполяция цвета символа: «ещё не дошли» (коричневато-оранжевый) → «уже прочитали»
 * (тёплый кремовый). t ∈ [0, 1]; через smoothstep внутри — мягкий край градиента.
 */
function applyReadColor(el, t) {
  const u = smoothstep(t)
  const r0 = 229
  const g0 = 154
  const b0 = 80
  const a0 = 0.48
  const r1 = 237
  const g1 = 229
  const b1 = 175
  const a1 = 0.97
  const r = Math.round(r0 + (r1 - r0) * u)
  const g = Math.round(g0 + (g1 - g0) * u)
  const b = Math.round(b0 + (b1 - b0) * u)
  const a = a0 + (a1 - a0) * u
  el.style.color = `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`
}

/**
 * Один блок с data-scroll-reading: оборачивает p в span’ы, вешает обновление по скроллу.
 * @param {HTMLElement} container
 */
function initScrollReadingBlock(container) {
  if (container.dataset.scrollReadingInit === '1') return

  const paragraphs = container.querySelectorAll('p')
  if (!paragraphs.length) return

  /** @type {HTMLSpanElement[]} */
  const allChars = []
  paragraphs.forEach((p) => {
    allChars.push(...wrapParagraph(p))
  })
  if (!allChars.length) return

  container.dataset.scrollReadingInit = '1'

  /**
   * На какой доле «сырого» прогресса скролла (raw 0…1) весь текст уже полностью яркий.
   * 0.8 → к ~80% пути скролла через блок всё уже подсвечено; начало (raw=0) без изменений.
   */
  const READING_COMPLETE_AT = 0.8

  /**
   * Толщина вертикальной зоны градиента (тусклый→яркий): доля высоты блока + минимум в px.
   * Больше ratio / min → шире полоса, за один кадр в градиенте участвует больше строк.
   */
  const BAND_RATIO = 0.38
  const BAND_MIN_PX = 72

  const update = () => {
    const rect = container.getBoundingClientRect()
    const vh = window.innerHeight
    const raw = (vh - rect.top) / (vh + rect.height)
    const progress = clamp01(raw / READING_COMPLETE_AT)

    const h = Math.max(1, rect.height)
    const band = Math.max(BAND_MIN_PX, h * BAND_RATIO)
    const travel = h + 2 * band
    const edgeY = rect.top - band + progress * travel

    for (const el of allChars) {
      const r = el.getBoundingClientRect()
      const cy = r.top + r.height * 0.5
      const t = clamp01((edgeY - cy + band) / (2 * band))
      applyReadColor(el, t)
    }
  }

  const lenis = getLenis()
  if (lenis) lenis.on('scroll', update)
  else window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update, { passive: true })
  update()
}

/**
 * Все блоки [data-scroll-reading] под root (по умолчанию document): каждый со своим прогрессом скролла.
 * @param {ParentNode} [root]
 */
export function initScrollReadingText(root = document) {
  if (typeof document === 'undefined') return
  if (motion.reduced) return

  root.querySelectorAll('[data-scroll-reading]').forEach((el) => {
    if (el instanceof HTMLElement) initScrollReadingBlock(el)
  })
}
