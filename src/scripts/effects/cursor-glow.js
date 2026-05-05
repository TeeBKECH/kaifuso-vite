// Глобальный custom cursor (тёплая палитра) + warm-glow по странице.
// Glow в зоне .page-intro отключён (класс is-off). Кольцо / glow / маска dim
// следуют за курсором без сглаживания (mx/my напрямую).
// Пишет --gx/--gy на .home-anim_glow и --cx/--cy на каждом .page-intro_bg.

import { motion } from '@/scripts/utils/anim-utils.js'

let inited = false

export function initCursorGlow() {
  if (inited) return
  if (motion.reduced || !motion.hasHover) return
  inited = true

  // ── DOM ────────────────────────────────────────────────────────────────
  const cursor = document.createElement('div')
  cursor.className = 'home-anim_cursor'
  cursor.setAttribute('aria-hidden', 'true')
  cursor.innerHTML =
    '<span class="home-anim_cursor-ring"></span>' +
    '<span class="home-anim_cursor-dot"></span>'
  document.body.appendChild(cursor)

  const glow = document.createElement('div')
  glow.className = 'home-anim_glow'
  glow.setAttribute('aria-hidden', 'true')
  document.body.appendChild(glow)

  document.body.classList.add('home-anim_has-cursor')

  const ring = cursor.querySelector('.home-anim_cursor-ring')
  const dot = cursor.querySelector('.home-anim_cursor-dot')

  // ── State ──────────────────────────────────────────────────────────────
  let mx = window.innerWidth / 2
  let my = window.innerHeight / 2

  document.addEventListener(
    'mousemove',
    (e) => {
      mx = e.clientX
      my = e.clientY
    },
    { passive: true },
  )

  function pointerInIntro() {
    return [...document.querySelectorAll('.page-intro')].some((el) => {
      const r = el.getBoundingClientRect()
      return mx >= r.left && mx <= r.right && my >= r.top && my <= r.bottom
    })
  }

  // ── RAF tick ───────────────────────────────────────────────────────────
  const heroBgs = () => document.querySelectorAll('.page-intro_bg')

  const tick = () => {
    if (dot) dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`
    if (ring) ring.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`

    glow.classList.toggle('is-off', pointerInIntro())
    glow.style.setProperty('--gx', `${mx}px`)
    glow.style.setProperty('--gy', `${my}px`)

    heroBgs().forEach((bg) => {
      const r = bg.getBoundingClientRect()
      bg.style.setProperty('--cx', `${mx - r.left}px`)
      bg.style.setProperty('--cy', `${my - r.top}px`)
    })

    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)

  // ── Hover-targets через делегирование ──────────────────────────────────
  const HOVER_SEL = 'a, button, [role="button"], [data-cursor-hover]'
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(HOVER_SEL)) cursor.classList.add('is-hover')
  })
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(HOVER_SEL)) cursor.classList.remove('is-hover')
  })

  // Скрываем курсор при выходе из окна — иначе остаётся «висеть» в углу
  document.addEventListener('mouseleave', () => cursor.classList.add('is-hidden'))
  document.addEventListener('mouseenter', () => cursor.classList.remove('is-hidden'))
}
