// Динамически добавляет data-aos атрибуты к ключевым контентным блокам.
// Применяется ко ВСЕМ страницам — селекторы, которых нет на странице, просто
// игнорируются. Slide-элементы Swiper'ов сюда НЕ включаем (translate-конфликт).
// После этого вызываем AOS.refreshHard() — иначе глобальный AOS.init из main.js
// не увидит новых атрибутов.

import AOS from 'aos'

const TARGETS = [
  // Главная
  ['.home-about_card', 'fade-up', 0],
  ['.home-afisha_head', 'fade-up', 0],
  ['.home-club_intro', 'fade-up', 0],
  ['.home-club_form', 'fade-up', 0],
  ['.contacts_card', 'fade-up', 0],
  // Универсальные
  ['.section_title', 'fade-up', 0],
  ['.section_subtitle', 'fade-up', 0],
]

export function initAosReveal() {
  TARGETS.forEach(([sel, kind, step]) => {
    document.querySelectorAll(sel).forEach((el, i) => {
      if (el.hasAttribute('data-aos')) return
      el.setAttribute('data-aos', kind)
      el.setAttribute('data-aos-duration', '900')
      el.setAttribute('data-aos-easing', 'ease-out-cubic')
      if (step) el.setAttribute('data-aos-delay', String(Math.min(i * step, 400)))
    })
  })

  // Глобальный AOS.init вызывается в main.js на DOMContentLoaded — даём ему
  // отработать и потом просим заново отсканировать DOM.
  setTimeout(() => {
    if (typeof AOS.refreshHard === 'function') AOS.refreshHard()
    else AOS.refresh()
  }, 60)
}
