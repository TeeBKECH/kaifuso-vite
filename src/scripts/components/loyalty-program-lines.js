const NS = 'http://www.w3.org/2000/svg'

/**
 * Рисует вертикальные сегменты между центрами маркеров (.loyalty_program_marker).
 * Пересчёт: resize, ResizeObserver, смена темы, load (шрифты).
 */
export function initLoyaltyProgramLines(root = document) {
  const programs = root.querySelectorAll('.loyalty_program')
  if (!programs.length) return () => {}

  const cleanups = []

  programs.forEach((program) => {
    const svg = program.querySelector('.loyalty_program_svg')
    if (!svg) return

    const getMarkers = () => [...program.querySelectorAll('.loyalty_program_marker')]

    function draw() {
      const markers = getMarkers()
      if (markers.length < 2) {
        while (svg.firstChild) svg.removeChild(svg.firstChild)
        return
      }

      const pr = program.getBoundingClientRect()
      const w = Math.max(1, pr.width)
      const h = Math.max(1, pr.height)

      svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
      svg.setAttribute('width', String(w))
      svg.setAttribute('height', String(h))

      while (svg.firstChild) svg.removeChild(svg.firstChild)

      for (let i = 0; i < markers.length - 1; i++) {
        const a = markers[i].getBoundingClientRect()
        const b = markers[i + 1].getBoundingClientRect()
        const x1 = a.left + a.width / 2 - pr.left
        const y1 = a.top + a.height / 2 - pr.top
        const x2 = b.left + b.width / 2 - pr.left
        const y2 = b.top + b.height / 2 - pr.top

        const line = document.createElementNS(NS, 'line')
        line.setAttribute('x1', String(x1))
        line.setAttribute('y1', String(y1))
        line.setAttribute('x2', String(x2))
        line.setAttribute('y2', String(y2))
        line.setAttribute('class', 'loyalty_program_line')
        svg.appendChild(line)
      }
    }

    const scheduleDraw = () => requestAnimationFrame(draw)

    draw()

    const ro = new ResizeObserver(scheduleDraw)
    ro.observe(program)
    cleanups.push(() => ro.disconnect())

    window.addEventListener('resize', scheduleDraw)
    cleanups.push(() => window.removeEventListener('resize', scheduleDraw))

    window.addEventListener('load', scheduleDraw)
    cleanups.push(() => window.removeEventListener('load', scheduleDraw))

    const mo = new MutationObserver(scheduleDraw)
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    cleanups.push(() => mo.disconnect())
  })

  return () => cleanups.forEach((fn) => fn())
}
