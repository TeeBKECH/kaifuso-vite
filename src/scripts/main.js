import Swiper from 'swiper'
import { Navigation } from 'swiper/modules'
import { Fancybox } from '@fancyapps/ui/dist/fancybox/'
import AOS from 'aos'

import { initResponsiveSwiper, initResponsiveSwiperAll } from '@/scripts/components/swiper.js'
import {
  attachCustomScrollbar,
  attachCustomScrollbarHorizontal,
} from '@/scripts/components/scroll-bar.js'
import { initSelects } from '@/scripts/components/select.js'
import { initCounters } from '@/scripts/components/counter.js'
import { initCountersUp } from '@/scripts/components/counters-up.js'
import { initPhoneMasks } from '@/scripts/components/phone-mask.js'
import { buildToc } from '@/scripts/components/toc.js'
import { initModalSystem, registerModal, initPopupModal, isModalOpen, closeModal } from '@/scripts/components/modal.js'
import { initVideoPlayer, initVideoSwiper } from '@/scripts/components/video-player.js'
import { initContactFields } from '@/scripts/components/contact-field.js'
import { initCategoryTags } from '@/scripts/components/category-tags.js'
import { initGalleryMosaic } from '@/scripts/components/gallery-mosaic.js'
import { initBlogFilters } from '@/scripts/components/filters.js'
import { initTabsAll } from '@/scripts/components/tabs.js'
import { initMeropriyaiyaFloorTabsSwipe } from '@/scripts/components/meropriyaiya-floor-tabs.js'
import { initIntroParallax } from '@/scripts/components/intro-parallax.js'
import { initPalacesTabs } from '@/scripts/components/palaces.js'
import { attachScrollVisibility } from '@/scripts/utils/scroll-visibility.js'

import { initGeneratorTotal } from '@/scripts/utils/gen-total.js'
import { truncateText } from '@/scripts/utils/truncText.js'
import { hidePartContent } from '@/scripts/utils/hidePartContent.js'
import { initViewportHeight, setHeaderHeight } from '@/scripts/utils/viewport-height.js'
import { initThemeSwitcher } from '@/scripts/utils/theme-switcher.js'

import '@/scripts/components/smooth-scroll.js'

import 'aos/dist/aos.css'
import '@/styles/styles.scss'

// Инициализируем viewport height для мобильных устройств
initViewportHeight()

