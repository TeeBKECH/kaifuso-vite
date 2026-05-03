// Утилиты для анимационных эффектов главной (main-4 «Atmospheric»).

const PREFERS_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const HAS_HOVER = window.matchMedia('(hover: hover) and (pointer: fine)').matches

export const motion = {
  reduced: PREFERS_REDUCED,
  hasHover: HAS_HOVER,
}

/**
 * Reveal-on-scroll: добавляет класс `is-revealed` элементам, попавшим в viewport.
 * Каждый элемент анимируется один раз. CSS отвечает за визуал.
 *
 * @param {string|NodeList|Element[]} target — селектор или коллекция элементов
 * @param {object} opts
 *   @param {string} opts.cls — класс, который добавляется при ревеле (default 'is-revealed')
 *   @param {number} opts.threshold — IntersectionObserver threshold
 *   @param {string} opts.rootMargin — IntersectionObserver rootMargin
 *   @param {number} opts.staggerStep — задержка между элементами в группе (data-anim-group)
 */
export function revealOnView(target, opts = {}) {
  const { cls = 'is-revealed', threshold = 0.18, rootMargin = '0px 0px -10% 0px', staggerStep = 0 } =
    opts

  const els = typeof target === 'string' ? document.querySelectorAll(target) : Array.from(target)
  if (!els.length) return () => {}

  if (PREFERS_REDUCED) {
    els.forEach((el) => el.classList.add(cls))
    return () => {}
  }

  const groupCounters = new Map()
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const el = entry.target
        if (staggerStep && el.dataset.animGroup) {
          const g = el.dataset.animGroup
          const i = groupCounters.get(g) || 0
          el.style.transitionDelay = `${i * staggerStep}ms`
          groupCounters.set(g, i + 1)
        }
        el.classList.add(cls)
        io.unobserve(el)
      })
    },
    { threshold, rootMargin },
  )

  els.forEach((el) => io.observe(el))
  return () => io.disconnect()
}

/**
 * Разбивает текст элемента на span'ы — по словам или символам — для stagger-reveal.
 * Сохраняет HTML-разметку <br>; пробелы заменяются на пробельные разделители.
 *
 * @param {Element} el — корневой элемент
 * @param {'words'|'chars'} mode — режим (default 'words')
 */
export function splitText(el, mode = 'words') {
  if (!el || el.dataset.split === '1') return
  const html = el.innerHTML

  // Разбираем содержимое: текстовые ноды + <br>. Игнорируем вложенные элементы (для простоты).
  const tmp = document.createElement('div')
  tmp.innerHTML = html

  const out = []
  Array.from(tmp.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent
      if (mode === 'chars') {
        for (const ch of text) {
          if (ch === ' ') {
            out.push(' ')
          } else {
            out.push(`<span class="anim-char">${ch}</span>`)
          }
        }
      } else {
        text.split(/(\s+)/).forEach((part) => {
          if (!part) return
          if (/^\s+$/.test(part)) {
            out.push(part)
          } else {
            out.push(`<span class="anim-word">${part}</span>`)
          }
        })
      }
    } else if (node.nodeName === 'BR') {
      out.push('<br>')
    } else {
      out.push(node.outerHTML || node.textContent || '')
    }
  })

  el.innerHTML = out.join('')
  el.dataset.split = '1'
}

/**
 * «Магнитный» эффект для кнопки: легко тянется к курсору в пределах элемента.
 * @param {Element} el
 * @param {object} opts.strength — макс. смещение в px (default 12)
 */
export function attachMagnetic(el, { strength = 12 } = {}) {
  if (!el || PREFERS_REDUCED || !HAS_HOVER) return () => {}
  const onMove = (e) => {
    const r = el.getBoundingClientRect()
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2)
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2)
    const x = Math.max(-1, Math.min(1, dx)) * strength
    const y = Math.max(-1, Math.min(1, dy)) * strength
    el.style.setProperty('--mg-x', `${x}px`)
    el.style.setProperty('--mg-y', `${y}px`)
  }
  const onLeave = () => {
    el.style.setProperty('--mg-x', '0px')
    el.style.setProperty('--mg-y', '0px')
  }
  el.addEventListener('mousemove', onMove)
  el.addEventListener('mouseleave', onLeave)
  return () => {
    el.removeEventListener('mousemove', onMove)
    el.removeEventListener('mouseleave', onLeave)
  }
}

/**
 * Парсит CSS-переменные параллакса под движение мыши: пишет в element style
 * переменные --mx и --my (значения -1..1) на основе global mousemove.
 *
 * @param {object} opts.target — корень для записи переменных (default document.documentElement)
 * @param {number} opts.lerp — коэффициент сглаживания (0..1, default 0.08)
 */
export function attachMouseParallax({ target = document.documentElement, lerp = 0.08 } = {}) {
  if (PREFERS_REDUCED || !HAS_HOVER) return () => {}
  let tx = 0
  let ty = 0
  let cx = 0
  let cy = 0
  let raf = 0

  const onMove = (e) => {
    tx = (e.clientX / window.innerWidth) * 2 - 1
    ty = (e.clientY / window.innerHeight) * 2 - 1
  }
  window.addEventListener('mousemove', onMove, { passive: true })

  const tick = () => {
    cx += (tx - cx) * lerp
    cy += (ty - cy) * lerp
    target.style.setProperty('--mx', cx.toFixed(3))
    target.style.setProperty('--my', cy.toFixed(3))
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('mousemove', onMove)
  }
}
