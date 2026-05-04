import Swiper from 'swiper'
import { Navigation, Pagination } from 'swiper/modules'
import { Fancybox } from '@fancyapps/ui/dist/fancybox/'
import AOS from 'aos'

import { initResponsiveSwiperAll } from '@/scripts/components/swiper.js'
import {
  attachCustomScrollbar,
  attachCustomScrollbarHorizontal,
} from '@/scripts/components/scroll-bar.js'
import { initSelects } from '@/scripts/components/select.js'
import { initPhoneMasks } from '@/scripts/components/phone-mask.js'
import { buildToc } from '@/scripts/components/toc.js'
import {
  initModalSystem,
  registerModal,
  initPopupModal,
  isModalOpen,
  closeModal,
  openModal,
} from '@/scripts/components/modal.js'
import { initContactFields } from '@/scripts/components/contact-field.js'
import { initBookingDatepickers } from '@/scripts/components/booking-datepicker.js'
import { attachScrollVisibility } from '@/scripts/utils/scroll-visibility.js'
import { truncateText } from '@/scripts/utils/truncText.js'
import {
  initViewportHeight,
  setHeaderHeight,
  setFooterHeight,
} from '@/scripts/utils/viewport-height.js'
// import { initThemeSwitcher } from '@/scripts/utils/theme-switcher.js'

import '@/scripts/components/smooth-scroll.js'
import { initEffects, initEffectsLate } from '@/scripts/effects'

import 'aos/dist/aos.css'
import '@/styles/styles.scss'

// Инициализируем viewport height для мобильных устройств
initViewportHeight()

// Смена темы (светлая/тёмная) — до загрузки DOM, чтобы минимизировать мигание
// initThemeSwitcher()

