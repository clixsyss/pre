import { putItem } from '../aws/dynamodbClient'
import optimizedAuthService from './optimizedAuthService'
import { isStoneResidenceProject } from '../constants/gateConfig'

const TABLE = 'projects__gatePasses'

function cleanString(value) {
  if (value === undefined || value === null) return ''
  return String(value).trim()
}

function resolveStoneGate({ projectId, gateName, gateKey }) {
  const raw = [gateName, gateKey].map(cleanString).join(' ').toLowerCase()

  if (isStoneResidenceProject(projectId)) {
    if (raw.includes('left') || raw.includes('gate_left') || raw.includes('gate left')) {
      return { gateName: 'Gate 1', gateId: 'gate_1', gateSide: 'left' }
    }
    if (raw.includes('right') || raw.includes('gate_right') || raw.includes('gate right')) {
      return { gateName: 'Gate 2', gateId: 'gate_2', gateSide: 'right' }
    }
  }

  const fallback = cleanString(gateName) || 'BLE Gate'
  return { gateName: fallback, gateId: fallback, gateSide: '' }
}

function getCurrentUserId(user) {
  return (
    user?.id ||
    user?.userSub ||
    user?.attributes?.sub ||
    user?.cognitoAttributes?.sub ||
    user?.uid ||
    user?.username ||
    ''
  )
}

function getCurrentUserName(user) {
  return cleanString(
    user?.fullName ||
    user?.name ||
    user?.attributes?.name ||
    user?.cognitoAttributes?.name ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.attributes?.email ||
    user?.cognitoAttributes?.email ||
    user?.email ||
    user?.username
  )
}

/**
 * Log a resident gate entry (BLE or QR) to the gatePasses table so it appears
 * in the dashboard Gate Pass tab.
 *
 * @param {object} opts
 * @param {string} opts.projectId
 * @param {string} [opts.projectName]
 * @param {string} opts.unit          - resident unit number
 * @param {'resident_ble'|'resident_qr'} opts.entryType
 * @param {string} [opts.gateName]    - BLE device name or gate label
 * @param {string} [opts.gateKey]     - app gate key/side when available
 */
export async function logResidentEntry({
  projectId,
  projectName = '',
  unit,
  entryType = 'resident_ble',
  gateName = '',
  gateKey = '',
  userRole = 'owner',
}) {
  try {
    if (!projectId) return

    const currentUser = await optimizedAuthService.getCurrentUser()
    const userId = getCurrentUserId(currentUser)
    const userName = getCurrentUserName(currentUser)
    const userEmail = cleanString(
      currentUser?.attributes?.email ||
      currentUser?.cognitoAttributes?.email ||
      currentUser?.email
    )
    const gate = resolveStoneGate({ projectId, gateName, gateKey })

    const now = Date.now()
    const id = `BLE-${projectId}-${userId || 'unknown'}-${now}`
    const openedAt = new Date(now).toISOString()

    const record = {
      projectId,
      parentId: projectId,
      projectName: projectName || '',
      id,
      entryType,
      type: 'owner',
      audience: 'owner',
      userRole,
      userId,
      userName,
      ownerName: userName,
      userEmail,
      unit: unit || '',
      gateName: gate.gateName,
      gateId: gate.gateId,
      gateSide: gate.gateSide,
      deviceName: gate.gateName,
      rawDeviceName: gateName || '',
      accessMethod: 'BLE',
      entryMethod: 'BLE',
      source: 'ble',
      openedAt,
      gateOpenedAt: openedAt,
      entryTime: openedAt,
      scannedAt: now,
      used: true,
      status: 'opened',
      createdAt: now,
      updatedAt: now,
    }

    await putItem(TABLE, record)
    console.log('[gateEntryLogService] Logged BLE gate entry:', {
      id,
      projectId,
      unit: record.unit,
      gateName: record.gateName,
    })
    return record
  } catch (err) {
    // Non-critical — never crash the gate-open flow
    console.warn('[gateEntryLogService] Failed to log entry:', err)
    return null
  }
}
