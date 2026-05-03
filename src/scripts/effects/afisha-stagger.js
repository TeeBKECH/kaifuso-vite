// Stagger-появление карточек афиши при попадании секции в viewport.
// Не используем AOS на slide-элементах: Swiper сам управляет transform слайдов,
// AOS-translateY конфликтует с translate Swiper'а. Здесь анимируем
// .home-afisha_card (внутреннюю обёртку), а триггер — IntersectionObserver
// на самой секции, который добавляет класс .is-revealed.

import { motion } from '@/scripts/utils/anim-utils.js'

export function initAfishaStagger() {
  document.querySelectorAll('.home-afisha').forEach((afisha) => {
    afisha.querySelectorAll('.home-afisha_slide').forEach((s, i) => {
      s.style.setProperty('--i', i)
    })

    if (motion.reduced) {
      afisha.classList.add('is-revealed')
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            afisha.classList.add('is-revealed')
            io.disconnect()
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' },
    )
    io.observe(afisha)
  })
}
