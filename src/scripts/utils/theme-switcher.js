/**
 * Theme Switcher: светлая/тёмная тема
 * Приоритет: localStorage → data-theme-default → "light"
 * Управление из WP: data-theme-default, data-theme-switcher на <html>
 */

const STORAGE_KEY = 'knyaje-theme'
const THEMES = ['light', 'dark']

/**
 * Применяет тему к документу
 * @param {string} theme - 'light' | 'dark'
 */
export function setTheme(theme) {
  if (!THEMES.includes(theme)) return
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch (e) {
    // ignore
  }
  updateSwitcherState(theme)
}

/**
 * Возвращает текущую тему
 * @returns {string}
 */
export function getTheme() {
  return document.documentElement.dataset.theme || 'light'
}

/**
 * Обновляет aria-pressed и визуальное состояние кнопок во всех переключателях
 * @param {string} currentTheme
 */
function updateSwitcherState(currentTheme) {
  document.querySelectorAll('.theme-switcher').forEach((container) => {
    container.querySelectorAll('[data-theme]').forEach((btn) => {
      const isActive = btn.getAttribute('data-theme') === currentTheme
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false')
    })
  })
}

/**
 * Инициализирует переключатель тем
 * - Читает data-theme-default и data-theme-switcher с html
 * - Восстанавливает тему из localStorage или использует дефолт (уже выставлен инлайн-скриптом)
 * - Вешает обработчики на кнопки
 * - Скрывает блок, если data-theme-switcher="false"
 * - Если data-theme-follow-system="true": подписка на prefers-color-scheme (без перезаписи выбора пользователя в localStorage)
 */
export function initThemeSwitcher() {
  const html = document.documentElement
  const defaultTheme = (html.getAttribute('data-theme-default') || 'light').toLowerCase()
  const showSwitcher = html.getAttribute('data-theme-switcher') !== 'false'
  const followSystem = html.getAttribute('data-theme-follow-system') === 'true'

  // Тема уже выставлена инлайн-скриптом; здесь только синхронизируем кнопки и localStorage при первом заходе
  let theme
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    theme = stored && THEMES.includes(stored) ? stored : (html.dataset.theme || defaultTheme)
    if (!THEMES.includes(theme)) theme = defaultTheme
  } catch (e) {
    theme = html.dataset.theme || defaultTheme
    if (!THEMES.includes(theme)) theme = defaultTheme
  }
  setTheme(theme)

  // Следование теме устройства: при смене системной темы обновляем только если пользователь не сохранял выбор
  if (followSystem && typeof window.matchMedia !== 'undefined') {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const applySystem = () => {
      try {
        if (localStorage.getItem(STORAGE_KEY)) return
      } catch (e) {
        return
      }
      const next = mq.matches ? 'dark' : 'light'
      if (html.dataset.theme !== next) setTheme(next)
    }
    mq.addEventListener('change', applySystem)
  }

  // Скрыть/показать все переключатели и повесить обработчики
  document.querySelectorAll('.theme-switcher').forEach((container) => {
    container.style.display = showSwitcher ? '' : 'none'
    container.querySelectorAll('[data-theme]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetTheme = btn.getAttribute('data-theme')
        if (targetTheme && THEMES.includes(targetTheme)) {
          setTheme(targetTheme)
        }
      })
    })
  })
}
