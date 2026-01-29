# Face Sync Retry Lambda

Processes **FaceSyncQueue** DynamoDB records with `status = PENDING`: publishes face data to MQTT, then marks `SENT` or increments retry (and marks `FAILED` after max retries).

## Requirements

- **FaceSyncQueue** DynamoDB table (PK: `id`).
- Lambda execution role with: `dynamodb:Scan`, `dynamodb:UpdateItem` on `FaceSyncQueue`.
- Optional env: `FACE_SYNC_QUEUE_TABLE` (default `FaceSyncQueue`), `FACE_SYNC_MAX_RETRIES` (default `10`), `FACE_SYNC_PENDING_LIMIT` (default `50`). Each queue record should have `mqttBrokerWsUrl`; if not set, Lambda can use `VITE_MQTT_BROKER_WS_URL` as fallback.

## MQTT

- **Topic:** `facesync/{projectId}/{clusterId}/{deviceId}`
- **Payload:** `{ faceId, userId, imageUrl, projectId, timestamp }`

## CloudWatch Schedule

1. **Every 15 minutes**  
   Create a CloudWatch Events rule (EventBridge):
   - **Schedule expression:** `rate(15 minutes)`
   - **Target:** this Lambda

2. **Every minute between 00:00 and 00:30 AM (UTC)**  
   Optional second rule for higher frequency in a window:
   - **Schedule expression:** `cron(0/1 0 * * ? *)` (every minute from 00:00 to 00:59 UTC; adjust if you need only 00:00–00:30).

   To restrict to 00:00–00:30 only, use:
   - **Schedule expression:** `cron(0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30 0 * * ? *)`  
   (runs at minute 0–30 of hour 0 UTC).

## Deploy

1. In `lambda/faceSyncRetry`: `npm install`
2. Zip handler + `node_modules`: e.g. `zip -r ../faceSyncRetry.zip . -x '*.git*'`
3. Create Lambda in AWS (Node 18+), upload zip, set handler to `handler.handler`.
4. Add the CloudWatch rule(s) and target this Lambda.
