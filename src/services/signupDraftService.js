/**
 * signupDraftService.js
 *
 * Persists signup progress to localStorage so users can resume after closing the app.
 * Password is stored salted (XOR + base64) — good enough for a draft that the user
 * owns on their own device; never sent anywhere until the final submit.
 *
 * Draft schema:
 * {
 *   version: 1,
 *   step: 'personal' | 'details' | 'property',
 *   savedAt: ISO8601,
 *   email: string,
 *   passwordObfuscated: string,   // base64(XOR(password, SALT))
 *   userDetails: { firstName, lastName, mobile, dateOfBirth, gender, nationalId },
 *   documents: { frontIdUrl, backIdUrl, profilePictureUrl, propertyContractUrl },
 *   projects: [{ projectId, unit, role }],
 * }
 */

const DRAFT_KEY = 'signup_draft_v1'
const DRAFT_VERSION = 1
const SALT = 'pre_draft_2024' // obfuscation only — not encryption

function _obfuscate(str) {
  if (!str) return ''
  const saltBytes = Array.from(SALT)
  return btoa(
    Array.from(str)
      .map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ saltBytes[i % saltBytes.length].charCodeAt(0)))
      .join('')
  )
}

function _deobfuscate(encoded) {
  if (!encoded) return ''
  try {
    const saltBytes = Array.from(SALT)
    const decoded = atob(encoded)
    return Array.from(decoded)
      .map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ saltBytes[i % saltBytes.length].charCodeAt(0)))
      .join('')
  } catch {
    return ''
  }
}

export const signupDraftService = {
  /**
   * Save or update the current draft.
   * @param {Partial<DraftSchema>} patch — only the fields to update
   */
  save(patch) {
    try {
      const existing = this.load() || { version: DRAFT_VERSION }
      const updated = {
        ...existing,
        ...patch,
        version: DRAFT_VERSION,
        savedAt: new Date().toISOString(),
      }
      // Always obfuscate password before storing
      if (patch.password !== undefined) {
        updated.passwordObfuscated = _obfuscate(patch.password)
        delete updated.password
      }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(updated))
    } catch (e) {
      console.warn('[signupDraftService] Failed to save draft:', e)
    }
  },

  /**
   * Load the persisted draft. Returns null if none exists or is invalid.
   * @returns {DraftSchema|null}
   */
  load() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return null
      const draft = JSON.parse(raw)
      if (!draft || draft.version !== DRAFT_VERSION) {
        this.clear()
        return null
      }
      return draft
    } catch {
      return null
    }
  },

  /**
   * Retrieve the stored password (deobfuscated).
   * Returns empty string if not available.
   */
  getPassword() {
    const draft = this.load()
    if (!draft?.passwordObfuscated) return ''
    return _deobfuscate(draft.passwordObfuscated)
  },

  /**
   * Returns true if a resumable draft exists.
   */
  hasDraft() {
    const draft = this.load()
    return !!(draft?.email && draft?.step)
  },

  /**
   * Advance the draft to the next step without replacing other fields.
   */
  advanceStep(step) {
    this.save({ step })
  },

  /**
   * Wipe the draft (call after successful registration or explicit restart).
   */
  clear() {
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch {
      // ignore
    }
  },
}
