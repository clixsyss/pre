/**
 * Face Sync Retry Lambda
 *
 * Trigger: CloudWatch Events (every 15 min + every minute 00:00–00:30 AM).
 * Logic: Query FaceSyncQueue for status = PENDING; for each record publish to MQTT
 * topic facesync/{projectId}/{clusterId}/{deviceId}; on success set SENT, on failure
 * increment retry and lastAttemptAt; if retryCount > MAX_RETRIES set FAILED.
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb')
const mqtt = require('mqtt')

const TABLE_NAME = process.env.FACE_SYNC_QUEUE_TABLE || 'FaceSyncQueue'
const MAX_RETRIES = parseInt(process.env.FACE_SYNC_MAX_RETRIES || '10', 10)
const PENDING_LIMIT = parseInt(process.env.FACE_SYNC_PENDING_LIMIT || '50', 10)
const MQTT_PUBLISH_TIMEOUT_MS = 15000

const STATUS_PENDING = 'PENDING'
const STATUS_SENT = 'SENT'
const STATUS_FAILED = 'FAILED'

const dynamoClient = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(dynamoClient)

/**
 * Scan FaceSyncQueue for PENDING records.
 */
async function getPendingTasks() {
  const cmd = new ScanCommand({
    TableName: TABLE_NAME,
    Limit: PENDING_LIMIT,
    FilterExpression: '#s = :pending',
    ExpressionAttributeNames: { '#s': 'status' },
    ExpressionAttributeValues: { ':pending': STATUS_PENDING },
  })
  const res = await docClient.send(cmd)
  return res.Items || []
}

/**
 * Publish face sync payload to MQTT topic.
 * Topic: facesync/{projectId}/{clusterId}/{deviceId}
 * Payload: { faceId, userId, imageUrl, projectId, timestamp }
 */
function publishToMqtt(task) {
  const { mqttBrokerWsUrl, projectId, clusterId, deviceId, faceId, userId, imageUrl } = task
  const brokerUrl = mqttBrokerWsUrl || process.env.VITE_MQTT_BROKER_WS_URL
  if (!brokerUrl) {
    return Promise.reject(new Error('No MQTT broker URL'))
  }

  const topic = `facesync/${projectId}/${clusterId}/${deviceId || 'all'}`
  const payload = JSON.stringify({
    faceId,
    userId,
    imageUrl,
    projectId,
    timestamp: new Date().toISOString(),
  })

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true
        try { client.end(true) } catch (_) {}
        reject(new Error('MQTT publish timeout'))
      }
    }, MQTT_PUBLISH_TIMEOUT_MS)

    let resolved = false
    const client = mqtt.connect(brokerUrl, {
      keepalive: 10,
      connectTimeout: 8000,
      reconnectPeriod: 0,
    })

    client.on('connect', () => {
      if (resolved) return
      client.publish(topic, payload, { qos: 1 }, (err) => {
        if (resolved) return
        resolved = true
        clearTimeout(timeout)
        try { client.end(true) } catch (_) {}
        if (err) reject(err)
        else resolve()
      })
    })

    client.on('error', (err) => {
      if (!resolved) {
        resolved = true
        clearTimeout(timeout)
        try { client.end(true) } catch (_) {}
        reject(err)
      }
    })
  })
}

/**
 * Mark task as SENT.
 */
async function markSent(id) {
  const now = new Date().toISOString()
  await docClient.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { id },
    UpdateExpression: 'SET #s = :sent, lastAttemptAt = :now',
    ExpressionAttributeNames: { '#s': 'status' },
    ExpressionAttributeValues: { ':sent': STATUS_SENT, ':now': now },
  }))
}

/**
 * Increment retry and optionally set FAILED.
 */
async function incrementRetryAndMaybeFail(id, currentRetryCount) {
  const nextCount = (currentRetryCount || 0) + 1
  const now = new Date().toISOString()
  const newStatus = nextCount > MAX_RETRIES ? STATUS_FAILED : STATUS_PENDING
  await docClient.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { id },
    UpdateExpression: 'SET retryCount = :c, lastAttemptAt = :now, #s = :status',
    ExpressionAttributeNames: { '#s': 'status' },
    ExpressionAttributeValues: { ':c': nextCount, ':now': now, ':status': newStatus },
  }))
  return newStatus
}

/**
 * Lambda entrypoint.
 */
exports.handler = async (event, context) => {
  console.log('[FaceSyncRetry] Invoked', { requestId: context.awsRequestId })
  const pending = await getPendingTasks()
  console.log('[FaceSyncRetry] PENDING count:', pending.length)

  let sent = 0
  let failed = 0
  let retried = 0

  for (const task of pending) {
    const id = task.id
    try {
      await publishToMqtt(task)
      await markSent(id)
      sent++
    } catch (err) {
      console.warn('[FaceSyncRetry] Publish failed for', id, err.message)
      const newStatus = await incrementRetryAndMaybeFail(id, task.retryCount || 0)
      if (newStatus === STATUS_FAILED) failed++
      else retried++
    }
  }

  console.log('[FaceSyncRetry] Done', { sent, failed, retried })
  return { sent, failed, retried, processed: pending.length }
}
