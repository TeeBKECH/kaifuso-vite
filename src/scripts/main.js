import Swiper from 'swiper'
import { Navigation } from 'swiper/modules'
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
import { initModalSystem, registerModal, initPopupModal, isModalOpen, closeModal } from '@/scripts/components/modal.js'
import { initContactFields } from '@/scripts/components/contact-field.js'
import { attachScrollVisibility } from '@/scripts/utils/scroll-visibility.js'
import { truncateText } from '@/scripts/utils/truncText.js'
import { initViewportHeight, setHeaderHeight } from '@/scripts/utils/viewport-height.js'
// import { initThemeSwitcher } from '@/scripts/utils/theme-switcher.js'

import '@/scripts/components/smooth-scroll.js'

import 'aos/dist/aos.css'
import '@/styles/styles.scss'

// Инициализируем viewport height для мобильных устройств
initViewportHeight()

// Смена темы (светлая/тёмная) — до загрузки DOM, чтобы минимизировать мигание
// initThemeSwitcher()

function getPageIdFromUrl() {
  const path = window.location.pathname.replace(/\/+/g, '/').replace(/^\/|\/$/g, '') // убираем ведущий/замыкающий слеш
  if (!path || path === '') return 'index'
  // /about -> about, /about/index.html -> about/index
  return path.replace(/\.html$/i, '') // about или about/index
}

const pageModules = import.meta.glob('./pages/**/*.js') // создаст ленивые загрузчики

async function boot() {
  const pageId = getPageIdFromUrl()
  // Пытаемся найти модуль страницы по двум конвенциям:
  // 1) ./pages/${pageId}.js (например, pages/media.js)
  // 2) ./pages/${lastSegment}/index.js (например, pages/media/index.js)
  const last = pageId.split('/').pop()
  const candidates = [`./pages/${pageId}.js`, `./pages/${last}/index.js`]

  for (const key of candidates) {
    const loader = pageModules[key]
    if (loader) {
      const mod = await loader()
      // вызываем init() или default(), если есть
      if (typeof mod.init === 'function') await mod.init()
      else if (typeof mod.default === 'function') await mod.default()
      break
    }
  }
}
boot()

document.addEventListener('DOMContentLoaded', (e) => {
  // AOS Section Animation
  AOS.init({
    duration: 800,
    once: false, // анимация только один раз
    offset: 100, // появление за 100px до границы видимости
  })
  /*
   * Toc for Single
   */
  buildToc({
    root: '.single_content',
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
    return {
      Swiper,
      modules: [Navigation],
      itemsSelector: '.gallery_slide',
      breakpoint: '(max-width: 9999px)',
      slidesPerView: 1,
      spaceBetween: 0,
      navigation: {
        prevEl,
        nextEl,
        createInside: false,
      },
      pagination: false,
      loop: false,
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
          slidesPerView: 1.05,
          spaceBetween: 14,
        },
        768: {
          slidesPerView: 2.1,
          spaceBetween: 20,
        },
        1200: {
          slidesPerView: 4,
          spaceBetween: 16,
        },
      },
      extendSwiperOptions: (opts) => ({
        ...opts,
        speed: 500,
      }),
    }
  })

  // Обновляем AOS после инициализации всех Swiper'ов
  // Используем небольшую задержку, чтобы Swiper'ы успели полностью инициализироваться
  setTimeout(() => {
    AOS.refresh()
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
      '.gallery [data-fancybox], .gallery-mosaic [data-fancybox], .room_gallery [data-fancybox], .meropriyaiya_gallery [data-fancybox], .meropriyaiya_gallery-skip [data-fancybox], .meropriyaiya_rental-visual [data-fancybox], .meropriyaiya_floor-tabs [data-fancybox^="meropriyaiya-floor-"]',
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
    },
    onClose: () => {
      burgerSite?.classList.remove('active')
      syncHeaderMenuState()
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
        }, 100)
      }
    },
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
