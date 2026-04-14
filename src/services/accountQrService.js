/**
 * Account verification QR payloads.
 *
 * Security model
 * --------------
 * - v1 (legacy): Unsigned JSON with user identifiers. Anyone can forge it; `exp` only limits
 *   accidental replay of old screenshots. Do not rely on it for trust — use only when
 *   VITE_ACCOUNT_QR_MINT_URL is unset (e.g. local dev).
 * - v2 (recommended): QR contains only `{ t, v, token, exp }` where `token` is minted by your API
 *   after validating the user's Cognito ID token. Forging requires stealing a real token before
 *   `exp` or compromising the issuer. The scanner / other app should call a verify endpoint with
 *   `token`; the server resolves identity.
 */
import { Auth } from 'aws-amplify'

const MINT_URL = (import.meta.env.VITE_ACCOUNT_QR_MINT_URL || '').trim()

/** How long each QR remains valid (also used for v1 window alignment). */
export const ACCOUNT_QR_ROTATION_MS = 30 * 1000 // 30 seconds

const currentQrWindowStart = () =>
  Math.floor(Date.now() / ACCOUNT_QR_ROTATION_MS) * ACCOUNT_QR_ROTATION_MS

function getPreferredIdentifier(cu) {
  // Prefer immutable user IDs; use email only as a fallback identifier.
  return (
    cu?.attributes?.sub ||
    cu?.userSub ||
    cu?.cognitoAttributes?.sub ||
    cu?.uid ||
    cu?.id ||
    cu?.attributes?.email ||
    cu?.email ||
    null
  )
}

function buildLegacyUnsignedPayload(cu, projectId) {
  const sub =
    cu?.attributes?.sub || cu?.userSub || cu?.cognitoAttributes?.sub || cu?.id || null
  const uid = cu?.uid || null
  const w = currentQrWindowStart()
  return {
    t: 'jdar_user_identity',
    v: 1,
    id: getPreferredIdentifier(cu),
    sub,
    uid,
    email: cu?.attributes?.email || cu?.email || null,
    name: cu?.attributes?.name || cu?.cognitoAttributes?.name || null,
    projectId: projectId || null,
    w,
    exp: w + ACCOUNT_QR_ROTATION_MS,
  }
}

/**
 * @returns {Promise<{ payload: object, mode: 'minted' | 'legacy' }>}
 */
export async function buildAccountQrPayload(cu, projectId) {
  if (MINT_URL) {
    const session = await Auth.currentSession()
    const idToken = session.getIdToken().getJwtToken()
    const res = await fetch(MINT_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId: projectId || null }),
    })
    const text = await res.text()
    let data
    try {
      data = text ? JSON.parse(text) : {}
    } catch {
      throw new Error(text || `Account QR mint failed (${res.status})`)
    }
    if (!res.ok) {
      throw new Error(data.message || data.error || text || `Account QR mint failed (${res.status})`)
    }
    const token = data.token
    const exp = data.exp
    if (token == null || typeof token !== 'string' || exp == null || Number.isNaN(Number(exp))) {
      throw new Error('Account QR mint: response must include string token and numeric exp (unix ms)')
    }
    return {
      mode: 'minted',
      payload: {
        t: 'jdar_user_identity',
        v: 2,
        id: getPreferredIdentifier(cu),
        token,
        exp: Number(exp),
      },
    }
  }

  console.warn(
    '[Account QR] VITE_ACCOUNT_QR_MINT_URL is not set — using unsigned v1 payload (not for production trust boundaries).',
  )

  return {
    mode: 'legacy',
    payload: buildLegacyUnsignedPayload(cu, projectId),
  }
}
