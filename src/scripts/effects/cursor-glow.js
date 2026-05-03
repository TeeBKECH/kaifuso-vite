// Глобальный custom cursor (тёплая палитра) + запаздывающее warm-glow.
// Создаёт DOM один раз при первом вызове, привязывается к body, пишет
// CSS-переменные --gx/--gy на glow и --cx/--cy на каждом .page-intro_bg
// (для маски затемнения вокруг курсора, которую делает intro-dim.js).

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
  let rx = mx
  let ry = my
  let gx = mx
  let gy = my

  document.addEventListener(
    'mousemove',
    (e) => {
      mx = e.clientX
      my = e.clientY
    },
    { passive: true },
  )

  // ── RAF tick ───────────────────────────────────────────────────────────
  const heroBgs = () => document.querySelectorAll('.page-intro_bg')

  const tick = () => {
    rx += (mx - rx) * 0.22
    ry += (my - ry) * 0.22
    gx += (mx - gx) * 0.05
    gy += (my - gy) * 0.05

    if (dot) dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`
    if (ring) ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`
    glow.style.setProperty('--gx', `${gx}px`)
    glow.style.setProperty('--gy', `${gy}px`)

    heroBgs().forEach((bg) => {
      const r = bg.getBoundingClientRect()
      bg.style.setProperty('--cx', `${gx - r.left}px`)
      bg.style.setProperty('--cy', `${gy - r.top}px`)
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