// Смена темы (светлая/тёмная) — до загрузки DOM, чтобы минимизировать мигание
initThemeSwitcher()

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
  initCategoryTags()

  /*
   * Blog Filters
   */
  initBlogFilters()

  /*
   * Tabs
   */
  initTabsAll()
  initMeropriyaiyaFloorTabsSwipe()
  initPalacesTabs()

  // Custom horizontal scroll for price tables (md+)
  document.querySelectorAll('.price-table_wrap').forEach((wrapEl) => {
    attachCustomScrollbarHorizontal(wrapEl, {
      offsetBottom: 12,
      trackHeight: 1,
      trackColor: 'rgba(185, 155, 79, 0.3)',
      thumbHeight: 6,
      thumbColor: 'rgba(185, 155, 79, 0.5)',
      minThumbPx: 30,
    })
  })

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
   * Counters
   */
  const counters = initCounters()
  // Пример: подписка на изменение
  // document.querySelectorAll('[data-component="counter"]').forEach((el) => {
  //   el.addEventListener('counter:change', (e) => {
  //     console.log('counter changed:', e.detail.value)
  //   })
  // })

  /*
   * Counters Up (Animated Counters)
   */
  const countersUp = initCountersUp()

  /*
   * Generator Cert
   */
  initGeneratorTotal({
    selectEl: '#cert-select', // корень вашего кастомного select (single)
    counterEl: '#cert-counter', // корень счётчика
    outEl: '.generator-form__total-count', // куда писать строку
    uppercase: true,
    dash: ' – ',
    defaultCount: 1,
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

  // Other Promotions Swiper
  initResponsiveSwiperAll('.other-promotions_items', (root) => {
    const section = root.closest('.other-promotions_content')
    const prevEl = section?.querySelector('.other-promotions_nav-prev')
    const nextEl = section?.querySelector('.other-promotions_nav-next')
    return {
      Swiper, // передаём класс
      modules: [Navigation],
      itemsSelector: '.other-promotions_item',
      breakpoint: '(max-width: 9999px)',
      slidesPerView: 1.5,
      spaceBetween: 16,
      loop: false,
      slidesOffsetAfter: 16,
      slidesOffsetBefore: 16,
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
        768: {
          slidesPerView: 2,
          spaceBetween: 24,
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

  // Benefits Swiper
  initResponsiveSwiperAll('.benefits_items', (root) => {
    return {
      Swiper, // передаём класс
      itemsSelector: '.card--promotion',
      breakpoint: '(max-width: 992px)',
      slidesPerView: 1.5,
      spaceBetween: 16,
      loop: false,
      slidesOffsetAfter: 16,
      slidesOffsetBefore: 16,
      pagination: false,
      extendSwiperOptions: (opts) => ({
        ...opts,
        speed: 500,
      }),
    }
  })
  // Programms Swiper
  initResponsiveSwiperAll('.programms', (root) => {
    return {
      Swiper, // передаём класс
      itemsSelector: '.programm-card',
      breakpoint: '(max-width: 1200px)',
      slidesPerView: 3.2,
      spaceBetween: 16,
      loop: false,
      slidesOffsetAfter: 16,
      slidesOffsetBefore: 16,
      pagination: false,
      breakpoints: {
        320: {
          slidesPerView: 1.2,
          spaceBetween: 16,
          slidesOffsetAfter: 16,
          slidesOffsetBefore: 16,
        },
        768: {
          slidesPerView: 2.2,
          spaceBetween: 24,
        },
        992: {
          slidesPerView: 3.2,
          spaceBetween: 32,
        },
      },
      extendSwiperOptions: (opts) => ({
        ...opts,
        speed: 500,
      }),
    }
  })

  // Rituals Section Swiper
  initResponsiveSwiperAll('.rituals_items', (root) => {
    const section = root.closest('.rituals_content')
    const prevEl = section?.querySelector('.rituals_nav-prev')
    const nextEl = section?.querySelector('.rituals_nav-next')
    const slideCount = root.querySelectorAll('.card--ritual').length
    const spv = slideCount > 1 ? 1.3 : 1
    return {
      Swiper,
      modules: [Navigation],
      itemsSelector: '.card--ritual',
      breakpoint: '(max-width: 9999px)',
      slidesPerView: slideCount > 1 ? 1.3 : 1,
      spaceBetween: 32,
      loop: false,
      navigation: {
        prevEl,
        nextEl,
        createInside: false,
      },
      pagination: false,
      breakpoints: {
        320: {
          slidesPerView: spv,
          spaceBetween: 20,
        },
        768: {
          slidesPerView: spv,
          spaceBetween: 24,
        },
        992: {
          slidesPerView: spv,
          spaceBetween: 32,
        },
      },
      extendSwiperOptions: (opts) => ({
        ...opts,
        speed: 500,
      }),
    }
  })

  // Spa Section Swiper
  initResponsiveSwiperAll('.spa_items', (root) => {
    return {
      Swiper,
      itemsSelector: '.spa_item',
      breakpoint: '(max-width: 769px)',
      slidesPerView: 1.2,
      spaceBetween: 16,
      slidesOffsetAfter: 16,
      slidesOffsetBefore: 16,
      loop: false,
      pagination: false,
      extendSwiperOptions: (opts) => ({
        ...opts,
        speed: 500,
      }),
    }
  })

  // Мероприятия: галерея — слайдер только < 991px
  initResponsiveSwiperAll('.meropriyaiya_gallery', () => ({
    Swiper,
    itemsSelector: '.meropriyaiya_gallery-cell',
    breakpoint: '(max-width: 990px)',
    slidesPerView: 1.08,
    spaceBetween: 12,
    slidesOffsetAfter: 0,
    slidesOffsetBefore: 0,
    loop: false,
    pagination: true,
    watchOverflow: true,
    extendSwiperOptions: (opts) => ({
      ...opts,
      speed: 400,
    }),
  }))

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

  // Room gallery (главный + миниатюры с Thumbs)
  initResponsiveSwiperAll('.room-gallery-main', (root) => {
    const gallery = root.closest('.room_gallery')
    const thumbsEl = gallery?.querySelector('.room-gallery-thumbs')
    const mainPrevEl = root.querySelector('.room_gallery-main_nav-prev')
    const mainNextEl = root.querySelector('.room_gallery-main_nav-next')
    const thumbsPrevEl = thumbsEl?.querySelector('.room_gallery-thumbs_nav-prev')
    const thumbsNextEl = thumbsEl?.querySelector('.room_gallery-thumbs_nav-next')
    return {
      Swiper,
      modules: [Navigation],
      breakpoint: '(max-width: 9999px)',
      thumbs: {
        container: '.room-gallery-thumbs',
        scope: '.room_gallery',
        options: {
          modules: [Navigation],
          navigation: {
            prevEl: thumbsPrevEl,
            nextEl: thumbsNextEl,
            createInside: false,
          },
          spaceBetween: 16,
          slidesPerView: 3.5,
          freeMode: true,
          watchSlidesProgress: true,
          slideToClickedSlide: true,
          breakpoints: {
            320: { slidesPerView: 3.5, spaceBetween: 12 },
            768: { slidesPerView: 3.5, spaceBetween: 16 },
          },
        },
      },
      slidesPerView: 1,
      spaceBetween: 0,
      navigation: { prevEl: mainPrevEl, nextEl: mainNextEl, createInside: false },
      speed: 500,
      grabCursor: true,
    }
  })

  // Room other (Другие хоромы) swiper
  initResponsiveSwiperAll('.room-other_items', (root) => {
    const section = root.closest('.room-other_content')
    const prevEl = section?.querySelector('.room-other_nav-prev')
    const nextEl = section?.querySelector('.room-other_nav-next')
    return {
      Swiper,
      modules: [Navigation],
      itemsSelector: '.room-other_item',
      breakpoint: '(max-width: 9999px)',
      slidesPerView: 1.5,
      spaceBetween: 16,
      loop: false,
      slidesOffsetAfter: 16,
      slidesOffsetBefore: 16,
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
        768: {
          slidesPerView: 2,
          spaceBetween: 24,
          slidesOffsetAfter: 0,
          slidesOffsetBefore: 0,
        },
        992: {
          slidesPerView: 3,
          spaceBetween: 32,
          slidesOffsetAfter: 0,
          slidesOffsetBefore: 0,
        },
      },
      extendSwiperOptions: (opts) => ({
        ...opts,
        speed: 500,
      }),
    }
  })

  // Dishes swiper
  // initResponsiveSwiperAll('.dishes_items', (root) => {
  //   const section = root.closest('.dishes')
  //   const prevEl = section?.querySelector('.dishes_nav-prev')
  //   const nextEl = section?.querySelector('.dishes_nav-next')
  //   return {
  //     Swiper,
  //     modules: [Navigation],
  //     itemsSelector: '.dishes_item',
  //     breakpoint: '(max-width: 9999px)',
  //     slidesPerView: 1.5,
  //     spaceBetween: 16,
  //     loop: false,
  //     navigation: {
  //       prevEl,
  //       nextEl,
  //       createInside: false,
  //     },
  //     pagination: false,
  //     breakpoints: {
  //       320: {
  //         slidesPerView: 1.2,
  //         spaceBetween: 16,
  //         slidesOffsetAfter: 16,
  //         slidesOffsetBefore: 16,
  //       },
  //       768: {
  //         slidesPerView: 2.2,
  //         spaceBetween: 24,
  //       },
  //       992: {
  //         slidesPerView: 3.2,
  //         spaceBetween: 32,
  //         slidesOffsetAfter: 0,
  //         slidesOffsetBefore: 0,
  //       },
  //     },
  //     extendSwiperOptions: (opts) => ({
  //       ...opts,
  //       speed: 500,
  //     }),
  //   }
  // })

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
   * Partners
   */
  // Ищем все ленты партнёров на странице
  document.querySelectorAll('.partners_line').forEach((line) => {
    const track = line.querySelector('.partners_track')
    if (!track) return

    // Дублируем содержимое один раз (получится 2N элементов подряд)
    const clone = track.cloneNode(true)
    clone.setAttribute('aria-hidden', 'true')
    line.appendChild(clone)
  })

  /*
   * FancyBox
   */
  // Dish Image
  Fancybox.bind('[data-fancybox="dish-image"]', {})
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

  // Инициализация мозаичной галереи (автоматическое определение ориентации)
  initGalleryMosaic()

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
  // Регистрируем модалки
  const burger = document.querySelector('.burger')
  registerModal('mobile-menu', {
    closeOnBackdrop: true,
    closeOnEscape: true,
    exclusive: true,
    onOpen: (modal) => {
      burger.classList.add('active')
      if (header) header.classList.add('menu-open')
    },
    onClose: (modal) => {
      burger.classList.remove('active')
      if (header) header.classList.remove('menu-open')
      // Закрываем все подменю при закрытии модалки
      modal.querySelectorAll('.menu_item.is-open').forEach((item) => {
        item.classList.remove('is-open')
        const btn = item.querySelector('[data-menu-drop-toggle]')
        if (btn) btn.setAttribute('aria-expanded', 'false')
      })
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
  registerModal('modal-form-meropriyatiya', {
    closeOnBackdrop: true,
    closeOnEscape: true,
    exclusive: true,
    onOpen: async (modal) => {
      if (isModalOpen('modal-popup')) {
        closeModal('modal-popup')
      }
      const form = modal.querySelector('form')
      if (form) {
        setTimeout(() => {
          initContactFields()
        }, 100)
      }
    },
  })
  registerModal('video-player-modal', {
    closeOnBackdrop: true,
    closeOnEscape: true,
    exclusive: true,
    onClose: (modal) => {
      // Очищаем контейнер при закрытии модалки
      const container = modal.querySelector('.video-player__container')
      if (container) {
        // Останавливаем локальное видео, если есть
        const video = container.querySelector('video')
        if (video) {
          video.pause()
          video.currentTime = 0
        }
        // Очищаем контейнер
        container.innerHTML = ''
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
    initPopupModal(popupConfig)
  }

  /*
   * Video Player
   */
  initVideoPlayer()

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
  attachScrollVisibility('.bottom-nav', { threshold: 60, minDelta: 25 })

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

  /*
   * Intro Arrow - плавная прокрутка к следующей секции
   */
  const introArrows = document.querySelectorAll('.intro_arrow')
  introArrows.forEach((arrow) => {
    arrow.addEventListener('click', (e) => {
      e.preventDefault()

      const introSection = arrow.closest('.intro')
      if (!introSection) return

      // Находим следующую секцию после intro
      const allSections = Array.from(document.querySelectorAll('section'))
      const introIndex = allSections.indexOf(introSection)
      const nextSection = allSections[introIndex + 1]

      if (!nextSection) return

      // Добавляем id следующей секции, если его нет
      if (!nextSection.id) {
        nextSection.id = 'next-section'
      }

      // Прокручиваем к следующей секции
      const offset = window.innerWidth < 768 ? 80 : 110
      const rect = nextSection.getBoundingClientRect()
      const targetY = Math.max(0, window.scrollY + rect.top - offset)

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
      window.scrollTo({
        top: targetY,
        behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
      })

      // Для доступности
      if (!nextSection.hasAttribute('tabindex')) {
        nextSection.setAttribute('tabindex', '-1')
      }
      nextSection.focus({ preventScroll: true })
    })
  })

  /*
   * Intro Parallax - параллакс эффект для интро блоков
   */
  initIntroParallax()
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
