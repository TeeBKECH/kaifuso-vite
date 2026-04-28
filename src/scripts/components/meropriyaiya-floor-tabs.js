/**
 * Свайп по области контента табов этажей (мероприятия): смена активного таба.
 * Во время жеста активная панель слегка следует за пальцем (демпфирование), затем отпружинивает или переключает таб.
 * Не перехватывает жесты над iframe / 3D-туром ([data-tour-frame]).
 */
import { tabsActivateByIndex, tabsGetActiveIndex, tabsButtonCount } from '@/scripts/components/tabs.js'

const SWIPE_MIN_PX = 48
/** Насколько сдвиг пальца переносится на панель (0…1) */
const DRAG_DAMP = 0.38
/** Макс. сдвиг панели от ширины области контента */
const DRAG_MAX_FR = 0.22

function isTouchUi() {
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches
}

function clearPanelTransforms(content) {
  content.querySelectorAll('.tabs_item').forEach((el) => {
    el.style.transform = ''
    el.style.transition = ''
  })
}

export function initMeropriyaiyaFloorTabsSwipe() {
  if (!isTouchUi()) return

  document.querySelectorAll('.meropriyaiya_floor-tabs[data-component="tabs"]').forEach((root) => {
    const content = root.querySelector('.tabs_content')
    if (!content) return

    let startX = 0
    let startY = 0
    let active = false
    /** undecided | horizontal | vertical */
    let axis = 'undecided'
    const AXIS_THRESHOLD = 12

    const resetState = () => {
      active = false
      axis = 'undecided'
      root.classList.remove('meropriyaiya_floor-tabs--drag')
    }

    const springPanelToZero = (panel, onDone) => {
      if (!panel) {
        onDone?.()
        return
      }
      panel.style.transition = 'transform 0.22s ease-out'
      panel.style.transform = 'translateX(0)'
      window.setTimeout(() => {
        panel.style.transition = ''
        panel.style.transform = ''
        root.classList.remove('meropriyaiya_floor-tabs--drag')
        onDone?.()
      }, 230)
    }

    content.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length !== 1) return
        const t = e.target
        if (t instanceof Element && (t.closest('iframe') || t.closest('[data-tour-frame]'))) return
        startX = e.touches[0].clientX
        startY = e.touches[0].clientY
        active = true
        axis = 'undecided'
        root.classList.remove('meropriyaiya_floor-tabs--drag')
        clearPanelTransforms(content)
      },
      { passive: true },
    )

    content.addEventListener(
      'touchmove',
      (e) => {
        if (!active || e.touches.length !== 1) return
        const touch = e.touches[0]
        const dx = touch.clientX - startX
        const dy = touch.clientY - startY

        if (axis === 'undecided') {
          if (Math.abs(dx) < AXIS_THRESHOLD && Math.abs(dy) < AXIS_THRESHOLD) return
          if (Math.abs(dy) > Math.abs(dx) + 4) {
            axis = 'vertical'
            return
          }
          if (Math.abs(dx) > Math.abs(dy) + 4) {
            axis = 'horizontal'
            root.classList.add('meropriyaiya_floor-tabs--drag')
          } else {
            return
          }
        }

        if (axis !== 'horizontal') return

        const panel = content.querySelector('.tabs_item--active')
        if (!panel) return

        const maxPx = Math.max(48, content.offsetWidth * DRAG_MAX_FR)
        const raw = dx * DRAG_DAMP
        const clamped = Math.max(-maxPx, Math.min(maxPx, raw))
        panel.style.transition = 'none'
        panel.style.transform = `translateX(${clamped}px)`
      },
      { passive: true },
    )

    content.addEventListener(
      'touchcancel',
      () => {
        if (!active) return
        const panel = content.querySelector('.tabs_item--active')
        if (axis === 'horizontal' && panel) {
          springPanelToZero(panel)
        }
        resetState()
      },
      { passive: true },
    )

    content.addEventListener(
      'touchend',
      (e) => {
        if (!active) return
        const wasHorizontal = axis === 'horizontal'
        const touch = e.changedTouches[0]
        const dx = touch.clientX - startX
        const dy = touch.clientY - startY
        const panel = content.querySelector('.tabs_item--active')

        if (!wasHorizontal) {
          resetState()
          return
        }

        const endEl = document.elementFromPoint(touch.clientX, touch.clientY)
        const overFrame =
          endEl instanceof Element &&
          (endEl.closest('iframe') || endEl.closest('[data-tour-frame]'))

        const canSwitch =
          Math.abs(dx) >= SWIPE_MIN_PX &&
          Math.abs(dx) >= Math.abs(dy) &&
          !overFrame

        if (canSwitch) {
          const n = tabsButtonCount(root)
          if (n >= 2) {
            let cur = tabsGetActiveIndex(root)
            if (dx < 0) {
              cur = Math.min(n - 1, cur + 1)
            } else {
              cur = Math.max(0, cur - 1)
            }
            if (panel) {
              panel.style.transition = 'none'
              panel.style.transform = ''
            }
            root.classList.remove('meropriyaiya_floor-tabs--drag')
            tabsActivateByIndex(root, cur)
            resetState()
            return
          }
        }

        springPanelToZero(panel)
        resetState()
      },
      { passive: true },
    )
  })
}