document.addEventListener('DOMContentLoaded', (e) => {
  // AOS Section Animation
  AOS.init({
    duration: 800,
    once: false, // анимация только один раз
    offset: 100, // появление за 100px до границы видимости
  })

  // Глобальные «atmospheric» эффекты (Lenis, custom cursor + glow, hero-dim,
  // звёзды, scroll-parallax, hero fade-up, stagger афиши, AOS-reveal).
  // Запускаем сразу после AOS.init, чтобы динамические data-aos попали в скан.
  initEffects()
  /*
   * Toc for Single
   */
  buildToc({
    root: '.single_prose',
    toc: '#toc-list',
    // h2Sel: '.post__article-title',
    // h3Sel: '.post__article-subtitle',
    // submenuClass: 'submenu',
    // anchorPrefix: 'sec-',
  })
  /*
   * Phone Masks
   */
  initPhoneMasks()

  /*
   * Selects
   */
  const selects = initSelects()
  // for (const select of selects) {
  //   console.log(select.root.id, 'multiple =', select.cfg.multiple)
  // }

  /*
   * Contact Fields (динамическое обновление поля контакта)
   */
  initContactFields()

  initBookingDatepickers()

  // Custom Scroll Bar for Selects
  selects.forEach((select) => {
    const listEl = select.refs.list
    if (listEl) {
      attachCustomScrollbar(listEl, {
        offsetRight: 0,
        trackWidth: 1,
        trackColor: '#242d4c',
        thumbWidth: 6,
        thumbColor: '#242d4c',
        minThumbPx: 20,
      })
    }
  })

  /*
   * ==== Swipers
   */
  // Events Swiper
  initResponsiveSwiperAll('.events_items', (root) => {
    const section = root.closest('.events_content')
    const prevEl = section?.querySelector('.events_nav-prev')
    const nextEl = section?.querySelector('.events_nav-next')
    return {
      Swiper, // передаём класс
      modules: [Navigation],
      itemsSelector: '.events_item',
      breakpoint: '(max-width: 9999px)',
      slidesPerView: 1.5,
      spaceBetween: 16,
      loop: false,
      slidesOffsetAfter: 16,
      slidesOffsetBefore: 16,
      watchOverflow: true,
      navigation: {
        prevEl,
        nextEl,
        createInside: false,
      },
      pagination: false,
      breakpoints: {
        320: {
          slidesPerView: 1.5,
          spaceBetween: 16,
          slidesOffsetAfter: 16,
          slidesOffsetBefore: 16,
        },
        992: {
          slidesPerView: 3,
          spaceBetween: 32,
        },
      },
      extendSwiperOptions: (opts) => ({
        ...opts,
        speed: 500,
      }),
    }
  })

  // Gallery swiper
  initResponsiveSwiperAll('.gallery-swiper', (root) => {
    const gallery = root.closest('.gallery')
    const prevEl = gallery?.querySelector('.gallery_nav-prev')
    const nextEl = gallery?.querySelector('.gallery_nav-next')
    const paginationEl = gallery?.querySelector('.gallery_pagination')
    return {
      Swiper,
      modules: [Navigation, Pagination],
      itemsSelector: '.gallery_slide',
      breakpoint: '(max-width: 9999px)',
      slidesPerView: 1,
      spaceBetween: 0,
      navigation: {
        prevEl,
        nextEl,
        createInside: false,
      },
      pagination: paginationEl
        ? {
            el: paginationEl,
            clickable: true,
            createInside: false,
          }
        : false,
      loop: false,
      extendSwiperOptions: (opts) => ({
        ...opts,
        speed: 500,
      }),
    }
  })

  // Single post: related blog posts swiper
  initResponsiveSwiperAll('.blog-related_items', (root) => {
    const section = root.closest('.blog-related')
    const prevEl = section?.querySelector('.blog-related_nav-prev')
    const nextEl = section?.querySelector('.blog-related_nav-next')

    return {
      Swiper,
      modules: [Navigation],
      itemsSelector: '.blog-related_slide',
      breakpoint: '(max-width: 9999px)',
      slidesPerView: 1.08,
      spaceBetween: 16,
      loop: false,
      watchOverflow: true,
      navigation: {
        prevEl,
        nextEl,
        createInside: false,
      },
      pagination: false,
      breakpoints: {
        320: {
          slidesPerView: 1.1,
          spaceBetween: 14,
          slidesOffsetAfter: 14,
          slidesOffsetBefore: 14,
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 20,
          slidesOffsetAfter: 0,
          slidesOffsetBefore: 0,
        },
        1200: {
          slidesPerView: 3,
          spaceBetween: 24,
        },
      },
      extendSwiperOptions: (opts) => ({
        ...opts,
        speed: 500,
      }),
    }
  })

  // Event page: related events swiper
  initResponsiveSwiperAll('.event-related_items', (root) => {
    const section = root.closest('.event-page_related')
    const prevEl = section?.querySelector('.event-page_related-nav-prev')
    const nextEl = section?.querySelector('.event-page_related-nav-next')

    return {
      Swiper,
      modules: [Navigation],
      itemsSelector: '.event-related_item',
      breakpoint: '(max-width: 9999px)',
      slidesPerView: 1.1,
      spaceBetween: 16,
      loop: false,
      watchOverflow: true,
      navigation: {
        prevEl,
        nextEl,
        createInside: false,
      },
      pagination: false,
      breakpoints: {
        320: {
          slidesPerView: 1.1,
          spaceBetween: 14,
          slidesOffsetAfter: 14,
          slidesOffsetBefore: 14,
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 20,
          slidesOffsetAfter: 0,
          slidesOffsetBefore: 0,
        },
        1200: {
          slidesPerView: 3,
          spaceBetween: 16,
        },
      },
      extendSwiperOptions: (opts) => ({
        ...opts,
        speed: 500,
      }),
    }
  })

  // Home: полоса фотографий "О ресторане" — слайды разной ширины (slidesPerView: 'auto')
  initResponsiveSwiperAll('.home-about-gallery_track', (root) => {
    const section = root.closest('.home-about-gallery')
    const prevEl = section?.querySelector('.home-about-gallery_nav-prev')
    const nextEl = section?.querySelector('.home-about-gallery_nav-next')
    return {
      Swiper,
      modules: [Navigation],
      itemsSelector: '.home-about-gallery_slide',
      breakpoint: '(max-width: 9999px)',
      spaceBetween: 32,
      centeredSlides: false,
      slidesOffsetBefore: 32,
      slidesOffsetAfter: 32,
      loop: false,
      watchOverflow: true,
      navigation: {
        prevEl,
        nextEl,
        createInside: false,
      },
      breakpoints: {
        320: { spaceBetween: 16, slidesOffsetBefore: 16, slidesOffsetAfter: 16 },
        768: { spaceBetween: 20, slidesOffsetBefore: 24, slidesOffsetAfter: 24 },
        1200: { spaceBetween: 32, slidesOffsetBefore: 32, slidesOffsetAfter: 32 },
      },
      extendSwiperOptions: (opts) => ({
        ...opts,
        slidesPerView: 'auto',
        speed: 600,
      }),
    }
  })

  // Home: афиша. Две принципиально разные конфигурации в зависимости от устройства:
  //   1) HOVER (мышь, десктоп): slidesPerView:'auto', все слайды с фиксированной шириной,
  //      активный шире (CSS). Hover на слайд → CSS открывает его без свайпа карусели.
  //      Свайп пальцем отключён (allowTouchMove:false). Стрелки — кастомные с расчётом
  //      translate под финальные ширины + clamp по maxTranslate.
  //   2) TOUCH (нет hover): slidesPerView:1 — один слайд = ширина контейнера. Стандартный
  //      Swiper, свайп пальцем ровно на 1 слайд (snapGrid одинаковый). Стрелки — стандарт.
  //      Click на любой слайд (если их вдруг видно несколько) делает его активным.
  initResponsiveSwiperAll('.home-afisha_list', (root) => {
    const section = root.closest('.home-afisha')
    const prevEl = section?.querySelector('.home-afisha_nav-prev')
    const nextEl = section?.querySelector('.home-afisha_nav-next')
    const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches

    const common = {
      Swiper,
      modules: [Navigation],
      itemsSelector: '.home-afisha_slide',
      breakpoint: '(max-width: 9999px)',
      watchOverflow: true,
      pagination: false,
    }

    if (hasHover) {
      // ── DESKTOP / HOVER ───────────────────────────────────────────────────
      return {
        ...common,
        slidesPerView: 'auto',
        spaceBetween: 32,
        navigation: false,
        breakpoints: {
          0: { spaceBetween: 16 },
          769: { spaceBetween: 24 },
          992: { spaceBetween: 24 },
          1200: { spaceBetween: 32 },
        },
        extendSwiperOptions: (opts) => ({
          ...opts,
          speed: 600,
          allowTouchMove: false,
          on: {
            init(swiper) {
              if (!prevEl && !nextEl) return
              const SPEED = 600

              const goTo = (newIdx) => {
                const slides = swiper.slides
                const total = slides.length
                if (!total) return
                const oldIdx = swiper.activeIndex
                const target = Math.max(0, Math.min(total - 1, newIdx))
                if (target === oldIdx) return

                // 1) Меняем активный класс — CSS триггерит transition ширины
                slides[oldIdx]?.classList.remove('swiper-slide-active')
                slides[target]?.classList.add('swiper-slide-active')

                // 2) translate под ФИНАЛЬНЫЕ ширины (активный = был широким = largeW, остальные = smallW)
                const largeW = slides[oldIdx].getBoundingClientRect().width
                const closedRef = slides.find((s, i) => i !== oldIdx) || slides[oldIdx]
                const smallW = closedRef.getBoundingClientRect().width
                const space = swiper.params.spaceBetween || 0

                let translate = -(target * (smallW + space))

                // Клампим к maxTranslate (нет пустоты слева в крайних позициях)
                const wrapperW = largeW + smallW * (total - 1) + space * (total - 1)
                const containerW = root.getBoundingClientRect().width
                const maxNeg = -Math.max(0, wrapperW - containerW)
                if (translate < maxNeg) translate = maxNeg

                // 3) Применяем
                swiper.activeIndex = target
                swiper.snapIndex = target
                swiper.setTransition(SPEED)
                swiper.setTranslate(translate)
                // НЕ вызываем swiper.update() — он откатил бы activeIndex к ближайшему snap.
              }

              prevEl?.addEventListener('click', (e) => {
                e.preventDefault()
                goTo(swiper.activeIndex - 1)
              })
              nextEl?.addEventListener('click', (e) => {
                e.preventDefault()
                goTo(swiper.activeIndex + 1)
              })
            },
          },
        }),
      }
    }

    // ── TOUCH / NO-HOVER ─────────────────────────────────────────────────────
    // ≤ md (768): slidesPerView 2.1, gap 16, info в карточке скрыт — видна только media.
    //              Стрелки скрыты CSS — управление только свайпом.
    // > md: slidesPerView 1 — один слайд = ширина контейнера (стрелки видны).
    return {
      ...common,
      slidesPerView: 1,
      spaceBetween: 16,
      slidesOffsetBefore: 16,
      slidesOffsetAfter: 16,
      navigation: { prevEl, nextEl, createInside: false },
      breakpoints: {
        0: {
          slidesPerView: 2.1,
          spaceBetween: 16,
          slidesOffsetBefore: 16,
          slidesOffsetAfter: 16,
        },
        // Включается на md+1 (769) — десктоп-вариант touch
        769: {
          slidesPerView: 1,
          spaceBetween: 16,
          slidesOffsetBefore: 16,
          slidesOffsetAfter: 16,
        },
      },
      extendSwiperOptions: (opts) => ({
        ...opts,
        speed: 500,
      }),
    }
  })

  // Home: О ресторане — параллакс декоративных птиц по направлению движения мыши.
  // Слушаем mousemove на window (по всей странице), считаем velocity и плавно затухаем.
  // Пишем CSS-переменные --home-about-mx/--home-about-my (-1..1) в :root, читаются в SCSS.
  ;(() => {
    if (!document.querySelector('.home-about')) return
    const mqHover = window.matchMedia('(hover: hover) and (pointer: fine)')
    const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!mqHover.matches || mqReduced.matches) return

    const root = document.documentElement
    let lastX = null
    let lastY = null
    let velX = 0
    let velY = 0
    let curX = 0
    let curY = 0

    window.addEventListener(
      'mousemove',
      (e) => {
        if (lastX !== null) {
          // Усреднение velocity для плавности
          velX = velX * 0.5 + (e.clientX - lastX) * 0.5
          velY = velY * 0.5 + (e.clientY - lastY) * 0.5
        }
        lastX = e.clientX
        lastY = e.clientY
      },
      { passive: true },
    )

    const tick = () => {
      // Цель: смещение пропорционально velocity, ограниченное [-1, 1]
      const targetX = Math.max(-1, Math.min(1, velX * 0.06))
      const targetY = Math.max(-1, Math.min(1, velY * 0.06))

      // Lerp текущего к target — плавный «эластичный» отклик
      curX += (targetX - curX) * 0.08
      curY += (targetY - curY) * 0.08

      // Затухание velocity (импульс гаснет когда мышь стоит)
      velX *= 0.86
      velY *= 0.86

      root.style.setProperty('--home-about-mx', curX.toFixed(3))
      root.style.setProperty('--home-about-my', curY.toFixed(3))

      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })()

  // Home: галерея — full-bleed карусель, slidesPerView 'auto', центрирование
  initResponsiveSwiperAll('.home-gallery_track', (root) => {
    const stage = root.closest('.home-gallery_stage')
    const prevEl = stage?.querySelector('.home-gallery_nav-prev')
    const nextEl = stage?.querySelector('.home-gallery_nav-next')
    const paginationEl = stage?.querySelector('.home-gallery_pagination')
    return {
      Swiper,
      modules: [Navigation, Pagination],
      itemsSelector: '.home-gallery_slide',
      breakpoint: '(max-width: 9999px)',
      spaceBetween: 32,
      centeredSlides: true,
      loop: true,
      navigation: {
        prevEl,
        nextEl,
        createInside: false,
      },
      pagination: paginationEl
        ? {
            el: paginationEl,
            clickable: true,
            createInside: false,
          }
        : false,
      extendSwiperOptions: (opts) => ({
        ...opts,
        slidesPerView: 'auto',
        speed: 650,
      }),
    }
  })

  // Обновляем AOS после инициализации всех Swiper'ов
  // Используем небольшую задержку, чтобы Swiper'ы успели полностью инициализироваться
  setTimeout(() => {
    AOS.refresh()
    // 3D tilt у медиа — после Swiper'ов, потому что vanilla-tilt опирается
    // на финальные размеры элементов.
    initEffectsLate()
  }, 300)

  /*
   * Text Trunc
   */
  // Seo Text
  truncateText('.seo_text--trunc', 650, {
    showText: 'Читать еще...',
    hideText: 'Скрыть',
    btnClass: 'seo_text-more',
    ellipsis: '…',
    smartWordCut: true,
    breakpoint: '(max-width: 9999px)',
  })

  /*
   * FancyBox
   */
  // Gallery - динамическая инициализация для всех групп галереи
  const galleryGroups = new Set()
  document
    .querySelectorAll(
      '.gallery [data-fancybox], .gallery-mosaic [data-fancybox], .room_gallery [data-fancybox], .meropriyaiya_gallery [data-fancybox], .meropriyaiya_gallery-skip [data-fancybox], .meropriyaiya_rental-visual [data-fancybox], .meropriyaiya_floor-tabs [data-fancybox^="meropriyaiya-floor-"], .home-gallery [data-fancybox]',
    )
    .forEach((el) => {
      const group = el.getAttribute('data-fancybox')
      if (group && !galleryGroups.has(group)) {
        galleryGroups.add(group)
        Fancybox.bind(`[data-fancybox="${group}"]`, {})
      }
    })

  /*
   * Accordions
   */
  const accordions = document.querySelectorAll('[data-accordion]')
  if (accordions?.length > 0) {
    accordions.forEach((acc) => {
      const trigger = acc.querySelector(`[data-accordion-trigger]`)
      if (!trigger) return
      trigger.addEventListener('click', () => {
        acc.classList.toggle('open')
        const open = acc.classList.contains('open')
        trigger.setAttribute('aria-expanded', open ? 'true' : 'false')
      })
    })
  }

  /*
   * Header
   */
  const header = document.querySelector('.header')

  /*
   * Modals
   */
  initModalSystem()

  const burgerMobile = document.querySelector('.header_burger--mobile.burger')
  const burgerSite = document.querySelector('.header_burger--site.burger')

  function syncHeaderMenuState() {
    if (!header) return
    const overlayOpen = isModalOpen('mobile-menu') || isModalOpen('site-menu')
    header.classList.toggle('menu-open', overlayOpen)
  }

  registerModal('mobile-menu', {
    closeOnBackdrop: true,
    closeOnEscape: true,
    exclusive: true,
    onOpen: () => {
      burgerMobile?.classList.add('active')
      syncHeaderMenuState()
    },
    onClose: (modal) => {
      burgerMobile?.classList.remove('active')
      syncHeaderMenuState()
      modal.querySelectorAll('.menu_item.is-open').forEach((item) => {
        item.classList.remove('is-open')
        const btn = item.querySelector('[data-menu-drop-toggle]')
        if (btn) btn.setAttribute('aria-expanded', 'false')
      })
    },
  })

  registerModal('site-menu', {
    closeOnBackdrop: true,
    closeOnEscape: true,
    exclusive: true,
    onOpen: () => {
      burgerSite?.classList.add('active')
      syncHeaderMenuState()
      // Footer должен быть виден над модалкой (Figma 2002:5808). Пересчёт высоты —
      // на случай если страница длинная и footer ещё не был измерен.
      setFooterHeight()
      document.body.classList.add('has-site-menu')
    },
    onClose: () => {
      burgerSite?.classList.remove('active')
      syncHeaderMenuState()
      document.body.classList.remove('has-site-menu')
    },
  })

  // Мобильное меню: открытие/закрытие выпадающего подменю (accordion)
  document.body.addEventListener('click', (e) => {
    const toggle = e.target.closest('[data-menu-drop-toggle]')
    if (!toggle) return
    const item = toggle.closest('.menu_item')
    if (!item || !item.closest('.menu--mobile')) return
    e.preventDefault()
    const isOpen = item.classList.toggle('is-open')
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false')
    if (isOpen) {
      item.parentElement?.querySelectorAll('.menu_item--has-drop.is-open').forEach((other) => {
        if (other !== item) {
          other.classList.remove('is-open')
          const otherBtn = other.querySelector('[data-menu-drop-toggle]')
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false')
        }
      })
    }
  })

  // Меню: запрет перехода по пунктам с href="#" (только блокировка, без переключения подменю)
  // На десктопе подменю показывается только по hover; на мобильном — через кнопку data-menu-drop-toggle
  document.body.addEventListener('click', (e) => {
    const link = e.target.closest('.menu_item_link')
    if (!link) return

    const href = link.getAttribute('href')
    if (href !== '#') return

    e.preventDefault()
  })

  registerModal('modal-form', {
    closeOnBackdrop: true,
    closeOnEscape: true,
    exclusive: true,
    onOpen: async (modal) => {
      // Закрываем popup, если был открыт (кнопка в popup открывает форму)
      if (isModalOpen('modal-popup')) {
        closeModal('modal-popup')
      }
      // Инициализируем функционал обновления поля контакта при открытии модалки
      const form = modal.querySelector('form')
      if (form) {
        setTimeout(() => {
          initContactFields()
          initBookingDatepickers(modal)
        }, 100)
      }
    },
  })

  registerModal('modal-popup', {
    closeOnBackdrop: true,
    closeOnEscape: true,
    exclusive: true,
  })

  document.addEventListener('submit', (event) => {
    const form = event.target.closest('.booking-modal_form')
    if (!form) return

    event.preventDefault()

    const dateRaw = form.querySelector('[name="booking-datetime"]')?.value?.trim() || ''
    const personsRaw =
      form.querySelector('input[name="booking-persons"]')?.value?.trim() ||
      form.querySelector('[name="booking-persons"]')?.value?.trim() ||
      ''

    const dateTarget = document.querySelector('[data-booking-date]')
    const timeTarget = document.querySelector('[data-booking-time]')
    const personsTarget = document.querySelector('[data-booking-persons]')

    const parts = dateRaw.split(',').map((p) => p.trim())
    const dateFromInput = parts[0] || ''
    const timeFromInput = parts[1] || ''

    if (dateTarget) dateTarget.textContent = dateFromInput || '—'
    if (timeTarget) timeTarget.textContent = timeFromInput || '—'
    if (personsTarget) {
      const selectRoot = form.querySelector('.c-select[data-name="booking-persons"]')
      const valueEl = selectRoot?.querySelector('[data-ref="value"]')
      const ph = (selectRoot?.dataset.placeholder || '').trim()
      const labelText = (valueEl?.textContent || '').trim()
      personsTarget.textContent =
        labelText && labelText !== ph ? labelText : personsRaw ? `${personsRaw} чел.` : '—'
    }

    closeModal('modal-form')
    setTimeout(() => openModal('modal-popup'), 220)
  })

  // Popup-модалка: показ по таймеру и/или при уходе курсора (конфиг из WP или data-атрибутов)
  const popupConfig =
    typeof window.knyajePopupConfig !== 'undefined'
      ? window.knyajePopupConfig
      : (() => {
          const el = document.getElementById('modal-popup')
          if (!el) return null
          return {
            modalId: 'modal-popup',
            delaySeconds: parseInt(el.dataset.popupDelay || '0', 10) || 0,
            onMouseLeave: el.dataset.popupOnLeave === 'true',
          }
        })()
  if (popupConfig) {
    // initPopupModal(popupConfig)
  }

  /*
   * Header Scroll
   */
  if (header) {
    const SCROLL_THRESHOLD = 50

    function handleScroll() {
      if (window.scrollY > SCROLL_THRESHOLD) {
        header.classList.add('scrolled')
      } else {
        header.classList.remove('scrolled')
      }
      // Обновляем высоту хедера после изменения класса (может влиять на высоту)
      setHeaderHeight()
    }

    // Проверяем при загрузке страницы
    handleScroll()

    // Отслеживаем скролл
    window.addEventListener('scroll', handleScroll, { passive: true })
  }

  /*
   * Bottom Nav — скрывать при скролле вниз, показывать при скролле вверх (класс hidden-by-scroll)
   */
  // attachScrollVisibility('.bottom-nav', { threshold: 60, minDelta: 25 })

  /*
   * Кнопка «Наверх» — показывать при скролле вниз, скрывать при скролле вверх (invert)
   */
  const scrollToTopEl = document.querySelector('.scroll-to-top')
  if (scrollToTopEl) {
    attachScrollVisibility('.scroll-to-top', { invert: true, threshold: 300, minDelta: 25 })
    scrollToTopEl.addEventListener('click', () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
      window.scrollTo({ top: 0, behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' })
    })
  }
})
// Обновляем AOS при изменении размера окна
let resizeTimer
window.addEventListener(
  'resize',
  () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      AOS.refresh()
    }, 250)
  },
  { passive: true },
)
