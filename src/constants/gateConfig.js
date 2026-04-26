export const BLE_SERVICE_UUID = '12345678-1234-5678-1234-56789abcdef0'
export const BLE_CHARACTERISTIC_UUID = 'abcdefab-cdef-1234-5678-abcdefabcdef'

export const DEFAULT_GATE_PASSWORD = 'OPEN123'

export const STONE_RESIDENCE_PROJECT_ID = 'BiHENuiMdDrivwbPccNE'
export const STONE_SHARED_GATE_PASSWORD = 'STONE_GATE_2026'

export const DEFAULT_GATE_SYSTEM = {
  serviceUUID: BLE_SERVICE_UUID,
  characteristicUUID: BLE_CHARACTERISTIC_UUID,
  password: DEFAULT_GATE_PASSWORD,
  fastMode: false,
  gates: [
    {
      key: 'main',
      label: 'Gate',
      bleName: null,
    },
  ],
}

export const STONE_RESIDENCE_GATE_SYSTEM = {
  serviceUUID: BLE_SERVICE_UUID,
  characteristicUUID: BLE_CHARACTERISTIC_UUID,
  password: STONE_SHARED_GATE_PASSWORD,
  fastMode: true,
  veryCloseRssiMin: -55,
  scanDurationMs: 2200,
  deviceNames: ['GATE_LEFT', 'GATE_RIGHT'],
  deviceDisplayNames: {
    GATE_LEFT: 'Gate 1',
    GATE_RIGHT: 'Gate 2',
  },
  // Gate_right is Gate 2, Gate_left is Gate 1 (PHYSICALLY)
  gates: [
    {
      key: 'main',
      label: 'gate',
      bleName: null,
    },
  ],
}

export const isStoneResidenceProject = (projectId) => {
  return projectId === STONE_RESIDENCE_PROJECT_ID
}

export const getGateSystemForProject = (projectId) => {
  return isStoneResidenceProject(projectId)
    ? STONE_RESIDENCE_GATE_SYSTEM
    : DEFAULT_GATE_SYSTEM
}

export const getGateByKey = (projectId, gateKey) => {
  const gateSystem = getGateSystemForProject(projectId)
  return gateSystem.gates.find((gate) => gate.key === gateKey) || gateSystem.gates[0]
}

export const getGateDisplayName = (projectId, gateName) => {
  const rawName = String(gateName || '').trim()
  if (!rawName) return ''

  const gateSystem = getGateSystemForProject(projectId)
  return gateSystem.deviceDisplayNames?.[rawName] || rawName
}
