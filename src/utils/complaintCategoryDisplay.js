/** Preset complaint category keys from the admin dashboard (fallback when no custom iconUrl). */
const COMPLAINT_CATEGORY_EMOJI_MAP = {
  gate: '🚪',
  volume_off: '🔇',
  build: '🔧',
  security: '🛡️',
  home: '🏠',
  receipt: '🧾',
  water: '💧',
  electric: '⚡',
  cleaning: '🧹',
  elevator: '🛗',
  parking: '🅿️',
  help: '❓',
}

export function getComplaintCategoryEmoji(iconKey) {
  if (!iconKey || typeof iconKey !== 'string') return '📋'
  return COMPLAINT_CATEGORY_EMOJI_MAP[iconKey] || '❓'
}
