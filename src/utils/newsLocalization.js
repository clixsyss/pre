/**
 * Resolve bilingual news fields from Firestore using the app language (vue-i18n locale).
 * Legacy documents only have title / content / message / excerpt (treated as English).
 */

export function appLocaleIsArabic(localeValue) {
  return localeValue === 'ar-SA' || String(localeValue || '').toLowerCase().startsWith('ar')
}

function stripEn(item) {
  return (item.titleEn ?? item.title ?? '').trim()
}

function stripAr(item) {
  return (item.titleAr ?? '').trim()
}

export function localizedNewsTitle(item, localeValue) {
  if (!item) return ''
  const en = stripEn(item)
  const ar = stripAr(item)
  if (appLocaleIsArabic(localeValue)) return ar || en
  return en || ar
}

function excerptEn(item) {
  return (item.excerptEn ?? item.excerpt ?? '').trim()
}

function excerptAr(item) {
  return (item.excerptAr ?? '').trim()
}

export function localizedNewsExcerpt(item, localeValue) {
  if (!item) return ''
  const en = excerptEn(item)
  const ar = excerptAr(item)
  if (appLocaleIsArabic(localeValue)) {
    if (ar) return ar
    const arBody = (item.contentAr ?? '').trim()
    if (arBody) return arBody.length > 160 ? `${arBody.slice(0, 157)}...` : arBody
    return en || (item.message || '').trim() || (item.content || '').trim()
  }
  if (en) return en
  const enBody = (item.contentEn ?? item.message ?? item.content ?? '').trim()
  if (enBody) return enBody.length > 160 ? `${enBody.slice(0, 157)}...` : enBody
  return ar
}

export function localizedNewsContentHtml(item, localeValue) {
  if (!item) return ''
  const en = (item.contentEn ?? item.message ?? item.content ?? '').trim()
  const ar = (item.contentAr ?? '').trim()
  if (appLocaleIsArabic(localeValue)) return ar || en
  return en || ar
}

export function newsBodyTextDirection(item, localeValue) {
  if (!item) return 'ltr'
  const ar = (item.contentAr ?? '').trim()
  const en = (item.contentEn ?? item.message ?? item.content ?? '').trim()
  if (appLocaleIsArabic(localeValue)) {
    if (ar) return 'rtl'
    return en ? 'ltr' : 'rtl'
  }
  return 'ltr'
}
