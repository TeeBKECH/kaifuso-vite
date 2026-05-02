import AirDatepicker from 'air-datepicker'
import localeRu from 'air-datepicker/locale/ru.js'

/**
 * Дефолты бронирования. Переопределение из админки WP:
 *   window.kaifusoBookingDatetime = { minHour, minMinute, maxHour, maxMinute, minutesStep }
 * Либо на input[data-booking-datetime]: data-booking-min-hour, data-booking-max-hour, …
 */
const BOOKING_DT_DEFAULTS = {
  minHour: 8,
  minMinute: 0,
  maxHour: 23,
  maxMinute: 0,
  minutesStep: 30,
}

function readGlobalBookingDatetime() {
  if (typeof window === 'undefined') return {}
  const g = window.kaifusoBookingDatetime
  return g && typeof g === 'object' ? g : {}
}

function parseAttrInt(el, attr, fallback) {
  if (!el.hasAttribute(attr)) return fallback
  const n = parseInt(String(el.getAttribute(attr)), 10)
  return Number.isFinite(n) ? n : fallback
}

function pickNum(g, key, el, attr, fallback) {
  if (g[key] !== undefined && g[key] !== null && String(g[key]).trim() !== '') {
    const n = Number(g[key])
    return Number.isFinite(n) ? n : fallback
  }
  return parseAttrInt(el, attr, fallback)
}

/** @param {HTMLInputElement} el */
function getBookingDatetimeConfig(el) {
  const g = readGlobalBookingDatetime()
  return {
    minHour: pickNum(g, 'minHour', el, 'data-booking-min-hour', BOOKING_DT_DEFAULTS.minHour),
    minMinute: pickNum(g, 'minMinute', el, 'data-booking-min-minute', BOOKING_DT_DEFAULTS.minMinute),
    maxHour: pickNum(g, 'maxHour', el, 'data-booking-max-hour', BOOKING_DT_DEFAULTS.maxHour),
    maxMinute: pickNum(g, 'maxMinute', el, 'data-booking-max-minute', BOOKING_DT_DEFAULTS.maxMinute),
    minutesStep: pickNum(g, 'minutesStep', el, 'data-booking-minutes-step', BOOKING_DT_DEFAULTS.minutesStep),
  }
}

function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function sameCalendarDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function clampHourMinute(h, mi) {
  let hh = Math.max(0, Math.min(23, h))
  let mm = Math.max(0, Math.min(59, mi))
  return { h: hh, m: mm }
}

/**
 * Окно времени ресторана + не раньше «сейчас» в выбранный календарный день; шаг минут.
 * @param {Date} date
 * @param {ReturnType<typeof getBookingDatetimeConfig>} cfg
 */
function clampBookingDateTime(date, cfg) {
  const step = Math.max(1, Math.min(60, Math.round(cfg.minutesStep)))
  const minBiz = cfg.minHour * 60 + cfg.minMinute
  const maxBiz = cfg.maxHour * 60 + cfg.maxMinute
  const now = new Date()

  const out = new Date(date.getTime())
  const todayStart = startOfDay(now)
  if (startOfDay(out) < todayStart) {
    out.setTime(todayStart.getTime())
  }

  let { h, m } = clampHourMinute(out.getHours(), out.getMinutes())
  let total = h * 60 + m
  total = Math.round(total / step) * step
  if (total >= 24 * 60) total = 24 * 60 - step

  let minAllowed = minBiz
  if (sameCalendarDay(out, now)) {
    const nowTotal = now.getHours() * 60 + now.getMinutes()
    minAllowed = Math.max(minBiz, Math.ceil(nowTotal / step) * step)
  }

  let maxAllowed = maxBiz
  if (minAllowed > maxAllowed) {
    total = maxAllowed
  } else {
    total = Math.min(Math.max(total, minAllowed), maxAllowed)
  }

  const nh = Math.floor(total / 60)
  const nm = total % 60
  out.setHours(nh, nm, 0, 0)
  return out
}

function sameInstant(a, b) {
  return a.getTime() === b.getTime()
}

/**
 * Поля «Дата и время» для форм бронирования (модалка, страницы).
 * Разметка: input[data-booking-datetime] — открытие календаря по клику (Air Datepicker v3).
 * Имена полей совместимы с типичной схемой CF7 (см. комментарии в form.pug).
 */
export function initBookingDatepickers(root = document) {
  if (typeof document === 'undefined') return

  root.querySelectorAll('input[data-booking-datetime]').forEach((el) => {
    if (!(el instanceof HTMLInputElement)) return
    if (el.dataset.bookingDatepickerInit === '1') return
    el.dataset.bookingDatepickerInit = '1'

    const cfg = getBookingDatetimeConfig(el)

    const picker = new AirDatepicker(el, {
      locale: localeRu,
      timepicker: true,
      timeFormat: 'HH:mm',
      dateFormat: 'dd.MM.yyyy',
      dateTimeSeparator: ', ',
      showEvent: 'click',
      autoClose: false,
      position: 'bottom left',
      minDate: new Date(),
      minHours: cfg.minHour,
      minMinutes: cfg.minMinute,
      maxHours: cfg.maxHour,
      maxMinutes: 59,
      minutesStep: cfg.minutesStep,
      classes: 'kaifuso',
      onShow: (isFinished) => {
        if (!isFinished) return
        picker.update({ minDate: new Date() }, { silent: true })
      },
      onSelect: ({ date, datepicker }) => {
        const raw = Array.isArray(date) ? date[0] : date
        if (!(raw instanceof Date)) {
          el.dispatchEvent(new Event('input', { bubbles: true }))
          el.dispatchEvent(new Event('change', { bubbles: true }))
          return
        }

        const clamped = clampBookingDateTime(raw, cfg)
        if (sameInstant(clamped, raw)) {
          el.dispatchEvent(new Event('input', { bubbles: true }))
          el.dispatchEvent(new Event('change', { bubbles: true }))
          return
        }

        void datepicker.selectDate(clamped, { updateTime: true }).then(() => {
          el.dispatchEvent(new Event('input', { bubbles: true }))
          el.dispatchEvent(new Event('change', { bubbles: true }))
        })
      },
    })

    el._bookingDatepicker = picker
  })
}
