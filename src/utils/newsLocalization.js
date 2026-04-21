/**
 * Resolve bilingual news fields from Firestore using the app language (vue-i18n locale).
 * Legacy documents only have title / content / message / excerpt (treated as English).
 */

export function appLocaleIsArabic(localeValue) {
  return localeValue === 'ar-SA' || String(localeValue || '').toLowerCase().startsWith('ar')
}

function sanitizeHtmlContent(html) {
  if (!html || typeof html !== 'string') return ''
  if (typeof window === 'undefined' || !window.document) return html

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const blockedTags = new Set(['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta'])
  const allowedStyles = new Set([
    'text-align',
    'font-weight',
    'font-style',
    'text-decoration',
    'margin-left',
    'margin-right'
  ])

  const cleanElement = (element) => {
    const tagName = element.tagName.toLowerCase()
    if (blockedTags.has(tagName)) {
      element.remove()
      return
    }

    Array.from(element.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase()
      if (name.startsWith('on')) {
        element.removeAttribute(attr.name)
        return
      }
      if (name === 'style') {
        const safeStyles = attr.value
          .split(';')
          .map((entry) => entry.trim())
          .filter(Boolean)
          .map((entry) => {
            const [rawProp, ...valueParts] = entry.split(':')
            const prop = (rawProp || '').trim().toLowerCase()
            const value = valueParts.join(':').trim()
            if (!allowedStyles.has(prop) || !value) return ''
            return `${prop}: ${value}`
          })
          .filter(Boolean)
        if (safeStyles.length) {
          element.setAttribute('style', safeStyles.join('; '))
        } else {
          element.removeAttribute('style')
        }
      }
    })

    Array.from(element.children).forEach(cleanElement)
  }

  Array.from(doc.body.children).forEach(cleanElement)
  return doc.body.innerHTML
}

function htmlToPlainText(html) {
  if (!html || typeof html !== 'string') return ''
  if (typeof window === 'undefined' || !window.document) {
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  }
  const container = document.createElement('div')
  container.innerHTML = sanitizeHtmlContent(html)
  return (container.textContent || container.innerText || '').replace(/\s+/g, ' ').trim()
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
    const arBody = htmlToPlainText((item.contentAr ?? '').trim())
    if (arBody) return arBody.length > 160 ? `${arBody.slice(0, 157)}...` : arBody
    return en || htmlToPlainText((item.message || '').trim()) || htmlToPlainText((item.content || '').trim())
  }
  if (en) return en
  const enBody = htmlToPlainText((item.contentEn ?? item.message ?? item.content ?? '').trim())
  if (enBody) return enBody.length > 160 ? `${enBody.slice(0, 157)}...` : enBody
  return ar
}

export function localizedNewsContentHtml(item, localeValue) {
  if (!item) return ''
  const en = (item.contentEn ?? item.message ?? item.content ?? '').trim()
  const ar = (item.contentAr ?? '').trim()
  if (appLocaleIsArabic(localeValue)) return sanitizeHtmlContent(ar || en)
  return sanitizeHtmlContent(en || ar)
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
