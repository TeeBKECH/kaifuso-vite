// Интерактивные частицы в hero (particles.js от V. Garreau).
// Активируется на странице с классом .particles-mode (см. main-lite-particles.pug).
//
// Частицы — тёплые «искры» в цвет акцента, между ними тянутся тонкие линии.
// При наведении мыши — линии «грабятся» к курсору, по клику добавляются новые
// искры.
//
// ВАЖНО: particles.js v2.0.0 использует устаревшие конструкции (arguments.callee),
// которые роняют ESM-модуль в strict-режиме (`'caller', 'callee'... may not be
// accessed on strict mode functions`). Поэтому грузим скрипт классическим тегом
// <script> (он не в strict-режиме). Через Vite берём URL ассета в node_modules
// — Vite копирует файл в build/assets и проставляет хеш.

import particlesScriptUrl from 'particles.js/particles.js?url'

import { motion } from '@/scripts/utils/anim-utils.js'

const CONTAINER_ID = 'home-anim-particles'

const CONFIG = {
  particles: {
    number: {
      value: 60,
      density: { enable: true, value_area: 900 },
    },
    color: { value: ['#ffc387', '#ffd9a5', '#d99452'] },
    shape: {
      type: 'circle',
      stroke: { width: 0, color: '#000' },
    },
    opacity: {
      value: 0.55,
      random: true,
      anim: { enable: true, speed: 0.6, opacity_min: 0.15, sync: false },
    },
    size: {
      value: 2.4,
      random: true,
      anim: { enable: true, speed: 1.5, size_min: 0.4, sync: false },
    },
    line_linked: {
      enable: true,
      distance: 140,
      color: '#ffb25f',
      opacity: 0.18,
      width: 1,
    },
    move: {
      enable: true,
      speed: 0.8,
      direction: 'none',
      random: true,
      straight: false,
      out_mode: 'out',
      bounce: false,
      attract: { enable: false },
    },
  },
  interactivity: {
    detect_on: 'window',
    events: {
      onhover: { enable: true, mode: 'grab' },
      onclick: { enable: true, mode: 'push' },
      resize: true,
    },
    modes: {
      grab: { distance: 160, line_linked: { opacity: 0.55 } },
      push: { particles_nb: 3 },
      bubble: { distance: 200, size: 6, duration: 2, opacity: 0.8, speed: 3 },
      repulse: { distance: 120, duration: 0.4 },
    },
  },
  retina_detect: true,
}

// Подгружаем библиотеку как обычный <script>: НЕ ESM-модуль, без strict-режима.
let particlesPromise = null
function loadParticlesScript() {
  if (typeof window.particlesJS === 'function') return Promise.resolve()
  if (particlesPromise) return particlesPromise
  particlesPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = particlesScriptUrl
    s.async = true
    s.onload = () => resolve()
    s.onerror = (e) => {
      particlesPromise = null
      reject(e)
    }
    document.head.appendChild(s)
  })
  return particlesPromise
}

export async function initIntroParticles() {
  if (motion.reduced || !motion.hasHover) return

  const intro = document.querySelector('.page-intro')
  if (!intro) return
  if (document.getElementById(CONTAINER_ID)) return

  if (getComputedStyle(intro).position === 'static') {
    intro.style.position = 'relative'
  }

  const wrap = document.createElement('div')
  wrap.id = CONTAINER_ID
  wrap.className = 'home-anim_particles'
  wrap.setAttribute('aria-hidden', 'true')
  intro.appendChild(wrap)

  await loadParticlesScript()
  if (typeof window.particlesJS === 'function') {
    window.particlesJS(CONTAINER_ID, CONFIG)
  }
}
